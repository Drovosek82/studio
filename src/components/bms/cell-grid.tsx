"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CellGridProps {
  voltages: number[];
}

export function CellGrid({ voltages }: CellGridProps) {
  const min = Math.min(...voltages);
  const max = Math.max(...voltages);
  const diff = max - min;

  return (
    <Card className="glass-card border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Напруга комірок (Cells)</CardTitle>
        <Badge variant="outline" className="border-accent/20 text-accent font-code">
          Diff: {diff.toFixed(3)} V
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {voltages.map((v, i) => {
            const isMin = v === min;
            const isMax = v === max;
            
            return (
              <div 
                key={i} 
                className={`p-3 rounded-lg border flex flex-col items-center transition-colors duration-300 ${
                  isMin ? 'bg-red-500/10 border-red-500/30' : 
                  isMax ? 'bg-blue-500/10 border-blue-500/30' : 
                  'bg-secondary/40 border-border'
                }`}
              >
                <span className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Cell {i + 1}</span>
                <span className="text-lg font-code font-bold text-accent">{v.toFixed(3)}</span>
                <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${((v - 3.0) / (4.2 - 3.0)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}