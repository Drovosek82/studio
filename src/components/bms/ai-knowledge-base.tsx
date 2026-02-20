"use client";

import { useMemo } from "react";
import { BrainCircuit, BookOpen, Activity, History, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useBmsStore } from "@/lib/bms-store";

export function AiKnowledgeBase() {
  const { t } = useBmsStore();
  const { user } = useUser();
  const db = useFirestore();

  const insightsRef = useMemoFirebase(() => 
    user && db ? query(collection(db, 'users', user.uid, 'modelInsights'), orderBy('lastSeen', 'desc'), limit(10)) : null,
  [user, db]);
  
  const { data: insights, isLoading } = useCollection<any>(insightsRef);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="p-4 bg-accent/20 rounded-full text-accent mb-4">
          <BrainCircuit className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold">{t('aiKnowledgeTitle')}</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {t('aiKnowledgeDesc')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Activity className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : insights && insights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="glass-card border-none hover:ring-1 hover:ring-accent/30 transition-all">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{insight.modelName}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-accent">
                      {t('manufacturer')}: {insight.manufacturer || t('unknown')}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-accent/20 text-accent">
                    {insight.protocol}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {insight.capabilities?.map((cap: string, i: number) => (
                    <Badge key={i} variant="secondary" className="bg-secondary/50 text-[9px]">
                      {cap}
                    </Badge>
                  ))}
                </div>
                
                <div className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                   <p className="text-[10px] text-accent uppercase font-bold mb-1">{t('technicalNotes')}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    "{insight.technicalNotes}"
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1">
                    <History className="h-3 w-3" />
                    {t('aiFirstSeen')}: {new Date(insight.lastSeen).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-accent" />
                    {t('aiDetectedCount')}: {insight.detectedCount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-bold">{t('knowledgeBaseEmpty')}</h3>
          <p className="text-xs text-muted-foreground mt-2">
            {t('connectFirst')}
          </p>
        </div>
      )}
    </div>
  );
}