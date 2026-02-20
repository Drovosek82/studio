
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, Search, AlertTriangle, Cpu, Globe, Plus, Smartphone, Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useBmsStore } from "@/lib/bms-store";
import { toast } from "@/hooks/use-toast";

export function BluetoothConnector() {
  const router = useRouter();
  const { addDirectBluetoothDevice, devices, isDemoMode } = useBmsStore();
  const [isScanning, setIsScanning] = useState(false);
  const [espName, setEspName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { addNetworkDevice } = useBmsStore();

  const handleDirectBluetooth = async () => {
    setIsScanning(true);
    setError(null);
    try {
      if (isDemoMode) {
        // У демо-режимі завжди знаходимо демо-модель
        await new Promise(r => setTimeout(r, 1500));
        const bmsName = "Demo-JBD-BMS-Scanner";
        const id = addDirectBluetoothDevice(bmsName);
        toast({
          title: "Демо-пристрій знайдено",
          description: `Ви підключилися до симулятора: ${bmsName}.`,
        });
        router.push(`/battery/${id}`);
        return;
      }

      // Реальна логіка Web Bluetooth
      if (typeof window !== 'undefined' && !navigator.bluetooth) {
        throw new Error("Ваш браузер не підтримує Web Bluetooth. Використовуйте Chrome або Edge через HTTPS.");
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000ff00-0000-1000-8000-00805f9b34fb', // JBD Standard
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Info
          '0000180f-0000-1000-8000-00805f9b34fb'  // Battery Service
        ]
      });

      const id = addDirectBluetoothDevice(device.name || "Real BMS Device");
      
      toast({
        title: "Пристрій підключено",
        description: `З'єднання з ${device.name || 'BMS'} встановлено.`,
      });
      
      router.push(`/battery/${id}`);
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        setError("Пошук скасовано або пристроїв не знайдено.");
      } else {
        setError(err.message || "Помилка підключення до Bluetooth");
      }
      toast({
        title: "Помилка",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddEsp = () => {
    if (!espName) return;
    
    if (devices.filter(d => d.type === 'ESP32').length >= 20) {
      toast({
        title: "Ліміт вузлів",
        description: "Максимум 20 ESP32 для агрегації.",
        variant: "destructive"
      });
      return;
    }
    
    addNetworkDevice(espName);
    setEspName("");
    
    toast({
      title: "Пристрій додано",
      description: isDemoMode 
        ? `${espName} підключено до симуляції.` 
        : `${espName} додано у стані очікування (Offline). Увімкніть демо-режим для симуляції даних.`,
    });
  };

  return (
    <div className="space-y-8 py-4">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in duration-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Помилка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Спосіб підключення</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Оберіть прямий доступ для налаштування або мережу ESP32 для постійного моніторингу.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none flex flex-col hover:ring-1 hover:ring-accent/50 transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <Bluetooth className="h-6 w-6" />
            </div>
            <CardTitle>Прямий BLE доступ</CardTitle>
            <CardDescription>
              Миттєве підключення до BMS через браузер. {isDemoMode && "(Демо-режим активний)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end gap-4">
            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                <Smartphone className="h-3 w-3" /> Можливості
              </div>
              <ul className="text-xs space-y-1 list-disc list-inside opacity-70 text-foreground">
                <li>Повний доступ до EEPROM</li>
                <li>Без Wi-Fi та серверів</li>
                <li>Пряма зміна параметрів</li>
              </ul>
            </div>
            <Button 
              size="lg" 
              onClick={handleDirectBluetooth}
              disabled={isScanning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isScanning ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Пошук...
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4 mr-2" />
                  {isDemoMode ? "Знайти демо-BMS" : "Знайти реальну BMS"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-none flex flex-col hover:ring-1 hover:ring-accent/50 transition-all duration-300">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <CardTitle>Мережа ESP32</CardTitle>
            <CardDescription>
              Агрегація даних з багатьох батарей через Wi-Fi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end gap-4">
            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold">
                <Radio className="h-3 w-3" /> Переваги
              </div>
              <ul className="text-xs space-y-1 list-disc list-inside opacity-70 text-foreground">
                <li>Моніторинг до 20 збірок</li>
                <li>Агрегація потужності та SoC</li>
                <li>Віддалений доступ 24/7</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Input 
                placeholder="Назва ESP32..." 
                value={espName} 
                onChange={(e) => setEspName(e.target.value)}
                className="bg-secondary/30 h-10 border-none text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEsp()}
              />
              <Button onClick={handleAddEsp} className="bg-accent text-accent-foreground h-10 aspect-square p-0">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {devices.filter(d => d.type === 'ESP32').length > 0 && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-1">Активні вузли мережі:</h4>
          <div className="grid grid-cols-1 gap-2">
            {devices.filter(d => d.type === 'ESP32').map(dev => (
              <div key={dev.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Cpu className={`h-4 w-4 ${dev.status === 'Online' ? 'text-accent' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{dev.name}</p>
                    <p className="text-[8px] text-muted-foreground opacity-50 font-mono">ID: {dev.id}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={dev.status === 'Online' ? 'text-green-500 border-green-500/20' : 'text-muted-foreground border-muted/20'}
                >
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
