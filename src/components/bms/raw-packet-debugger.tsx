"use client";

import { useState } from "react";
import { Terminal, Send, Loader2, Binary, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseBmsProtocol, ParseBmsProtocolOutput } from "@/ai/flows/parse-bms-protocol";
import { toast } from "@/hooks/use-toast";

export function RawPacketDebugger() {
  const [hex, setHex] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ParseBmsProtocolOutput | null>(null);

  const handleParse = async () => {
    if (!hex) return;
    setIsParsing(true);
    try {
      const output = await parseBmsProtocol({ hexString: hex });
      setResult(output);
      toast({
        title: "Пакет розпізнано",
        description: `Команда: ${output.detectedCommand}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Помилка розпізнавання",
        description: "ШІ не зміг обробити цей пакет.",
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Card className="glass-card border-none mt-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">AI Packet Interpreter</CardTitle>
        </div>
        <CardDescription>Вставте Hex-відповідь від BMS для аналізу структури протоколу</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Напр. DD 03 00 1B 0E..." 
            value={hex} 
            onChange={(e) => setHex(e.target.value)}
            className="bg-secondary/30 border-none font-code text-xs"
          />
          <Button 
            onClick={handleParse} 
            disabled={isParsing || !hex}
            className="bg-accent text-accent-foreground"
          >
            {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {result && (
          <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.isValid ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {result.detectedCommand}
                </span>
              </div>
              <Binary className="h-4 w-4 opacity-20" />
            </div>

            <p className="text-sm italic text-muted-foreground">
              {result.interpretation}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {Object.entries(result.parsedData).map(([key, val]) => (
                <div key={key} className="flex justify-between text-[10px] border-b border-border/30 pb-1">
                  <span className="text-muted-foreground uppercase">{key}:</span>
                  <span className="text-accent font-code font-bold">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
