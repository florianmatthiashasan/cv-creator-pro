import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CVData, CVTemplate, emptyCVData } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Coffee, ArrowUpRight, CheckCircle2, FileDown, LayoutTemplate, Palette, Sparkles } from 'lucide-react';
import StepIndicator from '@/components/cv/StepIndicator';
import PersonalInfoForm from '@/components/cv/PersonalInfoForm';
import ExperienceForm from '@/components/cv/ExperienceForm';
import EducationForm from '@/components/cv/EducationForm';
import SkillsForm from '@/components/cv/SkillsForm';
import LanguagesForm from '@/components/cv/LanguagesForm';
import CVPreview from '@/components/cv/CVPreview';
import CVPreviewCanvas from '@/components/cv/CVPreviewCanvas';
import { templateOptions } from '@/components/cv/templates/registry';
import { useSeo } from '@/hooks/use-seo';
import { trackEvent } from '@/lib/analytics';

const TOTAL_STEPS = 6;
const stepTitles = ['Personal details', 'Work experience', 'Education', 'Skills & strengths', 'Languages', 'Design, preview & download'];
const stepDescriptions = [
  'Tell us a bit about yourself',
  'Add the roles that shaped your career',
  'Outline your academic background',
  'Show what you do best',
  'List the languages you speak',
  'Adjust fonts and colors, choose a template, and download your CV',
];
const marketingFeatures = [
  {
    icon: Sparkles,
    title: 'Focused writing flow',
    description: 'Six guided steps keep content, hierarchy, and export decisions organized.',
  },
  {
    icon: LayoutTemplate,
    title: '10 CV layouts',
    description: 'Switch between classic, editorial, sidebar, compact, grid, and technical resume structures.',
  },
  {
    icon: Palette,
    title: 'Design controls',
    description: 'Tune fonts, accents, sidebar colors, dividers, and page colors with live feedback.',
  },
  {
    icon: FileDown,
    title: 'A4 PDF export',
    description: 'Export the finished document for applications, portfolios, and LinkedIn workflows.',
  },
];
const howItWorks = [
  'Fill in personal details, work experience, education, skills, and languages in just a few guided steps.',
  'Compare templates, colors, and fonts live until your resume feels polished and professional.',
  'Export the final CV as a PDF and use it directly for applications.',
];
const faqs = [
  {
    question: 'Is Folio CV completely free?',
    answer: 'Yes. Folio CV is free to use. You can create your resume, switch templates, customize colors, and export the final CV as a PDF.',
  },
  {
    question: 'Can I customize my resume design?',
    answer: 'Yes. You can adjust templates, fonts, and colors for headings, body text, accent areas, sidebars, and backgrounds directly in the live preview.',
  },
  {
    question: 'Is the CV suitable for job applications and ATS systems?',
    answer: 'The templates are clearly structured, optimized for A4 export, and built with a readable information hierarchy. That helps both recruiters and many ATS systems.',
  },
  {
    question: 'Do I need an account to create a CV?',
    answer: 'No. You can start immediately, build your resume online, and download it as a PDF without creating an account.',
  },
  {
    question: 'Who is Folio CV for?',
    answer: 'Folio CV works well for students, early-career professionals, freelancers, creatives, and experienced candidates who want a modern resume or CV.',
  },
];

const hasMeaningfulCvContent = (data: CVData) => {
  const hasPersonalInfo = Object.values(data.personalInfo).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return (
    hasPersonalInfo ||
    data.experiences.length > 0 ||
    data.education.length > 0 ||
    data.skills.length > 0 ||
    data.languages.length > 0
  );
};

const Index = () => {
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');
  const hasTrackedCvStart = useRef(false);
  const hasTrackedDownloadStep = useRef(false);

  const lastStep = TOTAL_STEPS - 1;
  const next = () => setStep((s) => Math.min(s + 1, lastStep));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const seoSchema = useMemo(
    () => [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Folio CV',
        url: `${siteUrl}/`,
        inLanguage: 'en-US',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Folio CV',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
        },
        description:
          'Free resume builder with live preview, CV templates, design customization, and PDF export.',
        url: `${siteUrl}/`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'Create a resume online with Folio CV',
        description: 'How to create a professional resume as a PDF with Folio CV in just a few steps.',
        step: howItWorks.map((text, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: `Step ${index + 1}`,
          text,
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
    [siteUrl],
  );

  useSeo({
    title: 'Folio CV | Free Resume Builder with Live Preview and PDF Export',
    description:
      'Create a professional resume online with Folio CV for free. Use live preview, CV templates, design customization, and PDF export without signing up.',
    path: '/',
    jsonLd: seoSchema,
  });

  useEffect(() => {
    trackEvent('editor_step_viewed', {
      step_index: step + 1,
      step_name: stepTitles[step],
    });

    if (step === lastStep && !hasTrackedDownloadStep.current) {
      hasTrackedDownloadStep.current = true;
      trackEvent('reached_download_step', {
        template,
      });
    }
  }, [lastStep, step, template]);

  useEffect(() => {
    if (hasTrackedCvStart.current || !hasMeaningfulCvContent(cvData)) return;

    hasTrackedCvStart.current = true;
    trackEvent('cv_started', {
      entry_point: 'editor',
    });
  }, [cvData]);

  const handleTemplateChange = (nextTemplate: CVTemplate) => {
    if (nextTemplate === template) return;

    setTemplate(nextTemplate);
    trackEvent('template_selected', {
      template: nextTemplate,
      step_index: step + 1,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      <a href="#editor" className="skip-link">Skip to editor</a>
      <div className="app-noise" aria-hidden="true" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/folio-cv-logo.svg"
              alt="Folio CV"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
              <a href="#features" className="transition-colors hover:text-foreground">Features</a>
              <a href="#editor" className="transition-colors hover:text-foreground">Editor</a>
              <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            </nav>
            <span className="hidden rounded-md border border-accent/20 bg-accent/10 px-3 py-1.5 font-mono text-[11px] tracking-[0.08em] text-accent sm:inline-flex">
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

      <main className="relative z-10 pt-16">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_hsl(76_67%_66%/0.13)]" />
                  Free builder, 10 layouts, live A4 preview
                </div>

                <h1 className="max-w-3xl font-display text-[clamp(3.7rem,7vw,6.7rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-foreground">
                  Design a sharp CV without fighting the layout.
                </h1>

                <p className="mt-7 max-w-xl text-base leading-8 text-muted-foreground">
                  Folio CV is now a dark, modern resume studio: guided writing on one side, live template preview on the other, and enough layouts to match different roles.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => {
                      trackEvent('start_building_clicked', {
                        source: 'hero',
                      });
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

                <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3">
                  {[
                    ['10', 'layouts'],
                    ['A4', 'preview'],
                    ['0', 'signup'],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-mono text-2xl text-foreground">{value}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="glass-panel relative overflow-hidden p-3"
              >
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                <div className="relative rounded-lg border border-white/10 bg-black/25 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.07)]">
                  <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Live workspace</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">Template mixer</p>
                    </div>
                    <span className="rounded-md bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-accent-foreground">
                      10 styles
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[0.72fr_1.28fr]">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
                      {templateOptions.slice(0, 6).map((item, index) => (
                        <div key={item.id} className={`rounded-md border p-3 ${index === 0 ? 'border-accent/50 bg-accent/10' : 'border-white/10 bg-white/[0.035]'}`}>
                          <p className="font-mono text-[10px] tracking-[0.08em] text-accent">{String(index + 1).padStart(2, '0')}</p>
                          <p className="mt-1 truncate text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-white/10 bg-[#f5f1e7] p-4 text-[#11181b] shadow-[0_24px_60px_-42px_hsl(0_0%_0%/0.95)]">
                      <div className="mb-5 flex items-start justify-between">
                        <div>
                          <p className="font-display text-3xl font-semibold leading-none tracking-[-0.04em]">Mira Keller</p>
                          <p className="mt-1 text-xs text-[#5d6868]">Product designer</p>
                        </div>
                        <div className="h-12 w-12 rounded-md bg-[#11181b]" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1 h-2 w-20 rounded-full bg-[#9fcf62]" />
                          <div className="h-1.5 w-full rounded-full bg-[#11181b]/40" />
                          <div className="mt-1 h-1.5 w-4/5 rounded-full bg-[#11181b]/25" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="h-10 rounded bg-[#11181b]/10" />
                          <div className="h-10 rounded bg-[#11181b]/10" />
                          <div className="h-10 rounded bg-[#11181b]/10" />
                        </div>
                        <div className="h-24 rounded-md border border-[#11181b]/10 bg-[#11181b]/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="studio-band">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <p className="section-kicker">Template library</p>
                <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-5xl">
                  More layouts, different personalities.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:ml-auto lg:text-right">
                Pick a conservative CV, a compact one-page layout, a sidebar profile, an editorial timeline, or a modular portfolio-style grid. The same content can be tested across all formats.
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {templateOptions.map((item, index) => (
                <article key={item.id} className="hero-feature min-h-36 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{item.label}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
            <div className="grid gap-4 md:grid-cols-4">
              {marketingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="hero-feature">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.06] text-accent">
                      <Icon size={18} />
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="editor" className="scroll-mt-16">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6">
            <div className="mb-7 grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
              <div>
                <p className="section-kicker">Editor</p>
                <h2 className="mt-2 font-display text-4xl font-semibold leading-[0.95] tracking-[-0.045em] text-foreground md:text-5xl">
                  Build, compare, export.
              </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-muted-foreground md:ml-auto md:text-right">
                Work through the guided steps, then switch between 10 layouts in the design step without re-entering your content.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
              <div className="min-w-0">
                <div className="editor-card px-5 py-5 md:px-7 md:py-7">
                  {/* Header */}
                  <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="section-kicker">Step {step + 1} of {TOTAL_STEPS}</p>
                        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-foreground">{stepTitles[step]}</h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
                      </div>
                      <div className="rounded-md border border-accent/20 bg-accent/10 px-3 py-2 text-right">
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent/70">Step</p>
                        <p className="font-mono text-lg tabular-nums text-accent">{String(step + 1).padStart(2, '0')}<span className="text-accent/40">/{TOTAL_STEPS}</span></p>
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
                          onTemplateChange={handleTemplateChange}
                          onDesignChange={(design) => setCvData({ ...cvData, design })}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="mt-8 flex justify-between border-t border-white/10 pt-5">
                    <Button onClick={prev} disabled={step === 0} variant="outline">
                      <ArrowLeft size={16} className="mr-1.5" /> Back
                    </Button>
                    {step < lastStep && (
                      <Button onClick={next}>
                        Next <ArrowRight size={16} className="ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Preview */}
              <aside className="hidden lg:block">
                <div className="sticky top-20 space-y-3">
                  <div className="glass-panel flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">Live preview</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{template} template</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_5px_hsl(76_67%_66%/0.13)]" />
                  </div>
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

        <section className="studio-band">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="section-kicker">How it works</p>
                <h2 className="mt-3 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-5xl">
                  One workflow, many final directions.
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  Add the content once, then use templates and design controls to test how the same profile reads in different contexts.
                </p>
              </div>

              <div className="space-y-4">
                {howItWorks.map((item, index) => (
                  <article key={item} className="soft-panel p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">Step {index + 1}</h3>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-white/10">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:py-16">
            <div className="max-w-3xl">
              <p className="section-kicker">FAQ</p>
              <h2 className="mt-3 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground md:text-5xl">
                Questions before you export.
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                These answers help users understand exactly what Folio CV is for and how it fits into their application workflow.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.question} className="soft-panel group p-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                    <span className="text-base font-semibold text-foreground">{faq.question}</span>
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-foreground/40 transition-colors group-open:text-foreground" />
                  </summary>
                  <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Footer CTA ─── */}
        <section className="border-t border-white/10 bg-black/30 text-foreground">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Folio CV is free and open-source.</p>
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
