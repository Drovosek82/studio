
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth, Search, Link as LinkIcon, AlertTriangle, Cpu, Globe, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBmsStore } from "@/lib/bms-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export function BluetoothConnector() {
  const router = useRouter();
  const { addDirectBluetoothDevice, addNetworkDevice, devices, isDemoMode } = useBmsStore();
  const [isScanning, setIsScanning] = useState(false);
  const [espName, setEspName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDirectBluetooth = async () => {
    setIsScanning(true);
    setError(null);
    try {
      // Імітація сканування
      await new Promise(r => setTimeout(r, 2000));
      
      if (!isDemoMode) {
        throw new Error("Реальних BMS пристроїв не знайдено поблизу. Увімкніть 'Демо-режим' у налаштуваннях для симуляції підключення.");
      }
      
      const bmsName = "JBD-BMS-Direct-Demo";
      const id = addDirectBluetoothDevice(bmsName);
      
      toast({
        title: "Підключено (Simulated)",
        description: `Пряме підключення до ${bmsName} встановлено.`,
      });
      
      router.push(`/battery/${id}`);
    } catch (err: any) {
      setError(err.message || "Помилка підключення до Bluetooth");
      toast({
        title: "Помилка пошуку",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddEsp = () => {
    if (!espName) return;
    
    if (!isDemoMode) {
      toast({
        title: "Інформація",
        description: "Для повноцінної роботи агрегації та отримання даних без реального заліза увімкніть 'Демо-режим'.",
      });
    }

    if (devices.filter(d => d.type === 'ESP32').length >= 20) {
      toast({
        title: "Ліміт вичерпано",
        description: "Ви можете додати до 20 ESP32 пристроїв для агрегації.",
        variant: "destructive"
      });
      return;
    }
    
    addNetworkDevice(espName);
    setEspName("");
    toast({
      title: "Пристрій додано",
      description: `${espName} інтегровано в систему.`,
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Помилка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-secondary/20 h-12">
          <TabsTrigger value="direct" className="gap-2">
            <Bluetooth className="h-4 w-4" /> Прямий доступ
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-2">
            <Globe className="h-4 w-4" /> Мережа (ESP32)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="direct" className="mt-6 space-y-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg">Підключення до однієї BMS</CardTitle>
              <CardDescription>
                Швидкий доступ до параметрів без агрегації. Потребує увімкненого Демо-режиму для симуляції.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent/20 rounded-xl bg-accent/5">
                <Bluetooth className={`h-16 w-16 text-accent mb-4 ${isScanning ? 'animate-spin' : ''}`} />
                <Button 
                  size="lg" 
                  onClick={handleDirectBluetooth}
                  disabled={isScanning}
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isScanning ? "Сканування ефіру..." : "Знайти BMS пристрої"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                *У реальних умовах тут використовується Web Bluetooth API для зв'язку з JBD.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="mt-6 space-y-4">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="text-lg">Агрегація даних (ESP32)</CardTitle>
              <CardDescription>
                Додайте вузли ESP32 для моніторингу паралельних збірок.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Назва ESP32 пристрою" 
                  value={espName} 
                  onChange={(e) => setEspName(e.target.value)}
                  className="bg-secondary/30"
                />
                <Button onClick={handleAddEsp} className="bg-accent text-accent-foreground">
                  <Plus className="h-4 w-4 mr-2" /> Додати
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">Активні вузли:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {devices.filter(d => d.type === 'ESP32').map(dev => (
                    <div key={dev.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50">
                      <div className="flex items-center gap-3">
                        <Cpu className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-sm font-medium">{dev.name}</p>
                          <p className="text-[10px] text-muted-foreground">ID: {dev.id}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-500/20">Online</Badge>
                    </div>
                  ))}
                  {devices.filter(d => d.type === 'ESP32').length === 0 && (
                    <p className="text-center py-4 text-xs text-muted-foreground">Пристрої не додані</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
