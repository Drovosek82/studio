"use client";

import { useState, useEffect } from "react";
import { 
  Download, 
  Cpu, 
  Wifi, 
  Shield, 
  Code, 
  Loader2, 
  Globe, 
  User, 
  Bluetooth, 
  Layers, 
  Monitor, 
  Radio, 
  Tv, 
  AlertTriangle, 
  Server, 
  Database, 
  Share2,
  Search
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
import { useUser } from "@/firebase";

export function FirmwareWizard() {
  const { user } = useUser();
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

  useEffect(() => {
    const randomId = Math.random().toString(36).substr(2, 4).toUpperCase();
    const modePrefix = mode === 'hub' ? 'HUB' : mode.toUpperCase();
    setDeviceId(`BMS_${modePrefix}_${randomId}`);
  }, [mode]);

  useEffect(() => {
    if (espModel === 'esp8266' && (mode === 'bridge' || mode === 'hub')) {
      setMode('display');
      toast({
        title: "MCU обмеження",
        description: "ESP8266 не має Bluetooth, тому доступний лише режим екрана.",
      });
    }
  }, [espModel, mode, toast]);

  const handleScanBms = async () => {
    if (typeof window !== 'undefined' && !navigator.bluetooth) {
      toast({
        title: "Помилка",
        description: "Ваш браузер не підтримує Web Bluetooth. Використовуйте Chrome або Edge.",
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
          title: "BMS знайдено",
          description: `Вибрано пристрій: ${device.name}`,
        });
      }
    } catch (err: any) {
      if (err.name !== 'NotFoundError') {
        toast({
          title: "Помилка сканування",
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
        title: "Помилка",
        description: "Заповніть Wi-Fi та назву пристрою",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'bridge' && !bmsIdentifier) {
      toast({
        title: "Помилка",
        description: "Вкажіть Bluetooth назву BMS для моста",
        variant: "destructive",
      });
      return;
    }

    if (useLocalHub && !localHubIp) {
      toast({
        title: "Помилка",
        description: "Вкажіть IP-адресу локального хаба",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Помилка авторизації",
        description: "Увійдіть у систему",
        variant: "destructive",
      });
      return;
    }

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
      } else if (mode === 'hub') {
        serverUrl = "Local Hub Aggregator";
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
        title: "Прошивку створено",
        description: `Готово для режиму: ${mode.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося згенерувати прошивку.",
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
          <CardTitle>Конструктор екосистеми</CardTitle>
        </div>
        <CardDescription>
          Створіть вузли (Bridges), центральний Хаб (Server) або віддалені дисплеї.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(val: any) => setMode(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50 h-10">
            <TabsTrigger value="bridge" className="gap-1 text-[9px] sm:text-xs" disabled={espModel === 'esp8266'}>
              <Radio className="h-3 w-3" /> Міст
            </TabsTrigger>
            <TabsTrigger value="hub" className="gap-1 text-[9px] sm:text-xs" disabled={espModel === 'esp8266'}>
              <Share2 className="h-3 w-3" /> Хаб
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-1 text-[9px] sm:text-xs">
              <Monitor className="h-3 w-3" /> Екран
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {mode === 'hub' && (
          <Alert variant="default" className="bg-accent/10 border-accent/20 text-accent">
            <Server className="h-4 w-4" />
            <AlertTitle>Режим Хаба</AlertTitle>
            <AlertDescription className="text-xs">
              Ця ESP32 стане <b>Центральним Сервером</b>. Вона не підключається до BMS сама, а збирає дані від усіх ваших "Містків" (Bridges) у мережі.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Модель MCU
            </Label>
            <Select value={espModel} onValueChange={setEspModel}>
              <SelectTrigger className="bg-secondary/50 border-none">
                <SelectValue placeholder="Оберіть чіп" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="esp32c3">ESP32-C3</SelectItem>
                <SelectItem value="esp32s3">ESP32-S3</SelectItem>
                <SelectItem value="esp32">ESP32 Classic</SelectItem>
                <SelectItem value="esp8266">ESP8266 (Тільки екран)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Tv className="h-4 w-4" /> Дисплей
            </Label>
            <Select value={displayType} onValueChange={setDisplayType}>
              <SelectTrigger className="bg-secondary/50 border-none">
                <SelectValue placeholder="Оберіть дисплей" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без екрана</SelectItem>
                <SelectItem value="ssd1306">OLED 0.96" (SSD1306)</SelectItem>
                <SelectItem value="sh1106">OLED 1.3" (SH1106)</SelectItem>
                <SelectItem value="lcd1602">LCD 1602 (I2C)</SelectItem>
                <SelectItem value="custom">Інший (Опис ШІ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {displayType === 'custom' && (
            <div className="md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label>Опис нестандартного дисплея</Label>
              <Input 
                placeholder="Напр. 1.8 TFT ST7735 SPI" 
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
                  <Label className="text-sm">Використовувати локальний Хаб</Label>
                  <p className="text-[10px] text-muted-foreground">Надсилати дані на іншу ESP32 замість хмари</p>
                </div>
                <Switch checked={useLocalHub} onCheckedChange={setUseLocalHub} />
              </div>
              
              {useLocalHub && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-xs">IP адреса вашого Хаба</Label>
                  <Input 
                    placeholder="Напр. 192.168.1.50" 
                    value={localHubIp} 
                    onChange={(e) => setLocalHubIp(e.target.value)}
                    className="bg-background border-accent/20"
                  />
                </div>
              )}
            </div>
          )}

          {mode === 'bridge' && (
            <div className="md:col-span-2 space-y-2">
              <Label className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4" /> Ідентифікатор BMS
              </Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Назва пристрою (напр. JBD-BMS)" 
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
                  Знайти
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Wi-Fi SSID
            </Label>
            <Input 
              placeholder="Назва мережі" 
              value={ssid} 
              onChange={(e) => setSsid(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Wi-Fi Пароль
            </Label>
            <Input 
              type="password" 
              placeholder="Пароль" 
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
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Згенерувати прошивку'}
        </Button>
        {firmware && (
          <Button variant="outline" onClick={handleDownload} className="w-full border-accent/20 text-accent hover:bg-accent/10">
            <Download className="mr-2 h-4 w-4" />
            Завантажити .ino file
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}