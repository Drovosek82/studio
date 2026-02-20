
"use client";

import { useState } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { BluetoothConnector } from "@/components/bms/bluetooth-connector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Activity, 
  Settings, 
  Bluetooth, 
  LayoutDashboard, 
  CircleDot,
  ChevronRight,
  Cpu,
  Server,
  BrainCircuit,
  Database,
  Languages
} from "lucide-react";
import { FirmwareWizard } from "@/components/bms/firmware-wizard";
import { AiKnowledgeBase } from "@/components/bms/ai-knowledge-base";

export default function Home() {
  const { aggregated, devices, allData, isDemoMode, setDemoMode, localHubIp, setLocalHubIp, lang, setLang, t } = useBmsStore();

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl text-accent">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-[0.2em]">{t('subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-accent">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-none">
                <DropdownMenuItem onClick={() => setLang('uk')} className={lang === 'uk' ? 'text-accent' : ''}>
                  Українська
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'text-accent' : ''}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {localHubIp && (
              <Badge variant="outline" className="border-green-500/20 text-green-500 gap-1">
                <Server className="h-3 w-3" /> {localHubIp}
              </Badge>
            )}
            {isDemoMode && (
              <Badge variant="outline" className="border-accent/20 text-accent gap-1 animate-pulse">
                <CircleDot className="h-3 w-3" /> {t('demoMode')}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Tabs defaultValue="aggregated" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-[800px] mb-8 bg-secondary/40 h-12">
            <TabsTrigger value="aggregated" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> {t('dashboard')}
            </TabsTrigger>
            <TabsTrigger value="connect" className="gap-2">
              <Bluetooth className="h-4 w-4" /> {t('connect')}
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="gap-2">
              <BrainCircuit className="h-4 w-4" /> {t('intelligence')}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> {t('settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="aggregated" className="space-y-6">
            {aggregated ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <Card className="glass-card border-none p-4">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase">{t('avgVoltage')}</p>
                    <h3 className="text-2xl font-bold text-accent">{aggregated.totalVoltage.toFixed(2)} V</h3>
                  </Card>
                  <Card className="glass-card border-none p-4">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase">{t('totalCurrent')}</p>
                    <h3 className="text-2xl font-bold text-accent">{aggregated.totalCurrent.toFixed(1)} A</h3>
                  </Card>
                  <Card className="glass-card border-none p-4">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase">{t('power')}</p>
                    <h3 className="text-2xl font-bold text-accent">{(aggregated.totalPower / 1000).toFixed(2)} kW</h3>
                  </Card>
                  <Card className="glass-card border-none p-4">
                    <p className="text-muted-foreground text-[10px] font-bold uppercase">{t('avgSoC')}</p>
                    <h3 className="text-2xl font-bold text-accent">{aggregated.avgSoC.toFixed(1)} %</h3>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-accent" />
                    {t('activeDevices')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map((device) => {
                      const data = allData[device.id];
                      return (
                        <Link key={device.id} href={`/battery/${device.id}`}>
                          <Card className="glass-card border-none hover:bg-accent/10 transition-colors cursor-pointer group">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${device.type === 'Bluetooth' ? 'bg-blue-500/10 text-blue-500' : 'bg-accent/10 text-accent'}`}>
                                  {device.type === 'Bluetooth' ? <Bluetooth className="h-5 w-5" /> : <Cpu className="h-5 w-5" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm">{device.name}</h4>
                                  <p className="text-[10px] text-muted-foreground">{t(device.status === 'Online' ? 'online' : device.status === 'Offline' ? 'offline' : 'connecting')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                {data && (
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-accent">{data.stateOfCharge.toFixed(0)}%</p>
                                    <p className="text-[10px] text-muted-foreground">{data.totalVoltage.toFixed(1)}V</p>
                                  </div>
                                )}
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                              </div>
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
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-bold">{t('waitingData')}</h3>
                <p className="text-xs text-muted-foreground mt-2">{t('connectFirst')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="intelligence">
            <AiKnowledgeBase />
          </TabsContent>

          <TabsContent value="connect">
            <BluetoothConnector />
          </TabsContent>

          <TabsContent value="settings">
             <div className="max-w-2xl mx-auto space-y-6">
                <Card className="glass-card border-none">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="h-5 w-5 text-accent" /> {t('localHub')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-secondary/30 border border-border/50 rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                        placeholder="IP (e.g. 192.168.1.50)"
                        value={localHubIp}
                        onChange={(e) => setLocalHubIp(e.target.value)}
                      />
                      <Button variant="outline" onClick={() => setLocalHubIp('')}>{t('reset')}</Button>
                    </div>
                  </CardContent>
                </Card>
                <FirmwareWizard />
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
