
"use client";

import { useState } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { BluetoothConnector } from "@/components/bms/bluetooth-connector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Activity, 
  Settings, 
  Bluetooth, 
  LayoutDashboard, 
  CircleDot,
  ChevronRight,
  MonitorPlay,
  Cpu,
  Server
} from "lucide-react";
import { FirmwareWizard } from "@/components/bms/firmware-wizard";

export default function Home() {
  const { aggregated, devices, allData, isDemoMode, setDemoMode, localHubIp, setLocalHubIp } = useBmsStore();

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl text-accent">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BMS Central</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-[0.2em]">Parallel Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {localHubIp && (
              <Badge variant="outline" className="border-green-500/20 text-green-500 gap-1">
                <Server className="h-3 w-3" />
                Local Hub: {localHubIp}
              </Badge>
            )}
            {isDemoMode && (
              <Badge variant="outline" className="border-accent/20 text-accent gap-1 animate-pulse">
                <CircleDot className="h-3 w-3" />
                Demo Mode
              </Badge>
            )}
            <div className="text-xs text-muted-foreground hidden sm:block">
              v1.6.0 | Local-First
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Tabs defaultValue="aggregated" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-8 bg-secondary/40 h-12">
            <TabsTrigger value="aggregated" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Дашборд
            </TabsTrigger>
            <TabsTrigger value="connect" className="gap-2">
              <Bluetooth className="h-4 w-4" /> Підключення
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> Налаштування
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aggregated" className="space-y-6">
            {aggregated ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="glass-card border-none">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm font-medium">Середня напруга</p>
                      <h3 className="text-3xl font-bold mt-1 text-accent">{aggregated.totalVoltage.toFixed(2)} V</h3>
                      <p className="text-[10px] text-muted-foreground mt-2">База: {aggregated.deviceCount} ESP32</p>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-none">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm font-medium">Сумарний струм</p>
                      <h3 className="text-3xl font-bold mt-1 text-accent">{aggregated.totalCurrent.toFixed(1)} A</h3>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-none">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm font-medium">Загальна потужність</p>
                      <h3 className="text-3xl font-bold mt-1 text-accent">{(aggregated.totalPower / 1000).toFixed(2)} kW</h3>
                    </CardContent>
                  </Card>
                  <Card className="glass-card border-none">
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-sm font-medium">Середній SoC</p>
                      <h3 className="text-3xl font-bold mt-1 text-accent">{aggregated.avgSoC.toFixed(1)} %</h3>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-accent" />
                    Мережеві пристрої (ESP32)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.filter(d => d.type === 'ESP32').map((device) => {
                      const data = allData[device.id];
                      return (
                        <Link key={device.id} href={`/battery/${device.id}`}>
                          <Card className="glass-card border-none hover:bg-accent/10 transition-colors cursor-pointer group">
                            <CardContent className="p-6 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary/50 rounded-lg text-accent">
                                  <Cpu className="h-6 w-6" />
                                </div>
                                <div>
                                  <h4 className="font-bold">{device.name}</h4>
                                  <p className="text-xs text-muted-foreground">{device.status}</p>
                                </div>
                              </div>
                              {data && (
                                <div className="flex items-center gap-6">
                                  <div className="text-right hidden sm:block">
                                    <p className="text-xs text-muted-foreground">V / A</p>
                                    <p className="font-code text-accent">{data.totalVoltage.toFixed(2)} / {data.totalCurrent.toFixed(1)}</p>
                                  </div>
                                  <Badge variant="outline" className="border-accent text-accent">{data.stateOfCharge.toFixed(0)}%</Badge>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
                <Cpu className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Немає мережевих даних</h3>
                <p className="text-sm text-muted-foreground mt-2">Додайте ESP32 пристрої у вкладці "Підключення" для агрегації</p>
              </div>
            )}

            {devices.some(d => d.type === 'Bluetooth') && (
              <div className="mt-12 space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bluetooth className="h-5 w-5 text-accent" />
                  Прямі підключення (Direct BLE)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.filter(d => d.type === 'Bluetooth').map((device) => {
                    const data = allData[device.id];
                    return (
                      <Link key={device.id} href={`/battery/${device.id}`}>
                        <Card className="glass-card border-none hover:bg-blue-500/10 transition-colors cursor-pointer group border-l-2 border-l-blue-500">
                          <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <Bluetooth className="h-6 w-6" />
                              </div>
                              <div>
                                <h4 className="font-bold">{device.name}</h4>
                                <Badge variant="secondary" className="text-[8px] uppercase">Service Mode</Badge>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connect" className="space-y-6 max-w-4xl mx-auto">
            <BluetoothConnector />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 max-w-4xl mx-auto">
            <Card className="glass-card border-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-accent" />
                  <CardTitle>Локальна мережа</CardTitle>
                </div>
                <CardDescription>Налаштуйте з'єднання з вашим Центральним Хабом (ESP32 Server)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>IP адреса Центрального Хаба</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Напр. 192.168.1.50" 
                      value={localHubIp} 
                      onChange={(e) => setLocalHubIp(e.target.value)}
                      className="bg-secondary/30 border-none h-10"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setLocalHubIp('')}
                      className="border-accent/20 text-accent"
                    >
                      Скинути
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Якщо IP вказано, програма отримуватиме дані з Хаба замість хмари. Це дозволяє працювати без інтернету.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-5 w-5 text-accent" />
                  <CardTitle>Симуляція системи</CardTitle>
                </div>
                <CardDescription>Керуйте демонстраційним режимом</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Демо-режим</Label>
                    <p className="text-xs text-muted-foreground">Автоматична генерація даних для тестування</p>
                  </div>
                  <Switch checked={isDemoMode} onCheckedChange={setDemoMode} />
                </div>
              </CardContent>
            </Card>
            
            <FirmwareWizard />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
