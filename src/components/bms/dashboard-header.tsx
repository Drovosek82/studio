
"use client";

import { Battery, ShieldCheck, Zap, Thermometer, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BatteryData } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBmsStore } from "@/lib/bms-store";

interface DashboardHeaderProps {
  data?: BatteryData;
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  const { t } = useBmsStore();
  if (!data) return null;

  const avgTemp = data.temperatures.length > 0 
    ? data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length 
    : 0;

  // Динамічні параметри, виявлені ШІ
  const extraParams = data.modelInsight?.supportedTelemetry || [];

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-none overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('voltage')}</p>
                <h3 className="text-3xl font-bold mt-1 text-accent">
                  {data.totalVoltage.toFixed(2)} <span className="text-lg font-normal">V</span>
                </h3>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Zap className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-accent/20 text-accent">
                {t('nominal')}: 48V
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('current')}</p>
                <h3 className="text-3xl font-bold mt-1 text-accent">
                  {data.totalCurrent.toFixed(2)} <span className="text-lg font-normal">A</span>
                </h3>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Zap className="h-6 w-6 rotate-90" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">{t('powerWatt')}: {(data.totalVoltage * data.totalCurrent).toFixed(0)} W</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{t('charge')} (SoC)</p>
                <h3 className="text-3xl font-bold mt-1 text-accent">
                  {data.stateOfCharge.toFixed(1)} <span className="text-lg font-normal">%</span>
                </h3>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Battery className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-500 ease-in-out" 
                style={{ width: `${data.stateOfCharge}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-muted-foreground text-sm font-medium">{t('temp')} (NTC)</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-3xl font-bold text-accent">
                    {avgTemp.toFixed(1)} <span className="text-lg font-normal">°C</span>
                  </h3>
                  <Badge variant="secondary" className="bg-secondary/50 text-[10px] h-4">AVG</Badge>
                </div>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg text-accent">
                <Thermometer className="h-6 w-6" />
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {data.temperatures.map((t_val, i) => (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                            <div 
                              className={`w-full ${t_val > 45 ? 'bg-red-500' : 'bg-accent'}`} 
                              style={{ height: `${(t_val / 80) * 100}%`, marginTop: 'auto' }} 
                            />
                          </div>
                          <span className="text-[8px] font-bold opacity-50">T{i+1}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border-border">
                        <p className="text-xs">Sensor {i + 1}: <span className="text-accent font-bold">{t_val.toFixed(1)}°C</span></p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-1">
                 <ShieldCheck className="h-3 w-3 text-green-500" />
                 <p className="text-[10px] text-green-500 font-medium truncate">{data.protectionStatus === 'Normal' ? t('online') : data.protectionStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Динамічні параметри від ШІ */}
      {extraParams.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          {extraParams.map(param => (
            <Card key={param.id} className="bg-secondary/20 border-border/50 p-3 flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground">{param.label}</p>
                <p className="text-sm font-bold text-accent">
                  {/* Відображаємо значення з eeprom або telemetry, якщо воно є */}
                  {data.eeprom?.[param.id] || "—"} {param.unit}
                </p>
              </div>
              <Info className="h-3 w-3 text-accent opacity-30" />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
