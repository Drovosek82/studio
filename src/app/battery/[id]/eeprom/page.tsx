"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertTriangle, Shield, Zap, Thermometer, Database } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function EepromPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allData } = useBmsStore();
  const data = allData[id];
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Збережено",
        description: "Конфігурацію успішно записано в EEPROM.",
      });
    }, 1500);
  };

  if (!data) return null;

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/battery/${id}`}>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Налаштування EEPROM</h1>
              <p className="text-[10px] uppercase font-bold text-accent opacity-70 tracking-widest">{data.name}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Запис..." : "Зберегти все"}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
          <AlertTriangle className="h-6 w-6 text-red-500 shrink-0" />
          <div className="text-sm">
            <h4 className="font-bold text-red-500">Увага!</h4>
            <p className="text-red-400 opacity-80">Зміна параметрів EEPROM може призвести до пошкодження батареї. Будьте обережні з порогами напруги та струму.</p>
          </div>
        </div>

        <Tabs defaultValue="voltages" className="space-y-6">
          <TabsList className="bg-secondary/40 h-12 w-full grid grid-cols-4">
            <TabsTrigger value="voltages" className="gap-2"><Zap className="h-4 w-4" /> Напруга</TabsTrigger>
            <TabsTrigger value="currents" className="gap-2"><Zap className="h-4 w-4 rotate-90" /> Струм</TabsTrigger>
            <TabsTrigger value="temps" className="gap-2"><Thermometer className="h-4 w-4" /> Темп.</TabsTrigger>
            <TabsTrigger value="capacity" className="gap-2"><Database className="h-4 w-4" /> Ємність</TabsTrigger>
          </TabsList>

          <TabsContent value="voltages" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за напругою (комірка)</CardTitle>
                <CardDescription>Пороги спрацювання для окремих комірок (mV)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>COVP (Over Voltage)</Label>
                  <Input defaultValue="4250" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>COVP Release</Label>
                  <Input defaultValue="4150" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>CUVP (Under Voltage)</Label>
                  <Input defaultValue="2700" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>CUVP Release</Label>
                  <Input defaultValue="3000" className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист пакета</CardTitle>
                <CardDescription>Загальні пороги для всього акумулятора (10mV)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>POVP (Pack Over Voltage)</Label>
                  <Input defaultValue="5880" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>PUVP (Pack Under Voltage)</Label>
                  <Input defaultValue="4200" className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currents" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Захист за струмом</CardTitle>
                <CardDescription>Максимально допустимі значення (10mA)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>OC (Charging Overcurrent)</Label>
                  <Input defaultValue="5000" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>OD (Discharging Overcurrent)</Label>
                  <Input defaultValue="10000" className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temps" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Температурні пороги</CardTitle>
                <CardDescription>Значення в Кельвінах (0.1K)</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CHGOT (Charge Over Temp)</Label>
                  <Input defaultValue="3231" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>DSGOT (Discharge Over Temp)</Label>
                  <Input defaultValue="3381" className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4">
            <Card className="glass-card border-none">
              <CardHeader>
                <CardTitle className="text-lg">Параметри ємності</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Design Capacity (10mAh)</Label>
                  <Input defaultValue="10000" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Cycle Capacity (10mAh)</Label>
                  <Input defaultValue="10000" className="bg-secondary/30" />
                </div>
                <div className="space-y-2">
                  <Label>Number of Cells</Label>
                  <Input defaultValue="14" className="bg-secondary/30" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center">
             <Button variant="outline" className="text-muted-foreground border-accent/10 hover:bg-accent/5">
                <Shield className="mr-2 h-4 w-4" />
                Увійти в Factory Mode (0x00: 0x5678)
             </Button>
        </div>
      </div>
    </main>
  );
}