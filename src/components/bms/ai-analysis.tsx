"use client";

import { useState } from "react";
import { Brain, Sparkles, Loader2, Info, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeBatteryHealth, AnalyzeBatteryHealthOutput } from "@/ai/flows/analyze-battery-health";
import { BatteryData, HistoricalRecord } from "@/lib/types";

interface AiAnalysisProps {
  currentData?: BatteryData;
  history: HistoricalRecord[];
}

export function AiAnalysis({ currentData, history }: AiAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeBatteryHealthOutput | null>(null);

  const runAnalysis = async () => {
    if (!currentData) return;
    
    setIsAnalyzing(true);
    try {
      const output = await analyzeBatteryHealth({
        currentData: {
          totalVoltage: currentData.totalVoltage,
          totalCurrent: currentData.totalCurrent,
          temperature: currentData.temperature,
          stateOfCharge: currentData.stateOfCharge,
          protectionStatus: currentData.protectionStatus,
          cellVoltages: currentData.cellVoltages,
        },
        historicalData: history.slice(-50),
        batterySpecs: {
          nominalVoltage: 48,
          maxVoltage: 54.6,
          minVoltage: 42,
          nominalCapacityAh: 100,
          cellCount: 14,
          isParallelConnected: false,
        }
      });
      setResult(output);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="glass-card border-none mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">AI Аналіз стану батареї</CardTitle>
        </div>
        <Button 
          size="sm" 
          onClick={runAnalysis} 
          disabled={isAnalyzing || !currentData}
          className="bg-accent/20 text-accent hover:bg-accent/30 border border-accent/20"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Аналізувати
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {!result && !isAnalyzing && (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-accent/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Натисніть кнопку вище, щоб AI проаналізував дані вашої батареї та надав рекомендації.</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="space-y-4 py-4">
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-full" />
            <div className="h-4 bg-secondary/50 rounded animate-pulse w-5/6" />
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
              <h4 className="font-bold text-accent mb-2">Підсумок:</h4>
              <p className="text-sm leading-relaxed">{result.overallHealthSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Детальний аналіз:</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.currentInsights}</p>
              </div>
              <div>
                <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Історичні тренди:</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{result.historicalAnalysis}</p>
              </div>
            </div>

            {result.alerts.length > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="text-sm font-bold">Критичні сповіщення:</h4>
                </div>
                <ul className="text-xs space-y-1">
                  {result.alerts.map((alert, i) => (
                    <li key={i} className="text-red-400">• {alert}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-bold text-accent uppercase tracking-wider mb-3">Рекомендації:</h4>
              <div className="grid grid-cols-1 gap-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg border border-border">
                    <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-xs leading-tight">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}