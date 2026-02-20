"use client";

import { useState, useEffect } from "react";
import { Download, Cpu, Wifi, Shield, Code, Loader2, Globe, User, Bluetooth, Layers, Monitor, Radio, Tv, AlertTriangle, Server, Database } from "lucide-react";
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
  const [mode, setMode] = useState<'bridge' | 'display' | 'local_server'>('bridge');
  const [displayType, setDisplayType] = useState<string>("none");
  const [customDisplayDescription, setCustomDisplayDescription] = useState("");
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
    const modePrefix = mode === 'local_server' ? 'SRV' : mode.toUpperCase();
    setDeviceId(`BMS_${modePrefix}_${randomId}`);
  }, [mode]);

  useEffect(() => {
    if (espModel === 'esp8266' && (mode === 'bridge' || mode === 'local_server')) {
      setMode('display');
      toast({
        title: "MCU обмеження",
        description: "ESP8266 не має Bluetooth, тому доступний лише режим екрана.",
      });
    }
  }, [espModel, mode, toast]);

  const handleGenerate = async () => {
    if (!ssid || !password || !deviceId || (mode !== 'display' && !bmsIdentifier)) {
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
      let serverUrl = "";
      if (mode === 'bridge') {
        serverUrl = `${window.location.origin}/api/bms/update?userId=${user.uid}`;
      } else if (mode === 'display') {
        serverUrl = `${window.location.origin}/api/bms/aggregated?userId=${user.uid}`;
      } else {
        serverUrl = "Local Address (0.0.0.0)";
      }

      const result = await generateEsp32Firmware({ 
        mode,
        displayType: displayType as any,
        customDisplayDescription: displayType === 'custom' ? customDisplayDescription : undefined,
        ssid, 
        password, 
        deviceId,
        bmsIdentifier: mode !== 'display' ? bmsIdentifier : undefined,
        espModel: espModel as any,
        serverUrl 
      });
      setFirmware(result.firmwareContent);
      toast({
        title: "Прошивку створено",
        description: `Режим: ${mode === 'local_server' ? 'Локальний сервер' : mode === 'bridge' ? 'Міст' : 'Екран'}.`,
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
          Створіть вузол моніторингу, віддалений екран або автономний локальний сервер.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(val: any) => setMode(val)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="bridge" className="gap-2 text-[10px] sm:text-xs" disabled={espModel === 'esp8266'}>
              <Radio className="h-4 w-4" /> Міст
            </TabsTrigger>
            <TabsTrigger value="local_server" className="gap-2 text-[10px] sm:text-xs" disabled={espModel === 'esp8266'}>
              <Server className="h-4 w-4" /> Сервер
            </TabsTrigger>
            <TabsTrigger value="display" className="gap-2 text-[10px] sm:text-xs">
              <Monitor className="h-4 w-4" /> Екран
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {espModel === 'esp8266' && mode !== 'display' && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg text-xs">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            ESP8266 не підтримує Bluetooth. Виберіть ESP32 для моста або сервера.
          </div>
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
              <Tv className="h-4 w-4" /> Дисплей (опція)
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
                <SelectItem value="custom">Інший (Описати ШІ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {displayType === 'custom' && (
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2 text-accent">
                <Code className="h-4 w-4" /> Опис дисплея
              </Label>
              <Input 
                placeholder="Напр. OLED 1.54 SPI, Waveshare E-Ink..." 
                value={customDisplayDescription} 
                onChange={(e) => setCustomDisplayDescription(e.target.value)}
                className="bg-secondary/50 border-accent/20 border"
              />
            </div>
          )}

          {mode !== 'display' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bluetooth className="h-4 w-4" /> Назва BMS
              </Label>
              <Input 
                placeholder="Напр. JBD-SP15S001" 
                value={bmsIdentifier} 
                onChange={(e) => setBmsIdentifier(e.target.value)}
                className="bg-secondary/50 border-none"
              />
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

        <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
          <h4 className="text-xs font-bold text-accent mb-2 flex items-center gap-2">
            {mode === 'local_server' ? <Server className="h-3 w-3" /> : <Database className="h-3 w-3" />}
            {mode === 'local_server' ? 'Логіка сервера:' : mode === 'bridge' ? 'Логіка моста:' : 'Логіка екрана:'}
          </h4>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {mode === 'local_server' 
              ? 'ESP32 створить власний веб-сайт у локальній мережі. Ви зможете бачити дані батареї за його IP-адресою навіть без інтернету.'
              : mode === 'bridge'
              ? 'ESP32 збирає дані з BMS та відправляє їх у вашу хмару через інтернет.'
              : 'ESP32 отримує загальну статистику вашої системи через Wi-Fi та виводить її на дисплей.'}
          </p>
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
            Завантажити .ino файл
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
