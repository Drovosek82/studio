
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bluetooth as BluetoothIcon, Search, Cpu, Globe, Plus, ShieldAlert, BrainCircuit, Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBmsStore } from "@/lib/bms-store";
import { toast } from "@/hooks/use-toast";
import { identifyBmsModel } from "@/ai/flows/identify-bms-model";
import { useUser, useFirestore, setDocumentNonBlocking } from "@/firebase";
import { doc, getDoc, increment } from "firebase/firestore";

export function BluetoothConnector() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { addDirectBluetoothDevice, isDemoMode, addNetworkDevice, t } = useBmsStore();
  const [isScanning, setIsScanning] = useState(false);
  const [espName, setEspName] = useState("");
  const [error, setError] = useState<{title: string, message: string, isSecurity: boolean} | null>(null);

  const handleIdentifyAndConnect = async (deviceName: string) => {
    if (!user || !db) return null;

    try {
      const identification = await identifyBmsModel({ deviceName });
      const insightId = identification.modelName.replace(/\s+/g, '_').toLowerCase();
      const insightRef = doc(db, 'modelInsights', insightId);
      
      const docSnap = await getDoc(insightRef);
      const insightData = {
        id: insightId,
        modelName: identification.modelName,
        manufacturer: identification.manufacturer,
        protocol: identification.protocol,
        capabilities: identification.capabilities,
        technicalNotes: identification.technicalNotes,
        supportedTelemetry: identification.supportedTelemetry,
        supportedEepromParams: identification.supportedEepromParams,
        detectedCount: increment(1),
        lastSeen: new Date().toISOString()
      };

      setDocumentNonBlocking(insightRef, insightData, { merge: true });

      toast({
        title: `${t('aiModelIdentified')}: ${identification.modelName}`,
        description: identification.protocol,
      });

      return identification;
    } catch (e) {
      console.warn("AI Identification failed", e);
      return null;
    }
  };

  const handleDirectBluetooth = async () => {
    setIsScanning(true);
    setError(null);
    try {
      let identification = null;
      let name = "Real BMS";

      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 800));
        name = "JBD-BMS-Demo-X";
        identification = await handleIdentifyAndConnect(name);
      } else {
        if (typeof window !== 'undefined' && !navigator.bluetooth) {
          throw new Error(t('toastScanError') + ": Browser not supported.");
        }
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
        });
        name = device.name || "Bluetooth BMS";
        identification = await handleIdentifyAndConnect(name);
      }

      // Додаємо пристрій з даними від ШІ
      const id = addDirectBluetoothDevice(name);
      router.push(`/battery/${id}`);

    } catch (err: any) {
      const isSecurity = err.name === 'SecurityError' || err.message.includes('Permissions-Policy');
      setError({ 
        title: isSecurity ? "Access Denied" : "Error", 
        message: err.message, 
        isSecurity 
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddEsp = () => {
    if (!espName) return;
    addNetworkDevice(espName);
    setEspName("");
  };

  return (
    <div className="space-y-8 py-4 max-w-4xl mx-auto">
      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription className="text-xs">
            {error.message}
            {error.isSecurity && (
              <Button variant="link" className="p-0 h-auto text-destructive underline block mt-2" onClick={() => window.open(window.location.href, '_blank')}>
                Open in new tab
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-card border-none hover:ring-1 hover:ring-blue-500/50 transition-all group">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <BluetoothIcon className="h-6 w-6" />
            </div>
            <CardTitle>{t('bleDirectAccess')}</CardTitle>
            <CardDescription>{t('bleAiLearn')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/20 rounded-lg p-3 text-[10px] space-y-1 opacity-70">
              <p className="flex items-center gap-1"><BrainCircuit className="h-3 w-3" /> {t('bleAutoDetect')}</p>
              <p className="flex items-center gap-1"><Database className="h-3 w-3" /> {t('bleFillKnowledge')}</p>
            </div>
            <Button 
              size="lg" 
              onClick={handleDirectBluetooth}
              disabled={isScanning}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isScanning ? <Search className="h-4 w-4 mr-2 animate-spin" /> : <BluetoothIcon className="h-4 w-4 mr-2" />}
              {isDemoMode ? "Simulate BLE" : t('scan')}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass-card border-none hover:ring-1 hover:ring-accent/50 transition-all group">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-2">
              <Globe className="h-6 w-6" />
            </div>
            <CardTitle>{t('wifiHub')}</CardTitle>
            <CardDescription>{t('wifiHubDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary/20 rounded-lg p-3 text-[10px] space-y-1 opacity-70">
              <p>• {t('wifiAggregation')}</p>
              <p>• {t('wifiRemoteAccess')}</p>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Name..." 
                value={espName} 
                onChange={(e) => setEspName(e.target.value)}
                className="bg-secondary/30 border-none h-10 text-sm"
              />
              <Button onClick={handleAddEsp} className="bg-accent text-accent-foreground">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
