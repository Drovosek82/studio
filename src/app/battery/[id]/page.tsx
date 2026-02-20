"use client";

import { use, useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { DashboardHeader } from "@/components/bms/dashboard-header";
import { CellGrid } from "@/components/bms/cell-grid";
import { HistoryCharts } from "@/components/bms/history-charts";
import { AiAnalysis } from "@/components/bms/ai-analysis";
import { RawPacketDebugger } from "@/components/bms/raw-packet-debugger";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Settings2, 
  Power,
  Zap,
  Activity,
  ShieldAlert,
  Loader2
} from "lucide-react";

export default function BatteryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allData, history, toggleControl, isLoading: isContextLoading, t } = useBmsStore();
  
  const [isInitializing, setIsInitializing] = useState(true);

  const data = useMemo(() => allData[id], [allData, id]);
  const activeHistory = useMemo(() => history[id] || [], [history, id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  if ((isContextLoading || isInitializing) && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-muted-foreground animate-pulse">{t('connecting')} {id}...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <ShieldAlert className="h-12 w-12 text-red-500 opacity-50" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{t('deviceNotFound')}</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Device <code className="bg-secondary px-1 rounded">{id}</code> was not found. 
          </p>
        </div>
        <Link href="/">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> {t('backToHome')}</Button>
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
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-widest">
                {id.startsWith('BLE_') ? t('bleDirectTag') : t('wifiHubTag')}
              </p>
            </div>
          </div>
          <Link href={`/battery/${id}/eeprom`}>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              <Settings2 className="h-4 w-4" />
              {t('editEeprom')}
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-6">
        <DashboardHeader data={data} />
        
        <div className="grid grid-cols-1 gap-6">
          <CellGrid voltages={data.cellVoltages} balancingCells={data.balancingCells} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
             <HistoryCharts history={activeHistory} />
             {id.startsWith('BLE_') && <RawPacketDebugger />}
          </div>
          <div className="space-y-6">
             <div className="glass-card p-6 rounded-xl space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Power className="h-5 w-5 text-accent" />
                  {t('mosfetControl')}
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Zap className={`h-4 w-4 ${data.isChargeEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                      {t('charge')}
                    </Label>
                    <Switch 
                      checked={data.isChargeEnabled} 
                      onCheckedChange={() => toggleControl(id, 'isChargeEnabled')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Power className={`h-4 w-4 ${data.isDischargeEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
                      {t('discharge')}
                    </Label>
                    <Switch 
                      checked={data.isDischargeEnabled} 
                      onCheckedChange={() => toggleControl(id, 'isDischargeEnabled')}
                    />
                  </div>

                  <div className="border-t border-border/50 pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Activity className={`h-4 w-4 ${data.isBalancingActive ? 'text-accent' : 'text-muted-foreground'}`} />
                        {t('balancing')}
                      </Label>
                      <Switch 
                        checked={data.isBalancingActive} 
                        onCheckedChange={() => toggleControl(id, 'isBalancingActive')}
                      />
                    </div>
                  </div>
                </div>
             </div>

             <AiAnalysis currentData={data} history={activeHistory} />
          </div>
        </div>
      </div>
    </main>
  );
}