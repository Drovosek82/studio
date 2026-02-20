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
  Bluetooth as BluetoothIcon, 
  LayoutDashboard, 
  CircleDot,
  ChevronRight,
  Cpu,
  Server,
  BrainCircuit,
  Database,
  Languages,
  Info
} from "lucide-react";
import { FirmwareWizard } from "@/components/bms/firmware-wizard";
import { AiKnowledgeBase } from "@/components/bms/ai-knowledge-base";

export default function Home() {
  const { aggregated, devices, allData, isDemoMode, setDemoMode, localHubIp, setLocalHubIp, lang, setLang, t } = useBmsStore();

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent/20 rounded-lg text-accent">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">{t('title')}</h1>
              <p className="text-[9px] uppercase font-bold text-accent opacity-70 tracking-wider">{t('subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/about">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-accent">
                <Info className="h-5 w-5" />
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-accent">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-none">
                <DropdownMenuItem onClick={() => setLang('uk')} className={lang === 'uk' ? 'text-accent font-bold' : ''}>
                  Українська
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLang('en')} className={lang === 'en' ? 'text-accent font-bold' : ''}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setDemoMode(!isDemoMode)}
              className={`h-9 w-9 ${isDemoMode ? 'text-accent animate-pulse' : 'text-muted-foreground'}`}
            >
              <CircleDot className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Tabs defaultValue="aggregated" className="w-full">
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="flex w-max min-w-full bg-secondary/40 h-11 p-1">
              <TabsTrigger value="aggregated" className="flex-1 gap-2 text-xs px-4">
                <LayoutDashboard className="h-3.5 w-3.5" /> {t('dashboard')}
              </TabsTrigger>
              <TabsTrigger value="connect" className="flex-1 gap-2 text-xs px-4">
                <BluetoothIcon className="h-3.5 w-3.5" /> {t('connect')}
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex-1 gap-2 text-xs px-4">
                <BrainCircuit className="h-3.5 w-3.5" /> {t('intelligence')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 gap-2 text-xs px-4">
                <Settings className="h-3.5 w-3.5" /> {t('settings')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="aggregated" className="space-y-6 pt-4">
            {aggregated ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Card className="glass-card border-none p-3">
                    <p className="text-muted-foreground text-[9px] font-bold uppercase">{t('avgVoltage')}</p>
                    <h3 className="text-xl font-bold text-accent">{aggregated.totalVoltage.toFixed(2)} V</h3>
                  </Card>
                  <Card className="glass-card border-none p-3">
                    <p className="text-muted-foreground text-[9px] font-bold uppercase">{t('totalCurrent')}</p>
                    <h3 className="text-xl font-bold text-accent">{aggregated.totalCurrent.toFixed(1)} A</h3>
                  </Card>
                  <Card className="glass-card border-none p-3">
                    <p className="text-muted-foreground text-[9px] font-bold uppercase">{t('powerWatt')}</p>
                    <h3 className="text-xl font-bold text-accent">{(aggregated.totalPower / 1000).toFixed(2)} kW</h3>
                  </Card>
                  <Card className="glass-card border-none p-3">
                    <p className="text-muted-foreground text-[9px] font-bold uppercase">{t('avgSoC')}</p>
                    <h3 className="text-xl font-bold text-accent">{aggregated.avgSoC.toFixed(1)} %</h3>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-accent" />
                    {t('activeDevices')}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {devices.map((device) => {
                      const data = allData[device.id];
                      return (
                        <Link key={device.id} href={`/battery/${device.id}`}>
                          <Card className="glass-card border-none hover:bg-accent/10 transition-colors cursor-pointer group">
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${device.type === 'Bluetooth' ? 'bg-blue-500/10 text-blue-500' : 'bg-accent/10 text-accent'}`}>
                                  {device.type === 'Bluetooth' ? <BluetoothIcon className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm leading-tight">{device.name}</h4>
                                  <p className="text-[9px] text-muted-foreground">{t(device.status === 'Online' ? 'online' : device.status === 'Offline' ? 'offline' : 'connecting')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {data && (
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-accent">{data.stateOfCharge.toFixed(0)}%</p>
                                    <p className="text-[9px] text-muted-foreground">{data.totalVoltage.toFixed(1)}V</p>
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
              <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border px-4">
                <Database className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <h3 className="text-lg font-bold">{t('waitingData')}</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-[200px] mx-auto">{t('connectFirst')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="intelligence" className="pt-4">
            <AiKnowledgeBase />
          </TabsContent>

          <TabsContent value="connect" className="pt-4">
            <BluetoothConnector />
          </TabsContent>

          <TabsContent value="settings" className="pt-4">
             <div className="max-w-2xl mx-auto space-y-6">
                <Card className="glass-card border-none">
                  <CardHeader className="p-4">
                    <CardTitle className="text-md flex items-center gap-2">
                      <Server className="h-4 w-4 text-accent" /> {t('localHub')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 bg-secondary/30 border border-border/50 rounded-md px-3 h-10 text-sm focus:outline-none focus:ring-1 focus:ring-accent text-foreground"
                        placeholder="IP (e.g. 192.168.1.50)"
                        value={localHubIp}
                        onChange={(e) => setLocalHubIp(e.target.value)}
                      />
                      <Button variant="outline" size="sm" onClick={() => setLocalHubIp('')}>{t('reset')}</Button>
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
