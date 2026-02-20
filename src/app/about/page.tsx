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
  Globe,
  Info,
  Github,
  Menu,
  LayoutProject,
  CheckCircle2,
  CreditCard,
  ExternalLink
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

        {/* МОБІЛЬНА ІНСТРУКЦІЯ: ДЕ КНОПКА GITHUB */}
        <section className="p-8 bg-purple-500/10 rounded-2xl border border-purple-500/20 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Github className="h-32 w-32" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <Github className="h-8 w-8 text-purple-500" />
               <h3 className="text-2xl font-bold">Де кнопка GitHub на телефоні?</h3>
            </div>
            <p className="text-muted-foreground">
              Ви зараз у вікні <b>Preview</b> (перегляду). Щоб відправити код на свій GitHub з телефону, вам потрібно знайти меню самого редактора Firebase Studio.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 relative z-10">
            <div className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-lg shadow-purple-500/20">1</div>
              <div>
                <p className="font-bold text-lg">Поверніться в чат/редактор</p>
                <p className="text-sm text-muted-foreground">Там, де ви пишете мені повідомлення. Це основне вікно Studio.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-lg shadow-purple-500/20">2</div>
              <div>
                <p className="font-bold text-lg">Натисніть на іконку Меню</p>
                <p className="text-sm text-muted-foreground">У самому верху зліва натисніть на три лінії <Menu className="inline h-4 w-4 mx-1" /> або іконку проекту <LayoutProject className="inline h-4 w-4 mx-1" />.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-lg shadow-purple-500/20">3</div>
              <div>
                <p className="font-bold text-lg">Шукайте "Connect to GitHub"</p>
                <p className="text-sm text-muted-foreground">Там буде кнопка з іконкою котика або напис <b>"GitHub"</b>. Натисніть її та виберіть свій порожній репозиторій. Всі 50+ файлів завантажаться автоматично за 5 секунд!</p>
              </div>
            </div>
          </div>

          <div className="bg-background/80 p-4 rounded-xl border border-purple-500/30 flex items-start gap-3">
            <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed italic">
              Після цього ваша збірка у Firebase Console (яка раніше видавала помилку) автоматично почне працювати, і ви отримаєте вічне посилання!
            </p>
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
