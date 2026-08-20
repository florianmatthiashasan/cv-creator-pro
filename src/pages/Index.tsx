import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Coffee,
  FileDown,
  LayoutTemplate,
  Palette,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CVPreview from '@/components/cv/CVPreview';
import CVPreviewCanvas from '@/components/cv/CVPreviewCanvas';
import EducationForm from '@/components/cv/EducationForm';
import ExperienceForm from '@/components/cv/ExperienceForm';
import LanguagesForm from '@/components/cv/LanguagesForm';
import PersonalInfoForm from '@/components/cv/PersonalInfoForm';
import SkillsForm from '@/components/cv/SkillsForm';
import StepIndicator from '@/components/cv/StepIndicator';
import { templateOptions } from '@/components/cv/templates/registry';
import { useSeo } from '@/hooks/use-seo';
import { trackCvStartedOncePerSession, trackEvent } from '@/lib/analytics';
import { CVData, CVTemplate, emptyCVData } from '@/types/cv';

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

type AppScreen = 'landing' | 'dashboard' | 'tracker' | 'editor' | 'matches';
type TrackerView = 'kanban' | 'table';
type ApplicationStage = 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Closed';

type Application = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  score: string;
  stage: ApplicationStage;
  when: string;
  reason?: string;
};

type IndexProps = {
  initialScreen?: AppScreen;
};

const screenPaths: Record<AppScreen, string> = {
  landing: '/',
  dashboard: '/dashboard',
  editor: '/dashboard/simulator',
  tracker: '/dashboard/tracker',
  matches: '/dashboard/matches',
};

const stages: ApplicationStage[] = ['Saved', 'Applied', 'Interview', 'Offer', 'Closed'];
const nextStageLabel: Record<ApplicationStage, string> = {
  Saved: 'Mark applied',
  Applied: 'Move to interview',
  Interview: 'Move to offer',
  Offer: 'Close out',
  Closed: 'Reopen',
};

const marketingFeatures = [
  {
    icon: Sparkles,
    title: 'Forms, not a blank page',
    description: 'Every section is a prompt: what you did, where, and how much of it. Fill in the structure, then polish the wording.',
    plan: 'Free',
  },
  {
    icon: LayoutTemplate,
    title: 'Formats in one click',
    description: 'Classic, compact, editorial, technical, grid, sidebar, and more layouts can use the same CV content.',
    plan: 'Free',
  },
  {
    icon: Palette,
    title: 'Design controls',
    description: 'Tune fonts, accents, sidebar colors, dividers, and page color while the live A4 preview stays visible.',
    plan: 'Free',
  },
  {
    icon: FileDown,
    title: 'PDF export',
    description: 'Export the finished document as a PDF from the simulator without creating an account.',
    plan: 'Free',
  },
  {
    icon: CheckCircle2,
    title: 'CV check',
    description: 'A local read-through names what a recruiter will notice first: evidence, length, weak verbs, and missing header details.',
    plan: 'Demo',
  },
  {
    icon: ArrowUpRight,
    title: 'Application tracker',
    description: 'The dashboard preview shows how saved roles, applications, interviews, offers, and closed jobs can be organized.',
    plan: 'Preview',
  },
];

const howItWorks = [
  'Fill in the forms, switch between formats, and see the page update as you type. The simulator stays free and works without an account.',
  'Use the dashboard view to keep several role-focused versions visible instead of forcing every application into one generic CV.',
  'Track applications in a board or table view so saved jobs, sent applications, interviews, offers, and closed roles do not blur together.',
];

const faqs = [
  {
    question: 'Is the CV simulator really free?',
    answer: 'Yes. The CV simulator can be used without an account for writing, template switching, design adjustments, live preview, and PDF export.',
  },
  {
    question: 'Do I need an account?',
    answer: 'No. You can start the CV in the browser immediately. The dashboard shown here is a product preview around the same workflow.',
  },
  {
    question: 'Is the export suitable for applications and ATS systems?',
    answer: 'The templates use readable section headings and exported PDF text. That helps recruiters and many applicant tracking systems read the document.',
  },
  {
    question: 'Can I customize the design?',
    answer: 'Yes. You can change templates, heading fonts, body fonts, accents, page color, sidebar color, and divider behavior in the design step.',
  },
  {
    question: 'What happens to my CV content?',
    answer: 'A CV contains personal information, so the simulator keeps the writing, preview, and export workflow in your browser-facing editing flow before you decide where to send the PDF.',
  },
];

const dashboardCvs = [
  { id: 1, name: 'Operations Lead — general', format: 'Classic', updated: '2 days ago', pages: '1 page', strength: '92%' },
  { id: 2, name: 'Supply Chain Manager', format: 'Two column', updated: '5 days ago', pages: '2 pages', strength: '78%' },
  { id: 3, name: 'Logistics referral', format: 'Compact', updated: '3 weeks ago', pages: '1 page', strength: '64%' },
  { id: 4, name: 'Consulting version', format: 'Serif', updated: 'last month', pages: '2 pages', strength: '45%' },
];

const initialApplications: Application[] = [
  { id: 1, title: 'Operations Manager', company: 'Maersk NL', location: 'Rotterdam', salary: 'EUR 62k', score: '94%', stage: 'Interview', when: 'yesterday' },
  { id: 2, title: 'Regional Planner', company: 'Picnic', location: 'Utrecht', salary: 'EUR 58k', score: '88%', stage: 'Applied', when: '3 days ago' },
  { id: 3, title: 'Depot Lead', company: 'DHL Parcel', location: 'Amsterdam', salary: 'EUR 55k', score: '85%', stage: 'Applied', when: '4 days ago' },
  { id: 4, title: 'Supply Chain Lead', company: 'Vanderlande', location: 'Veghel', salary: 'EUR 68k', score: '81%', stage: 'Saved', when: 'today' },
  { id: 5, title: 'Ops Consultant', company: 'Districon', location: 'Hybrid', salary: 'EUR 60k', score: '76%', stage: 'Offer', when: '2 days ago' },
  { id: 6, title: 'Warehouse Manager', company: 'Bol', location: 'Waalwijk', salary: 'EUR 57k', score: '72%', stage: 'Closed', when: 'last week' },
];

const initialMatches: Application[] = [
  { id: 11, title: 'Head of Operations', company: 'Fastned', location: 'Amsterdam', salary: 'EUR 72k', score: '91%', stage: 'Saved', when: 'new', reason: 'S&OP match' },
  { id: 12, title: 'Logistics Manager', company: 'Coolblue', location: 'Rotterdam', salary: 'EUR 64k', score: '89%', stage: 'Saved', when: 'new', reason: 'Same city' },
  { id: 13, title: 'Planning Lead', company: 'Jumbo', location: 'Veghel', salary: 'EUR 61k', score: '84%', stage: 'Saved', when: 'new', reason: 'Depot exp.' },
  { id: 14, title: 'Network Planner', company: 'PostNL', location: 'The Hague', salary: 'EUR 59k', score: '80%', stage: 'Saved', when: 'new', reason: 'SQL listed' },
];

const sampleRoles = [
  {
    title: 'Operations Lead',
    company: 'Kestrel Logistics',
    years: '2022 — now',
    detail: 'Runs depot planning for 40 staff and 120 daily routes. Rebuilt the shift model and cut late deliveries 34%.',
  },
  {
    title: 'Logistics Coordinator',
    company: 'Nord Freight',
    years: '2019 — 2022',
    detail: 'Owned carrier scheduling for the Benelux lane and renegotiated vendor contracts for a 9% unit saving.',
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

const getStageClassName = (stage: ApplicationStage) => {
  if (stage === 'Interview') return 'organic-tag organic-tag-accent-2';
  if (stage === 'Applied') return 'organic-tag organic-tag-accent';
  if (stage === 'Offer') return 'organic-tag border border-accent text-accent';
  return 'organic-tag';
};

const DemoNotice = () => (
  <div className="organic-card border border-accent/25 bg-[var(--organic-accent-100)] px-5 py-4 text-[var(--organic-accent-800)]">
    <p className="text-sm font-semibold">This is demo data.</p>
    <p className="mt-1 text-sm leading-6">
      Guest users can create and export CVs. Saved CVs, matches, application tracking, and real dashboard data require login.
    </p>
  </div>
);

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const buildCvReview = (cvData: CVData) => {
  const summary = cvData.personalInfo.summary || '';
  const roleText = cvData.experiences.map((role) => role.description).join(' ');
  const skills = cvData.skills.map((skill) => skill.name).filter(Boolean);
  const words = countWords(summary);
  const numbers = `${summary} ${roleText}`.match(/\d+([.,]\d+)?%?/g) || [];
  const hasHeader = Boolean(cvData.personalInfo.fullName && cvData.personalInfo.email);
  let score = 54;
  const items: { kind: 'Good' | 'Fix' | 'Tip'; title: string; body: string }[] = [];

  if (numbers.length >= 2) {
    score += 14;
    items.push({ kind: 'Good', title: 'Evidence is visible', body: `${numbers.length} numbers appear across the summary and roles.` });
  } else {
    items.push({ kind: 'Fix', title: 'Add measurable results', body: 'Add team size, revenue, time saved, percentage improved, or volume handled to at least two bullets.' });
  }

  if (words >= 35 && words <= 90) {
    score += 12;
    items.push({ kind: 'Good', title: 'Summary length is readable', body: `${words} words is enough context without becoming a cover letter.` });
  } else {
    items.push({ kind: 'Fix', title: 'Tune the summary length', body: 'Aim for roughly 45 to 80 words: role, scope, proof point, and what you do well.' });
  }

  if (skills.length >= 6) score += 10;
  else items.push({ kind: 'Fix', title: 'Name more skills', body: 'Six to ten concrete tools, methods, and strengths help both readers and filters.' });

  if (hasHeader) score += 8;
  else items.push({ kind: 'Fix', title: 'Complete the header', body: 'Name and email should be present before export.' });

  items.push({ kind: 'Tip', title: 'Match the role wording', body: 'Mirror two or three phrases from the job ad in your summary when you apply.' });

  const finalScore = Math.max(35, Math.min(96, score));
  return {
    score: finalScore,
    label: finalScore >= 85 ? 'Strong — send it' : finalScore >= 70 ? 'Solid, with easy wins' : 'Needs a pass before sending',
    summary: `${items.filter((item) => item.kind === 'Fix').length} things to fix, ${items.filter((item) => item.kind === 'Good').length} working well`,
    items,
  };
};

const parseJobUrl = (url: string): Application => {
  const host = (url.match(/^(?:https?:\/\/)?(?:www\.)?([^/?#]+)/i) || [])[1] || 'posting.example';
  const slug = url.split(/[?#]/)[0].split('/').filter(Boolean).pop() || 'operations-manager';
  const title = slug
    .replace(/\.(html?|php)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
  const company = host.split('.')[0];

  return {
    id: Date.now(),
    title: title || 'Operations Manager',
    company: company.charAt(0).toUpperCase() + company.slice(1),
    location: 'Rotterdam',
    salary: 'EUR 60k',
    score: '87%',
    stage: 'Saved',
    when: 'just now',
    reason: 'titles and skills overlap',
  };
};

const Index = ({ initialScreen = 'landing' }: IndexProps) => {
  const navigate = useNavigate();
  const [screen, setScreenState] = useState<AppScreen>(initialScreen);
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [matches, setMatches] = useState<Application[]>(initialMatches);
  const [trackerView, setTrackerView] = useState<TrackerView>('kanban');
  const [filters, setFilters] = useState({ role: '', location: '', salary: '' });
  const [addOpen, setAddOpen] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [draftApplication, setDraftApplication] = useState<Application | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const lastStep = TOTAL_STEPS - 1;
  const next = () => setStep((s) => Math.min(s + 1, lastStep));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const cvReview = useMemo(() => buildCvReview(cvData), [cvData]);
  const setScreen = (nextScreen: AppScreen) => {
    setScreenState(nextScreen);
    navigate(screenPaths[nextScreen]);
  };

  useEffect(() => {
    setScreenState(initialScreen);
  }, [initialScreen]);

  const filteredApplications = useMemo(() => {
    const roleQuery = filters.role.toLowerCase();
    const locationQuery = filters.location.toLowerCase();
    const salaryFloor = Number(filters.salary.replace(/\D/g, ''));

    return applications.filter((application) => {
      if (roleQuery && !`${application.title} ${application.company}`.toLowerCase().includes(roleQuery)) return false;
      if (locationQuery && !application.location.toLowerCase().includes(locationQuery)) return false;
      if (salaryFloor) {
        const salary = Number(application.salary.replace(/\D/g, ''));
        if (salary && salary < salaryFloor) return false;
      }
      return true;
    });
  }, [applications, filters]);

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
    title: screen === 'landing'
      ? 'Folio CV | Free Resume Builder with Live Preview and PDF Export'
      : `Folio CV ${screen === 'editor' ? 'Simulator' : screen.charAt(0).toUpperCase() + screen.slice(1)} | Dashboard Preview`,
    description:
      'Create a professional resume online with Folio CV for free. Use live preview, CV templates, design customization, and PDF export without signing up.',
    path: screenPaths[screen],
    jsonLd: seoSchema,
  });

  useEffect(() => {
    if (!hasMeaningfulCvContent(cvData)) return;
    trackCvStartedOncePerSession();
  }, [cvData]);

  const handleTemplateChange = (nextTemplate: CVTemplate) => {
    if (nextTemplate === template) return;
    setTemplate(nextTemplate);
    trackEvent('template_selected', {
      template_name: nextTemplate,
    });
  };

  const advanceApplication = (_id: number) => undefined;

  const trackMatch = (_match: Application) => undefined;

  const createDraftApplication = () => {
    if (!addUrl.trim()) return;
    setDraftApplication(parseJobUrl(addUrl.trim()));
  };

  const saveDraftApplication = () => undefined;

  const openEditor = () => {
    setScreen('editor');
    setStep(0);
  };

  const openExportStep = () => {
    setScreen('editor');
    setStep(lastStep);
  };

  const renderAppShell = () => {
    const openCount = applications.filter((application) => application.stage !== 'Closed').length;
    const stageColumns = stages.map((stage) => ({
      stage,
      items: filteredApplications.filter((application) => application.stage === stage),
    }));

    return (
      <div className="folio-app-shell">
        <aside className="folio-sidebar">
          <button className="flex items-center gap-3 px-2 font-display text-lg text-foreground" onClick={() => setScreen('landing')}>
            <span className="h-6 w-6 rounded-full bg-accent" />
            Folio CV
          </button>
          <nav className="space-y-1">
            {[
              { label: 'Dashboard', target: 'dashboard' as AppScreen, active: screen === 'dashboard' },
              { label: 'CV simulator', target: 'editor' as AppScreen, active: screen === 'editor' },
              { label: 'Job tracker', target: 'tracker' as AppScreen, active: screen === 'tracker' },
              { label: 'Matches', target: 'matches' as AppScreen, active: screen === 'matches' },
            ].map((item) => (
              <button
                key={item.label}
                className={`folio-sidebar-link ${item.active ? 'is-active' : ''}`}
                onClick={() => setScreen(item.target)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto space-y-4">
            <div className="rounded-[20px] bg-background p-4">
              <p className="font-display text-base">Guest mode</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Create CVs for free. Dashboard data is demo until login.</p>
            </div>
            <div className="flex items-center gap-3 px-1">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--organic-accent-2-300)] text-xs font-bold text-[var(--organic-accent-2-800)]">G</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Gast</p>
                <p className="truncate text-xs text-muted-foreground">not logged in</p>
              </div>
            </div>
            <Button variant="ghost" className="justify-start px-2 text-accent" onClick={() => setScreen('landing')}>
              <ArrowLeft size={16} />
              Back to site
            </Button>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-7 md:px-10 md:py-8">
          {screen === 'dashboard' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">Good afternoon, Mara.</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{openCount} applications still open · {matches.length} new matches this week</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setScreen('tracker')}>Open tracker</Button>
                  <Button onClick={openEditor}>New CV</Button>
                </div>
              </div>

              <div className="mt-6">
                <DemoNotice />
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['CVs', String(dashboardCvs.length), 'one per role family'],
                  ['Applications', String(applications.length), 'across five stages'],
                  ['Interviews', String(applications.filter((item) => item.stage === 'Interview').length), 'currently active'],
                  ['New matches', String(matches.length), 'from the demo CV'],
                ].map(([label, value, note]) => (
                  <article key={label} className="organic-card p-5">
                    <p className="section-kicker">{label}</p>
                    <p className="mt-3 font-display text-4xl leading-none">{value}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{note}</p>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-7 xl:grid-cols-[1.15fr_0.85fr]">
                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-normal">Your CVs</h2>
                    <Button variant="ghost" onClick={openEditor}>+ New version</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {dashboardCvs.map((cv) => (
                      <article key={cv.id} className="organic-card p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-xl font-normal">{cv.name}</h3>
                          <span className="organic-tag">{cv.format}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Edited {cv.updated} · {cv.pages}</p>
                        <div className="mt-4 flex items-center gap-2 text-xs">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--organic-neutral-200)]">
                            <span className="block h-full rounded-full bg-[var(--organic-accent-2)]" style={{ width: cv.strength }} />
                          </span>
                          <span className="text-[var(--organic-accent-2-800)]">{cv.strength} complete</span>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="outline" onClick={openEditor}>Edit</Button>
                          <Button size="sm" variant="ghost" disabled>Login required</Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-normal">Matched to your CV</h2>
                    <span className="organic-tag organic-tag-accent-2">Demo parsed</span>
                  </div>
                  <div className="organic-card p-3">
                    {matches.map((job) => (
                      <article key={job.id} className="flex items-center gap-3 border-b border-border/70 px-1 py-4 last:border-0">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-xs font-bold text-[var(--organic-accent-2-800)]">
                          {job.score}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold">{job.title}</h3>
                          <p className="truncate text-xs text-muted-foreground">{job.company} · {job.location} · {job.salary}</p>
                        </div>
                        <Button size="sm" variant="outline" disabled>Login required</Button>
                      </article>
                    ))}
                    <Button variant="ghost" className="mt-2" onClick={() => setScreen('tracker')}>All matches and filters</Button>
                  </div>
                </section>
              </div>
            </section>
          )}

          {screen === 'tracker' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">Applications</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{applications.length} tracked · last update {applications[0]?.when ?? 'today'}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="folio-segmented">
                    <button className={trackerView === 'kanban' ? 'is-active' : ''} onClick={() => setTrackerView('kanban')}>Board</button>
                    <button className={trackerView === 'table' ? 'is-active' : ''} onClick={() => setTrackerView('table')}>Table</button>
                  </div>
                  <Button disabled>Login required</Button>
                </div>
              </div>

              <div className="mt-6">
                <DemoNotice />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Input className="max-w-60" placeholder="Role or company" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))} />
                <Input className="max-w-48" placeholder="Location" value={filters.location} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} />
                <Input className="max-w-40" placeholder="Salary floor" value={filters.salary} onChange={(event) => setFilters((current) => ({ ...current, salary: event.target.value }))} />
                <span className="organic-tag border border-accent bg-transparent text-accent">Remote ok</span>
                <Button variant="ghost" onClick={() => setFilters({ role: '', location: '', salary: '' })}>Clear</Button>
              </div>

              {trackerView === 'kanban' ? (
                <div className="mt-7 grid gap-4 xl:grid-cols-5">
                  {stageColumns.map((column) => (
                    <section key={column.stage} className="rounded-[24px] bg-card p-3 shadow-[var(--organic-shadow-sm)]">
                      <div className="mb-3 flex items-center justify-between px-1">
                        <h2 className="font-display text-base font-normal">{column.stage}</h2>
                        <span className="organic-tag">{column.items.length}</span>
                      </div>
                      <div className="space-y-3">
                        {column.items.map((job) => (
                          <article key={job.id} className="rounded-[18px] bg-background p-4 shadow-[var(--organic-shadow-sm)]">
                            <h3 className="text-sm font-semibold leading-tight">{job.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{job.company} · {job.location}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="organic-tag organic-tag-accent-2">{job.score}</span>
                              <span className="text-xs text-muted-foreground">{job.when}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="mt-3 justify-start px-0" disabled onClick={() => advanceApplication(job.id)}>
                              Login required
                            </Button>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="organic-card mt-7 overflow-x-auto p-4">
                  <table className="folio-table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Company</th>
                        <th>Location</th>
                        <th>Salary</th>
                        <th>Match</th>
                        <th>Stage</th>
                        <th>Updated</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((job) => (
                        <tr key={job.id}>
                          <td className="font-semibold">{job.title}</td>
                          <td>{job.company}</td>
                          <td className="text-muted-foreground">{job.location}</td>
                          <td>{job.salary}</td>
                          <td>{job.score}</td>
                          <td><span className={getStageClassName(job.stage)}>{job.stage}</span></td>
                          <td className="text-muted-foreground">{job.when}</td>
                          <td><Button size="sm" variant="ghost" disabled onClick={() => advanceApplication(job.id)}>Login required</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {addOpen && (
                <div className="folio-dialog-backdrop">
                  <div className="folio-dialog">
                    <div>
                      <h2 className="font-display text-2xl font-normal">Add an application</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Paste a job link. This demo reads the URL shape and fills a draft you can correct before saving.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input placeholder="https://jobs.example.com/operations-manager" value={addUrl} onChange={(event) => setAddUrl(event.target.value)} />
                      <Button className="shrink-0" onClick={createDraftApplication}>Read link</Button>
                    </div>
                    {draftApplication && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="organic-tag organic-tag-accent-2">Read from link</span>
                          <span className="text-xs text-muted-foreground">{addUrl}</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(['title', 'company', 'location', 'salary'] as const).map((field) => (
                            <label key={field} className="field-card space-y-1.5">
                              <span className="text-xs capitalize text-muted-foreground">{field}</span>
                              <Input
                                value={draftApplication[field]}
                                onChange={(event) => setDraftApplication((current) => current ? { ...current, [field]: event.target.value } : current)}
                              />
                            </label>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 rounded-[18px] bg-background p-4 text-sm">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-xs font-bold text-[var(--organic-accent-2-800)]">
                            {draftApplication.score}
                          </span>
                          Match against <strong>{dashboardCvs[0].name}</strong> — {draftApplication.reason}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                      <Button disabled={!draftApplication} onClick={saveDraftApplication}>Save to Saved</Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {screen === 'matches' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">Matches</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Demo roles matched against the dashboard CV. Track a role to move it into the application board.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setScreen('dashboard')}>Back to dashboard</Button>
                  <Button onClick={openEditor}>Edit CV</Button>
                </div>
              </div>

              <div className="mt-6">
                <DemoNotice />
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
                <aside className="organic-card p-5">
                  <p className="section-kicker">Filters</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="organic-tag">Operations</span>
                    <span className="organic-tag">Rotterdam · 30km</span>
                    <span className="organic-tag">EUR 55k+</span>
                    <span className="organic-tag border border-accent bg-transparent text-accent">Hybrid</span>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-muted-foreground">
                    These cards are local preview data from the redesign. The working product remains the CV simulator and export flow.
                  </p>
                </aside>

                <div className="grid gap-4 md:grid-cols-2">
                  {matches.map((job) => (
                    <article key={job.id} className="organic-card p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-display text-2xl font-normal">{job.title}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{job.company} · {job.location} · {job.salary}</p>
                        </div>
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-xs font-bold text-[var(--organic-accent-2-800)]">
                          {job.score}
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className="organic-tag organic-tag-accent">{job.reason}</span>
                        <span className="organic-tag">CV version: {dashboardCvs[0].format}</span>
                      </div>
                      <Button className="mt-6 w-full" variant="outline" disabled onClick={() => trackMatch(job)}>
                        Login required
                      </Button>
                    </article>
                  ))}

                  {matches.length === 0 && (
                    <article className="organic-card p-8 md:col-span-2">
                      <h2 className="font-display text-2xl font-normal">All current matches are tracked.</h2>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Open the tracker to review the roles you moved into the application board.
                      </p>
                      <Button className="mt-6" onClick={() => setScreen('tracker')}>Open tracker</Button>
                    </article>
                  )}
                </div>
              </div>
            </section>
          )}

          {screen === 'editor' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">CV simulator</h1>
                  <p className="mt-1 text-sm text-muted-foreground">Free to use. Build with the real Folio CV editor and export from the preview step.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setReviewOpen((current) => !current)}>
                    {reviewOpen ? 'Hide CV check' : 'Run CV check'}
                  </Button>
                  <Button onClick={openExportStep}>Export PDF</Button>
                </div>
              </div>

              <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
                <div className="min-w-0 space-y-5">
                  {reviewOpen && (
                    <article className="organic-card p-5">
                      <div className="flex items-center gap-4">
                        <span
                          className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full"
                          style={{ background: `conic-gradient(var(--organic-accent-2) ${cvReview.score}%, var(--organic-neutral-300) 0)` }}
                        >
                          <span className="grid h-[58px] w-[58px] place-items-center rounded-full bg-card font-display text-lg">{cvReview.score}</span>
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-normal">{cvReview.label}</h2>
                          <p className="mt-1 text-sm text-muted-foreground">{cvReview.summary}</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {cvReview.items.map((item) => (
                          <div key={item.title} className="flex gap-3 border-t border-border/70 pt-3">
                            <span className={`organic-tag shrink-0 ${item.kind === 'Good' ? 'organic-tag-accent-2' : item.kind === 'Fix' ? 'organic-tag-accent' : ''}`}>{item.kind}</span>
                            <div>
                              <h3 className="text-sm font-semibold">{item.title}</h3>
                              <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  )}

                  <article className="organic-card p-5">
                    <p className="section-kicker">Format</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {templateOptions.map((item) => (
                        <button
                          key={item.id}
                          className={`folio-chip ${template === item.id ? 'is-active' : ''}`}
                          onClick={() => handleTemplateChange(item.id)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </article>

                  <div className="editor-card px-5 py-5 md:px-7 md:py-7">
                    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="section-kicker">Step {step + 1} of {TOTAL_STEPS}</p>
                          <h2 className="mt-2 font-display text-3xl font-normal text-foreground">{stepTitles[step]}</h2>
                          <p className="mt-1.5 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
                        </div>
                        <div className="rounded-full bg-[var(--organic-accent-100)] px-4 py-2 text-right text-[var(--organic-accent-800)]">
                          <p className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-70">Step</p>
                          <p className="font-mono text-lg tabular-nums">{String(step + 1).padStart(2, '0')}<span className="opacity-40">/{TOTAL_STEPS}</span></p>
                        </div>
                      </div>
                      <StepIndicator currentStep={step} onStepClick={setStep} />
                    </div>

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
                          <div className="space-y-5">
                            <CVPreview
                              data={cvData}
                              template={template}
                              onDesignChange={(design) => setCvData({ ...cvData, design })}
                            />
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

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

                <aside className="min-w-0 xl:sticky xl:top-8 xl:self-start">
                  <div className="organic-card mb-3 flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="section-kicker">Live preview</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">{template} template</p>
                    </div>
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  </div>
                  <CVPreviewCanvas
                    data={cvData}
                    template={template}
                    maxHeightClassName="max-h-[calc(100vh-7rem)]"
                    scaleClassName="scale-[0.38] sm:scale-[0.48] lg:scale-[0.54] xl:scale-[0.48] 2xl:scale-[0.58]"
                  />
                </aside>
              </div>
            </section>
          )}
        </main>
      </div>
    );
  };

  if (screen !== 'landing') return renderAppShell();

  return (
    <div className="organic-page-shell">
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="app-noise" aria-hidden="true" />

      <header className="sticky inset-x-0 top-0 z-50 bg-background/90 backdrop-blur-xl">
        <div className="organic-container flex items-center justify-between gap-3 py-3">
          <a href="/" className="flex items-center gap-3 font-display text-lg text-foreground" aria-label="Folio CV home">
            <span className="h-6 w-6 rounded-full bg-accent" aria-hidden="true" />
            Folio CV
          </a>

          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground lg:flex">
              <a href="#how" className="transition-colors hover:text-accent">How it works</a>
              <a href="#jobs" className="transition-colors hover:text-accent">Jobs</a>
              <a href="#tracker" className="transition-colors hover:text-accent">Tracker</a>
            </nav>
            <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={() => setScreen('dashboard')}>Log in</Button>
            <Button size="sm" onClick={openEditor}>Try simulator</Button>
          </div>
        </div>
      </header>

      <main id="content" className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="organic-container grid gap-8 py-7 sm:py-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="organic-tag mb-4">Simulator is free — no account needed</span>
              <h1 className="max-w-[12em] font-display text-[clamp(3.2rem,6.4vw,6rem)] font-normal leading-[1.02] tracking-[-0.025em] text-foreground">
                Build a CV that reads well and gets sent out.
              </h1>
              <p className="mt-4 max-w-[34em] text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
                Write your CV in the free simulator, pick a format, export it. When you are ready
                to keep several versions and track applications, the dashboard view takes over.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={openEditor}>
                  Open the free simulator
                  <ArrowUpRight size={16} className="ml-1.5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => setScreen('dashboard')}>
                  See the dashboard
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Free PDF export, live A4 preview, and no credit card.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute -right-5 -top-7 h-64 w-64 rounded-full bg-[var(--organic-accent-200)]" aria-hidden="true" />
              <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[var(--organic-accent-2-200)]" aria-hidden="true" />
              <div className="organic-paper relative z-10 rotate-[-1.4deg] rounded-[20px] p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-3xl leading-none">Mara Ellison</p>
                    <p className="mt-2 text-sm text-[var(--organic-accent-700)]">Operations Lead · Rotterdam</p>
                  </div>
                  <span className="h-12 w-12 rounded-full bg-accent" />
                </div>
                <div className="my-5 h-px bg-[var(--organic-divider)]" />
                <p className="section-kicker">Experience</p>
                <div className="mt-3 space-y-5">
                  {sampleRoles.map((role) => (
                    <article key={role.title}>
                      <div className="flex justify-between gap-4">
                        <h2 className="text-sm font-semibold">{role.title} — {role.company}</h2>
                        <span className="text-xs text-muted-foreground">{role.years}</span>
                      </div>
                      <p className="mt-2 text-[13px] leading-6 text-foreground/75">{role.detail}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['Capacity planning', 'S&OP', 'SQL', 'Warehouse ops'].map((skill) => (
                    <span key={skill} className="organic-tag bg-[var(--organic-neutral-100)] text-[var(--organic-neutral-800)]">{skill}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="border-y border-border/70">
            <div className="organic-container grid gap-6 py-6 sm:grid-cols-4">
              {[
                ['10', 'CV layouts in the simulator'],
                ['A4', 'live document preview'],
                ['Board', 'application tracker preview'],
                ['EUR 0', 'to write and export a CV'],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-display text-3xl leading-none text-foreground">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="studio-band">
          <div className="organic-container py-14 lg:py-20">
            <h2 className="max-w-[16em] font-display text-4xl font-normal leading-[1.08] md:text-5xl">
              Three steps, and the first one costs nothing.
            </h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {howItWorks.map((item, index) => (
                <article key={item} className="space-y-4">
                  <span className={`grid h-14 w-14 place-items-center rounded-full font-display text-2xl ${
                    index === 1 ? 'bg-[var(--organic-accent-2)] text-background' : index === 2 ? 'bg-[var(--organic-neutral-900)] text-[var(--organic-neutral-100)]' : 'bg-accent text-accent-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <h3 className="font-display text-2xl font-normal">{index === 0 ? 'Write it in the simulator' : index === 1 ? 'Keep a version per role' : 'Apply and track'}</h3>
                  <p className="max-w-sm text-sm leading-7 text-foreground/75">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="jobs" className="organic-container grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
          <div>
            <span className="organic-tag organic-tag-accent">Job matching</span>
            <h2 className="mt-4 max-w-[14em] font-display text-4xl font-normal leading-[1.08] md:text-5xl">
              Jobs shown from what your CV already says.
            </h2>
            <p className="mt-5 max-w-[34em] text-base leading-8 text-foreground/80">
              The dashboard design shows how role, city, salary, and remote filters can sit next
              to match cards. It is a product preview around the free simulator.
            </p>
            <Button className="mt-6" onClick={() => setScreen('dashboard')}>Browse matches</Button>
          </div>
          <div className="organic-card p-6">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="organic-tag">Operations</span>
              <span className="organic-tag">Rotterdam · 30km</span>
              <span className="organic-tag">EUR 55k+</span>
              <span className="organic-tag border border-accent bg-transparent text-accent">Hybrid</span>
            </div>
            {matches.slice(0, 3).map((job) => (
              <article key={job.id} className="flex items-center gap-4 border-t border-border/70 py-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-xs font-bold text-[var(--organic-accent-2-800)]">{job.score}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{job.title}</h3>
                  <p className="truncate text-xs text-muted-foreground">{job.company} · {job.location} · {job.salary}</p>
                </div>
                <span className="organic-tag organic-tag-accent">{job.reason}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="studio-band">
          <div className="organic-container py-14 lg:py-20">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-[18em] font-display text-4xl font-normal leading-[1.08] md:text-5xl">
                Everything between "I should update my CV" and "they replied".
              </h2>
              <Button variant="outline" onClick={openEditor}>Start with the free part</Button>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {marketingFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="organic-card p-6">
                    <span className={`mb-5 flex h-10 w-10 items-center justify-center rounded-full ${
                      index > 2 ? 'bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]' : 'bg-[var(--organic-accent-100)] text-[var(--organic-accent-800)]'
                    }`}>
                      <Icon size={18} strokeWidth={2.75} />
                    </span>
                    <h3 className="font-display text-xl font-normal text-foreground">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-foreground/75">{feature.description}</p>
                    <span className={`organic-tag mt-5 ${feature.plan === 'Free' ? 'organic-tag-accent' : 'organic-tag-accent-2'}`}>{feature.plan}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tracker" className="organic-container py-14 lg:py-20">
          <span className="organic-tag organic-tag-accent-2">The tracker</span>
          <h2 className="mt-4 max-w-[20em] font-display text-4xl font-normal leading-[1.08] md:text-5xl">
            Five columns, and you always know who owes you an answer.
          </h2>
          <p className="mt-5 max-w-[44em] text-base leading-8 text-foreground/80">
            Saved, applied, interview, offer, closed. Board when you want the shape of it,
            table when you want the detail.
          </p>
          <div className="mt-8 grid gap-3 lg:grid-cols-5">
            {stages.map((stage) => {
              const items = applications.filter((application) => application.stage === stage).slice(0, 1);
              return (
                <article key={stage} className="rounded-[24px] bg-card p-3 shadow-[var(--organic-shadow-sm)]">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="font-display text-sm font-normal">{stage}</h3>
                    <span className="organic-tag">{applications.filter((application) => application.stage === stage).length}</span>
                  </div>
                  {items.map((job) => (
                    <div key={job.id} className="rounded-[18px] bg-background p-3">
                      <p className="text-xs font-semibold leading-tight">{job.title}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{job.company}</p>
                      <span className="organic-tag organic-tag-accent-2 mt-2">{job.score}</span>
                    </div>
                  ))}
                </article>
              );
            })}
          </div>
          <Button className="mt-7" onClick={() => setScreen('tracker')}>Look inside the tracker</Button>
        </section>

        <section id="pricing" className="studio-band">
          <div className="organic-container py-14 lg:py-20">
            <h2 className="font-display text-4xl font-normal md:text-5xl">What's free, what's previewed.</h2>
            <div className="mt-9 grid gap-6 lg:grid-cols-2">
              <article className="organic-card p-8">
                <p className="section-kicker">Free</p>
                <p className="mt-3 font-display text-4xl">EUR 0</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">The CV simulator, in full: forms, templates, design controls, live preview, and PDF export.</p>
                <div className="mt-5 flex flex-col gap-2 text-sm">
                  <span>Unlimited editing and export</span>
                  <span>All formats and layouts</span>
                  <span>One CV in the browser, no account</span>
                </div>
                <Button className="mt-6 w-full" variant="outline" onClick={openEditor}>Start writing</Button>
              </article>
              <article className="rounded-[32px] bg-[var(--organic-neutral-900)] p-8 text-[var(--organic-neutral-100)] shadow-[var(--organic-shadow-lg)]">
                <p className="section-kicker text-[var(--organic-accent-200)]">Dashboard</p>
                <p className="mt-3 font-display text-4xl">Preview</p>
                <p className="mt-3 text-sm leading-7 text-[var(--organic-neutral-300)]">The design shell from the redesign folder: saved CV cards, matched roles, and the application tracker.</p>
                <div className="mt-5 flex flex-col gap-2 text-sm">
                  <span>Saved CV versions</span>
                  <span>Application board and table</span>
                  <span>Job match cards as demo data</span>
                </div>
                <Button className="mt-6 w-full" onClick={() => setScreen('dashboard')}>Open the dashboard</Button>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="organic-container grid gap-10 py-14 lg:grid-cols-[0.72fr_1.28fr] lg:py-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-4xl font-normal leading-[1.08] md:text-5xl">
              Questions,<br />answered plainly.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              The simulator is the working product. The dashboard screens show the surrounding product direction from the redesign.
            </p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <article key={faq.question} className="organic-card px-6 py-1">
                <button className="flex w-full items-center justify-between gap-4 py-5 text-left" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                  <span className="font-display text-lg text-foreground">{faq.question}</span>
                  <CheckCircle2 size={18} className={`shrink-0 text-accent transition-transform ${openFaq === index ? 'rotate-45' : ''}`} />
                </button>
                {openFaq === index && <p className="mb-5 max-w-4xl text-sm leading-7 text-foreground/75">{faq.answer}</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="organic-container py-12">
          <div className="relative overflow-hidden rounded-[40px] bg-accent px-7 py-12 text-accent-foreground md:px-14">
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/15" aria-hidden="true" />
            <div className="absolute bottom-[-6rem] right-32 h-44 w-44 rounded-full bg-white/10" aria-hidden="true" />
            <div className="relative max-w-[28em]">
              <h2 className="font-display text-4xl font-normal leading-[1.08] md:text-5xl">
                Write the thing. It takes about ten minutes.
              </h2>
              <p className="mt-4 text-base leading-8 text-accent-foreground/90">
                No account, no card, no trial countdown. The dashboard is there as the surrounding app shell.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  className="bg-[var(--organic-neutral-900)] text-[var(--organic-neutral-100)] hover:bg-[var(--organic-neutral-800)]"
                  onClick={openEditor}
                >
                  Open the free simulator
                </Button>
                <Button variant="outline" className="border-white/45 text-accent-foreground hover:bg-white/10" onClick={() => setScreen('dashboard')}>
                  See dashboard
                </Button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-border/70">
          <div className="organic-container grid gap-8 py-10 text-sm md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3 font-display text-lg">
                <span className="h-6 w-6 rounded-full bg-accent" />
                Folio CV
              </div>
              <p className="mt-3 max-w-sm text-muted-foreground">
                A CV writer that stays free, and a dashboard design for when the search gets real.
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              <span className="font-semibold">Product</span>
              <a href="#how" className="text-muted-foreground transition-colors hover:text-accent">How it works</a>
              <a href="#jobs" className="text-muted-foreground transition-colors hover:text-accent">Job matching</a>
              <a href="#pricing" className="text-muted-foreground transition-colors hover:text-accent">Pricing</a>
            </nav>
            <nav className="flex flex-col gap-2">
              <span className="font-semibold">Help</span>
              <a href="/features/" className="text-muted-foreground transition-colors hover:text-accent">Features</a>
              <a href="/faq/" className="text-muted-foreground transition-colors hover:text-accent">FAQ</a>
              <a href="#faq" className="text-muted-foreground transition-colors hover:text-accent">Data and privacy</a>
            </nav>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Support</span>
              <a href="https://buymeacoffee.com/yourdeveloperhsn" target="_blank" rel="noreferrer" className="text-muted-foreground transition-colors hover:text-accent">
                <Coffee size={14} className="mr-1 inline-block" />
                Buy me a coffee
              </a>
              <span className="text-muted-foreground">© 2026 Folio CV</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
