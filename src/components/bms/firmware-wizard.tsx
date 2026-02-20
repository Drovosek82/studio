
"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  Cpu, 
  Wifi, 
  Shield, 
  Loader2, 
  Layers, 
  Monitor, 
  Radio, 
  Tv, 
  AlertTriangle, 
  Server, 
  Share2,
  Search,
  Bluetooth as BluetoothIcon,
  BrainCircuit
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { generateEsp32Firmware } from "@/ai/flows/generate-esp32-firmware";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useBmsStore } from "@/lib/bms-store";
import { collection, query, orderBy } from "firebase/firestore";

export function FirmwareWizard() {
  const { user } = useUser();
  const db = useFirestore();
  const { localHubIp: globalLocalHubIp, t } = useBmsStore();
  
  const [mode, setMode] = useState<'bridge' | 'display' | 'hub'>('bridge');
  const [displayType, setDisplayType] = useState<string>("none");
  const [customDisplayDescription, setCustomDisplayDescription] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [bmsIdentifier, setBmsIdentifier] = useState("");
  const [espModel, setEspModel] = useState<string>("esp32c3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanningBms, setIsScanningBms] = useState(false);
  const [firmware, setFirmware] = useState<string | null>(null);
  
  const [useLocalHub, setUseLocalHub] = useState(false);
  const [localHubIp, setLocalHubIp] = useState("");

  const { toast } = useToast();

  // Завантажуємо моделі з Глобальної бази знань ШІ
  const insightsRef = useMemoFirebase(() => 
    db ? query(collection(db, 'modelInsights'), orderBy('modelName', 'asc')) : null,
  [db]);
  
  const { data: insights } = useCollection<any>(insightsRef);

  useEffect(() => {
    if (globalLocalHubIp && globalLocalHubIp.length > 5 && (mode === 'bridge' || mode === 'display')) {
      setLocalHubIp(globalLocalHubIp);
      setUseLocalHub(true);
    } else if (mode === 'hub') {
      setUseLocalHub(false);
      setLocalHubIp("");
    }
  }, [globalLocalHubIp, mode]);

  useEffect(() => {
    const randomId = Math.random().toString(36).substr(2, 4).toUpperCase();
    const modePrefix = mode === 'hub' ? 'HUB' : mode.toUpperCase();
    setDeviceId(`BMS_${modePrefix}_${randomId}`);
  }, [mode]);

  useEffect(() => {
    if (espModel === 'esp8266' && (mode === 'bridge' || mode === 'hub')) {
      setMode('display');
      toast({
        title: "MCU Limitation",
        description: "ESP8266 does not have Bluetooth, only Display mode available.",
      });
    }
  }, [espModel, mode, toast]);

  const handleScanBms = async () => {
    if (typeof window !== 'undefined' && !navigator.bluetooth) {
      toast({
        title: "Error",
        description: "Your browser does not support Web Bluetooth.",
        variant: "destructive",
      });
      return;
    }

    setIsScanningBms(true);
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
      });

      if (device.name) {
        setBmsIdentifier(device.name);
        toast({
          title: t('toastBmsFound'),
          description: device.name,
        });
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        toast({
          title: t('toastScanError'),
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsScanningBms(false);
    }
  };

  const handleGenerate = async () => {
    if (!ssid || !password || !deviceId) {
      toast({
        title: "Error",
        description: "Fill Wi-Fi and device name",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    setIsGenerating(true);
    try {
      let serverUrl = "";
      if (mode === 'bridge') {
        serverUrl = useLocalHub 
          ? `http://${localHubIp}/api/update` 
          : `${window.location.origin}/api/bms/update?userId=${user.uid}`;
      } else if (mode === 'display') {
        serverUrl = useLocalHub 
          ? `http://${localHubIp}/api/data` 
          : `${window.location.origin}/api/bms/aggregated?userId=${user.uid}`;
      }

      const result = await generateEsp32Firmware({ 
        mode,
        displayType: displayType as any,
        customDisplayDescription: displayType === 'custom' ? customDisplayDescription : undefined,
        ssid, 
        password, 
        deviceId,
        bmsIdentifier: (mode === 'bridge') ? bmsIdentifier : undefined,
        espModel: espModel as any,
        serverUrl 
      });
      setFirmware(result.firmwareContent);
      toast({
        title: t('toastFirmwareReady'),
        description: `${t('firmwareMode')}: ${mode.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate firmware.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!firmware) return;
    const element = document.createElement("a");
    const file = new Blob([firmware], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${deviceId}.ino`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-accent" />
          <CardTitle>{t('firmwareWizard')}</CardTitle>
        </div>
        <CardDescription>
          {t('wifiHubDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(val: any) => setMode(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-10">
            <TabsTrigger value="bridge" className="gap-1 text-[9px] sm:text-xs" disabled={espModel === 'esp8266'}>
              <Radio className="h-3 w-3" /> {t('bridgeMode')}
            </TabsTrigger>
            <TabsTrigger value="hub" className="gap-1 text-[9px] sm:text-xs" disabled={espModel === 'esp8266'}>
              <Share2 className="h-3 w-3" /> {t('hubMode')}
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-1 text-[9px] sm:text-xs">
              <Monitor className="h-3 w-3" /> {t('screenMode')}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'hub' && (
          <Alert variant="default" className="bg-accent/10 border-accent/20 text-accent">
            <Server className="h-4 w-4" />
            <AlertTitle>{t('hubAlertTitle')}</AlertTitle>
            <AlertDescription className="text-xs">
              {t('hubAlertDesc')}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> {t('mcuModel')}
            </Label>
            <Select value={espModel} onValueChange={setEspModel}>
              <SelectTrigger className="bg-secondary/50 border-none">
                <SelectValue placeholder="MCU" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="esp32c3">ESP32-C3</SelectItem>
                <SelectItem value="esp32s3">ESP32-S3</SelectItem>
                <SelectItem value="esp32">ESP32 Classic</SelectItem>
                <SelectItem value="esp8266">ESP8266</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tv className="h-4 w-4" /> {t('display')}
            </Label>
            <Select value={displayType} onValueChange={setDisplayType}>
              <SelectTrigger className="bg-secondary/50 border-none">
                <SelectValue placeholder="Display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('displayNone')}</SelectItem>
                <SelectItem value="ssd1306">OLED 0.96" (SSD1306)</SelectItem>
                <SelectItem value="sh1106">OLED 1.3" (SH1106)</SelectItem>
                <SelectItem value="lcd1602">LCD 1602 (I2C)</SelectItem>
                <SelectItem value="custom">{t('displayCustom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {displayType === 'custom' && (
            <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>{t('customDisplayDescLabel')}</Label>
              <Input 
                placeholder="ST7735 SPI..." 
                value={customDisplayDescription} 
                onChange={(e) => setCustomDisplayDescription(e.target.value)}
                className="bg-secondary/50 border-none"
              />
            </div>
          )}

          {(mode === 'bridge' || mode === 'display') && (
            <div className="md:col-span-2 p-4 bg-secondary/30 rounded-lg space-y-4 border border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t('useLocalHub')}</Label>
                  <p className="text-[10px] text-muted-foreground">{t('useLocalHubDesc')}</p>
                </div>
                <Switch checked={useLocalHub} onCheckedChange={setUseLocalHub} />
              </div>
              
              {useLocalHub && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-xs">{t('localHubIpAddr')}</Label>
                  <Input 
                    placeholder="192.168.1.50" 
                    value={localHubIp} 
                    onChange={(e) => setLocalHubIp(e.target.value)}
                    className="bg-background border-accent/20"
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'bridge' && (
            <>
              {insights && insights.length > 0 && (
                <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-accent" /> {t('aiModelSelect')}
                  </Label>
                  <Select onValueChange={(val) => setBmsIdentifier(val)}>
                    <SelectTrigger className="bg-secondary/50 border-none">
                      <SelectValue placeholder={t('selectKnownModel')} />
                    </SelectTrigger>
                    <SelectContent>
                      {insights.map((insight: any) => (
                        <SelectItem key={insight.id} value={insight.modelName}>
                          {insight.modelName} ({insight.protocol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">Використовуйте спільну базу знань ШІ для налаштування.</p>
                </div>
              )}

              <div className="md:col-span-2 space-y-2">
                <Label className="flex items-center gap-2">
                  <BluetoothIcon className="h-4 w-4" /> {t('bmsId')}
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="JBD-BMS..." 
                    value={bmsIdentifier} 
                    onChange={(e) => setBmsIdentifier(e.target.value)}
                    className="bg-secondary/50 border-none"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleScanBms} 
                    disabled={isScanningBms}
                    className="border-accent/20 text-accent gap-2 whitespace-nowrap"
                  >
                    {isScanningBms ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {t('find')}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> {t('wifiSsid')}
            </Label>
            <Input 
              placeholder="SSID" 
              value={ssid} 
              onChange={(e) => setSsid(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> {t('wifiPass')}
            </Label>
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-stretch">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !user}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('generateFirmware')}
        </Button>
        {firmware && (
          <Button variant="outline" onClick={handleDownload} className="w-full border-accent/20 text-accent hover:bg-accent/10">
            <Download className="mr-2 h-4 w-4" />
            {t('downloadIno')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
