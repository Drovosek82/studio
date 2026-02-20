"use client";

import { use } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { DashboardHeader } from "@/components/bms/dashboard-header";
import { CellGrid } from "@/components/bms/cell-grid";
import { HistoryCharts } from "@/components/bms/history-charts";
import { AiAnalysis } from "@/components/bms/ai-analysis";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Settings2, 
  LayoutDashboard,
  ShieldCheck,
  Thermometer,
  Zap,
  Info
} from "lucide-react";

export default function BatteryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allData, history } = useBmsStore();
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
             <AiAnalysis currentData={data} history={activeHistory} />
             
             <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  Статус системи
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Балансування:</span>
                    <span className="text-accent font-medium">Активне (Комірки 2, 4, 8)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MOSFET Заряду:</span>
                    <span className="text-green-500 font-medium">УВІМК</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MOSFET Розряду:</span>
                    <span className="text-green-500 font-medium">УВІМК</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Циклів:</span>
                    <span className="text-white font-medium">42</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}