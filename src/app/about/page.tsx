"use client";

import Link from "next/link";
import { useBmsStore } from "@/lib/bms-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Activity, 
  Bluetooth as BluetoothIcon, 
  BrainCircuit, 
  Layers, 
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Users,
  Share2
} from "lucide-react";

export default function AboutPage() {
  const { t } = useBmsStore();

  const features = [
    {
      icon: <BluetoothIcon className="h-8 w-8 text-blue-500" />,
      title: t('aboutFeature1Title'),
      desc: t('aboutFeature1Desc'),
    },
    {
      icon: <Globe className="h-8 w-8 text-accent" />,
      title: t('aboutFeature2Title'),
      desc: t('aboutFeature2Desc'),
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
      title: t('aboutFeature3Title'),
      desc: t('aboutFeature3Desc'),
    },
    {
      icon: <Layers className="h-8 w-8 text-orange-500" />,
      title: t('aboutFeature4Title'),
      desc: t('aboutFeature4Desc'),
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pb-12">
      <header className="border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-bold tracking-tight">{t('aboutTitle')}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-12 space-y-12">
        <section className="text-center space-y-4">
          <div className="inline-flex p-4 bg-accent/10 rounded-full text-accent mb-4">
            <Activity className="h-12 w-12" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-accent to-blue-500">
            BMS Central
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('aboutDesc')}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="glass-card border-none hover:ring-1 hover:ring-accent/30 transition-all p-2">
              <CardHeader>
                <div className="p-3 bg-secondary/30 rounded-xl w-fit mb-2">
                  {f.icon}
                </div>
                <CardTitle className="text-xl">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="p-8 bg-secondary/20 rounded-2xl border border-border/50 space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            {t('intelligence')} & Community
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Важливо розуміти, як працює спільний доступ: ваші дані про батареї є <b>абсолютно приватними</b>. Але технічні знання, які ШІ здобуває під час ваших підключень, стають частиною <b>глобальної бази знань</b>. Це дозволяє спільноті швидше адаптувати нові моделі BMS.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full border border-border text-xs">
              <ShieldCheck className="h-3 w-3 text-green-500" /> Private Telemetry
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full border border-border text-xs">
              <Database className="h-3 w-3 text-blue-500" /> Shared Insights
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background/50 rounded-full border border-border text-xs">
              <BrainCircuit className="h-3 w-3 text-purple-500" /> Collaborative AI
            </div>
          </div>
        </section>

        <section className="p-8 bg-accent/5 rounded-2xl border border-accent/20 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5 text-accent" />
            Як поділитися з друзями?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Після того, як ви розгорнете проект через <b>Firebase App Hosting</b>, ви отримаєте постійне посилання. Ви можете надіслати його будь-якому тестувальнику. Кожен, хто зайде за посиланням, зможе підключити свою BMS, а ви побачите нові моделі в загальній базі знань.
          </p>
        </section>

        <div className="flex justify-center">
          <Link href="/">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t('backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
