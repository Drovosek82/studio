
"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EepromPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { allData, updateEeprom, toggleControl } = useBmsStore();
  const data = allData[id];
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(true);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const handleStartProgramming = () => {
    setShowAuthDialog(false);
    setIsLoading(true);
    
    if (data?.isChargeEnabled) toggleControl(id, 'isChargeEnabled');
    if (data?.isDischargeEnabled) toggleControl(id, 'isDischargeEnabled');
    
    setTimeout(() => {
      if (data?.eeprom) {
        setLocalSettings(data.eeprom);
      }
      setIsLoading(false);
      setIsAuthorized(true);
      toast({
        title: "Зв'язок встановлено",
        description: "MOSFET відключено. Дані EEPROM зчитано успішно.",
      });
    }, 1500);
  };

  const handleInputChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAndExit = () => {
    setIsSaving(true);
    setTimeout(() => {
      Object.entries(localSettings).forEach(([key, value]) => {
        updateEeprom(id, key, value);
      });
      setIsSaving(false);
      toast({
        title: "Запис завершено",
        description: "Конфігурацію збережено. Тепер ви можете вручну увімкнути MOSFET заряду та розряду на головній сторінці.",
      });
      router.push(`/battery/${id}`);
    }, 2000);
  };

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="glass-card border-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Вхід у режим налаштування EEPROM
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Увага! Для безпечного читання та запису параметрів EEPROM, MOSFET заряду та розряду будуть ТИМЧАСОВО ВІДКЛЮЧЕНІ. Продовжити?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push(`/battery/${id}`)}>Скасувати</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartProgramming} className="bg-red-600 hover:bg-red-700">
              Так, відключити та зчитати
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <Button 
            onClick={handleSaveAndExit} 
            disabled={isSaving || !isAuthorized} 
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Запис..." : "Зберегти та Вийти"}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="max-w-6xl mx-auto px-4 pt-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground animate-pulse">Читання регістрів BMS (0x10 - 0xAF)...</p>
        </div>
      ) : isAuthorized ? (
        <div className="max-w-6xl mx-auto px-4 pt-8">
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
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>COVP (Cell Over Voltage)</Label>
                    <Input value={localSettings.covp || ""} onChange={(e) => handleInputChange('covp', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Поріг перезаряду. При перевищенні MOSFET заряду вимикається (Регістр 0x24).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>COVP Release</Label>
                    <Input value={localSettings.covp_rel || ""} onChange={(e) => handleInputChange('covp_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Напруга відновлення заряду після спрацювання COVP (Регістр 0x25).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>CUVP (Cell Under Voltage)</Label>
                    <Input value={localSettings.cuvp || ""} onChange={(e) => handleInputChange('cuvp', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Поріг перерозряду. При падінні нижче MOSFET розряду вимикається (Регістр 0x26).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>CUVP Release</Label>
                    <Input value={localSettings.cuvp_rel || ""} onChange={(e) => handleInputChange('cuvp_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Напруга відновлення розряду після спрацювання CUVP (Регістр 0x27).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary COVP High</Label>
                    <Input value={localSettings.covp_high || "4300"} onChange={(e) => handleInputChange('covp_high', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Вторинний, критичний поріг перенапруги комірки (Регістр 0x36).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary CUVP High</Label>
                    <Input value={localSettings.cuvp_high || "2500"} onChange={(e) => handleInputChange('cuvp_high', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Вторинний, критичний поріг низької напруги комірки (Регістр 0x37).</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Cell Voltage Delay (s)</Label>
                    <Input value={localSettings.cell_v_delays || "2"} onChange={(e) => handleInputChange('cell_v_delays', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Затримка спрацювання захисту по напрузі комірок (Регістр 0x3D).</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Захист пакета (10mV)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>POVP (Pack Over Voltage)</Label>
                    <Input value={localSettings.povp || ""} onChange={(e) => handleInputChange('povp', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Загальний поріг перезаряду всієї батареї (Регістр 0x20).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>POVP Release</Label>
                    <Input value={localSettings.povp_rel || ""} onChange={(e) => handleInputChange('povp_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Напруга відновлення всього пакета після POVP (Регістр 0x21).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>PUVP (Pack Under Voltage)</Label>
                    <Input value={localSettings.puvp || ""} onChange={(e) => handleInputChange('puvp', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Загальний поріг низької напруги пакета (Регістр 0x22).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>PUVP Release</Label>
                    <Input value={localSettings.puvp_rel || ""} onChange={(e) => handleInputChange('puvp_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Відновлення після глибокого розряду пакета (Регістр 0x23).</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Pack Voltage Delay (s)</Label>
                    <Input value={localSettings.pack_v_delays || "2"} onChange={(e) => handleInputChange('pack_v_delays', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Час затримки для спрацювання захисту пакета (Регістр 0x3C).</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="currents" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Захист за струмом (10mA)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>CHGOC (Charge Over Current)</Label>
                    <Input value={localSettings.chgoc || ""} onChange={(e) => handleInputChange('chgoc', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Максимальний струм заряду. 5000 = 50.00A (Регістр 0x28).</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Charge OC Delay (s)</Label>
                    <Input value={localSettings.chgoc_delays || "5"} onChange={(e) => handleInputChange('chgoc_delays', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Затримка та час відновлення для струму заряду (Регістр 0x3E).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>DSGOC (Discharge Over Current)</Label>
                    <Input value={localSettings.dsgoc || ""} onChange={(e) => handleInputChange('dsgoc', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Максимальний робочий струм розряду. 10000 = 100.00A (Регістр 0x29).</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Discharge OC Delay (s)</Label>
                    <Input value={localSettings.dsgoc_delays || "5"} onChange={(e) => handleInputChange('dsgoc_delays', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Затримка та час відновлення для струму розряду (Регістр 0x3F).</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="temps" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Температурні пороги (0.1K)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>CHGOT (Charge Over Temp)</Label>
                    <Input value={localSettings.chgot || ""} onChange={(e) => handleInputChange('chgot', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Макс. температура заряду. 3231 = 50°C (Регістр 0x18).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>CHGOT Release</Label>
                    <Input value={localSettings.chgot_rel || ""} onChange={(e) => handleInputChange('chgot_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Відновлення заряду після перегріву (Регістр 0x19).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>CHGUT (Charge Under Temp)</Label>
                    <Input value={localSettings.chgut || ""} onChange={(e) => handleInputChange('chgut', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Мін. температура заряду. 2731 = 0°C (Регістр 0x1A).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>CHGUT Release</Label>
                    <Input value={localSettings.chgut_rel || ""} onChange={(e) => handleInputChange('chgut_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Відновлення після переохолодження заряду (Регістр 0x1B).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>DSGOT (Discharge Over Temp)</Label>
                    <Input value={localSettings.dsgot || ""} onChange={(e) => handleInputChange('dsgot', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Макс. температура розряду (Регістр 0x1C).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>DSGOT Release</Label>
                    <Input value={localSettings.dsgot_rel || ""} onChange={(e) => handleInputChange('dsgot_rel', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Відновлення після перегріву при розряді (Регістр 0x1D).</p>
                  </div>
                  <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> Temp Delay (s)</Label>
                     <Input value={localSettings.chg_t_delays || "2"} onChange={(e) => handleInputChange('chg_t_delays', e.target.value)} className="bg-secondary/30" />
                     <p className="text-[10px] text-muted-foreground">Затримка реакції на температурні аномалії (Регістри 0x3A, 0x3B).</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="capacity_soc" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Ємність та SOC (10mAh)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Design Capacity</Label>
                      <Input value={localSettings.design_cap || ""} onChange={(e) => handleInputChange('design_cap', e.target.value)} className="bg-secondary/30" />
                      <p className="text-[10px] text-muted-foreground">Номінальна ємність батареї. 10000 = 100Ah (Регістр 0x10).</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Self-Discharge Rate (0.1%)</Label>
                      <Input value={localSettings.dsg_rate || "10"} onChange={(e) => handleInputChange('dsg_rate', e.target.value)} className="bg-secondary/30" />
                      <p className="text-[10px] text-muted-foreground">Процент саморозряду за місяць (Регістр 0x14).</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Cell 100% Voltage (mV)</Label>
                      <Input value={localSettings.cap_100 || ""} onChange={(e) => handleInputChange('cap_100', e.target.value)} className="bg-secondary/30" />
                      <p className="text-[10px] text-muted-foreground">Напруга для 100% заряду (Регістр 0x12).</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Cell 0% Voltage (mV)</Label>
                      <Input value={localSettings.cap_0 || ""} onChange={(e) => handleInputChange('cap_0', e.target.value)} className="bg-secondary/30" />
                      <p className="text-[10px] text-muted-foreground">Напруга для 0% заряду (Регістр 0x13).</p>
                    </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Загальна конфігурація</CardTitle>
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
                    <p className="text-[10px] text-muted-foreground">Кількість фізичних сенсорів температури (Біти 0-7 регістра 0x2E).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Shunt Resistor (μΩ)</Label>
                    <Input value={localSettings.shunt_res || "100"} onChange={(e) => handleInputChange('shunt_res', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Опір вимірювального шунта. 100 = 0.1 mOhm (Регістр 0x2C).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Balancing Start Voltage (mV)</Label>
                    <Input value={localSettings.bal_start || "3400"} onChange={(e) => handleInputChange('bal_start', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Напруга початку вирівнювання (Регістр 0x2A).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Balancing Window (mV)</Label>
                    <Input value={localSettings.bal_window || "50"} onChange={(e) => handleInputChange('bal_window', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Допуск різниці напруг для балансування (Регістр 0x2B).</p>
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
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Manufacturer Name (0xA0)</Label>
                    <Input value={localSettings.mfg_name || ""} onChange={(e) => handleInputChange('mfg_name', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Назва виробника (ASCII рядок).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Device Name (0xA1)</Label>
                    <Input value={localSettings.device_name || ""} onChange={(e) => handleInputChange('device_name', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Модель пристрою.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Serial Number (0x16)</Label>
                    <Input value={localSettings.serial_num || ""} onChange={(e) => handleInputChange('serial_num', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Заводський серійний номер.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacturing Date (0x15)</Label>
                    <Input value={localSettings.mfg_date || ""} onChange={(e) => handleInputChange('mfg_date', e.target.value)} className="bg-secondary/30" type="date" />
                    <p className="text-[10px] text-muted-foreground">Дата випуску з виробництва.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calibration" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Калібрування NTC (0.1K)</CardTitle>
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
                  <p className="text-[10px] text-muted-foreground mt-4 italic">Корекція зміщення кожного датчика в Кельвінах (Регістри 0xD0-0xD7).</p>
                </CardContent>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">Калібрування струму та нуль-пункту</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Idle Current Calib (0xAD)</Label>
                    <Input value={localSettings.idle_current_cal || "0"} onChange={(e) => handleInputChange('idle_current_cal', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Обнулення офсету АЦП при відсутності навантаження.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Charge Current Calib (0xAE)</Label>
                    <Input value={localSettings.charge_current_cal || ""} onChange={(e) => handleInputChange('charge_current_cal', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Калібрування шунта при стабільному струмі заряду.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Discharge Current Calib (0xAF)</Label>
                    <Input value={localSettings.discharge_current_cal || ""} onChange={(e) => handleInputChange('discharge_current_cal', e.target.value)} className="bg-secondary/30" />
                    <p className="text-[10px] text-muted-foreground">Калібрування шунта при еталонному розряді.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-center gap-4">
               <Button variant="outline" className="text-muted-foreground border-accent/10 hover:bg-accent/5">
                  <Shield className="mr-2 h-4 w-4" />
                  Factory Mode Active
               </Button>
               <Button 
                variant="ghost" 
                className="text-[10px] opacity-50"
                onClick={() => router.push(`/battery/${id}`)}
               >
                  Скасувати зміни та повернутися
               </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 pt-20 flex flex-col items-center justify-center gap-4">
           <Shield className="h-16 w-16 text-muted-foreground opacity-20" />
           <p className="text-muted-foreground">Очікування підтвердження безпеки...</p>
        </div>
      )}
    </main>
  );
}
