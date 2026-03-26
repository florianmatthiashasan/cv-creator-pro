import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CVData, CVTemplate, emptyCVData } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
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

const Index = () => {
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');

  const lastStep = TOTAL_STEPS - 1;
  const next = () => setStep((s) => Math.min(s + 1, lastStep));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background font-body">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">CV Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm font-body">Erstelle deinen professionellen Lebenslauf in wenigen Minuten.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
          <div className="min-w-0">
            <StepIndicator currentStep={step} onStepClick={setStep} />

            <div className="mb-8 text-center xl:text-left">
              <h2 className="text-xl font-display font-semibold text-foreground">{stepTitles[step]}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {step === 0 && <PersonalInfoForm data={cvData.personalInfo} onChange={(d) => setCvData({ ...cvData, personalInfo: d })} />}
                {step === 1 && <ExperienceForm data={cvData.experiences} onChange={(d) => setCvData({ ...cvData, experiences: d })} />}
                {step === 2 && <EducationForm data={cvData.education} onChange={(d) => setCvData({ ...cvData, education: d })} />}
                {step === 3 && <SkillsForm data={cvData.skills} onChange={(d) => setCvData({ ...cvData, skills: d })} />}
                {step === 4 && <LanguagesForm data={cvData.languages} onChange={(d) => setCvData({ ...cvData, languages: d })} />}
                {step === 5 && <CVPreview data={cvData} template={template} onTemplateChange={setTemplate} />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between">
              <Button onClick={prev} disabled={step === 0} variant="outline" className="font-display border-border">
                <ArrowLeft size={16} className="mr-2" /> Zurück
              </Button>
              {step < lastStep && (
                <Button onClick={next} className="bg-primary text-primary-foreground font-display hover:bg-primary/90">
                  Weiter <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
            </div>
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-8 space-y-4">
              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <p className="text-sm font-display text-foreground">Editor + Preview</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Links bearbeitest du deine Daten, rechts siehst du sofort das Ergebnis.
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
      </div>
    </div>
  );
};

export default Index;
