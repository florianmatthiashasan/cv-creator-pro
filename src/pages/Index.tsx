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
import CVPreview from '@/components/cv/CVPreview';

const stepTitles = ['Persönliche Daten', 'Berufserfahrung', 'Bildung', 'Kenntnisse & Skills', 'Vorschau & Download'];
const stepDescriptions = [
  'Erzähl uns etwas über dich',
  'Deine bisherigen Stationen',
  'Dein akademischer Werdegang',
  'Was kannst du besonders gut?',
  'Wähle dein Template und lade deinen CV herunter',
];

const Index = () => {
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Hero Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles size={20} className="text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">CV Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm font-body">Erstelle deinen professionellen Lebenslauf in wenigen Minuten.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <StepIndicator currentStep={step} onStepClick={setStep} />

        {/* Step Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-display font-semibold text-foreground">{stepTitles[step]}</h2>
          <p className="text-sm text-muted-foreground mt-1">{stepDescriptions[step]}</p>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <PersonalInfoForm data={cvData.personalInfo} onChange={(d) => setCvData({ ...cvData, personalInfo: d })} />
            )}
            {step === 1 && (
              <ExperienceForm data={cvData.experiences} onChange={(d) => setCvData({ ...cvData, experiences: d })} />
            )}
            {step === 2 && (
              <EducationForm data={cvData.education} onChange={(d) => setCvData({ ...cvData, education: d })} />
            )}
            {step === 3 && (
              <SkillsForm data={cvData.skills} onChange={(d) => setCvData({ ...cvData, skills: d })} />
            )}
            {step === 4 && (
              <CVPreview data={cvData} template={template} onTemplateChange={setTemplate} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <Button onClick={prev} disabled={step === 0} variant="outline" className="font-display border-border">
            <ArrowLeft size={16} className="mr-2" /> Zurück
          </Button>
          {step < 4 && (
            <Button onClick={next} className="bg-primary text-primary-foreground font-display hover:bg-primary/90">
              Weiter <ArrowRight size={16} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
