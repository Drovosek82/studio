"use client";

import { Battery, ShieldCheck, Zap, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BatteryData } from "@/lib/types";

interface DashboardHeaderProps {
  data?: BatteryData;
}

export function DashboardHeader({ data }: DashboardHeaderProps) {
  if (!data) return null;

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
            <div>
              <p className="text-muted-foreground text-sm font-medium">Температура</p>
              <h3 className="text-3xl font-bold mt-1 text-accent">
                {data.temperature.toFixed(1)} <span className="text-lg font-normal">°C</span>
              </h3>
            </div>
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Thermometer className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <p className="text-xs text-green-500 font-medium">{data.protectionStatus}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}