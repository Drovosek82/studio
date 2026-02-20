"use client";

import { useState } from "react";
import { Bluetooth, Search, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function BluetoothConnector() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestBluetooth = async () => {
    setIsScanning(true);
    setError(null);
    try {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth не підтримується цим браузером. Використовуйте Chrome, Edge або Opera.");
      }
      
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'JBD' }, { namePrefix: 'xiaoxiang' }],
        optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb']
      });

      console.log('Connected to', device.name);
      // Logic for connection and data parsing would go here
    } catch (err: any) {
      setError(err.message || "Помилка підключення до Bluetooth");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className="glass-card border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Bluetooth className="h-5 w-5 text-accent" />
          <CardTitle>Пряме Bluetooth підключення</CardTitle>
        </div>
        <CardDescription>
          Підключіться до JBD BMS безпосередньо з браузера через BLE
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-accent/20 rounded-xl bg-accent/5">
          <Bluetooth className={`h-16 w-16 text-accent mb-4 ${isScanning ? 'animate-pulse' : ''}`} />
          <p className="text-center text-sm text-muted-foreground mb-6 max-w-xs">
            Переконайтеся, що BMS увімкнений і Bluetooth активний на вашому пристрої
          </p>
          <Button 
            size="lg" 
            onClick={requestBluetooth}
            disabled={isScanning}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isScanning ? (
              <>Пошук BMS...</>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Шукати пристрої
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-accent" />
            Як це працює?
          </h4>
          <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
            <li>Працює в Chrome, Edge та Opera (версії з Web Bluetooth)</li>
            <li>Не потребує додаткового обладнання (тільки ваш ПК/Телефон)</li>
            <li>Стабільна дальність зв'язку до 5-10 метрів</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}