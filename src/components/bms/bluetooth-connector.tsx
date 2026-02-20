
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, Search, Cpu, Globe, Plus, Smartphone, Radio, ShieldAlert, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useBmsStore } from "@/lib/bms-store";
import { toast } from "@/hooks/use-toast";

export function BluetoothConnector() {
  const router = useRouter();
  const { addDirectBluetoothDevice, devices, isDemoMode, addNetworkDevice } = useBmsStore();
  const [isScanning, setIsScanning] = useState(false);
  const [espName, setEspName] = useState("");
  const [error, setError] = useState<{title: string, message: string, isSecurity: boolean} | null>(null);

  const handleDirectBluetooth = async () => {
    setIsScanning(true);
    setError(null);
    try {
      // 1. Якщо увімкнено демо-режим, просто додаємо демо-пристрій
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 800));
        const id = addDirectBluetoothDevice("Demo-JBD-BMS-Scanner");
        toast({
          title: "Демо-BMS активовано",
          description: "Симуляція прямого підключення готова.",
        });
        router.push(`/battery/${id}`);
        return;
      }

      // 2. Перевірка наявності API
      if (typeof window !== 'undefined' && !navigator.bluetooth) {
        throw new Error("Ваш браузер не підтримує Web Bluetooth. Спробуйте Chrome або Edge через HTTPS.");
      }

      // 3. Запит пристрою (може кинути SecurityError у фреймах)
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000ff00-0000-1000-8000-00805f9b34fb',
          '0000180a-0000-1000-8000-00805f9b34fb'
        ]
      }).catch(err => {
        // Специфічна обробка для помилок всередині requestDevice
        if (err.name === 'SecurityError' || err.message.includes('Permissions-Policy')) {
          const securityErr = new Error("Permissions-Policy заблокував Bluetooth у цьому вікні.");
          securityErr.name = 'SecurityError';
          throw securityErr;
        }
        throw err;
      });

      const id = addDirectBluetoothDevice(device.name || "Real BMS Device");
      toast({
        title: "Пристрій підключено",
        description: `З'єднання з ${device.name || 'BMS'} встановлено.`,
      });
      router.push(`/battery/${id}`);

    } catch (err: any) {
      console.warn("Bluetooth Access Blocked:", err.message);
      
      const isSecurity = err.name === 'SecurityError' || err.message.includes('Permissions-Policy');
      
      let errorTitle = "Помилка підключення";
      let errorMessage = err.message;

      if (isSecurity) {
        errorTitle = "Доступ обмежено браузером";
        errorMessage = "Це вікно (iframe) не має прав на використання Bluetooth. Для роботи з реальним залізом запустіть додаток локально або увімкніть 'Демо-режим' для тестування інтерфейсу.";
      } else if (err.name === 'NotFoundError') {
        errorTitle = "Скасовано";
        errorMessage = "Вибір пристрою було скасовано.";
      }

      setError({ title: errorTitle, message: errorMessage, isSecurity });
      
      if (!isSecurity) {
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddEsp = () => {
    if (!espName) return;
    addNetworkDevice(espName);
    setEspName("");
    toast({
      title: "ESP32 додано",
      description: isDemoMode ? "Симуляція запущена." : "Пристрій у стані Offline (очікування даних).",
    });
  };

  return (
    <div className="space-y-8 py-4">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in zoom-in duration-300">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription className="text-xs space-y-2">
            <p>{error.message}</p>
            {error.isSecurity && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-destructive underline flex items-center gap-1 text-[10px]"
                onClick={() => window.open(window.location.href, '_blank')}
              >
                <ExternalLink className="h-3 w-3" /> Відкрити в новій вкладці
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Спосіб підключення</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Прямий доступ для сервісного налаштування або мережа ESP32 для моніторингу.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none flex flex-col hover:ring-1 hover:ring-blue-500/50 transition-all duration-300 overflow-hidden group">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <Bluetooth className="h-6 w-6" />
            </div>
            <CardTitle>Прямий BLE доступ</CardTitle>
            <CardDescription>Керування BMS через Bluetooth (без агрегації).</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end gap-4">
            <div className="bg-secondary/20 rounded-lg p-4 text-[10px] space-y-1 opacity-70">
              <p>• Повний доступ до EEPROM</p>
              <p>• Тільки для однієї батареї одночасно</p>
            </div>
            <Button 
              size="lg" 
              onClick={handleDirectBluetooth}
              disabled={isScanning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScanning ? <Search className="h-4 w-4 mr-2 animate-spin" /> : <Bluetooth className="h-4 w-4 mr-2" />}
              {isDemoMode ? "Знайти демо-BMS" : "Сканувати Bluetooth"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-none flex flex-col hover:ring-1 hover:ring-accent/50 transition-all duration-300 overflow-hidden group">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <CardTitle>Мережа ESP32</CardTitle>
            <CardDescription>Моніторинг багатьох батарей через Wi-Fi.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end gap-4">
            <div className="bg-secondary/20 rounded-lg p-4 text-[10px] space-y-1 opacity-70">
              <p>• Агрегація даних (до 20 пристроїв)</p>
              <p>• Віддалений доступ 24/7</p>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Назва ESP32..." 
                value={espName} 
                onChange={(e) => setEspName(e.target.value)}
                className="bg-secondary/30 border-none h-10"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEsp()}
              />
              <Button onClick={handleAddEsp} className="bg-accent text-accent-foreground h-10 px-3">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {devices.filter(d => d.type === 'ESP32').length > 0 && (
        <div className="space-y-3 pt-4 animate-in fade-in slide-in-from-bottom-4">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Активні вузли мережі:</h4>
          <div className="grid grid-cols-1 gap-2">
            {devices.filter(d => d.type === 'ESP32').map(dev => (
              <div key={dev.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <Cpu className={`h-4 w-4 ${dev.status === 'Online' ? 'text-accent' : 'text-muted-foreground opacity-50'}`} />
                  <span className="text-sm font-medium">{dev.name}</span>
                </div>
                <Badge variant="outline" className={dev.status === 'Online' ? 'text-green-500 border-green-500/20' : 'text-muted-foreground border-muted/20'}>
                  {dev.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
