
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  Shield, 
  Zap, 
  Thermometer, 
  Database, 
  Info, 
  Activity, 
  Wrench,
  ChevronRight,
  Settings2
} from "lucide-react";
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

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
          <div className="text-sm">
            <h4 className="font-bold text-red-500">Увага!</h4>
            <p className="text-red-400 opacity-80">Зміна параметрів EEPROM може призвести до пошкодження батареї. Будьте обережні з порогами напруги та струму. Неправильне калібрування призведе до хибних показників стану.</p>
          </div>
        </div>

        <Tabs defaultValue="voltages" className="space-y-6">
          <ScrollArea className="w-full">
            <TabsList className="bg-secondary/40 h-12 inline-flex min-w-full">
              <TabsTrigger value="voltages" className="gap-2"><Zap className="h-4 w-4" /> Напруга</TabsTrigger>
              <TabsTrigger value="currents" className="gap-2"><Activity className="h-4 w-4" /> Струм</TabsTrigger>
              <TabsTrigger value="temps" className="gap-2"><Thermometer className="h-4 w-4" /> Темп.</TabsTrigger>
              <TabsTrigger value="capacity_soc" className="gap-2"><Database className="h-4 w-4" /> Ємність/SOC</TabsTrigger>
              <TabsTrigger value="config" className="gap-2"><Settings2 className="h-4 w-4" /> Конфігурація</TabsTrigger>
              <TabsTrigger value="calibration" className="gap-2"><Wrench className="h-4 w-4" /> Калібрування</TabsTrigger>
            </TabsList>
          </ScrollArea>

          <TabsContent value="voltages" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист комірок (mV)</CardTitle>
                <CardDescription>Поріги спрацювання для кожної окремої комірки</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>COVP (Over Voltage)</Label>
                  <Input value={localSettings.covp || ""} onChange={(e) => handleInputChange('covp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальна напруга комірки (напр. 4250mV).</p>
                </div>
                <div className="space-y-2">
                  <Label>COVP Release</Label>
                  <Input value={localSettings.covp_rel || ""} onChange={(e) => handleInputChange('covp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення заряду.</p>
                </div>
                <div className="space-y-2">
                  <Label>CUVP (Under Voltage)</Label>
                  <Input value={localSettings.cuvp || ""} onChange={(e) => handleInputChange('cuvp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Мінімальна напруга комірки (напр. 2700mV).</p>
                </div>
                <div className="space-y-2">
                  <Label>CUVP Release</Label>
                  <Input value={localSettings.cuvp_rel || ""} onChange={(e) => handleInputChange('cuvp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення розряду.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист пакета (10mV)</CardTitle>
                <CardDescription>Загальна напруга всієї батареї</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>POVP (Pack Over Voltage)</Label>
                  <Input value={localSettings.povp || ""} onChange={(e) => handleInputChange('povp', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>PUVP (Pack Under Voltage)</Label>
                  <Input value={localSettings.puvp || ""} onChange={(e) => handleInputChange('puvp', e.target.value)} className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currents" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за струмом (10mA)</CardTitle>
                <CardDescription>Максимально допустимі значення струму</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CHGOC (Charge Over Current)</Label>
                  <Input value={localSettings.chgoc || ""} onChange={(e) => handleInputChange('chgoc', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Струм заряду. 5000 = 50.0A.</p>
                </div>
                <div className="space-y-2">
                  <Label>DSGOC (Discharge Over Current)</Label>
                  <Input value={localSettings.dsgoc || ""} onChange={(e) => handleInputChange('dsgoc', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Струм розряду. 10000 = 100.0A.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temps" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Температурні пороги (0.1K)</CardTitle>
                <CardDescription>Значення в Кельвінах (T[K] = T[°C] + 273.15)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CHGOT (Charge Over Temp)</Label>
                  <Input value={localSettings.chgot || ""} onChange={(e) => handleInputChange('chgot', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>CHGUT (Charge Under Temp)</Label>
                  <Input value={localSettings.chgut || ""} onChange={(e) => handleInputChange('chgut', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Заборона зарядки при низьких температурах.</p>
                </div>
                <div className="space-y-2">
                  <Label>DSGOT (Discharge Over Temp)</Label>
                  <Input value={localSettings.dsgot || ""} onChange={(e) => handleInputChange('dsgot', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>DSGUT (Discharge Under Temp)</Label>
                  <Input value={localSettings.dsgut || ""} onChange={(e) => handleInputChange('dsgut', e.target.value)} className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity_soc" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Крива SOC та Ємність</CardTitle>
                <CardDescription>Налаштування для точного розрахунку відсотка заряду</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Design Capacity (10mAh)</Label>
                    <Input value={localSettings.design_cap || ""} onChange={(e) => handleInputChange('design_cap', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cycle Capacity (10mAh)</Label>
                    <Input value={localSettings.cycle_cap || ""} onChange={(e) => handleInputChange('cycle_cap', e.target.value)} className="bg-secondary/30" />
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-sm font-bold mb-4">Напруга комірки за рівнем заряду (mV)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px]">100% SOC</Label>
                      <Input value={localSettings.cap_100 || ""} onChange={(e) => handleInputChange('cap_100', e.target.value)} className="bg-secondary/30 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">80% SOC</Label>
                      <Input value={localSettings.cap_80 || ""} onChange={(e) => handleInputChange('cap_80', e.target.value)} className="bg-secondary/30 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">60% SOC</Label>
                      <Input value={localSettings.cap_60 || ""} onChange={(e) => handleInputChange('cap_60', e.target.value)} className="bg-secondary/30 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">40% SOC</Label>
                      <Input value={localSettings.cap_40 || ""} onChange={(e) => handleInputChange('cap_40', e.target.value)} className="bg-secondary/30 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">20% SOC</Label>
                      <Input value={localSettings.cap_20 || ""} onChange={(e) => handleInputChange('cap_20', e.target.value)} className="bg-secondary/30 text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">0% SOC</Label>
                      <Input value={localSettings.cap_0 || ""} onChange={(e) => handleInputChange('cap_0', e.target.value)} className="bg-secondary/30 text-xs" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Конфігурація функцій</CardTitle>
                <CardDescription>Балансування та системні налаштування</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Balancing Start (mV)</Label>
                  <Input value={localSettings.bal_start || ""} onChange={(e) => handleInputChange('bal_start', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга, при якій починається балансування.</p>
                </div>
                <div className="space-y-2">
                  <Label>Balancing Window (mV)</Label>
                  <Input value={localSettings.bal_window || ""} onChange={(e) => handleInputChange('bal_window', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Різниця між комірками для початку балансування.</p>
                </div>
                <div className="space-y-2">
                  <Label>Number of Cells</Label>
                  <Input value={localSettings.cell_cnt || ""} onChange={(e) => handleInputChange('cell_cnt', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Shunt Resistor (μΩ)</Label>
                  <Input value={localSettings.shunt_res || ""} onChange={(e) => handleInputChange('shunt_res', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Опір шунта для вимірювання струму.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Калібрування комірок (mV)</CardTitle>
                <CardDescription>Введіть реальні виміряні значення для корекції АЦП</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                  {Array.from({ length: Number(localSettings.cell_cnt) || 14 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-[10px]">Cell {i + 1}</Label>
                      <Input 
                        value={localSettings[`cell_cal_${i+1}`] || ""} 
                        onChange={(e) => handleInputChange(`cell_cal_${i+1}`, e.target.value)} 
                        className="bg-secondary/30 text-xs h-8" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Калібрування струму (10mA)</CardTitle>
                <CardDescription>Корекція датчика струму (Shunt)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Idle Current Calib</Label>
                  <Input value={localSettings.idle_current_cal || "0"} onChange={(e) => handleInputChange('idle_current_cal', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Встановіть 0 при відсутності навантаження.</p>
                </div>
                <div className="space-y-2">
                  <Label>Charge Current Calib</Label>
                  <Input value={localSettings.charge_current_cal || ""} onChange={(e) => handleInputChange('charge_current_cal', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Discharge Current Calib</Label>
                  <Input value={localSettings.discharge_current_cal || ""} onChange={(e) => handleInputChange('discharge_current_cal', e.target.value)} className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center gap-4">
             <Button variant="outline" className="text-muted-foreground border-accent/10 hover:bg-accent/5">
                <Shield className="mr-2 h-4 w-4" />
                Factory Mode
             </Button>
             <Button variant="ghost" className="text-[10px] opacity-50">
                Exit without saving (0x01: 0x2828)
             </Button>
        </div>
      </div>
    </main>
  );
}
