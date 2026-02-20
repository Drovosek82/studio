"use client";

import { useState, useEffect } from "react";
import { Download, Cpu, Wifi, Shield, Code, Loader2, Globe, User, Bluetooth } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateEsp32Firmware } from "@/ai/flows/generate-esp32-firmware";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export function FirmwareWizard() {
  const { user } = useUser();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [bmsIdentifier, setBmsIdentifier] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [firmware, setFirmware] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const randomId = Math.random().toString(36).substr(2, 4).toUpperCase();
    setDeviceId(`BMS_BRIDGE_${randomId}`);
    if (typeof window !== 'undefined') {
      setServerUrl(`${window.location.origin}/api/bms/update`);
    }
  }, []);

  const handleGenerate = async () => {
    if (!ssid || !password || !deviceId || !bmsIdentifier) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля, включаючи назву BMS",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Помилка авторизації",
        description: "Увійдіть у систему, щоб пристрій міг зареєструватися у вашому профілі.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateEsp32Firmware({ 
        ssid, 
        password, 
        deviceId,
        bmsIdentifier,
        serverUrl: `${serverUrl}?userId=${user.uid}` 
      });
      setFirmware(result.firmwareContent);
      toast({
        title: "Прошивку створено",
        description: "Тепер ESP32 автоматично підключиться до вашої BMS через Bluetooth.",
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
    element.download = `JBD_BLE_Bridge_${deviceId}.ino`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-5 w-5 text-accent" />
          <CardTitle>BLE-WiFi Bridge Generator</CardTitle>
        </div>
        <CardDescription>
          Створіть прошивку для ESP32-C3, яка буде зчитувати вашу BMS через Bluetooth і передавати дані в хмару.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-500 text-xs">
            <User className="h-4 w-4" />
            Будь ласка, увійдіть перед генерацією прошивки.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Shield className="h-4 w-4" /> Wi-Fi Password
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
          <div className="space-y-2">
            <Label htmlFor="bmsName" className="flex items-center gap-2">
              <Bluetooth className="h-4 w-4" /> Назва BMS (Bluetooth)
            </Label>
            <Input 
              id="bmsName" 
              placeholder="Напр. JBD-SP15S001" 
              value={bmsIdentifier} 
              onChange={(e) => setBmsIdentifier(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="devId" className="flex items-center gap-2">
              <Cpu className="h-4 w-4" /> ID пристрою
            </Label>
            <Input 
              id="devId" 
              value={deviceId} 
              onChange={(e) => setDeviceId(e.target.value)}
              className="bg-secondary/50 border-none font-code text-xs"
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
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Згенерувати прошивку для моста'}
        </Button>
        {firmware && (
          <Button variant="outline" onClick={handleDownload} className="w-full border-accent/20 text-accent hover:bg-accent/10">
            <Download className="mr-2 h-4 w-4" />
            Завантажити .ino файл
          </Button>
        )}
        <p className="text-[10px] text-muted-foreground text-center">
          Після прошивки ESP32 автоматично зареєструє пристрій у вашому профілі при першій передачі даних.
        </p>
      </CardFooter>
    </Card>
  );
}
