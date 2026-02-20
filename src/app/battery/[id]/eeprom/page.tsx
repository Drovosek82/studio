
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    // Simulate write delay
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
                <CardDescription>Пороги спрацювання для кожної окремої комірки (регістри 0x24-0x27)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>COVP (Cell Over Voltage)</Label>
                  <Input value={localSettings.covp || ""} onChange={(e) => handleInputChange('covp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальна напруга комірки. При перевищенні MOSFET заряду вимикається.</p>
                </div>
                <div className="space-y-2">
                  <Label>COVP Release</Label>
                  <Input value={localSettings.covp_rel || ""} onChange={(e) => handleInputChange('covp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга, при якій MOSFET заряду знову увімкнеться після перенапруги.</p>
                </div>
                <div className="space-y-2">
                  <Label>CUVP (Cell Under Voltage)</Label>
                  <Input value={localSettings.cuvp || ""} onChange={(e) => handleInputChange('cuvp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Мінімальна напруга комірки. При падінні нижче цього значення MOSFET розряду вимикається.</p>
                </div>
                <div className="space-y-2">
                  <Label>CUVP Release</Label>
                  <Input value={localSettings.cuvp_rel || ""} onChange={(e) => handleInputChange('cuvp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення розряду. Має бути вищою за CUVP на 200-300mV.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Cell Voltage Delay (s)</Label>
                  <Input value={localSettings.cell_v_delays || "2"} onChange={(e) => handleInputChange('cell_v_delays', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Час утримання аномальної напруги комірки в секундах до спрацювання захисту.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист пакета (10mV)</CardTitle>
                <CardDescription>Загальна напруга всієї батареї (регістри 0x20-0x23)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>POVP (Pack Over Voltage)</Label>
                  <Input value={localSettings.povp || ""} onChange={(e) => handleInputChange('povp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Загальний поріг перезаряду пакета (напр. 5880 = 58.8V). 1 од. = 0.01V.</p>
                </div>
                <div className="space-y-2">
                  <Label>POVP Release</Label>
                  <Input value={localSettings.povp_rel || ""} onChange={(e) => handleInputChange('povp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення всього пакета після спрацювання POVP.</p>
                </div>
                <div className="space-y-2">
                  <Label>PUVP (Pack Under Voltage)</Label>
                  <Input value={localSettings.puvp || ""} onChange={(e) => handleInputChange('puvp', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Критично низька загальна напруга пакета для вимкнення навантаження.</p>
                </div>
                <div className="space-y-2">
                  <Label>PUVP Release</Label>
                  <Input value={localSettings.puvp_rel || ""} onChange={(e) => handleInputChange('puvp_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга відновлення після глибокого розряду пакета.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currents" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за струмом (10mA)</CardTitle>
                <CardDescription>Максимально допустимі значення струму (регістри 0x28-0x29)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CHGOC (Charge Over Current)</Label>
                  <Input value={localSettings.chgoc || ""} onChange={(e) => handleInputChange('chgoc', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальний струм заряду. 5000 = 50.00A. Захищає від занадто потужних ЗП.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Charge OC Delay (s)</Label>
                  <Input value={localSettings.chgoc_delays || ""} onChange={(e) => handleInputChange('chgoc_delays', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Час затримки спрацювання захисту по струму заряду.</p>
                </div>
                <div className="space-y-2">
                  <Label>DSGOC (Discharge Over Current)</Label>
                  <Input value={localSettings.dsgoc || ""} onChange={(e) => handleInputChange('dsgoc', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Максимальний робочий струм розряду. 10000 = 100.00A.</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Discharge OC Delay (s)</Label>
                  <Input value={localSettings.dsgoc_delays || ""} onChange={(e) => handleInputChange('dsgoc_delays', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Час витримки перед вимкненням при перевищенні споживання.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temps" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Температурні пороги (0.1K)</CardTitle>
                <CardDescription>Значення в Кельвінах (2731 = 0.0°C). Регістри 0x18-0x1F.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>CHGOT (Charge Over Temp)</Label>
                  <Input value={localSettings.chgot || ""} onChange={(e) => handleInputChange('chgot', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Макс. температура при зарядці. 3231 = 50°C. При перевищенні заряд зупиняється.</p>
                </div>
                <div className="space-y-2">
                  <Label>CHGOT Release</Label>
                  <Input value={localSettings.chgot_rel || ""} onChange={(e) => handleInputChange('chgot_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Температура відновлення заряду після перегріву.</p>
                </div>
                <div className="space-y-2">
                  <Label>CHGUT (Charge Under Temp)</Label>
                  <Input value={localSettings.chgut || ""} onChange={(e) => handleInputChange('chgut', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Мін. температура заряду. Литієві батареї не можна заряджати при мінусі.</p>
                </div>
                <div className="space-y-2">
                  <Label>CHGUT Release</Label>
                  <Input value={localSettings.chgut_rel || ""} onChange={(e) => handleInputChange('chgut_rel', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Температура, при якій заряд знову дозволений після "морозу".</p>
                </div>
                <div className="space-y-2">
                  <Label>DSGOT (Discharge Over Temp)</Label>
                  <Input value={localSettings.dsgot || ""} onChange={(e) => handleInputChange('dsgot', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Макс. температура при розрядці. Захист від перегріву під навантаженням.</p>
                </div>
                <div className="space-y-2">
                   <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Temp Protection Delay (s)</Label>
                   <Input value={localSettings.chg_t_delays || "2"} onChange={(e) => handleInputChange('chg_t_delays', e.target.value)} className="bg-secondary/30" />
                   <p className="text-[10px] text-muted-foreground">Затримка реакції на зміну температури.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity_soc" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Ємність та SOC (10mAh)</CardTitle>
                <CardDescription>Налаштування для підрахунку відсотків заряду (регістри 0x10-0x14, 0x32-0x35)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Design Capacity</Label>
                    <Input value={localSettings.design_cap || ""} onChange={(e) => handleInputChange('design_cap', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Номінальна ємність батареї. 10000 = 100Ah.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Self-Discharge Rate (0.1%)</Label>
                    <Input value={localSettings.dsg_rate || "10"} onChange={(e) => handleInputChange('dsg_rate', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Відсоток саморозряду на місяць. 10 = 1.0%.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Cell 100% Voltage (mV)</Label>
                    <Input value={localSettings.cap_100 || ""} onChange={(e) => handleInputChange('cap_100', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Напруга комірки для 100% заряду.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Cell 0% Voltage (mV)</Label>
                    <Input value={localSettings.cap_0 || ""} onChange={(e) => handleInputChange('cap_0', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Напруга комірки для 0% заряду.</p>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Загальна конфігурація</CardTitle>
                <CardDescription>Параметри обладнання та алгоритмів (регістри 0x2A-0x2F)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Кількість NTC датчиків (0x2E)</Label>
                  <Select 
                    value={String(localSettings.ntc_cnt || "3")} 
                    onValueChange={(val) => handleInputChange('ntc_cnt', val)}
                  >
                    <SelectTrigger className="bg-secondary/30 border-none h-10">
                      <SelectValue placeholder="Оберіть кількість" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} датчиків</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground">Кількість підключених датчиків температури (макс 8).</p>
                </div>
                <div className="space-y-2">
                  <Label>Shunt Resistor (μΩ)</Label>
                  <Input value={localSettings.shunt_res || "100"} onChange={(e) => handleInputChange('shunt_res', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Опір вимірювального шунта. Впливає на точність струму.</p>
                </div>
                <div className="space-y-2">
                  <Label>Balancing Start Voltage (mV)</Label>
                  <Input value={localSettings.bal_start || "3400"} onChange={(e) => handleInputChange('bal_start', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Напруга, вище якої починається процес вирівнювання (регістр 0x2A).</p>
                </div>
                <div className="space-y-2">
                  <Label>Balancing Window (mV)</Label>
                  <Input value={localSettings.bal_window || "50"} onChange={(e) => handleInputChange('bal_window', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Різниця напруг між комірками для активації балансира (регістр 0x2B).</p>
                </div>
                <div className="space-y-2">
                  <Label>Cell Count (0x2F)</Label>
                  <Input value={localSettings.cell_cnt || "14"} onChange={(e) => handleInputChange('cell_cnt', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Кількість послідовно з'єднаних комірок (S).</p>
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
                  <p className="text-[10px] text-muted-foreground">Назва виробника або бренду.</p>
                </div>
                <div className="space-y-2">
                  <Label>Device Name (0xA1)</Label>
                  <Input value={localSettings.device_name || ""} onChange={(e) => handleInputChange('device_name', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Назва моделі або ідентифікатор пристрою.</p>
                </div>
                <div className="space-y-2">
                  <Label>Serial Number (0x16)</Label>
                  <Input value={localSettings.serial_num || ""} onChange={(e) => handleInputChange('serial_num', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Унікальний заводський номер.</p>
                </div>
                <div className="space-y-2">
                  <Label>Manufacturing Date (0x15)</Label>
                  <Input value={localSettings.mfg_date || ""} onChange={(e) => handleInputChange('mfg_date', e.target.value)} className="bg-secondary/30" type="date" />
                  <p className="text-[10px] text-muted-foreground">Дата випуску пристрою з заводу.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calibration" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Калібрування NTC (0.1K)</CardTitle>
                <CardDescription>Корекція значень температурних датчиків (регістри 0xD0-0xD7)</CardDescription>
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
                <p className="text-[10px] text-muted-foreground mt-4 italic">*Введіть зміщення в Кельвінах для кожного датчика окремо.</p>
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
                  <p className="text-[10px] text-muted-foreground">Запис 0 при відсутності навантаження для обнулення зміщення.</p>
                </div>
                <div className="space-y-2">
                  <Label>Charge Current Calib (0xAE)</Label>
                  <Input value={localSettings.charge_current_cal || ""} onChange={(e) => handleInputChange('charge_current_cal', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Еталонний струм заряду для калібрування шунта.</p>
                </div>
                <div className="space-y-2">
                  <Label>Discharge Current Calib (0xAF)</Label>
                  <Input value={localSettings.discharge_current_cal || ""} onChange={(e) => handleInputChange('discharge_current_cal', e.target.value)} className="bg-secondary/30" />
                  <p className="text-[10px] text-muted-foreground">Еталонний струм розряду для точного вимірювання.</p>
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
