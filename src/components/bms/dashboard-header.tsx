"use client";

import { Battery, ShieldCheck, Zap, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BatteryData } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  data?: BatteryData;
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  if (!data) return null;

  // Вираховуємо середню температуру для головного дисплея
  const avgTemp = data.temperatures.length > 0 
    ? data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="glass-card border-none overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Напруга</p>
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
              Nominal: 48V
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Струм</p>
              <h3 className="text-3xl font-bold mt-1 text-accent">
                {data.totalCurrent.toFixed(2)} <span className="text-lg font-normal">A</span>
              </h3>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Zap className="h-6 w-6 rotate-90" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Потужність: {(data.totalVoltage * data.totalCurrent).toFixed(0)} W</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-none overflow-hidden">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Заряд (SoC)</p>
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
              <p className="text-muted-foreground text-sm font-medium">Температура (NTC)</p>
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
                {data.temperatures.map((t, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                          <div 
                            className={`w-full ${t > 45 ? 'bg-red-500' : 'bg-accent'}`} 
                            style={{ height: `${(t / 80) * 100}%`, marginTop: 'auto' }} 
                          />
                        </div>
                        <span className="text-[8px] font-bold opacity-50">T{i+1}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-popover border-border">
                      <p className="text-xs">Сенсор {i + 1}: <span className="text-accent font-bold">{t.toFixed(1)}°C</span></p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-1">
               <ShieldCheck className="h-3 w-3 text-green-500" />
               <p className="text-[10px] text-green-500 font-medium truncate">{data.protectionStatus}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
