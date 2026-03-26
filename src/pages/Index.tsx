import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CVData, CVTemplate, emptyCVData } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Coffee, ArrowUpRight } from 'lucide-react';
import StepIndicator from '@/components/cv/StepIndicator';
import PersonalInfoForm from '@/components/cv/PersonalInfoForm';
import ExperienceForm from '@/components/cv/ExperienceForm';
import EducationForm from '@/components/cv/EducationForm';
import SkillsForm from '@/components/cv/SkillsForm';
import LanguagesForm from '@/components/cv/LanguagesForm';
import CVPreview from '@/components/cv/CVPreview';
import CVPreviewCanvas from '@/components/cv/CVPreviewCanvas';

const TOTAL_STEPS = 6;
const stepTitles = ['Persönliche Daten', 'Berufserfahrung', 'Bildung', 'Kenntnisse & Skills', 'Sprachen', 'Design, Vorschau & Download'];
const stepDescriptions = [
  'Erzähl uns etwas über dich',
  'Deine bisherigen Stationen',
  'Dein akademischer Werdegang',
  'Was kannst du besonders gut?',
  'Welche Sprachen sprichst du?',
  'Passe Schrift und Farben an, wähle dein Template und lade deinen CV herunter',
];

const Index = () => {
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');

  const lastStep = TOTAL_STEPS - 1;
  const next = () => setStep((s) => Math.min(s + 1, lastStep));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="relative min-h-screen font-body">
      {/* ─── Top Navigation ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/folio-cv-logo.png"
              alt="Folio CV"
              className="h-8 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-foreground px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] text-white sm:inline-flex">
              free forever
            </span>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer">
                <Coffee size={15} className="mr-1.5" />
                Support
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* ─── Hero ─── */}
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
            <div className="grid gap-16 lg:grid-cols-[1fr_380px] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  Open-source CV builder
                </p>

                <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.8rem,6vw,5rem)] italic leading-[1.05] tracking-[-0.02em] text-foreground">
                  Build a CV that feels like you designed it.
                </h1>

                <p className="mt-6 max-w-lg text-[15px] leading-7 text-muted-foreground">
                  Real-time preview, precise form rhythm, and six distinct layouts — no signup, no watermark, completely free.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => {
                      document.getElementById('editor')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Start building
                    <ArrowUpRight size={16} className="ml-1.5" />
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer">
                      <Coffee size={16} className="mr-1.5" />
                      Buy me a coffee
                    </a>
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap gap-6 text-[13px] text-muted-foreground">
                  {['A4-ready export', 'Live preview', '6 templates', 'No account needed'].map((item) => (
                    <span key={item} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-foreground/30" />
                      {item}
                    </span>
                  ))}
                </div>
              </motion.div>

              <div className="space-y-3 lg:pt-8">
                {[
                  {
                    num: '01',
                    title: 'Live Preview',
                    desc: 'Jede Eingabe aktualisiert das Layout sofort. Kein Umweg, kein Raten.',
                  },
                  {
                    num: '02',
                    title: 'Editorial UI',
                    desc: 'Typografie und Flächen, die sich von generischen Dashboards abheben.',
                  },
                  {
                    num: '03',
                    title: '6 Layouts',
                    desc: 'Verschiedene Stile für verschiedene Branchen — alle druckfertig.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + 0.08 * index, ease: [0.16, 1, 0.3, 1] }}
                    className="hero-feature group"
                  >
                    <div className="hero-feature-line group-hover:h-14" />
                    <div className="pl-4">
                      <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground">{item.num}</p>
                      <h2 className="mt-1.5 text-base font-semibold text-foreground">{item.title}</h2>
                      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Editor ─── */}
        <section id="editor" className="scroll-mt-16">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
              <div className="min-w-0">
                <div className="editor-card px-5 py-5 md:px-7 md:py-7">
                  {/* Header */}
                  <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="section-kicker">Schritt {step + 1} von {TOTAL_STEPS}</p>
                        <h2 className="mt-2 font-display text-3xl italic text-foreground">{stepTitles[step]}</h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
                      </div>
                      <div className="rounded-lg bg-foreground px-3 py-2 text-right">
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">Schritt</p>
                        <p className="font-mono text-lg tabular-nums text-white">{String(step + 1).padStart(2, '0')}<span className="text-white/40">/{TOTAL_STEPS}</span></p>
                      </div>
                    </div>
                    <StepIndicator currentStep={step} onStepClick={setStep} />
                  </div>

                  {/* Form */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {step === 0 && <PersonalInfoForm data={cvData.personalInfo} onChange={(d) => setCvData({ ...cvData, personalInfo: d })} />}
                      {step === 1 && <ExperienceForm data={cvData.experiences} onChange={(d) => setCvData({ ...cvData, experiences: d })} />}
                      {step === 2 && <EducationForm data={cvData.education} onChange={(d) => setCvData({ ...cvData, education: d })} />}
                      {step === 3 && <SkillsForm data={cvData.skills} onChange={(d) => setCvData({ ...cvData, skills: d })} />}
                      {step === 4 && <LanguagesForm data={cvData.languages} onChange={(d) => setCvData({ ...cvData, languages: d })} />}
                  {step === 5 && (
                    <CVPreview
                      data={cvData}
                      template={template}
                      onTemplateChange={setTemplate}
                      onDesignChange={(design) => setCvData({ ...cvData, design })}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

                  {/* Navigation */}
                  <div className="mt-8 flex justify-between border-t border-border pt-5">
                    <Button onClick={prev} disabled={step === 0} variant="outline">
                      <ArrowLeft size={16} className="mr-1.5" /> Zurück
                    </Button>
                    {step < lastStep && (
                      <Button onClick={next}>
                        Weiter <ArrowRight size={16} className="ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Preview */}
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-3">
                  <CVPreviewCanvas
                    data={cvData}
                    template={template}
                    maxHeightClassName="max-h-[calc(100vh-8rem)]"
                    scaleClassName="scale-[0.31] lg:scale-[0.36] xl:scale-[0.44] 2xl:scale-[0.58]"
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ─── Footer CTA ─── */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Folio CV is free and open-source.</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  If you find it useful, consider supporting the project.
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer">
                  <Coffee size={15} className="mr-1.5" />
                  Buy me a coffee
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
