"use client";

import { useState, useEffect } from "react";
import { Download, Cpu, Wifi, Shield, Code, Loader2, Globe, User, Bluetooth, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEsp32Firmware } from "@/ai/flows/generate-esp32-firmware";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";

export function FirmwareWizard() {
  const { user } = useUser();
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [bmsIdentifier, setBmsIdentifier] = useState("");
  const [espModel, setEspModel] = useState<string>("esp32c3");
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
        description: "Будь ласка, заповніть всі поля конфігурації",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Помилка авторизації",
        description: "Увійдіть у систему для генерації персональної прошивки",
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
        espModel: espModel as any,
        serverUrl: `${serverUrl}?userId=${user.uid}` 
      });
      setFirmware(result.firmwareContent);
      toast({
        title: "Прошивку створено",
        description: `Код оптимізовано для моделі ${espModel.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося згенерувати прошивку. Спробуйте пізніше.",
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
    element.download = `BMS_Bridge_${espModel}_${deviceId}.ino`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-accent" />
          <CardTitle>Конструктор BLE-WiFi Моста</CardTitle>
        </div>
        <CardDescription>
          Налаштуйте вашу ESP32 для стабільної роботи. Для моделей з однією антеною буде застосовано режим Coexistence.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-500 text-xs">
            <User className="h-4 w-4" />
            Авторизуйтесь, щоб пристрій автоматично з'явився у вашому профілі.
          </div>
        )}
        
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

          <div className="space-y-2">
            <Label htmlFor="ssid" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Wi-Fi SSID
            </Label>
            <Input 
              id="ssid" 
              placeholder="SSID" 
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
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="bg-secondary/50 border-none"
            />
          </div>
        </div>

        <div className="p-3 bg-secondary/30 rounded-lg text-[10px] text-muted-foreground flex flex-col gap-1">
          <p>• <b>ESP32-C3:</b> ШІ додасть логіку перемикання радіо для уникнення конфліктів антени.</p>
          <p>• <b>S3/Classic:</b> Буде використано переваги другого ядра для паралельної роботи.</p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 items-stretch">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !user}
          className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Згенерувати оптимізований код'}
        </Button>
        {firmware && (
          <Button variant="outline" onClick={handleDownload} className="w-full border-accent/20 text-accent hover:bg-accent/10">
            <Download className="mr-2 h-4 w-4" />
            Завантажити .ino для Arduino IDE
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
