"use client";

import { useBmsStore } from "@/lib/bms-store";
import { DashboardHeader } from "@/components/bms/dashboard-header";
import { CellGrid } from "@/components/bms/cell-grid";
import { HistoryCharts } from "@/components/bms/history-charts";
import { FirmwareWizard } from "@/components/bms/firmware-wizard";
import { BluetoothConnector } from "@/components/bms/bluetooth-connector";
import { AiAnalysis } from "@/components/bms/ai-analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Settings, 
  Bluetooth, 
  LayoutDashboard, 
  Info,
  CircleDot
} from "lucide-react";

export default function Home() {
  const { currentData, activeHistory, isDemoMode } = useBmsStore();

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      {/* Navigation Top Bar */}
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl text-accent">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BMS Monitor</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-[0.2em]">Battery Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isDemoMode && (
              <Badge variant="outline" className="border-accent/20 text-accent gap-1 animate-pulse">
                <CircleDot className="h-3 w-3" />
                Demo Mode
              </Badge>
            )}
            <div className="text-xs text-muted-foreground hidden sm:block">
              v1.0.4 | ESP32-C3
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-8 bg-secondary/40 h-12">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <LayoutDashboard className="h-4 w-4" />
              Дашборд
            </TabsTrigger>
            <TabsTrigger value="connect" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Bluetooth className="h-4 w-4" />
              Підключення
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <Settings className="h-4 w-4" />
              Налаштування
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardHeader data={currentData} />
            <div className="grid grid-cols-1 gap-6">
              <CellGrid voltages={currentData?.cellVoltages || []} />
            </div>
            <HistoryCharts history={activeHistory} />
            <AiAnalysis currentData={currentData} history={activeHistory} />
          </TabsContent>

          <TabsContent value="connect" className="space-y-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BluetoothConnector />
              <div className="glass-card p-6 rounded-xl flex flex-col justify-center">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  Поради щодо підключення
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• <strong>ESP32:</strong> Найкращий вибір для віддаленого моніторингу через Wi-Fi.</li>
                  <li>• <strong>Bluetooth:</strong> Швидкий спосіб перевірити стан поруч з батареєю.</li>
                  <li>• <strong>JBD BMS:</strong> Сумісно з більшістю моделей Xiaoxiang.</li>
                  <li>• <strong>Демо режим:</strong> Вимкніть його в налаштуваннях для роботи з реальним залізом.</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 max-w-4xl mx-auto">
            <FirmwareWizard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Info */}
      <footer className="mt-20 border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>© 2024 BMS Monitor System. Спроектовано для JBD BMS SP14S004.</p>
        <p className="mt-2 text-[10px] opacity-50 uppercase tracking-widest">ESP32-C3 Super Mini Compatible</p>
      </footer>
    </main>
  );
}