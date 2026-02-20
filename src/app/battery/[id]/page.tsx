"use client";

import { use } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { DashboardHeader } from "@/components/bms/dashboard-header";
import { CellGrid } from "@/components/bms/cell-grid";
import { HistoryCharts } from "@/components/bms/history-charts";
import { AiAnalysis } from "@/components/bms/ai-analysis";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Settings2, 
  Info,
  Power,
  Zap,
  Activity,
  ShieldAlert
} from "lucide-react";

export default function BatteryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allData, history, toggleControl } = useBmsStore();
  const data = allData[id];
  const activeHistory = history[id] || [];

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Батарею не знайдено</h2>
        <Link href="/">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Повернутися</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{data.name}</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-widest">Детальний моніторинг</p>
            </div>
          </div>
          <Link href={`/battery/${id}/eeprom`}>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Settings2 className="h-4 w-4" />
              Редагувати EEPROM
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-6">
        <DashboardHeader data={data} />
        
        <div className="grid grid-cols-1 gap-6">
          <CellGrid voltages={data.cellVoltages} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <HistoryCharts history={activeHistory} />
          </div>
          <div className="space-y-6">
             {/* Device Control Card */}
             <div className="glass-card p-6 rounded-xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Power className="h-5 w-5 text-accent" />
                  Керування пристроєм
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${data.isChargeEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                        MOSFET Заряду
                      </Label>
                      <p className="text-[10px] text-muted-foreground">Дозвіл на приймання енергії</p>
                    </div>
                    <Switch 
                      checked={data.isChargeEnabled} 
                      onCheckedChange={() => toggleControl(id, 'isChargeEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Power className={`h-4 w-4 ${data.isDischargeEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                        MOSFET Розряду
                      </Label>
                      <p className="text-[10px] text-muted-foreground">Дозвіл на видачу енергії</p>
                    </div>
                    <Switch 
                      checked={data.isDischargeEnabled} 
                      onCheckedChange={() => toggleControl(id, 'isDischargeEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Activity className={`h-4 w-4 ${data.isBalancingActive ? 'text-accent' : 'text-muted-foreground'}`} />
                        Балансування
                      </Label>
                      <p className="text-[10px] text-muted-foreground">Вирівнювання напруги комірок</p>
                    </div>
                    <Switch 
                      checked={data.isBalancingActive} 
                      onCheckedChange={() => toggleControl(id, 'isBalancingActive')}
                    />
                  </div>
                </div>

                {!data.isChargeEnabled && !data.isDischargeEnabled && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5" />
                    <p className="text-[10px] text-red-400">Всі виходи заблоковано. Батарея повністю ізольована від навантаження та зарядного пристрою.</p>
                  </div>
                )}
             </div>

             <AiAnalysis currentData={data} history={activeHistory} />
             
             <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  Статус системи
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Балансування:</span>
                    <span className={data.isBalancingActive ? "text-accent font-medium" : "text-muted-foreground"}>
                      {data.isBalancingActive ? "Активне (Комірки 2, 4, 8)" : "Вимкнено"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MOSFET Заряду:</span>
                    <span className={data.isChargeEnabled ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {data.isChargeEnabled ? "УВІМК" : "ВИМК"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MOSFET Розряду:</span>
                    <span className={data.isDischargeEnabled ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {data.isDischargeEnabled ? "УВІМК" : "ВИМК"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Циклів:</span>
                    <span className="text-white font-medium">{data.cycleCount}</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
