"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertTriangle, 
  Zap, 
  Thermometer, 
  Database, 
  Activity, 
  Wrench,
  Settings2,
  Shield,
  Info,
  Clock,
  Loader2
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

  const handleInputChange = (key: string, value: string) => {
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
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-widest">{data.name}</p>
            </div>
          </div>
          <Button 
            onClick={handleSaveAndExit} 
            disabled={isSaving || !isAuthorized} 
            className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "..." : t('saveExit')}
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="max-w-6xl mx-auto px-4 pt-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
          <p className="text-muted-foreground animate-pulse">Reading BMS Registers...</p>
        </div>
      ) : isAuthorized ? (
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Tabs defaultValue="voltages" className="space-y-6">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border border-border/50 bg-secondary/20">
              <TabsList className="bg-transparent h-12 inline-flex p-1">
                <TabsTrigger value="voltages" className="gap-2 px-4"><Zap className="h-4 w-4" /> {t('voltage')}</TabsTrigger>
                <TabsTrigger value="currents" className="gap-2 px-4"><Activity className="h-4 w-4" /> {t('current')}</TabsTrigger>
                <TabsTrigger value="temps" className="gap-2 px-4"><Thermometer className="h-4 w-4" /> {t('temp')}</TabsTrigger>
                <TabsTrigger value="capacity_soc" className="gap-2 px-4"><Database className="h-4 w-4" /> {t('capacitySoc')}</TabsTrigger>
                <TabsTrigger value="config" className="gap-2 px-4"><Settings2 className="h-4 w-4" /> {t('settings')}</TabsTrigger>
                <TabsTrigger value="info" className="gap-2 px-4"><Info className="h-4 w-4" /> {t('deviceInfo')}</TabsTrigger>
                <TabsTrigger value="calibration" className="gap-2 px-4"><Wrench className="h-4 w-4" /> {t('calibration')}</TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="voltages" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('cellProtection')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>COVP (Cell Over Voltage)</Label>
                    <Input value={localSettings.covp || ""} onChange={(e) => handleInputChange('covp', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>COVP Release</Label>
                    <Input value={localSettings.covp_rel || ""} onChange={(e) => handleInputChange('covp_rel', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>CUVP (Cell Under Voltage)</Label>
                    <Input value={localSettings.cuvp || ""} onChange={(e) => handleInputChange('cuvp', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>CUVP Release</Label>
                    <Input value={localSettings.cuvp_rel || ""} onChange={(e) => handleInputChange('cuvp_rel', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> {t('cellVoltageDelay')} (s)</Label>
                    <Input value={localSettings.cell_v_delays || "2"} onChange={(e) => handleInputChange('cell_v_delays', e.target.value)} className="bg-secondary/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('packProtection')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>POVP (Pack Over Voltage)</Label>
                    <Input value={localSettings.povp || ""} onChange={(e) => handleInputChange('povp', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>PUVP (Pack Under Voltage)</Label>
                    <Input value={localSettings.puvp || ""} onChange={(e) => handleInputChange('puvp', e.target.value)} className="bg-secondary/30" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="currents" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('currentProtection')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>CHGOC (Charge Over Current)</Label>
                    <Input value={localSettings.chgoc || ""} onChange={(e) => handleInputChange('chgoc', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="h-3 w-3" /> {t('chargeOcDelay')} (s)</Label>
                    <Input value={localSettings.chgoc_delays || "5"} onChange={(e) => handleInputChange('chgoc_delays', e.target.value)} className="bg-secondary/30" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('generalConfig')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t('ntcCount')}</Label>
                    <Select 
                      value={String(localSettings.ntc_cnt || "3")} 
                      onValueChange={(val) => handleInputChange('ntc_cnt', val)}
                    >
                      <SelectTrigger className="bg-secondary/30 border-none h-10">
                        <SelectValue placeholder="NTC" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} NTC</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('balancingStart')} (mV)</Label>
                    <Input value={localSettings.bal_start || "3400"} onChange={(e) => handleInputChange('bal_start', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('balancingWindow')} (mV)</Label>
                    <Input value={localSettings.bal_window || "50"} onChange={(e) => handleInputChange('bal_window', e.target.value)} className="bg-secondary/30" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card className="glass-card border-none">
                <CardHeader>
                  <CardTitle className="text-lg">{t('deviceInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>{t('manufacturer')}</Label>
                    <Input value={localSettings.mfg_name || ""} onChange={(e) => handleInputChange('mfg_name', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('deviceName')}</Label>
                    <Input value={localSettings.device_name || ""} onChange={(e) => handleInputChange('device_name', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('serialNumber')}</Label>
                    <Input value={localSettings.serial_num || ""} onChange={(e) => handleInputChange('serial_num', e.target.value)} className="bg-secondary/30" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('mfgDate')}</Label>
                    <Input value={localSettings.mfg_date || ""} onChange={(e) => handleInputChange('mfg_date', e.target.value)} className="bg-secondary/30" type="date" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-center gap-4">
               <Button variant="outline" className="text-muted-foreground border-accent/10 hover:bg-accent/5">
                  <Shield className="mr-2 h-4 w-4" />
                  {t('factoryMode')}
               </Button>
               <Button 
                variant="ghost" 
                className="text-[10px] opacity-50"
                onClick={() => router.push(`/battery/${id}`)}
               >
                  {t('cancel')}
               </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 pt-20 flex flex-col items-center justify-center gap-4">
           <Shield className="h-16 w-16 text-muted-foreground opacity-20" />
           <p className="text-muted-foreground">Waiting for authorization...</p>
        </div>
      )}
    </main>
  );
}