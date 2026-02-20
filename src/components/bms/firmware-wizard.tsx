"use client";

import { useState, useEffect } from "react";
import { Download, Cpu, Wifi, Shield, Code, Loader2, Globe, User, Bluetooth, Layers, Monitor, Radio, Tv } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateEsp32Firmware } from "@/ai/flows/generate-esp32-firmware";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export function FirmwareWizard() {
  const { user } = useUser();
  const [mode, setMode] = useState<'bridge' | 'display'>('bridge');
  const [displayType, setDisplayType] = useState<string>("none");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [bmsIdentifier, setBmsIdentifier] = useState("");
  const [espModel, setEspModel] = useState<string>("esp32c3");
  const [isGenerating, setIsGenerating] = useState(false);
  const [firmware, setFirmware] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const randomId = Math.random().toString(36).substr(2, 4).toUpperCase();
    setDeviceId(`BMS_${mode.toUpperCase()}_${randomId}`);
  }, [mode]);

  const handleGenerate = async () => {
    if (!ssid || !password || !deviceId || (mode === 'bridge' && !bmsIdentifier)) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля конфігурації",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Помилка авторизації",
        description: "Увійдіть у систему для генерації прошивки",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const serverUrl = mode === 'bridge' 
        ? `${window.location.origin}/api/bms/update?userId=${user.uid}`
        : `${window.location.origin}/api/bms/aggregated?userId=${user.uid}`;

      const result = await generateEsp32Firmware({ 
        mode,
        displayType: displayType as any,
        ssid, 
        password, 
        deviceId,
        bmsIdentifier: mode === 'bridge' ? bmsIdentifier : undefined,
        espModel: espModel as any,
        serverUrl 
      });
      setFirmware(result.firmwareContent);
      toast({
        title: "Прошивку створено",
        description: `Режим: ${mode === 'bridge' ? 'Міст' : 'Екран'}. Дисплей: ${displayType.toUpperCase()}.`,
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
          <CardTitle>Конструктор пристроїв</CardTitle>
        </div>
        <CardDescription>
          Створіть розумний міст для збору даних або віддалений екран для моніторингу системи.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(val: any) => setMode(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger value="bridge" className="gap-2">
              <Radio className="h-4 w-4" /> Вузол (Міст)
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2">
              <Monitor className="h-4 w-4" /> Термінал (Екран)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Модель ESP32
            </Label>
            <Select value={espModel} onValueChange={setEspModel}>
              <SelectTrigger className="bg-secondary/50 border-none">
                <SelectValue placeholder="Оберіть чіп" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="esp32c3">ESP32-C3 (Single Antenna)</SelectItem>
                <SelectItem value="esp32s3">ESP32-S3 (Dual Core)</SelectItem>
                <SelectItem value="esp32">ESP32 Classic (Dual Core)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'display' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tv className="h-4 w-4" /> Тип дисплея
              </Label>
              <Select value={displayType} onValueChange={setDisplayType}>
                <SelectTrigger className="bg-secondary/50 border-none">
                  <SelectValue placeholder="Оберіть дисплей" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Тільки Serial (Без екрана)</SelectItem>
                  <SelectItem value="ssd1306">OLED 0.96" (SSD1306)</SelectItem>
                  <SelectItem value="sh1106">OLED 1.3" (SH1106)</SelectItem>
                  <SelectItem value="lcd1602">LCD 1602 (I2C)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'bridge' && (
            <div className="space-y-2">
              <Label htmlFor="bmsName" className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4" /> Назва BMS
              </Label>
              <Input 
                id="bmsName" 
                placeholder="Напр. JBD-SP15S001" 
                value={bmsIdentifier} 
                onChange={(e) => setBmsIdentifier(e.target.value)}
                className="bg-secondary/50 border-none"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="ssid" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Wi-Fi SSID
            </Label>
            <Input 
              id="ssid" 
              placeholder="Назва мережі" 
              value={ssid} 
              onChange={(e) => setSsid(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Wi-Fi Пароль
            </Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Пароль" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
        </div>

        <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
          <h4 className="text-xs font-bold text-accent mb-2 flex items-center gap-2">
            <Monitor className="h-3 w-3" /> 
            {mode === 'bridge' ? 'Логіка моста:' : 'Логіка екрана:'}
          </h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {mode === 'bridge' 
              ? "Пристрій з'єднається з BMS по Bluetooth і відправлятиме дані в хмару кожні 10 секунд. Оптимізовано для обраної моделі чіпа."
              : `Пристрій буде отримувати агреговані дані всієї системи через Wi-Fi та виводити їх на ${displayType === 'none' ? 'Serial порт' : 'обраний дисплей'}.`}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-stretch">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !user}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Згенерувати код (.ino)'}
        </Button>
        {firmware && (
          <Button variant="outline" onClick={handleDownload} className="w-full border-accent/20 text-accent hover:bg-accent/10">
            <Download className="mr-2 h-4 w-4" />
            Завантажити файл прошивки
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
