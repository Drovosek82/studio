"use client";

import { useState } from "react";
import { Download, Cpu, Wifi, Shield, Code, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateEsp32Firmware } from "@/ai/flows/generate-esp32-firmware";
import { useToast } from "@/hooks/use-toast";

export function FirmwareWizard() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [deviceId, setDeviceId] = useState("ESP32_BMS_001");
  const [isGenerating, setIsGenerating] = useState(false);
  const [firmware, setFirmware] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!ssid || !password || !deviceId) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateEsp32Firmware({ ssid, password, deviceId });
      setFirmware(result.firmwareContent);
      toast({
        title: "Готово",
        description: "Прошивку успішно згенеровано!",
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
    element.download = `${deviceId}.ino`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-5 w-5 text-accent" />
          <CardTitle>Генератор прошивки ESP32</CardTitle>
        </div>
        <CardDescription>
          Створіть персоналізований .ino файл для вашого ESP32-C3 Super Mini
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ssid" className="flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Wi-Fi SSID
            </Label>
            <Input 
              id="ssid" 
              placeholder="Назва вашої мережі" 
              value={ssid} 
              onChange={(e) => setSsid(e.target.value)}
              className="bg-secondary/50"
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
              className="bg-secondary/50"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deviceId" className="flex items-center gap-2">
            <Code className="h-4 w-4" /> Device ID
          </Label>
          <Input 
            id="deviceId" 
            placeholder="Наприклад: BMS_LIVING_ROOM" 
            value={deviceId} 
            onChange={(e) => setDeviceId(e.target.value)}
            className="bg-secondary/50"
          />
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Генерація...
            </>
          ) : (
            'Згенерувати код'
          )}
        </Button>
        {firmware && (
          <Button variant="outline" onClick={handleDownload} className="border-accent/20 text-accent hover:bg-accent/10">
            <Download className="mr-2 h-4 w-4" />
            Завантажити .ino
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}