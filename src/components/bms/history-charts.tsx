"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { HistoricalRecord } from "@/lib/types";
import { useBmsStore } from "@/lib/bms-store";

interface HistoryChartsProps {
  history: HistoricalRecord[];
}

export function HistoryCharts({ history }: HistoryChartsProps) {
  const { t } = useBmsStore();
  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('voltageCurrentChart')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4a" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime} 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis yAxisId="left" stroke="#5EDEE0" fontSize={12} domain={['auto', 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#2966A3" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="totalVoltage" 
                stroke="#5EDEE0" 
                strokeWidth={2}
                dot={false}
                name={t('voltage') + " (V)"}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="totalCurrent" 
                stroke="#2966A3" 
                strokeWidth={2}
                dot={false}
                name={t('current') + " (A)"}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card border-none">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{t('socChart')}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorSoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5EDEE0" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5EDEE0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3a4a" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime} 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="stateOfCharge" 
                stroke="#5EDEE0" 
                fillOpacity={1} 
                fill="url(#colorSoc)" 
                name="SoC %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
