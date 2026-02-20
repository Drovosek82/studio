
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
  Globe,
  Database as DatabaseIcon,
  Users,
  Share2,
  ExternalLink,
  Menu,
  MousePointer2,
  CreditCard,
  CheckCircle2,
  Github,
  Info,
  LayoutProject
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

        {/* ДЕТАЛЬНА ІНСТРУКЦІЯ ДЛЯ ТЕЛЕФОНУ */}
        <section className="p-8 bg-purple-500/10 rounded-2xl border border-purple-500/20 space-y-6">
          <div className="flex items-center gap-3">
             <Github className="h-8 w-8 text-purple-500" />
             <h3 className="text-2xl font-bold">Де кнопка GitHub на телефоні?</h3>
          </div>
          
          <div className="space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground">Ви зараз дивитесь на **Preview** (попередній перегляд). Кнопка GitHub знаходиться в **Editor** (редакторі), де ми з вами спілкуємось.</p>
            
            <div className="bg-background/80 p-5 rounded-xl border border-purple-500/30 space-y-6">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">1</div>
                <div>
                  <p className="font-bold">Поверніться у вікно чату/редактора</p>
                  <p className="text-xs text-muted-foreground">Там, де ви пишете мені повідомлення.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">2</div>
                <div>
                  <p className="font-bold">Натисніть "Проект" або "Меню"</p>
                  <p className="text-xs text-muted-foreground">У самому верху сторінки зліва натисніть іконку <Menu className="inline h-3 w-3" /> або <LayoutProject className="inline h-3 w-3" />.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">3</div>
                <div>
                  <p className="font-bold">Шукайте котика (GitHub)</p>
                  <p className="text-xs text-muted-foreground">Там буде кнопка <b>"Connect to GitHub"</b> або значок кота. Натисніть її та виберіть свій порожній репозиторій.</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] text-muted-foreground italic bg-secondary/20 p-4 rounded-lg">
              <Info className="h-4 w-4 shrink-0 text-accent" />
              Коли ви це зробите, всі 50+ файлів проекту за 5 секунд з'являться на вашому GitHub. Після цього Firebase App Hosting автоматично запустить збірку і видасть вам вічне посилання!
            </div>
          </div>
        </section>

        <section className="p-8 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-amber-500" />
            {t('aboutPriceTitle')}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('aboutPriceDesc')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs">{t('aboutPriceLimit1')}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-xs">{t('aboutPriceLimit2')}</span>
            </div>
          </div>
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
