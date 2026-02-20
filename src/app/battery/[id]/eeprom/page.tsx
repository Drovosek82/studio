"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertTriangle, Shield, Zap, Thermometer, Database, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EepromPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allData, updateEeprom } = useBmsStore();
  const data = allData[id];
  const [isSaving, setIsSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data?.eeprom) {
      setLocalSettings(data.eeprom);
    }
  }, [data]);

  const handleInputChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
      Object.entries(localSettings).forEach(([key, value]) => {
        updateEeprom(id, key, value);
      });
      
      setIsSaving(false);
      toast({
        title: "Збережено",
        description: "Конфігурацію успішно записано в пам'ять (Демо режим).",
      });
    }, 1000);
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Завантаження даних...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/battery/${id}`}>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Налаштування EEPROM</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-widest">{data.name}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Запис..." : "Зберегти все"}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
          <div className="text-sm">
            <h4 className="font-bold text-red-500">Увага!</h4>
            <p className="text-red-400 opacity-80">Зміна параметрів EEPROM може призвести до пошкодження батареї. Будьте обережні з порогами напруги та струму.</p>
          </div>
        </div>

        <Tabs defaultValue="voltages" className="space-y-6">
          <TabsList className="bg-secondary/40 h-12 w-full grid grid-cols-4">
            <TabsTrigger value="voltages" className="gap-2"><Zap className="h-4 w-4" /> Напруга</TabsTrigger>
            <TabsTrigger value="currents" className="gap-2"><Zap className="h-4 w-4 rotate-90" /> Струм</TabsTrigger>
            <TabsTrigger value="temps" className="gap-2"><Thermometer className="h-4 w-4" /> Темп.</TabsTrigger>
            <TabsTrigger value="capacity" className="gap-2"><Database className="h-4 w-4" /> Ємність</TabsTrigger>
          </TabsList>

          <TabsContent value="voltages" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за напругою (комірка)</CardTitle>
                <CardDescription>Пороги спрацювання для окремих комірок (mV)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">COVP (Over Voltage) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.covp || ""} 
                    onChange={(e) => handleInputChange('covp', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Максимальна напруга комірки. При перевищенні зарядка припиняється.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">COVP Release <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.covp_rel || ""} 
                    onChange={(e) => handleInputChange('covp_rel', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Напруга відновлення заряду. Комірка має впасти до цього рівня для активації MOSFET.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">CUVP (Under Voltage) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.cuvp || ""} 
                    onChange={(e) => handleInputChange('cuvp', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Мінімальна напруга комірки. При падінні нижче - розрядка блокується.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">CUVP Release <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.cuvp_rel || ""} 
                    onChange={(e) => handleInputChange('cuvp_rel', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Напруга відновлення розряду. Напруга має піднятися вище для розблокування.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист пакета</CardTitle>
                <CardDescription>Загальні пороги для всього акумулятора (10mV)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">POVP (Pack Over Voltage) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.povp || ""} 
                    onChange={(e) => handleInputChange('povp', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Максимальна загальна напруга всієї батареї (напр. 588 = 58.8V).</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">PUVP (Pack Under Voltage) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.puvp || ""} 
                    onChange={(e) => handleInputChange('puvp', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Мінімальна загальна напруга всієї батареї (напр. 420 = 42.0V).</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currents" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за струмом</CardTitle>
                <CardDescription>Максимально допустимі значення (10mA)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">OC (Charging Overcurrent) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input defaultValue="5000" className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Максимальний струм заряду. 5000 = 50.0A. Перевищення вимкне MOSFET заряду.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">OD (Discharging Overcurrent) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input defaultValue="10000" className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Максимальний струм розряду. 10000 = 100.0A. Захист від перевантаження.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temps" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Температурні пороги</CardTitle>
                <CardDescription>Значення в Кельвінах (0.1K)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">CHGOT (Charge Over Temp) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.chgot || ""} 
                    onChange={(e) => handleInputChange('chgot', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Макс. температура при зарядці. Напр. 3231 = 50°C (323.1K).</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">DSGOT (Discharge Over Temp) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.dsgot || ""} 
                    onChange={(e) => handleInputChange('dsgot', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Макс. температура при розрядці. Напр. 3381 = 65°C.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Параметри ємності</CardTitle>
                <CardDescription>Базові характеристики акумулятора</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Design Capacity (10mAh) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.design_cap || ""} 
                    onChange={(e) => handleInputChange('design_cap', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Номінальна ємність, вказана виробником. Використовується для розрахунку SoC %.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Cycle Capacity (10mAh) <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.cycle_cap || ""} 
                    onChange={(e) => handleInputChange('cycle_cap', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Ємність, яку BMS вважає за один повний цикл розряду/заряду.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Number of Cells <Info className="h-3 w-3 opacity-50" /></Label>
                  <Input 
                    value={localSettings.cell_cnt || ""} 
                    onChange={(e) => handleInputChange('cell_cnt', e.target.value)}
                    className="bg-secondary/30" 
                  />
                  <p className="text-[10px] text-muted-foreground leading-tight">Кількість послідовно з'єднаних комірок (напр. 14S, 16S).</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center">
             <Button variant="outline" className="text-muted-foreground border-accent/10 hover:bg-accent/5">
                <Shield className="mr-2 h-4 w-4" />
                Увійти в Factory Mode (0x00: 0x5678)
             </Button>
        </div>
      </div>
    </main>
  );
}
