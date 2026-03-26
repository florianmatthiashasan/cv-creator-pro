import { useMemo, useState } from 'react';
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
import { useSeo } from '@/hooks/use-seo';

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
    title: 'Free resume builder',
    description: 'Create a professional resume or CV online without signup, watermarks, or hidden costs.',
  },
  {
    icon: LayoutTemplate,
    title: 'CV templates with live preview',
    description: 'Choose from six layouts and see every change instantly in the preview before exporting your resume.',
  },
  {
    icon: Palette,
    title: 'Customize fonts and colors',
    description: 'Adjust headings, body text, accent colors, and font pairings so your CV fits your industry and personality.',
  },
  {
    icon: FileDown,
    title: 'PDF export for applications',
    description: 'Download your resume as an A4-optimized PDF and use it right away for job applications, LinkedIn, or portfolios.',
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

const Index = () => {
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');

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
            <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
              <a href="#features" className="transition-colors hover:text-foreground">Features</a>
              <a href="#editor" className="transition-colors hover:text-foreground">Editor</a>
              <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            </nav>
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
                  Free resume builder
                </p>

                <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.8rem,6vw,5rem)] italic leading-[1.05] tracking-[-0.02em] text-foreground">
                  Build your resume online, customize it live, and download it as a PDF.
                </h1>

                <p className="mt-6 max-w-lg text-[15px] leading-7 text-muted-foreground">
                  Folio CV is a free CV and resume builder with live preview, six templates, design customization, and fast PDF export for applications.
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
                  {['Resume & CV builder', 'Live preview', 'A4 PDF export', 'No signup required'].map((item) => (
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
                    title: 'Live preview',
                    desc: 'Every input updates your resume instantly. No reloads, no guesswork.',
                  },
                  {
                    num: '02',
                    title: 'Free and accountless',
                    desc: 'Start immediately, try templates, and download your CV as a PDF without creating an account.',
                  },
                  {
                    num: '03',
                    title: 'Design customization',
                    desc: 'Adjust colors, fonts, and layouts for modern, classic, or creative applications.',
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
                      <h3 className="mt-1.5 text-base font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-border bg-white/70">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
            <div className="max-w-3xl">
              <p className="section-kicker">Why Folio CV</p>
              <h2 className="mt-3 font-display text-4xl italic text-foreground">
                Everything you need to create a professional resume in one place.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                Folio CV helps you create a polished resume online. The app combines resume templates,
                live preview, design customization, and PDF export in one clear workflow.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {marketingFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="hero-feature">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-white">
                        <Icon size={18} />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </article>
                );
              })}
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
                        <p className="section-kicker">Step {step + 1} of {TOTAL_STEPS}</p>
                        <h2 className="mt-2 font-display text-3xl italic text-foreground">{stepTitles[step]}</h2>
                        <p className="mt-1.5 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
                      </div>
                      <div className="rounded-lg bg-foreground px-3 py-2 text-right">
                        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/50">Step</p>
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

        <section className="border-t border-border border-b bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="section-kicker">How it works</p>
                <h2 className="mt-3 font-display text-4xl italic text-foreground">
                  Create a professional resume in just a few steps.
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  If you want to build a strong resume online, you should be able to control content, layout, and PDF export in one place.
                  That is exactly what Folio CV is built for.
                </p>
              </div>

              <div className="space-y-4">
                {howItWorks.map((item, index) => (
                  <article key={item} className="soft-panel p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-white">
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

        <section id="faq" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
            <div className="max-w-3xl">
              <p className="section-kicker">FAQ</p>
              <h2 className="mt-3 font-display text-4xl italic text-foreground">
                Frequently asked questions about the resume and CV builder.
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
