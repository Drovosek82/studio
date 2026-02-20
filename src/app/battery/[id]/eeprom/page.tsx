
"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Save, 
  Shield, 
  Loader2,
  Settings,
  Zap,
  Activity,
  Thermometer,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EepromPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { allData, updateEeprom, toggleControl, t } = useBmsStore();
  const data = allData[id];
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(true);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  const handleStartProgramming = () => {
    setShowAuthDialog(false);
    setIsLoading(true);
    
    // Disable MOSFETs for safety if active
    if (data?.isChargeEnabled) toggleControl(id, 'isChargeEnabled');
    if (data?.isDischargeEnabled) toggleControl(id, 'isDischargeEnabled');
    
    setTimeout(() => {
      if (data?.eeprom) {
        setLocalSettings(data.eeprom);
      }
      setIsLoading(false);
      setIsAuthorized(true);
      toast({
        title: t('toastConnEstablished'),
        description: t('toastEepromReadSuccess'),
      });
    }, 1500);
  };

  const handleInputChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAndExit = () => {
    setIsSaving(true);
    setTimeout(() => {
      Object.entries(localSettings).forEach(([key, value]) => {
        updateEeprom(id, key, value);
      });
      setIsSaving(false);
      toast({
        title: t('toastWriteFinished'),
        description: t('toastConfigSaved'),
      });
      router.push(`/battery/${id}`);
    }, 2000);
  };

  // Групуємо параметри за категоріями (від ШІ або стандартні)
  const categories = useMemo(() => {
    const params = data?.modelInsight?.supportedEepromParams || [];
    if (params.length === 0) {
      // Стандартний набір, якщо ШІ ще не визначив модель
      return {
        "Protection": [
          { id: 'covp', label: 'Cell Over Voltage', unit: 'mV', type: 'number' },
          { id: 'cuvp', label: 'Cell Under Voltage', unit: 'mV', type: 'number' },
        ],
        "General": [
          { id: 'ntc_cnt', label: 'NTC Count', type: 'number' },
          { id: 'bal_start', label: 'Balance Start', unit: 'mV', type: 'number' },
        ]
      };
    }

    const grouped: Record<string, any[]> = {};
    params.forEach(p => {
      const cat = p.category || "General";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  }, [data]);

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="glass-card border-accent/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              {t('eepromAuthTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('eepromWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.push(`/battery/${id}`)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartProgramming} className="bg-red-600 hover:bg-red-700">
              {t('eepromConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/battery/${id}`}>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('eepromTitle')}</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-widest">
                {data.modelInsight?.modelName || data.name}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSaveAndExit} 
            disabled={isSaving || !isAuthorized} 
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t('saveExit')}
          </Button>
        </div>
      </header>

      {isAuthorized && (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Tabs defaultValue={Object.keys(categories)[0]} className="space-y-6">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border/50 bg-secondary/20">
              <TabsList className="bg-transparent h-12 inline-flex p-1">
                {Object.keys(categories).map(cat => (
                  <TabsTrigger key={cat} value={cat} className="gap-2 px-4 capitalize">
                    {cat === 'Protection' ? <Shield className="h-4 w-4" /> : 
                     cat === 'Voltage' ? <Zap className="h-4 w-4" /> :
                     cat === 'Current' ? <Activity className="h-4 w-4" /> :
                     <Settings className="h-4 w-4" />}
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {Object.entries(categories).map(([cat, params]) => (
              <TabsContent key={cat} value={cat} className="space-y-4">
                <Card className="glass-card border-none">
                  <CardHeader>
                    <CardTitle className="text-lg">{cat}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {params.map((p: any) => (
                      <div key={p.id} className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          {p.label} {p.unit ? `(${p.unit})` : ''}
                        </Label>
                        
                        {p.type === 'select' ? (
                          <Select 
                            value={String(localSettings[p.id] || "")} 
                            onValueChange={(val) => handleInputChange(p.id, val)}
                          >
                            <SelectTrigger className="bg-secondary/30 border-none h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {p.options?.map((opt: string) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : p.type === 'boolean' ? (
                          <div className="flex items-center h-10">
                            <Switch 
                              checked={!!localSettings[p.id]} 
                              onCheckedChange={(val) => handleInputChange(p.id, val)} 
                            />
                          </div>
                        ) : (
                          <Input 
                            type={p.type === 'number' ? 'number' : 'text'}
                            value={localSettings[p.id] || ""} 
                            onChange={(e) => handleInputChange(p.id, e.target.value)} 
                            className="bg-secondary/30 border-none h-10"
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </main>
  );
}
