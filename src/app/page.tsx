
"use client";

import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { DashboardHeader } from "@/components/bms/dashboard-header";
import { FirmwareWizard } from "@/components/bms/firmware-wizard";
import { BluetoothConnector } from "@/components/bms/bluetooth-connector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Activity, 
  Settings, 
  Bluetooth, 
  LayoutDashboard, 
  CircleDot,
  Battery,
  ChevronRight,
  Zap,
  MonitorPlay
} from "lucide-react";

export default function Home() {
  const { aggregated, devices, allData, isDemoMode, setDemoMode } = useBmsStore();

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
            {isDemoMode && (
              <Badge variant="outline" className="border-accent/20 text-accent gap-1 animate-pulse">
                <CircleDot className="h-3 w-3" />
                Demo Mode
              </Badge>
            )}
            <div className="text-xs text-muted-foreground hidden sm:block">
              v1.2.0 | Multi-Unit
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Tabs defaultValue="aggregated" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-8 bg-secondary/40 h-12">
            <TabsTrigger value="aggregated" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Загальний стан
            </TabsTrigger>
            <TabsTrigger value="connect" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Bluetooth className="h-4 w-4" />
              Підключення
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Settings className="h-4 w-4" />
              Налаштування
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aggregated" className="space-y-6">
            {/* Aggregated Summary Cards */}
            {aggregated && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="glass-card border-none">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-sm font-medium">Середня напруга</p>
                    <h3 className="text-3xl font-bold mt-1 text-accent">{aggregated.totalVoltage.toFixed(2)} V</h3>
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
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Battery className="h-5 w-5 text-accent" />
                Список підключених батарей
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((device) => {
                  const data = allData[device.id];
                  return (
                    <Link key={device.id} href={`/battery/${device.id}`}>
                      <Card className="glass-card border-none hover:bg-accent/10 transition-colors cursor-pointer group">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-secondary/50 rounded-lg text-accent">
                              <Battery className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-bold">{device.name}</h4>
                              <p className="text-xs text-muted-foreground">ID: {device.id} | {device.status}</p>
                            </div>
                          </div>
                          {data && (
                            <div className="flex items-center gap-6">
                              <div className="text-right hidden sm:block">
                                <p className="text-xs text-muted-foreground">Напруга / Струм</p>
                                <p className="font-code text-accent">{data.totalVoltage.toFixed(2)}V / {data.totalCurrent.toFixed(1)}A</p>
                              </div>
                              <div className="w-12 h-12 rounded-full border-2 border-accent/20 flex items-center justify-center relative">
                                <span className="text-[10px] font-bold">{data.stateOfCharge.toFixed(0)}%</span>
                              </div>
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

            <div className="mt-8 p-4 bg-secondary/20 rounded-lg border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Всього підключено: <span className="text-accent font-bold">{devices.length} BMS</span>
                </p>
            </div>
          </TabsContent>

          <TabsContent value="connect" className="space-y-6 max-w-4xl mx-auto">
            <BluetoothConnector />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 max-w-4xl mx-auto">
            <Card className="glass-card border-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MonitorPlay className="h-5 w-5 text-accent" />
                  <CardTitle>Симуляція системи</CardTitle>
                </div>
                <CardDescription>
                  Керуйте режимом демонстрації для тестування інтерфейсу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Демо-режим</Label>
                    <p className="text-xs text-muted-foreground">
                      Автоматична генерація випадкових даних для візуалізації
                    </p>
                  </div>
                  <Switch 
                    checked={isDemoMode} 
                    onCheckedChange={setDemoMode}
                  />
                </div>
              </CardContent>
            </Card>
            
            <FirmwareWizard />
          </TabsContent>
        </Tabs>
      </div>

      <footer className="mt-20 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>© 2024 BMS Central Monitor. Спроектовано для паралельних систем JBD BMS.</p>
      </footer>
    </main>
  );
}
