
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Save, 
  AlertTriangle, 
  Zap, 
  Thermometer, 
  Database, 
  Activity, 
  Wrench,
  Settings2,
  Shield,
  Info,
  Clock
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
          <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border/50 bg-secondary/20">
            <TabsList className="bg-transparent h-12 inline-flex p-1">
              <TabsTrigger value="voltages" className="gap-2 px-4"><Zap className="h-4 w-4" /> Напруга</TabsTrigger>
              <TabsTrigger value="currents" className="gap-2 px-4"><Activity className="h-4 w-4" /> Струм</TabsTrigger>
              <TabsTrigger value="temps" className="gap-2 px-4"><Thermometer className="h-4 w-4" /> Темп.</TabsTrigger>
              <TabsTrigger value="capacity_soc" className="gap-2 px-4"><Database className="h-4 w-4" /> Ємність/SOC</TabsTrigger>
              <TabsTrigger value="config" className="gap-2 px-4"><Settings2 className="h-4 w-4" /> Конфігурація</TabsTrigger>
              <TabsTrigger value="info" className="gap-2 px-4"><Info className="h-4 w-4" /> Інформація</TabsTrigger>
              <TabsTrigger value="calibration" className="gap-2 px-4"><Wrench className="h-4 w-4" /> Калібрування</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent value="voltages" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист комірок (mV)</CardTitle>
                <CardDescription>Пороги спрацювання для кожної окремої комірки</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>COVP (Cell Over Voltage)</Label>
                  <Input value={localSettings.covp || ""} onChange={(e) => handleInputChange('covp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальна напруга комірки (зазвичай 4250 для Li-Ion).</p>
                </div>
                <div className="space-y-2">
                  <Label>COVP Release</Label>
                  <Input value={localSettings.covp_rel || ""} onChange={(e) => handleInputChange('covp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення заряду після COVP.</p>
                </div>
                <div className="space-y-2">
                  <Label>CUVP (Cell Under Voltage)</Label>
                  <Input value={localSettings.cuvp || ""} onChange={(e) => handleInputChange('cuvp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Мінімальна напруга комірки (зазвичай 2700-2800).</p>
                </div>
                <div className="space-y-2">
                  <Label>CUVP Release</Label>
                  <Input value={localSettings.cuvp_rel || ""} onChange={(e) => handleInputChange('cuvp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення розряду після CUVP.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Cell Voltage Delay (s)</Label>
                  <Input value={localSettings.cell_v_delays || "2"} onChange={(e) => handleInputChange('cell_v_delays', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Час утримання аномальної напруги комірки до вимкнення MOSFET.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист пакета (10mV)</CardTitle>
                <CardDescription>Загальна напруга всієї батареї (1 од. = 0.01 V)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>POVP (Pack Over Voltage)</Label>
                  <Input value={localSettings.povp || ""} onChange={(e) => handleInputChange('povp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Загальний поріг перезаряду пакета (напр. 5880 = 58.8V).</p>
                </div>
                <div className="space-y-2">
                  <Label>POVP Release</Label>
                  <Input value={localSettings.povp_rel || ""} onChange={(e) => handleInputChange('povp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення всього пакета.</p>
                </div>
                <div className="space-y-2">
                  <Label>PUVP (Pack Under Voltage)</Label>
                  <Input value={localSettings.puvp || ""} onChange={(e) => handleInputChange('puvp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Критично низька загальна напруга пакета.</p>
                </div>
                <div className="space-y-2">
                  <Label>PUVP Release</Label>
                  <Input value={localSettings.puvp_rel || ""} onChange={(e) => handleInputChange('puvp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення розряду пакета.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Pack Voltage Delay (s)</Label>
                  <Input value={localSettings.pack_v_delays || "2"} onChange={(e) => handleInputChange('pack_v_delays', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Затримка захисту за загальною напругою.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currents" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за струмом (10mA)</CardTitle>
                <CardDescription>Максимально допустимі значення струму (1 од. = 0.01 A)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CHGOC (Charge Over Current)</Label>
                  <Input value={localSettings.chgoc || ""} onChange={(e) => handleInputChange('chgoc', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальний струм заряду. 5000 = 50.00A.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Charge OC Delay (s)</Label>
                  <Input value={localSettings.chgoc_delays || ""} onChange={(e) => handleInputChange('chgoc_delays', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>DSGOC (Discharge Over Current)</Label>
                  <Input value={localSettings.dsgoc || ""} onChange={(e) => handleInputChange('dsgoc', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальний струм розряду. 10000 = 100.00A.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Discharge OC Delay (s)</Label>
                  <Input value={localSettings.dsgoc_delays || ""} onChange={(e) => handleInputChange('dsgoc_delays', e.target.value)} className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temps" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Температурні пороги (0.1K)</CardTitle>
                <CardDescription>Значення в Кельвінах (2731 = 0.0°C)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CHGOT (Charge Over Temp)</Label>
                  <Input value={localSettings.chgot || ""} onChange={(e) => handleInputChange('chgot', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Макс. температура заряду. 3231 = 50°C.</p>
                </div>
                <div className="space-y-2">
                  <Label>CHGOT Release</Label>
                  <Input value={localSettings.chgot_rel || ""} onChange={(e) => handleInputChange('chgot_rel', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>CHGUT (Charge Under Temp)</Label>
                  <Input value={localSettings.chgut || ""} onChange={(e) => handleInputChange('chgut', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Мін. температура заряду (мороз).</p>
                </div>
                <div className="space-y-2">
                  <Label>CHGUT Release</Label>
                  <Input value={localSettings.chgut_rel || ""} onChange={(e) => handleInputChange('chgut_rel', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                   <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Temp Protection Delay (s)</Label>
                   <Input value={localSettings.chg_t_delays || "2"} onChange={(e) => handleInputChange('chg_t_delays', e.target.value)} className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity_soc" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Ємність та Самовирозряд</CardTitle>
                <CardDescription>Налаштування для підрахунку циклів та SOC</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Design Capacity (10mAh)</Label>
                    <Input value={localSettings.design_cap || ""} onChange={(e) => handleInputChange('design_cap', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>Self-Discharge Rate (0.1%)</Label>
                    <Input value={localSettings.dsg_rate || "10"} onChange={(e) => handleInputChange('dsg_rate', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Швидкість саморозряду на місяць. 10 = 1%.</p>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Ідентифікаційні дані пристрою</CardTitle>
                <CardDescription>Ці дані зберігаються в ASCII регістрах 0xA0-0xA2</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Manufacturer Name (0xA0)</Label>
                  <Input value={localSettings.mfg_name || ""} onChange={(e) => handleInputChange('mfg_name', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Device Name (0xA1)</Label>
                  <Input value={localSettings.device_name || ""} onChange={(e) => handleInputChange('device_name', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number (0x16)</Label>
                  <Input value={localSettings.serial_num || ""} onChange={(e) => handleInputChange('serial_num', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Manufacturing Date (0x15)</Label>
                  <Input value={localSettings.mfg_date || ""} onChange={(e) => handleInputChange('mfg_date', e.target.value)} className="bg-secondary/30" type="date" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Калібрування NTC (0.1K)</CardTitle>
                <CardDescription>Корекція значень температурних датчиків</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <Label className="text-[10px]">NTC {i + 1}</Label>
                      <Input 
                        value={localSettings[`ntc_cal_${i+1}`] || "0"} 
                        onChange={(e) => handleInputChange(`ntc_cal_${i+1}`, e.target.value)} 
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
                <CardDescription>Регістри 0xAD-0xAF (AD: Idle, AE: Charge, AF: Discharge)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Idle Current Calib (0xAD)</Label>
                  <Input value={localSettings.idle_current_cal || "0"} onChange={(e) => handleInputChange('idle_current_cal', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Запис 0 при відсутності навантаження.</p>
                </div>
                <div className="space-y-2">
                  <Label>Charge Current Calib (0xAE)</Label>
                  <Input value={localSettings.charge_current_cal || ""} onChange={(e) => handleInputChange('charge_current_cal', e.target.value)} className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Discharge Current Calib (0xAF)</Label>
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
                Вихід без збереження (Reset)
             </Button>
        </div>
      </div>
    </main>
  );
}
