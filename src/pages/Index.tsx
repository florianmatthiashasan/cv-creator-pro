import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CVData, CVTemplate, emptyCVData } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Coffee, Sparkles } from 'lucide-react';
import StepIndicator from '@/components/cv/StepIndicator';
import PersonalInfoForm from '@/components/cv/PersonalInfoForm';
import ExperienceForm from '@/components/cv/ExperienceForm';
import EducationForm from '@/components/cv/EducationForm';
import SkillsForm from '@/components/cv/SkillsForm';
import LanguagesForm from '@/components/cv/LanguagesForm';
import CVPreview from '@/components/cv/CVPreview';
import CVPreviewCanvas from '@/components/cv/CVPreviewCanvas';

const TOTAL_STEPS = 6;
const stepTitles = ['Persönliche Daten', 'Berufserfahrung', 'Bildung', 'Kenntnisse & Skills', 'Sprachen', 'Vorschau & Download'];
const stepDescriptions = [
  'Erzähl uns etwas über dich',
  'Deine bisherigen Stationen',
  'Dein akademischer Werdegang',
  'Was kannst du besonders gut?',
  'Welche Sprachen sprichst du?',
  'Wähle dein Template und lade deinen CV herunter',
];
const highlights = [
  {
    kicker: '01',
    title: 'Live Preview',
    description: 'Jede Eingabe landet ohne Umweg im Layout. Kein Springen, kein separates Vorschau-Denken.',
  },
  {
    kicker: '02',
    title: 'Editorial UI',
    description: 'Serif Headlines, Mono-Metadaten und helle Glass-Flächen geben der App mehr Charakter.',
  },
  {
    kicker: '03',
    title: '6 CV Layouts',
    description: 'Mehr Auswahl für unterschiedliche Stile, ohne dass der Editor unruhig oder beliebig wirkt.',
  },
];
const topNavItems = ['Editor', 'Templates', 'Free Forever'];

const Index = () => {
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');

  const lastStep = TOTAL_STEPS - 1;
  const next = () => setStep((s) => Math.min(s + 1, lastStep));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="relative min-h-screen bg-background font-body">
      <div className="pointer-events-none absolute inset-0 noise-texture opacity-60" />

      <header className="fixed inset-x-0 top-4 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel flex items-center justify-between px-4 py-3 md:px-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary shadow-[0_16px_34px_-26px_rgba(222,111,32,0.65)]">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="section-kicker">Resume Studio</p>
                <p className="font-display text-lg text-foreground">CV Generator</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 md:flex">
              {topNavItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/70 bg-white/70 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>

            <Button asChild variant="outline" className="font-body">
              <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer">
                <Coffee size={16} className="mr-2" />
                Support
              </a>
            </Button>
          </motion.div>
        </div>
      </header>

      <main className="relative pt-28">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(248,153,60,0.15),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(80,180,158,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0))]" />
          <div className="mx-auto max-w-7xl px-6 pb-10 pt-6">
            <div className="glass-panel relative overflow-hidden px-6 py-8 md:px-8 lg:px-10">
              <div className="absolute right-[-90px] top-[-90px] h-60 w-60 rounded-full bg-orange-200/35 blur-3xl" />
              <div className="absolute bottom-[-70px] right-[16%] h-52 w-52 rounded-full bg-emerald-100/55 blur-3xl" />

              <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_390px] xl:grid-cols-[minmax(0,1.2fr)_430px]">
                <motion.div
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="animate-fade-right"
                >
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    <Sparkles size={14} className="text-primary" />
                    Crafted for sharp CVs
                  </div>

                  <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground sm:text-6xl xl:text-7xl">
                    Editorial polish for a free CV builder that feels premium.
                  </h1>

                  <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                    Playful details, precise form rhythm and a sticky live canvas turn the editor into something calmer, sharper and far less generic than a standard dashboard.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {['A4-ready export', 'Real-time preview', 'Precision form flow'].map((item) => (
                      <span key={item} className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-foreground/80 shadow-[0_10px_26px_-24px_rgba(84,56,24,0.28)]">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 soft-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="section-kicker">Support The Project</p>
                      <p className="mt-2 font-display text-2xl text-foreground">This is completely free.</p>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                        If you want to support me, you can buy me a coffee at buymeacoffee.com/yourdeveloperhsn.
                      </p>
                    </div>
                    <Button asChild className="font-body">
                      <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer">
                        <Coffee size={16} className="mr-2" />
                        Buy Me a Coffee
                      </a>
                    </Button>
                  </div>
                </motion.div>

                <div className="space-y-4 lg:pt-14">
                  {highlights.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 18, x: 10 }}
                      animate={{ opacity: 1, y: 0, x: 0 }}
                      transition={{ duration: 0.55, delay: 0.12 * index, ease: [0.22, 1, 0.36, 1] }}
                      className="group hero-feature animate-fade-up"
                    >
                      <div className="hero-feature-line group-hover:h-20 group-hover:bg-primary" />
                      <div className="pl-4">
                        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{item.kicker}</p>
                        <h2 className="mt-2 font-display text-2xl text-foreground">{item.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
          <div className="min-w-0">
            <div className="editor-card px-5 py-5 md:px-7 md:py-7">
              <div className="mb-6 flex flex-col gap-5 border-b border-border/70 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="section-kicker">Guided Editing Flow</p>
                    <h2 className="mt-2 text-[2rem] font-display font-semibold tracking-[-0.03em] text-foreground">{stepTitles[step]}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{stepDescriptions[step]}</p>
                  </div>
                  <div className="soft-panel px-4 py-3">
                    <p className="section-kicker">Aktueller Schritt</p>
                    <p className="mt-1 font-display text-lg text-foreground">{String(step + 1).padStart(2, '0')} / {TOTAL_STEPS}</p>
                  </div>
                </div>
                <StepIndicator currentStep={step} onStepClick={setStep} />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {step === 0 && <PersonalInfoForm data={cvData.personalInfo} onChange={(d) => setCvData({ ...cvData, personalInfo: d })} />}
                  {step === 1 && <ExperienceForm data={cvData.experiences} onChange={(d) => setCvData({ ...cvData, experiences: d })} />}
                  {step === 2 && <EducationForm data={cvData.education} onChange={(d) => setCvData({ ...cvData, education: d })} />}
                  {step === 3 && <SkillsForm data={cvData.skills} onChange={(d) => setCvData({ ...cvData, skills: d })} />}
                  {step === 4 && <LanguagesForm data={cvData.languages} onChange={(d) => setCvData({ ...cvData, languages: d })} />}
                  {step === 5 && <CVPreview data={cvData} template={template} onTemplateChange={setTemplate} />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex justify-between border-t border-border/70 pt-6">
                <Button onClick={prev} disabled={step === 0} variant="outline" className="font-display">
                  <ArrowLeft size={16} className="mr-2" /> Zurück
                </Button>
                {step < lastStep && (
                  <Button onClick={next} className="font-display">
                    Weiter <ArrowRight size={16} className="ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-28 space-y-4">
              <div className="soft-panel p-5">
                <p className="section-kicker">Live Canvas</p>
                <p className="mt-2 font-display text-xl font-semibold tracking-[-0.03em] text-foreground">Editor links, Ausgabe rechts.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Farben, Abstand und Typografie der App sind jetzt auf eine helle, moderne Studio-Oberfläche abgestimmt.
                </p>
              </div>
              <CVPreviewCanvas
                data={cvData}
                template={template}
                maxHeightClassName="max-h-[calc(100vh-12rem)]"
                scaleClassName="scale-[0.31] lg:scale-[0.36] xl:scale-[0.44] 2xl:scale-[0.58]"
              />
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <div className="soft-panel flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="section-kicker">Free To Use</p>
              <p className="mt-2 font-display text-xl text-foreground">This CV builder is completely free.</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                If you want to support my work, you can buy me a coffee at buymeacoffee.com/yourdeveloperhsn.
              </p>
            </div>
            <Button asChild variant="outline" className="font-display">
              <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer">
                <Coffee size={16} className="mr-2" />
                Support The Project
              </a>
            </Button>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
