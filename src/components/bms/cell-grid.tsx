"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface CellGridProps {
  voltages: number[];
  balancingCells?: boolean[];
}

export function CellGrid({ voltages, balancingCells = [] }: CellGridProps) {
  const min = Math.min(...voltages);
  const max = Math.max(...voltages);
  const diff = max - min;

  return (
    <Card className="glass-card border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Напруга комірок (Cells)</CardTitle>
        <div className="flex gap-2">
          {balancingCells.some(b => b) && (
            <Badge variant="outline" className="border-accent text-accent animate-pulse">
              <Zap className="h-3 w-3 mr-1" /> Балансування активне
            </Badge>
          )}
          <Badge variant="outline" className="border-accent/20 text-accent font-code">
            Diff: {diff.toFixed(3)} V
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {voltages.map((v, i) => {
            const isMin = v === min;
            const isMax = v === max;
            const isBalancing = balancingCells[i];
            
            return (
              <div 
                key={i} 
                className={`p-3 rounded-lg border flex flex-col items-center transition-all duration-500 relative ${
                  isBalancing ? 'cyan-glow border-accent bg-accent/10' :
                  isMin ? 'bg-red-500/10 border-red-500/30' : 
                  isMax ? 'bg-blue-500/10 border-blue-500/30' : 
                  'bg-secondary/40 border-border'
                }`}
              >
                {isBalancing && (
                   <div className="absolute top-1 right-1">
                      <Zap className="h-3 w-3 text-accent animate-pulse" />
                   </div>
                )}
                <span className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Cell {i + 1}</span>
                <span className={`text-lg font-code font-bold ${isBalancing ? 'text-accent' : 'text-foreground'}`}>
                  {v.toFixed(3)}
                </span>
                <div className="w-full bg-muted h-1 mt-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isBalancing ? 'bg-accent' : 'bg-primary'}`} 
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
