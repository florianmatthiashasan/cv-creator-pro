import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Coffee,
  Copy,
  FileDown,
  FileSearch,
  Globe2,
  Headphones,
  LayoutTemplate,
  Mail,
  MessageSquareText,
  Palette,
  Printer,
  SearchCheck,
  Settings,
  Sparkles,
  Target,
  UserRound,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CVPreview from '@/components/cv/CVPreview';
import CVPreviewCanvas from '@/components/cv/CVPreviewCanvas';
import AdditionalSectionsForm from '@/components/cv/AdditionalSectionsForm';
import EducationForm from '@/components/cv/EducationForm';
import ExperienceForm from '@/components/cv/ExperienceForm';
import LanguagesForm from '@/components/cv/LanguagesForm';
import PersonalInfoForm from '@/components/cv/PersonalInfoForm';
import SkillsForm from '@/components/cv/SkillsForm';
import StepIndicator from '@/components/cv/StepIndicator';
import { templateOptions } from '@/components/cv/templates/registry';
import { useSeo } from '@/hooks/use-seo';
import { trackCvStartedOncePerSession, trackEvent } from '@/lib/analytics';
import { fetchArbeitnowJobFromUrl, getProfileCity } from '@/lib/job-matching';
import {
  ApplicationStage,
  DbApplication,
  fetchDashboardData,
  getInitialAuthUser,
  onAuthUserChange,
  saveApplication,
  saveCvSnapshot,
  signInWithEmail,
  signOut,
  supabaseConfigured,
  updateApplicationFollowUp,
  updateApplicationStage,
} from '@/lib/supabase-db';
import { toast } from '@/components/ui/sonner';
import { CVData, CVTemplate, emptyCVData } from '@/types/cv';
import {
  buildAtsCheck,
  buildInterviewPrep,
  buildJobMatchReport,
  type AtsCheck,
  type InterviewPrep,
  type JobMatchReport,
} from '@/lib/cv-analysis';

const TOTAL_STEPS = 7;
const stepTitles = ['Personal details', 'Work experience', 'Education', 'Skills & strengths', 'Languages', 'Extra proof', 'Design, preview & download'];
const stepDescriptions = [
  'Tell us a bit about yourself',
  'Add the roles that shaped your career',
  'Outline your academic background',
  'Show what you do best',
  'List the languages you speak',
  'Add projects, certificates, awards, volunteering, or publications',
  'Adjust fonts and colors, choose a template, and download your CV',
];

type AppScreen = 'landing' | 'dashboard' | 'tracker' | 'editor' | 'matcher' | 'writer';
type TrackerView = 'kanban' | 'table';
type Application = DbApplication;

type ApplicationWriterResult = {
  coverLetter: string;
  motivation: string;
  email: string;
  notes?: string;
  source: 'openai';
};

type WriterTone = 'Professional' | 'Warm' | 'Direct';
type WriterLanguage = 'English' | 'German';
type UiLanguage = WriterLanguage;

type IndexProps = {
  initialScreen?: AppScreen;
};

const uiCopy = {
  English: {
    dashboard: 'Dashboard',
    cvSimulator: 'CV simulator',
    jobMatcher: 'Job matcher',
    jobTracker: 'Job tracker',
    aiWriter: 'AI writer',
    guestMode: 'Guest mode',
    signedIn: 'Signed in',
    guestDetail: 'Create CVs for free. Save versions and track jobs after signing in.',
    signedInDetail: 'Your CVs and applications are saved to your account.',
    notLoggedIn: 'not logged in',
    logIn: 'Log in',
    logOut: 'Log out',
    backToSite: 'Back to site',
    language: 'Language',
    settings: 'Settings',
    settingsTitle: 'Settings',
    profile: 'Profile',
    support: 'Support',
    close: 'Close',
    profileSignedOut: 'Sign in to save CVs, applications, and AI versions.',
    supportText: 'Need help or spotted a problem? Contact support with the current page and what you expected.',
    aiWorking: 'AI is working...',
    aiMatcherWorking: 'AI is reading your CV and the job ad. Results will appear here when the analysis is ready.',
    aiWriterWorking: 'AI is writing your application package. This can take a few seconds.',
    aiJudgeWorking: 'AI is reviewing your CV. Suggestions will appear here when ready.',
    aiUnavailable: 'AI is unavailable right now. Please try again.',
    english: 'English',
    german: 'German',
    backToCv: 'Back to CV',
    editCv: 'Edit CV',
    exportPdf: 'Export PDF',
    saveCv: 'Save CV',
    loginToSave: 'Login to save',
    loginRequired: 'Login required',
    format: 'Format',
    livePreview: 'Live preview',
    template: 'template',
    step: 'Step',
    back: 'Back',
    next: 'Next',
    aiJudge: 'AI Judge',
    hideAiJudge: 'Hide AI Judge',
    analyzing: 'Analyzing...',
    openAiUnavailableLocal: 'AI is unavailable right now. No estimate is shown.',
    openAiUnavailableReview: 'AI is unavailable right now. No review is shown.',
    openAiUnavailablePrep: 'AI is unavailable right now. No interview prep is shown.',
    matcherTitle: 'Job matcher',
    matcherDescription: 'Compare your current CV with a posting, then apply only the changes that make sense.',
    input: 'Input',
    pastePosting: 'Paste the posting',
    pastePostingHelp: 'Use the full job ad for better keyword and interview suggestions.',
    jobAd: 'Job ad',
    jobAdPlaceholder: 'Paste the job description here...',
    currentCv: 'Current CV',
    currentCvHelp: 'Matching against the CV currently open in the simulator.',
    createAiTailoredVersion: 'Create AI tailored version',
    creatingWithAi: 'Creating with AI...',
    pasteJobToStart: 'Paste a job ad to start',
    matcherEmptyHelp: 'The matcher will calculate keyword coverage, ATS risks, CV rewrite suggestions, and interview prep.',
    matchScore: 'Match score',
    atsCheck: 'ATS check',
    target: 'Target',
    aiEstimate: 'AI estimate from CV evidence and job ad.',
    localEstimate: 'Waiting for AI analysis.',
    keywordCoverage: 'Keyword coverage',
    matched: 'Matched',
    missing: 'Missing',
    noKeywordOverlap: 'No strong keyword overlap yet.',
    noMissingKeywords: 'No major missing keywords detected.',
    suggestions: 'Suggestions',
    applySelectively: 'Apply selectively',
    changes: 'changes',
    apply: 'Apply',
    atsChecklist: 'ATS checklist',
    interviewPrep: 'Interview prep',
    writerTitle: 'AI application writer',
    writerDescription: 'Paste a job ad and your motivation, then generate a cover letter, motivation text, and application email.',
    writeNow: 'Write now',
    writing: 'Writing...',
    regenerate: 'Regenerate',
    jobAdAndNotes: 'Job ad and notes',
    writerJobPlaceholder: 'Paste the full job description here...',
    yourMotivation: 'Your motivation',
    motivationPlaceholder: 'Why this company, why this role, what should the letter emphasize?',
    tone: 'Tone',
    outputLanguage: 'Output language',
    questionAngles: 'Question angles',
    noInterviewPrep: 'No interview prep yet',
    noInterviewPrepHelp: 'Paste a job ad above to generate role-specific interview questions and answer angles.',
    output: 'Output',
    applicationPackage: 'Application package',
    generatedWithOpenAi: 'Generated with OpenAI.',
    localFallbackDraft: 'AI unavailable.',
    autoWriterHint: 'Paste a job ad and the writer starts automatically.',
    copyAll: 'Copy all',
    copy: 'Copy',
    pdf: 'PDF',
    coverLetter: 'Cover letter',
    motivation: 'Motivation',
    email: 'Email',
    noApplicationText: 'No application text yet',
    noApplicationTextHelp: 'Use your current CV as the profile source, then paste a job ad and generate a tailored package.',
    cvContentNeeded: 'Add CV content first',
    cvContentNeededHelp: 'AI needs real profile information before it can judge your CV. Add your experience, skills, or summary first.',
    editorTitle: 'CV simulator',
    editorDescription: 'Free to use. Build with the real Folio CV editor and export from the preview step.',
    textSuggestions: 'Text suggestions',
    rewrites: 'rewrites',
    replace: 'Replace',
    current: 'Current',
    suggested: 'Suggested',
    noRewriteNeeded: 'No rewrite needed right now',
    noRewriteNeededHelp: 'The judge will show replaceable suggestions when summary or role descriptions look weak, short, or generic.',
    notEnoughCvInfo: 'Your CV does not contain enough real information yet. AI will not invent missing experience, skills, metrics, or tools. Add what you have first, then create the tailored version.',
    notEnoughCvInfoTracker: 'Your CV does not contain enough real information yet. AI will not invent missing experience, skills, metrics, or tools. Add what you have first, then tailor this job.',
    localTailoredFallback: 'AI tailoring is unavailable right now. No AI version was created.',
    localTailoredTrackerFallback: 'AI tailoring is unavailable right now. No AI tracker version was created.',
    pasteJobFirstError: 'Paste a job ad first.',
    pasteLongerJobError: 'Paste a longer job ad first.',
  },
  German: {
    dashboard: 'Dashboard',
    cvSimulator: 'CV-Simulator',
    jobMatcher: 'Job-Matcher',
    jobTracker: 'Job-Tracker',
    aiWriter: 'AI-Writer',
    guestMode: 'Gastmodus',
    signedIn: 'Angemeldet',
    guestDetail: 'Erstelle CVs kostenlos. Versionen speichern und Jobs tracken nach dem Login.',
    signedInDetail: 'Deine CVs und Bewerbungen sind in deinem Account gespeichert.',
    notLoggedIn: 'nicht angemeldet',
    logIn: 'Einloggen',
    logOut: 'Ausloggen',
    backToSite: 'Zurück zur Seite',
    language: 'Sprache',
    settings: 'Einstellungen',
    settingsTitle: 'Einstellungen',
    profile: 'Profil',
    support: 'Support',
    close: 'Schließen',
    profileSignedOut: 'Melde dich an, um CVs, Bewerbungen und AI-Versionen zu speichern.',
    supportText: 'Brauchst du Hilfe oder hast du ein Problem gefunden? Kontaktiere den Support mit aktueller Seite und Erwartung.',
    aiWorking: 'AI arbeitet...',
    aiMatcherWorking: 'AI liest deinen CV und die Stellenanzeige. Die Ergebnisse erscheinen hier, sobald die Analyse fertig ist.',
    aiWriterWorking: 'AI schreibt dein Bewerbungspaket. Das kann ein paar Sekunden dauern.',
    aiJudgeWorking: 'AI prüft deinen CV. Vorschläge erscheinen hier, sobald sie fertig sind.',
    aiUnavailable: 'AI ist gerade nicht verfügbar. Bitte versuche es erneut.',
    english: 'Englisch',
    german: 'Deutsch',
    backToCv: 'Zurück zum CV',
    editCv: 'CV bearbeiten',
    exportPdf: 'PDF exportieren',
    saveCv: 'CV speichern',
    loginToSave: 'Login zum Speichern',
    loginRequired: 'Login nötig',
    format: 'Format',
    livePreview: 'Live-Vorschau',
    template: 'Template',
    step: 'Schritt',
    back: 'Zurück',
    next: 'Weiter',
    aiJudge: 'AI Judge',
    hideAiJudge: 'AI Judge ausblenden',
    analyzing: 'Analysiert...',
    openAiUnavailableLocal: 'AI ist gerade nicht verfügbar. Es wird keine Schätzung angezeigt.',
    openAiUnavailableReview: 'AI ist gerade nicht verfügbar. Es wird keine Bewertung angezeigt.',
    openAiUnavailablePrep: 'AI ist gerade nicht verfügbar. Es wird keine Interview-Vorbereitung angezeigt.',
    matcherTitle: 'Job-Matcher',
    matcherDescription: 'Vergleiche deinen aktuellen CV mit einer Stellenanzeige und übernimm nur sinnvolle Änderungen.',
    input: 'Eingabe',
    pastePosting: 'Stellenanzeige einfügen',
    pastePostingHelp: 'Nutze die komplette Anzeige für bessere Keywords und Interview-Vorschläge.',
    jobAd: 'Stellenanzeige',
    jobAdPlaceholder: 'Stellenbeschreibung hier einfügen...',
    currentCv: 'Aktueller CV',
    currentCvHelp: 'Vergleich mit dem CV, der gerade im Simulator geöffnet ist.',
    createAiTailoredVersion: 'AI-Version für Job erstellen',
    creatingWithAi: 'AI erstellt Version...',
    pasteJobToStart: 'Stellenanzeige einfügen',
    matcherEmptyHelp: 'Der Matcher berechnet Keyword-Abdeckung, ATS-Risiken, CV-Vorschläge und Interview-Vorbereitung.',
    matchScore: 'Match-Score',
    atsCheck: 'ATS-Check',
    target: 'Ziel',
    aiEstimate: 'AI-Schätzung aus CV-Belegen und Stellenanzeige.',
    localEstimate: 'Warten auf AI-Analyse.',
    keywordCoverage: 'Keyword-Abdeckung',
    matched: 'Gefunden',
    missing: 'Fehlt',
    noKeywordOverlap: 'Noch keine starke Keyword-Überschneidung.',
    noMissingKeywords: 'Keine großen fehlenden Keywords erkannt.',
    suggestions: 'Vorschläge',
    applySelectively: 'Gezielt übernehmen',
    changes: 'Änderungen',
    apply: 'Übernehmen',
    atsChecklist: 'ATS-Checkliste',
    interviewPrep: 'Interview-Vorbereitung',
    writerTitle: 'AI-Bewerbungswriter',
    writerDescription: 'Füge eine Stellenanzeige und deine Motivation ein, dann entstehen Anschreiben, Motivationstext und E-Mail.',
    writeNow: 'Jetzt schreiben',
    writing: 'Schreibt...',
    regenerate: 'Neu generieren',
    jobAdAndNotes: 'Stellenanzeige und Notizen',
    writerJobPlaceholder: 'Komplette Stellenbeschreibung hier einfügen...',
    yourMotivation: 'Deine Motivation',
    motivationPlaceholder: 'Warum diese Firma, warum diese Rolle, was soll betont werden?',
    tone: 'Ton',
    outputLanguage: 'Ausgabesprache',
    questionAngles: 'Antwortansätze',
    noInterviewPrep: 'Noch keine Interview-Vorbereitung',
    noInterviewPrepHelp: 'Füge oben eine Stellenanzeige ein, um rollenspezifische Fragen und Antwortansätze zu erhalten.',
    output: 'Ausgabe',
    applicationPackage: 'Bewerbungspaket',
    generatedWithOpenAi: 'Mit OpenAI generiert.',
    localFallbackDraft: 'AI nicht verfügbar.',
    autoWriterHint: 'Füge eine Stellenanzeige ein, der Writer startet automatisch.',
    copyAll: 'Alles kopieren',
    copy: 'Kopieren',
    pdf: 'PDF',
    coverLetter: 'Anschreiben',
    motivation: 'Motivation',
    email: 'E-Mail',
    noApplicationText: 'Noch kein Bewerbungstext',
    noApplicationTextHelp: 'Nutze deinen aktuellen CV als Profilquelle, füge eine Stellenanzeige ein und generiere ein passendes Paket.',
    cvContentNeeded: 'Erst CV-Inhalt hinzufügen',
    cvContentNeededHelp: 'AI braucht echte Profilinformationen, bevor sie deinen CV bewerten kann. Füge Erfahrung, Skills oder Summary hinzu.',
    editorTitle: 'CV-Simulator',
    editorDescription: 'Kostenlos nutzbar. Baue deinen CV im echten Editor und exportiere ihn im Vorschau-Schritt.',
    textSuggestions: 'Textvorschläge',
    rewrites: 'Umschreibungen',
    replace: 'Ersetzen',
    current: 'Aktuell',
    suggested: 'Vorschlag',
    noRewriteNeeded: 'Gerade keine Umschreibung nötig',
    noRewriteNeededHelp: 'Der Judge zeigt ersetzbare Vorschläge, wenn Summary oder Rollenbeschreibungen schwach, kurz oder generisch wirken.',
    notEnoughCvInfo: 'Dein CV enthält noch nicht genug echte Informationen. AI erfindet keine fehlende Erfahrung, Skills, Metriken oder Tools. Füge zuerst ein, was du wirklich hast, dann erstelle die Job-Version.',
    notEnoughCvInfoTracker: 'Dein CV enthält noch nicht genug echte Informationen. AI erfindet keine fehlende Erfahrung, Skills, Metriken oder Tools. Füge zuerst ein, was du wirklich hast, dann passe diesen Job an.',
    localTailoredFallback: 'AI-Tailoring ist gerade nicht verfügbar. Es wurde keine AI-Version erstellt.',
    localTailoredTrackerFallback: 'AI-Tailoring ist gerade nicht verfügbar. Es wurde keine AI-Tracker-Version erstellt.',
    pasteJobFirstError: 'Füge zuerst eine Stellenanzeige ein.',
    pasteLongerJobError: 'Füge zuerst eine längere Stellenanzeige ein.',
  },
} as const;

const uiStepText: Record<UiLanguage, { titles: string[]; descriptions: string[] }> = {
  English: {
    titles: stepTitles,
    descriptions: stepDescriptions,
  },
  German: {
    titles: ['Persönliche Daten', 'Berufserfahrung', 'Ausbildung', 'Skills & Stärken', 'Sprachen', 'Zusätzliche Nachweise', 'Design, Vorschau & Download'],
    descriptions: [
      'Erzähl kurz, wer du bist',
      'Füge Rollen hinzu, die deine Erfahrung zeigen',
      'Zeige deinen Bildungsweg',
      'Zeige, was du gut kannst',
      'Liste deine Sprachen auf',
      'Füge Projekte, Zertifikate, Awards, Ehrenamt oder Publikationen hinzu',
      'Passe Fonts und Farben an, wähle ein Template und lade deinen CV herunter',
    ],
  },
};

const screenPaths: Record<AppScreen, string> = {
  landing: '/',
  dashboard: '/dashboard',
  editor: '/dashboard/simulator',
  matcher: '/dashboard/matcher',
  tracker: '/dashboard/tracker',
  writer: '/dashboard/writer',
};

const stages: ApplicationStage[] = ['Saved', 'Applied', 'No response', 'Interview', 'Offer', 'Closed'];
const nextStageLabel: Record<ApplicationStage, string> = {
  Saved: 'Mark applied',
  Applied: 'No response',
  'No response': 'Move to interview',
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
  { id: '1', name: 'Operations Lead — general', format: 'Classic', updated: '2 days ago', pages: '1 page', strength: '92%' },
  { id: '2', name: 'Supply Chain Manager', format: 'Two column', updated: '5 days ago', pages: '2 pages', strength: '78%' },
  { id: '3', name: 'Logistics referral', format: 'Compact', updated: '3 weeks ago', pages: '1 page', strength: '64%' },
  { id: '4', name: 'Consulting version', format: 'Serif', updated: 'last month', pages: '2 pages', strength: '45%' },
];

const initialApplications: Application[] = [
  { id: '1', title: 'Operations Manager', company: 'Maersk NL', location: 'Rotterdam', salary: 'EUR 62k', score: '94%', stage: 'Interview', when: 'yesterday', isDemo: true },
  { id: '2', title: 'Regional Planner', company: 'Picnic', location: 'Utrecht', salary: 'EUR 58k', score: '88%', stage: 'Applied', when: '3 days ago', isDemo: true },
  { id: '3', title: 'Depot Lead', company: 'DHL Parcel', location: 'Amsterdam', salary: 'EUR 55k', score: '85%', stage: 'Applied', when: '4 days ago', isDemo: true },
  { id: '4', title: 'Supply Chain Lead', company: 'Vanderlande', location: 'Veghel', salary: 'EUR 68k', score: '81%', stage: 'Saved', when: 'today', isDemo: true },
  { id: '5', title: 'Ops Consultant', company: 'Districon', location: 'Hybrid', salary: 'EUR 60k', score: '76%', stage: 'Offer', when: '2 days ago', isDemo: true },
  { id: '6', title: 'Warehouse Manager', company: 'Bol', location: 'Waalwijk', salary: 'EUR 57k', score: '72%', stage: 'Closed', when: 'last week', isDemo: true },
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
    data.languages.length > 0 ||
    (data.additionalSections || []).length > 0
  );
};

const hasTailoringEvidence = (data: CVData) =>
  Boolean(
    data.personalInfo.summary.trim() ||
    data.skills.some((skill) => skill.name.trim()) ||
    data.experiences.some((experience) =>
      [experience.position, experience.company, experience.description].some((value) => value.trim()),
    ) ||
    (data.additionalSections || []).some((section) =>
      [section.title, section.organization, section.description].some((value) => value.trim()),
    ),
  );

const getStageClassName = (stage: ApplicationStage) => {
  if (stage === 'Interview') return 'organic-tag organic-tag-accent-2';
  if (stage === 'Applied') return 'organic-tag organic-tag-accent';
  if (stage === 'No response') return 'organic-tag border border-border bg-transparent text-muted-foreground';
  if (stage === 'Offer') return 'organic-tag border border-accent text-accent';
  return 'organic-tag';
};

const DemoNotice = ({ language }: { language: UiLanguage }) => (
  <div className="organic-card border border-accent/25 bg-[var(--organic-accent-100)] px-5 py-4 text-[var(--organic-accent-800)]">
    <p className="text-sm font-semibold">{language === 'German' ? 'Das sind Demo-Daten.' : 'This is demo data.'}</p>
    <p className="mt-1 text-sm leading-6">
      {language === 'German'
        ? 'Gäste können CVs erstellen und exportieren. Gespeicherte CVs, AI-Texte und Bewerbungs-Tracking benötigen Login.'
        : 'Guest users can create and export CVs. Saved CVs, AI writing, and application tracking require login.'}
    </p>
  </div>
);

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

type CvSuggestion =
  | {
      id: string;
      label: string;
      issue: string;
      current: string;
      suggestion: string;
      target: 'summary';
    }
  | {
      id: string;
      label: string;
      issue: string;
      current: string;
      suggestion: string;
      target: 'experience';
      experienceId: string;
    };

const weakVerbReplacements: Array<[RegExp, string]> = [
  [/\bresponsible for\b/gi, 'Owned'],
  [/\bworked on\b/gi, 'Delivered'],
  [/\bhelped with\b/gi, 'Supported'],
  [/\bhelped\b/gi, 'Supported'],
  [/\bmade\b/gi, 'Built'],
  [/\bdid\b/gi, 'Completed'],
  [/\bhandled\b/gi, 'Managed'],
];

const hasMetric = (text: string) => /\d+([.,]\d+)?%?|\b(k|m|eur|usd|gbp|hours?|days?|weeks?|months?|people|users|clients|routes|orders)\b/i.test(text);

const cleanSentence = (text: string) => text.replace(/\s+/g, ' ').trim().replace(/[.。]+$/, '');

const addPeriod = (text: string) => {
  const value = text.trim();
  if (!value) return value;
  return /[.!?]$/.test(value) ? value : `${value}.`;
};

const strengthenText = (text: string, fallback: string) => {
  const current = cleanSentence(text);
  if (!current) return addPeriod(fallback);

  const rewritten = weakVerbReplacements.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    current,
  );

  if (rewritten !== current) return addPeriod(rewritten);
  if (/^(i\s+)?(was|am|were|are)\b/i.test(current)) return addPeriod(current.replace(/^(i\s+)?(was|am|were)\s+/i, 'Led '));
  return addPeriod(current);
};

const buildSummarySuggestion = (cvData: CVData) => {
  const role = cvData.personalInfo.title.trim() || 'Professional';
  const skills = cvData.skills.map((skill) => skill.name.trim()).filter(Boolean).slice(0, 3);
  const skillText = skills.length ? ` across ${skills.join(', ')}` : '';
  return `${role} with practical experience${skillText}. Focused on clear execution, measurable outcomes, and reliable delivery across teams and stakeholders.`;
};

const buildCvReview = (cvData: CVData) => {
  const summary = cvData.personalInfo.summary || '';
  const roleText = cvData.experiences.map((role) => role.description).join(' ');
  const skills = cvData.skills.map((skill) => skill.name).filter(Boolean);
  const words = countWords(summary);
  const numbers = `${summary} ${roleText}`.match(/\d+([.,]\d+)?%?/g) || [];
  const hasHeader = Boolean((cvData.personalInfo.firstName || cvData.personalInfo.lastName) && cvData.personalInfo.email);
  let score = 54;
  const items: { kind: 'Good' | 'Fix' | 'Tip'; title: string; body: string }[] = [];
  const suggestions: CvSuggestion[] = [];

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
    suggestions.push({
      id: 'summary-length',
      label: 'Summary',
      issue: summary.trim() ? 'Make the summary more recruiter-friendly.' : 'Add a focused summary.',
      current: summary.trim() || 'No summary written yet.',
      suggestion: buildSummarySuggestion(cvData),
      target: 'summary',
    });
  }

  if (skills.length >= 6) score += 10;
  else items.push({ kind: 'Fix', title: 'Name more skills', body: 'Six to ten concrete tools, methods, and strengths help both readers and filters.' });

  if (hasHeader) score += 8;
  else items.push({ kind: 'Fix', title: 'Complete the header', body: 'Name and email should be present before export.' });

  cvData.experiences.forEach((experience) => {
    const description = experience.description.trim();
    const fallback = `Led ${experience.position || 'role'} work${experience.company ? ` at ${experience.company}` : ''}, improving execution, coordination, and delivery quality.`;
    const strengthened = strengthenText(description, fallback);
    const weakText = weakVerbReplacements.some(([pattern]) => {
      pattern.lastIndex = 0;
      return pattern.test(description);
    });

    if (!description || weakText || countWords(description) < 12 || !hasMetric(description)) {
      suggestions.push({
        id: `experience-${experience.id}`,
        label: experience.position || experience.company || 'Experience',
        issue: !description
          ? 'Add an achievement-focused description.'
          : !hasMetric(description)
            ? 'Add stronger impact and measurable scope.'
            : 'Use stronger action verbs.',
        current: description || 'No description written yet.',
        suggestion: strengthened,
        target: 'experience',
        experienceId: experience.id,
      });
    }
  });

  items.push({ kind: 'Tip', title: 'Match the role wording', body: 'Mirror two or three phrases from the job ad in your summary when you apply.' });

  const finalScore = Math.max(35, Math.min(96, score));
  return {
    score: finalScore,
    label: finalScore >= 85 ? 'Strong — send it' : finalScore >= 70 ? 'Solid, with easy wins' : 'Needs a pass before sending',
    summary: `${items.filter((item) => item.kind === 'Fix').length} things to fix, ${items.filter((item) => item.kind === 'Good').length} working well`,
    items,
    suggestions: suggestions.slice(0, 5),
  };
};

type CvReview = ReturnType<typeof buildCvReview>;

type AiJobAnalysis = {
  jobMatchReport: JobMatchReport;
  atsCheck: AtsCheck;
  interviewPrep: InterviewPrep;
  notes?: string;
  source?: 'openai';
};

type AiTailoredCvResult = {
  role: string;
  company: string;
  cvName: string;
  matchScore: number;
  matchLabel: string;
  dataUseNote: string;
  gapNote: string;
  changes: string[];
  summary: string;
  skillsToAdd: string[];
  experienceRewrites: Array<{
    experienceId: string;
    description: string;
    reason: string;
  }>;
  source?: 'openai';
};

const getFullName = (data: CVData) =>
  `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim() || 'Your Name';

const buildCvProfileForAi = (data: CVData) => {
  const personal = data.personalInfo;
  const skills = data.skills.map((skill) => skill.name).filter(Boolean).join(', ');
  const experiences = data.experiences
    .map((item) => `${item.position || 'Role'} at ${item.company || 'Company'}: ${item.description || 'No description'}`)
    .join('\n');

  return [
    `Name: ${getFullName(data)}`,
    `Target title: ${personal.title || 'Not specified'}`,
    `Location: ${personal.address || 'Not specified'}`,
    `Summary: ${personal.summary || 'Not specified'}`,
    `Skills: ${skills || 'Not specified'}`,
    `Experience:\n${experiences || 'Not specified'}`,
  ].join('\n');
};

const getCompanyFromJobAd = (jobAd: string) => {
  const companyLine = jobAd
    .split('\n')
    .map((line) => line.trim())
    .find((line) => /company|unternehmen|firma|employer/i.test(line));
  return companyLine?.replace(/^(company|unternehmen|firma|employer)\s*[:-]\s*/i, '').slice(0, 80) || 'your team';
};

const getRoleFromJobAd = (jobAd: string, fallback: string) => {
  const firstUsefulLine = jobAd
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length >= 6 && line.length <= 90);
  return firstUsefulLine || fallback || 'the open role';
};

const formatApplicationDraft = (result: ApplicationWriterResult) =>
  [
    'Cover letter',
    result.coverLetter,
    '',
    'Motivation',
    result.motivation,
    '',
    'Email',
    result.email,
  ].join('\n');

const humanizeSlug = (value: string) =>
  decodeURIComponent(value)
    .replace(/\.(html?|php)$/i, '')
    .replace(/\b\d{4,}\b/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const knownJobCities = [
  'Dornbirn',
  'Innsbruck',
  'Salzburg',
  'Vienna',
  'Wien',
  'Graz',
  'Linz',
  'Klagenfurt',
  'Berlin',
  'Munich',
  'Munchen',
  'Hamburg',
  'Karlsruhe',
  'Mannheim',
  'Amsterdam',
  'Rotterdam',
];

const splitTitleAndLocation = (rawTitle: string, fallbackLocation: string) => {
  const city = knownJobCities.find((item) => rawTitle.toLowerCase().endsWith(` ${item.toLowerCase()}`));
  if (!city) return { title: rawTitle, location: fallbackLocation };

  return {
    title: rawTitle.slice(0, -city.length).trim(),
    location: city === 'Wien' ? 'Vienna' : city,
  };
};

const parseJobUrl = (url: string, fallbackLocation = 'Remote') => {
  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    parsedUrl = null;
  }

  const host = parsedUrl?.hostname.replace(/^www\./, '') || 'posting.example';
  const pathParts = parsedUrl?.pathname.split('/').filter(Boolean) || [];
  const companyIndex = pathParts.indexOf('companies');
  const companySlug = companyIndex >= 0 ? pathParts[companyIndex + 1] : '';
  const titleSlug = pathParts[pathParts.length - 1] || 'operations-manager';
  const titleWithLocation = humanizeSlug(titleSlug);
  const { title, location } = splitTitleAndLocation(titleWithLocation, fallbackLocation);
  const companyFromPath = companySlug ? humanizeSlug(companySlug) : '';
  const isAggregatorHost = /(^|\.)jooble\.org$/.test(host);
  const companyFromHost = isAggregatorHost ? '' : humanizeSlug(host.split('.')[0]);
  const company = companyFromPath || companyFromHost;

  return {
    id: String(Date.now()),
    title: title || 'Job from link',
    company: company ? company.charAt(0).toUpperCase() + company.slice(1) : 'Company not listed',
    location,
    salary: 'Not listed',
    score: 'Manual',
    stage: 'Saved',
    when: 'just now',
    reason: 'Draft from link',
    sourceUrl: url,
  };
};

const getCvName = (data: CVData) => {
  const role = data.personalInfo.title.trim();
  const name = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim();
  if (role && name) return `${role} - ${name}`;
  return role || name || 'Untitled CV';
};

const formatFollowUpLabel = (value?: string) => {
  if (!value) return 'No follow-up';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return `Due in ${diffDays}d`;
};

const Index = ({ initialScreen = 'landing' }: IndexProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hydratedUserIdRef = useRef<string | null>(null);
  const writerAutoKeyRef = useRef('');
  const [screen, setScreenState] = useState<AppScreen>(initialScreen);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>('English');
  const [step, setStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(emptyCVData);
  const [template, setTemplate] = useState<CVTemplate>('modern');
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [selectedCvName, setSelectedCvName] = useState('Untitled CV');
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [trackerView, setTrackerView] = useState<TrackerView>('kanban');
  const [draggedApplicationId, setDraggedApplicationId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ApplicationStage | null>(null);
  const [filters, setFilters] = useState({ role: '', location: '', salary: '' });
  const [addOpen, setAddOpen] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addReading, setAddReading] = useState(false);
  const [addReadStatus, setAddReadStatus] = useState<'idle' | 'imported' | 'draft'>('idle');
  const [draftApplication, setDraftApplication] = useState<Application | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [matcherJobAd, setMatcherJobAd] = useState('');
  const [writerJobAd, setWriterJobAd] = useState('');
  const [writerMotivation, setWriterMotivation] = useState('');
  const [writerTone, setWriterTone] = useState<WriterTone>('Professional');
  const [writerLanguage, setWriterLanguage] = useState<WriterLanguage>('English');
  const [writerResult, setWriterResult] = useState<ApplicationWriterResult | null>(null);
  const [writerLoading, setWriterLoading] = useState(false);
  const [writerError, setWriterError] = useState('');
  const [aiCvReview, setAiCvReview] = useState<CvReview | null>(null);
  const [aiCvReviewLoading, setAiCvReviewLoading] = useState(false);
  const [aiCvReviewError, setAiCvReviewError] = useState('');
  const [aiJobAnalysis, setAiJobAnalysis] = useState<AiJobAnalysis | null>(null);
  const [aiJobAnalysisLoading, setAiJobAnalysisLoading] = useState(false);
  const [aiJobAnalysisError, setAiJobAnalysisError] = useState('');
  const [tailoringLoading, setTailoringLoading] = useState(false);
  const [tailoringNote, setTailoringNote] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const lastStep = TOTAL_STEPS - 1;
  const next = () => setStep((s) => Math.min(s + 1, lastStep));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const localCvReview = useMemo(() => buildCvReview(cvData), [cvData]);
  const cvReview = aiCvReview;
  const activeJobAd = screen === 'writer'
    ? writerJobAd.trim() || matcherJobAd.trim()
    : matcherJobAd.trim() || writerJobAd.trim();
  const localJobMatchReport = useMemo(
    () => (activeJobAd.length >= 40 ? buildJobMatchReport(cvData, activeJobAd) : null),
    [activeJobAd, cvData],
  );
  const localAtsCheck = useMemo(() => buildAtsCheck(cvData, template, activeJobAd), [activeJobAd, cvData, template]);
  const localInterviewPrep = useMemo(
    () => (activeJobAd.length >= 40 ? buildInterviewPrep(cvData, activeJobAd) : null),
    [activeJobAd, cvData],
  );
  const jobMatchReport = aiJobAnalysis?.jobMatchReport || null;
  const atsCheck = aiJobAnalysis?.atsCheck || null;
  const interviewPrep = aiJobAnalysis?.interviewPrep || null;
  const t = uiCopy[uiLanguage];
  const localizedStepTitles = uiStepText[uiLanguage].titles;
  const localizedStepDescriptions = uiStepText[uiLanguage].descriptions;
  const cvReviewSourceLabel = aiCvReview ? 'OpenAI' : t.analyzing;
  const jobAnalysisSourceLabel = aiJobAnalysis ? 'OpenAI' : t.analyzing;
  const updateUiLanguage = (language: UiLanguage) => {
    setUiLanguage(language);
    setWriterLanguage(language);
  };
  const setScreen = (nextScreen: AppScreen) => {
    setScreenState(nextScreen);
    navigate(screenPaths[nextScreen]);
  };

  useEffect(() => {
    setScreenState(initialScreen);
  }, [initialScreen]);

  useEffect(() => {
    setAiCvReview(null);
    setAiCvReviewError('');
  }, [cvData, uiLanguage]);

  useEffect(() => {
    if (!reviewOpen || !hasMeaningfulCvContent(cvData)) {
      setAiCvReviewLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setAiCvReviewLoading(true);
      setAiCvReviewError('');

      try {
        const response = await fetch('/api/ai-career-advisor', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mode: 'cv-review',
            cvData,
            outputLanguage: uiLanguage,
            localReview: localCvReview,
          }),
        });

        if (!response.ok) throw new Error((await response.json())?.error || 'OpenAI CV review is unavailable.');
        const data = await response.json();
        if (!cancelled) setAiCvReview(data as CvReview);
      } catch (error) {
        if (!cancelled) {
          setAiCvReviewError(error instanceof Error ? error.message : 'OpenAI CV review is unavailable.');
        }
      } finally {
        if (!cancelled) setAiCvReviewLoading(false);
      }
    }, 800);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [cvData, localCvReview, reviewOpen, uiLanguage]);

  useEffect(() => {
    setAiJobAnalysis(null);
    setAiJobAnalysisError('');
  }, [activeJobAd, cvData, template, uiLanguage]);

  useEffect(() => {
    if (!['matcher', 'writer'].includes(screen) || !localJobMatchReport || !localInterviewPrep) {
      setAiJobAnalysisLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setAiJobAnalysisLoading(true);
      setAiJobAnalysisError('');

      try {
        const response = await fetch('/api/ai-career-advisor', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            mode: 'job-match',
            cvData,
            template,
            jobAd: activeJobAd,
            outputLanguage: uiLanguage,
            localJobMatch: localJobMatchReport,
            localAtsCheck,
            localInterviewPrep,
          }),
        });

        if (!response.ok) throw new Error((await response.json())?.error || 'OpenAI job analysis is unavailable.');
        const data = await response.json();
        if (!cancelled) setAiJobAnalysis(data as AiJobAnalysis);
      } catch (error) {
        if (!cancelled) {
          setAiJobAnalysisError(error instanceof Error ? error.message : 'OpenAI job analysis is unavailable.');
        }
      } finally {
        if (!cancelled) setAiJobAnalysisLoading(false);
      }
    }, 900);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [activeJobAd, cvData, localAtsCheck, localInterviewPrep, localJobMatchReport, screen, template, uiLanguage]);

  useEffect(() => {
    if (!supabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    getInitialAuthUser().then((user) => {
      if (cancelled) return;
      setAuthUser(user);
      setAuthLoading(false);
    });

    const unsubscribe = onAuthUserChange((user) => {
      hydratedUserIdRef.current = null;
      setAuthUser(user);
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const dashboardQuery = useQuery({
    queryKey: ['dashboard-data', authUser?.id],
    queryFn: () => fetchDashboardData(authUser as User),
    enabled: Boolean(authUser && supabaseConfigured),
  });

  useEffect(() => {
    if (!authUser) {
      hydratedUserIdRef.current = null;
      setSelectedCvId(null);
      setSelectedCvName('Untitled CV');
      setApplications(initialApplications);
      return;
    }

    const data = dashboardQuery.data;
    if (!data || hydratedUserIdRef.current === authUser.id) return;

    const firstCv = data.cvs[0];
    if (firstCv) {
      setSelectedCvId(firstCv.id);
      setSelectedCvName(firstCv.name);
      setCvData(firstCv.data);
      setTemplate(firstCv.templateId);
    } else if (hasMeaningfulCvContent(cvData)) {
      setSelectedCvId(null);
      setSelectedCvName(getCvName(cvData));
    } else {
      setSelectedCvId(null);
      setSelectedCvName(getCvName(emptyCVData));
      setCvData(emptyCVData);
      setTemplate('modern');
    }

    setApplications(data.applications);
    hydratedUserIdRef.current = authUser.id;
  }, [authUser, dashboardQuery.data, cvData]);

  useEffect(() => {
    if (!dashboardQuery.error) return;
    toast.error(dashboardQuery.error instanceof Error ? dashboardQuery.error.message : 'Supabase-Daten konnten nicht geladen werden.');
  }, [dashboardQuery.error]);

  const saveCvMutation = useMutation({
    mutationFn: () =>
      saveCvSnapshot({
        userId: authUser?.id || '',
        cvId: selectedCvId,
        name: selectedCvName && selectedCvName !== 'Untitled CV' ? selectedCvName : getCvName(cvData),
        templateId: template,
        data: cvData,
      }),
    onSuccess: (cvId) => {
      setSelectedCvId(cvId);
      setSelectedCvName((current) => current || getCvName(cvData));
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', authUser?.id] });
      toast.success('CV wurde in Supabase gespeichert.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'CV konnte nicht gespeichert werden.');
    },
  });

  const applicationSaveMutation = useMutation({
    mutationFn: (application: Application) =>
      saveApplication({
        userId: authUser?.id || '',
        cvId: selectedCvId,
        application,
      }),
    onSuccess: (application) => {
      setApplications((current) => [application, ...current]);
      setAddOpen(false);
      setAddUrl('');
      setDraftApplication(null);
      setAddReadStatus('idle');
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', authUser?.id] });
      toast.success('Bewerbung wurde gespeichert.');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Bewerbung konnte nicht gespeichert werden.');
    },
  });

  const stageUpdateMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: ApplicationStage }) => updateApplicationStage(id, stage),
    onMutate: ({ id, stage }) => {
      const previousApplications = applications;
      setApplications((current) => current.map((item) => (item.id === id ? { ...item, stage } : item)));
      return { previousApplications };
    },
    onSuccess: (application) => {
      setApplications((current) => current.map((item) => (item.id === application.id ? application : item)));
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', authUser?.id] });
    },
    onError: (error, _variables, context) => {
      if (context?.previousApplications) setApplications(context.previousApplications);
      toast.error(error instanceof Error ? error.message : 'Status konnte nicht gespeichert werden.');
    },
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, followUpAt }: { id: string; followUpAt: string | null }) => updateApplicationFollowUp(id, followUpAt),
    onMutate: ({ id, followUpAt }) => {
      const previousApplications = applications;
      setApplications((current) => current.map((item) => (item.id === id ? { ...item, followUpAt: followUpAt || undefined } : item)));
      return { previousApplications };
    },
    onSuccess: (application) => {
      setApplications((current) => current.map((item) => (item.id === application.id ? application : item)));
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', authUser?.id] });
      toast.success('Follow-up gespeichert.');
    },
    onError: (error, _variables, context) => {
      if (context?.previousApplications) setApplications(context.previousApplications);
      toast.error(error instanceof Error ? error.message : 'Follow-up konnte nicht gespeichert werden.');
    },
  });

  const dbTemplateOptions = useMemo(() => {
    if (!dashboardQuery.data?.templates.length) return templateOptions;
    return dashboardQuery.data.templates.map((item) => ({
      id: item.id,
      label: item.label,
      desc: item.description,
    }));
  }, [dashboardQuery.data?.templates]);

  const visibleDashboardCvs = useMemo(() => {
    if (!authUser || !dashboardQuery.data) return dashboardCvs;
    return dashboardQuery.data.cvs.map((cv) => ({
      id: cv.id,
      name: cv.name,
      format: cv.format,
      updated: cv.updated,
      pages: cv.pages,
      strength: `${cv.strength}%`,
    }));
  }, [authUser, dashboardQuery.data]);

  const profileCity = getProfileCity(cvData);
  const profileRole = cvData.personalInfo.title.trim() || 'Your target role';

  const isLoggedIn = Boolean(authUser);
  const displayName = authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0] || 'Gast';
  const authStatusLabel = isLoggedIn ? t.signedIn : t.guestMode;
  const authDetailLabel = isLoggedIn ? authUser?.email || (uiLanguage === 'German' ? 'angemeldet' : 'logged in') : t.notLoggedIn;

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

  const requestLogin = () => {
    if (!supabaseConfigured) {
      toast.error('Supabase ENV fehlt. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_PUBLISHABLE_KEY setzen.');
      return;
    }

    setAuthOpen(true);
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authEmail.trim()) return;

    setAuthSubmitting(true);
    try {
      await signInWithEmail(authEmail.trim());
      toast.success('Check your inbox for the sign-in link.');
      setAuthOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login konnte nicht gestartet werden.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setAuthUser(null);
      toast.success('Du bist ausgeloggt.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Logout fehlgeschlagen.');
    }
  };

  const saveCurrentCv = () => {
    if (!isLoggedIn) {
      requestLogin();
      return;
    }

    setSelectedCvName((current) => current || getCvName(cvData));
    saveCvMutation.mutate();
  };

  const applyCvSuggestion = (suggestion: CvSuggestion) => {
    setCvData((current) => {
      if (suggestion.target === 'summary') {
        return {
          ...current,
          personalInfo: {
            ...current.personalInfo,
            summary: suggestion.suggestion,
          },
        };
      }

      return {
        ...current,
        experiences: current.experiences.map((experience) =>
          experience.id === suggestion.experienceId
            ? { ...experience, description: suggestion.suggestion }
            : experience,
        ),
      };
    });
    toast.success('Suggestion applied to your CV.');
  };

  const applyJobMatchSuggestion = (suggestionId: string) => {
    if (!jobMatchReport) return;
    const suggestion = jobMatchReport.suggestions.find((item) => item.id === suggestionId);
    if (!suggestion) return;

    setCvData((current) => {
      if (suggestion.target === 'summary') {
        return {
          ...current,
          personalInfo: {
            ...current.personalInfo,
            summary: suggestion.suggestion,
          },
        };
      }

      if (suggestion.target === 'skills') {
        const skills = suggestion.suggestion
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item && !current.skills.some((skill) => skill.name.toLowerCase() === item.toLowerCase()))
          .map((name) => ({
            id: crypto.randomUUID(),
            name,
            level: 3,
          }));

        return {
          ...current,
          skills: [...current.skills, ...skills],
        };
      }

      return {
        ...current,
        experiences: current.experiences.map((experience) =>
          experience.id === suggestion.experienceId
            ? { ...experience, description: suggestion.suggestion }
            : experience,
        ),
      };
    });
    toast.success('Job match suggestion applied.');
  };

  const applyAiTailoredCvResult = (current: CVData, result: AiTailoredCvResult) => {
    if (!hasTailoringEvidence(current)) return current;

    const existingSkillNames = new Set(current.skills.map((skill) => skill.name.trim().toLowerCase()).filter(Boolean));
    const skillsToAdd = result.skillsToAdd
      .map((skill) => skill.trim())
      .filter((skill) => skill && !existingSkillNames.has(skill.toLowerCase()))
      .map((name) => ({
        id: crypto.randomUUID(),
        name,
        level: 3,
      }));
    const rewritesById = new Map(
      result.experienceRewrites
        .filter((item) => item.experienceId && item.description.trim())
        .map((item) => [item.experienceId, item.description.trim()]),
    );
    const summary = result.summary.trim();

    return {
      ...current,
      personalInfo: {
        ...current.personalInfo,
        title: result.role.trim() || current.personalInfo.title,
        summary: summary || current.personalInfo.summary,
      },
      skills: [...current.skills, ...skillsToAdd],
      experiences: current.experiences.map((experience) =>
        rewritesById.has(experience.id)
          ? { ...experience, description: rewritesById.get(experience.id) || experience.description }
          : experience,
      ),
    };
  };

  const createTailoredCvVersion = async () => {
    const baselineReport = jobMatchReport || localJobMatchReport;
    if (!baselineReport) {
      toast.error(t.pasteJobFirstError);
      return;
    }

    if (!hasTailoringEvidence(cvData)) {
      const note = t.notEnoughCvInfo;
      setTailoringNote(note);
      toast.message(note);
      return;
    }

    setTailoringLoading(true);
    setTailoringNote('');
    try {
      const response = await fetch('/api/ai-career-advisor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'tailored-cv',
          cvData,
          template,
          jobAd: activeJobAd,
          outputLanguage: uiLanguage,
          localJobMatch: baselineReport,
          localAtsCheck,
        }),
      });

      if (!response.ok) throw new Error((await response.json())?.error || 'AI tailoring is unavailable.');
      const data = (await response.json()) as AiTailoredCvResult;

      setSelectedCvId(null);
      setSelectedCvName(data.cvName || `${data.role || baselineReport.role} - ${data.company || baselineReport.company}`);
      setCvData((current) => applyAiTailoredCvResult(current, data));
      setAiJobAnalysis((current) => current ? {
        ...current,
        jobMatchReport: {
          ...current.jobMatchReport,
          score: data.matchScore,
          label: data.matchLabel,
          role: data.role || current.jobMatchReport.role,
          company: data.company || current.jobMatchReport.company,
        },
      } : current);
      setTailoringNote(`${data.dataUseNote} ${data.gapNote}`.trim());
      setStep(0);
      setScreen('editor');
      toast.success('AI tailored CV version created.');
      if (data.gapNote) toast.message(data.gapNote);
    } catch {
      setTailoringNote(t.localTailoredFallback);
      setScreen('matcher');
      toast.message(t.localTailoredFallback);
    } finally {
      setTailoringLoading(false);
    }
  };

  const createTailoredCvForApplication = async (application: Application) => {
    const jobAd = [
      application.title,
      `Company: ${application.company}`,
      `Location: ${application.location}`,
      application.reason || '',
      application.salary ? `Compensation or tag: ${application.salary}` : '',
    ].join('\n');
    const report = buildJobMatchReport(cvData, jobAd);

    setMatcherJobAd(jobAd);
    if (!hasTailoringEvidence(cvData)) {
      const note = t.notEnoughCvInfoTracker;
      setTailoringNote(note);
      setScreen('matcher');
      toast.message(note);
      return;
    }

    setTailoringLoading(true);
    setTailoringNote('');
    try {
      const response = await fetch('/api/ai-career-advisor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode: 'tailored-cv',
          cvData,
          template,
          jobAd,
          outputLanguage: uiLanguage,
          localJobMatch: report,
          localAtsCheck: buildAtsCheck(cvData, template, jobAd),
        }),
      });

      if (!response.ok) throw new Error((await response.json())?.error || 'AI tailoring is unavailable.');
      const data = (await response.json()) as AiTailoredCvResult;

      setSelectedCvId(null);
      setSelectedCvName(data.cvName || `${application.title} - ${application.company}`);
      setCvData((current) => applyAiTailoredCvResult(current, data));
      setTailoringNote(`${data.dataUseNote} ${data.gapNote}`.trim());
      setStep(0);
      setScreen('editor');
      toast.success('AI tailored CV version created from tracker item.');
      if (data.gapNote) toast.message(data.gapNote);
    } catch {
      setTailoringNote(t.localTailoredTrackerFallback);
      setScreen('matcher');
      toast.message(t.localTailoredTrackerFallback);
    } finally {
      setTailoringLoading(false);
    }
  };

  const generateApplicationText = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (writerJobAd.trim().length < 40) {
      if (!silent) toast.error(t.pasteLongerJobError);
      return;
    }

    setWriterLoading(true);
    setWriterError('');
    try {
      const payload = {
        cvProfile: buildCvProfileForAi(cvData),
        jobAd: writerJobAd,
        motivation: writerMotivation,
        tone: writerTone,
        language: writerLanguage,
      };

      const response = await fetch('/api/ai-application-writer', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error((await response.json())?.error || 'AI writer is not configured.');
      const data = await response.json();
      setWriterResult({
        coverLetter: data.coverLetter || '',
        motivation: data.motivation || '',
        email: data.email || '',
        notes: data.notes,
        source: 'openai',
      });
      if (!silent) toast.success('AI application text generated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : t.aiUnavailable;
      setWriterResult(null);
      setWriterError(message);
      if (!silent) toast.message(message);
    } finally {
      setWriterLoading(false);
    }
  }, [cvData, t, writerJobAd, writerLanguage, writerMotivation, writerTone]);

  useEffect(() => {
    if (screen !== 'writer' || writerLoading || writerJobAd.trim().length < 40) return;

    const autoKey = JSON.stringify({
      cvData,
      jobAd: writerJobAd.trim(),
      language: writerLanguage,
      motivation: writerMotivation.trim(),
      tone: writerTone,
    });
    if (writerAutoKeyRef.current === autoKey) return;

    const timeout = window.setTimeout(() => {
      writerAutoKeyRef.current = autoKey;
      generateApplicationText({ silent: true });
    }, 1400);

    return () => window.clearTimeout(timeout);
  }, [cvData, generateApplicationText, screen, writerJobAd, writerLanguage, writerLoading, writerMotivation, writerTone]);

  const copyApplicationText = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toast.success('Copied.');
  };

  const printApplicationText = () => {
    if (!writerResult) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked. Allow popups to export as PDF.');
      return;
    }

    const escaped = formatApplicationDraft(writerResult)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    printWindow.document.write(`
      <html>
        <head>
          <title>Application Text - ${getFullName(cvData)}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1f1d1b; margin: 36px; line-height: 1.55; }
            pre { white-space: pre-wrap; font: inherit; }
          </style>
        </head>
        <body><pre>${escaped}</pre></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const moveApplicationToStage = (id: string, stage: ApplicationStage) => {
    const application = applications.find((item) => item.id === id);
    if (!application || application.stage === stage) return;

    if (!isLoggedIn || application.isDemo) {
      setApplications((current) => current.map((item) => (item.id === id ? { ...item, stage } : item)));
      return;
    }

    stageUpdateMutation.mutate({ id, stage });
  };

  const setApplicationFollowUp = (id: string, followUpAt: string) => {
    const application = applications.find((item) => item.id === id);
    if (!application) return;
    const normalizedFollowUp = followUpAt || undefined;
    if (application.followUpAt === normalizedFollowUp) return;

    if (!isLoggedIn || application.isDemo) {
      setApplications((current) => current.map((item) => (item.id === id ? { ...item, followUpAt: normalizedFollowUp } : item)));
      toast.success(followUpAt ? 'Follow-up set locally.' : 'Follow-up cleared locally.');
      return;
    }

    followUpMutation.mutate({ id, followUpAt: followUpAt || null });
  };

  const advanceApplication = (id: string) => {
    const application = applications.find((item) => item.id === id);
    if (!application) return;

    if (!isLoggedIn) {
      requestLogin();
      return;
    }

    const stageIndex = stages.indexOf(application.stage);
    const nextStage = stages[(stageIndex + 1) % stages.length];

    if (application.isDemo) {
      setApplications((current) => current.map((item) => (item.id === id ? { ...item, stage: nextStage } : item)));
      return;
    }

    stageUpdateMutation.mutate({ id, stage: nextStage });
  };

  const handleApplicationDragStart = (event: React.DragEvent<HTMLElement>, id: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDraggedApplicationId(id);
  };

  const handleApplicationDragEnd = () => {
    setDraggedApplicationId(null);
    setDragOverStage(null);
  };

  const handleStageDragOver = (event: React.DragEvent<HTMLElement>, stage: ApplicationStage) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) setDragOverStage(stage);
  };

  const handleStageDrop = (event: React.DragEvent<HTMLElement>, stage: ApplicationStage) => {
    event.preventDefault();
    const applicationId = event.dataTransfer.getData('text/plain') || draggedApplicationId;
    setDraggedApplicationId(null);
    setDragOverStage(null);
    if (applicationId) moveApplicationToStage(applicationId, stage);
  };

  const createDraftApplication = async () => {
    if (!addUrl.trim()) return;
    setAddReading(true);
    try {
      const sourceApplication = await fetchArbeitnowJobFromUrl(addUrl.trim());
      setDraftApplication(sourceApplication || parseJobUrl(addUrl.trim(), profileCity || 'Remote'));
      setAddReadStatus(sourceApplication ? 'imported' : 'draft');
    } catch {
      setDraftApplication(parseJobUrl(addUrl.trim(), profileCity || 'Remote'));
      setAddReadStatus('draft');
    } finally {
      setAddReading(false);
    }
  };

  const saveDraftApplication = () => {
    if (!draftApplication) return;
    if (!isLoggedIn) {
      requestLogin();
      return;
    }

    applicationSaveMutation.mutate(draftApplication);
  };

  const openEditor = () => {
    setScreen('editor');
    setStep(0);
  };

  const startNewCv = () => {
    setSelectedCvId(null);
    setSelectedCvName(getCvName(emptyCVData));
    setCvData(emptyCVData);
    setTemplate('modern');
    openEditor();
  };

  const openSavedCv = (id: string) => {
    const cv = dashboardQuery.data?.cvs.find((item) => item.id === id);
    if (cv) {
      setSelectedCvId(cv.id);
      setSelectedCvName(cv.name);
      setCvData(cv.data);
      setTemplate(cv.templateId);
    }

    openEditor();
  };

  const openExportStep = () => {
    setScreen('editor');
    setStep(lastStep);
  };

  const renderAuthDialog = () => {
    if (!authOpen) return null;

    return (
      <div className="folio-dialog-backdrop">
        <form className="folio-dialog" onSubmit={handleAuthSubmit}>
          <div>
            <h2 className="font-display text-2xl font-normal">Sign in to save your work</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We will email you a secure sign-in link. No password needed.
            </p>
          </div>
          <Input
            type="email"
            placeholder="you@example.com"
            value={authEmail}
            onChange={(event) => setAuthEmail(event.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setAuthOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={authSubmitting || !authEmail.trim()}>
              {authSubmitting ? 'Sending...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const renderSettingsDialog = () => {
    if (!settingsOpen) return null;

    return (
      <div className="folio-dialog-backdrop">
        <div className="folio-dialog">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-normal">{t.settingsTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {uiLanguage === 'German'
                  ? 'Steuere Sprache, Profil und Support an einem Ort.'
                  : 'Manage language, profile, and support in one place.'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(false)}>
              {t.close}
            </Button>
          </div>

          <section className="field-card">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                <Globe2 size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="meta-label">{t.language}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`folio-chip ${uiLanguage === 'English' ? 'is-active' : ''}`}
                    onClick={() => updateUiLanguage('English')}
                  >
                    {t.english}
                  </button>
                  <button
                    type="button"
                    className={`folio-chip ${uiLanguage === 'German' ? 'is-active' : ''}`}
                    onClick={() => updateUiLanguage('German')}
                  >
                    {t.german}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="field-card">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--organic-accent-100)] text-[var(--organic-accent-800)]">
                <UserRound size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="meta-label">{t.profile}</p>
                <h3 className="mt-2 text-sm font-semibold">{displayName}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {isLoggedIn ? authDetailLabel : t.profileSignedOut}
                </p>
                {!isLoggedIn && (
                  <Button
                    className="mt-3"
                    size="sm"
                    onClick={() => {
                      setSettingsOpen(false);
                      requestLogin();
                    }}
                  >
                    {t.logIn}
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section className="field-card">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-card text-accent shadow-[inset_0_0_0_1px_var(--organic-divider)]">
                <Headphones size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="meta-label">{t.support}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.supportText}</p>
                <Button className="mt-3" size="sm" variant="outline" asChild>
                  <a href="mailto:support@foliocv.local?subject=Folio%20CV%20Support">support@foliocv.local</a>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderAppShell = () => {
    const openCount = applications.filter((application) => application.stage !== 'Closed').length;
    const followUpCount = applications.filter((application) => application.followUpAt).length;
    const stageColumns = stages.map((stage) => ({
      stage,
      items: filteredApplications.filter((application) => application.stage === stage),
    }));

    return (
      <>
      <div className="folio-app-shell">
        <aside className="folio-sidebar">
          <button className="flex items-center gap-3 px-2 font-display text-lg text-foreground" onClick={() => setScreen('landing')}>
            <span className="h-6 w-6 rounded-full bg-accent" />
            Folio CV
          </button>
          <nav className="space-y-1">
            {[
              { label: t.dashboard, target: 'dashboard' as AppScreen, active: screen === 'dashboard' },
              { label: t.cvSimulator, target: 'editor' as AppScreen, active: screen === 'editor' },
              { label: t.jobMatcher, target: 'matcher' as AppScreen, active: screen === 'matcher' },
              { label: t.jobTracker, target: 'tracker' as AppScreen, active: screen === 'tracker' },
              { label: t.aiWriter, target: 'writer' as AppScreen, active: screen === 'writer' },
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
            <Button variant="outline" className="w-full justify-start" onClick={() => setSettingsOpen(true)}>
              <Settings size={16} />
              {t.settings}
            </Button>
            <div className="rounded-[20px] bg-background p-4">
              <p className="font-display text-base">{authStatusLabel}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {isLoggedIn ? t.signedInDetail : t.guestDetail}
              </p>
            </div>
            <div className="flex items-center gap-3 px-1">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--organic-accent-2-300)] text-xs font-bold text-[var(--organic-accent-2-800)]">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{authDetailLabel}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={isLoggedIn ? handleLogout : requestLogin}
              disabled={authLoading}
            >
              {isLoggedIn ? t.logOut : t.logIn}
            </Button>
            <Button variant="ghost" className="justify-start px-2 text-accent" onClick={() => setScreen('landing')}>
              <ArrowLeft size={16} />
              {t.backToSite}
            </Button>
          </div>
        </aside>

        <main className="min-w-0 px-5 py-7 md:px-10 md:py-8">
          {screen === 'dashboard' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">Good afternoon, {displayName}.</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{openCount} applications still open · AI writer ready for tailored applications</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setScreen('tracker')}>Open tracker</Button>
                  <Button onClick={startNewCv}>New CV</Button>
                </div>
              </div>

              {!isLoggedIn && <div className="mt-6">
                <DemoNotice language={uiLanguage} />
              </div>}

              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['CVs', String(visibleDashboardCvs.length), 'one per role family'],
                  ['Applications', String(applications.length), 'across six stages'],
                  ['Interviews', String(applications.filter((item) => item.stage === 'Interview').length), 'currently active'],
                  ['Follow-ups', String(followUpCount), 'reminders scheduled'],
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
                    <Button variant="ghost" onClick={startNewCv}>+ New version</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {visibleDashboardCvs.map((cv) => (
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
                          <Button size="sm" variant="outline" onClick={() => openSavedCv(cv.id)}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={isLoggedIn ? saveCurrentCv : requestLogin}>
                            {isLoggedIn ? 'Save' : 'Login required'}
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-normal">AI writer</h2>
                    <span className="organic-tag organic-tag-accent-2">Job ad based</span>
                  </div>
                  <div className="organic-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                        <Wand2 size={18} />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">Create application text</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Paste a job ad and get a cover letter, motivation answer, and email from your CV.
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        ['Cover letter', 'Long-form application letter'],
                        ['Motivation', 'Short answer for forms'],
                        ['Email', 'Ready-to-send message'],
                      ].map(([label, note]) => (
                        <div key={label} className="flex items-center justify-between gap-3 border-t border-border/70 pt-3">
                          <span className="text-sm font-semibold">{label}</span>
                          <span className="text-xs text-muted-foreground">{note}</span>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-5 w-full" onClick={() => setScreen('writer')}>
                      Open AI writer
                    </Button>
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
                  <Button onClick={isLoggedIn ? () => setAddOpen(true) : requestLogin}>
                    {isLoggedIn ? 'Add application' : 'Login required'}
                  </Button>
                </div>
              </div>

              {!isLoggedIn && <div className="mt-6">
                <DemoNotice language={uiLanguage} />
              </div>}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Input className="max-w-60" placeholder="Role or company" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))} />
                <Input className="max-w-48" placeholder="Location" value={filters.location} onChange={(event) => setFilters((current) => ({ ...current, location: event.target.value }))} />
                <Input className="max-w-40" placeholder="Salary floor" value={filters.salary} onChange={(event) => setFilters((current) => ({ ...current, salary: event.target.value }))} />
                <span className="organic-tag border border-accent bg-transparent text-accent">Remote ok</span>
                <Button variant="ghost" onClick={() => setFilters({ role: '', location: '', salary: '' })}>Clear</Button>
              </div>

              {trackerView === 'kanban' ? (
                <div className="mt-7 grid gap-4 xl:grid-cols-6">
                  {stageColumns.map((column) => (
                    <section
                      key={column.stage}
                      className={`tracker-column rounded-[24px] bg-card p-3 shadow-[var(--organic-shadow-sm)] ${dragOverStage === column.stage ? 'is-drop-target' : ''}`}
                      aria-label={`${column.stage} drop zone`}
                      onDragOver={(event) => handleStageDragOver(event, column.stage)}
                      onDragLeave={() => setDragOverStage((current) => (current === column.stage ? null : current))}
                      onDrop={(event) => handleStageDrop(event, column.stage)}
                    >
                      <div className="mb-3 flex items-center justify-between px-1">
                        <h2 className="font-display text-base font-normal">{column.stage}</h2>
                        <span className="organic-tag">{column.items.length}</span>
                      </div>
                      <div className="space-y-3">
                        {column.items.map((job) => (
                          <article
                            key={job.id}
                            className={`tracker-card rounded-[18px] bg-background p-4 shadow-[var(--organic-shadow-sm)] ${draggedApplicationId === job.id ? 'is-dragging' : ''}`}
                            draggable
                            onDragStart={(event) => handleApplicationDragStart(event, job.id)}
                            onDragEnd={handleApplicationDragEnd}
                          >
                            <h3 className="text-sm font-semibold leading-tight">{job.title}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{job.company} · {job.location}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span className="organic-tag organic-tag-accent-2">{job.score}</span>
                              <span className="text-xs text-muted-foreground">{job.when}</span>
                            </div>
                            <label className="mt-3 block rounded-[14px] bg-card/70 px-3 py-2">
                              <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                <CalendarClock size={12} />
                                {formatFollowUpLabel(job.followUpAt)}
                              </span>
                              <Input
                                type="date"
                                value={job.followUpAt || ''}
                                onInput={(event) => setApplicationFollowUp(job.id, event.currentTarget.value)}
                                onChange={(event) => setApplicationFollowUp(job.id, event.target.value)}
                                className="mt-1 h-8 bg-background/70 text-xs"
                                disabled={followUpMutation.isPending}
                              />
                            </label>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {job.sourceUrl && (
                                <Button variant="ghost" size="sm" className="justify-start px-0" asChild>
                                  <a href={job.sourceUrl} target="_blank" rel="noreferrer">
                                    Open job
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start px-0"
                                onClick={() => advanceApplication(job.id)}
                                disabled={stageUpdateMutation.isPending}
                              >
                                {isLoggedIn ? nextStageLabel[job.stage] : 'Login required'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="justify-start px-0"
                                onClick={() => createTailoredCvForApplication(job)}
                                disabled={tailoringLoading}
                              >
                                {tailoringLoading ? 'AI tailoring...' : 'Tailor CV'}
                              </Button>
                            </div>
                          </article>
                        ))}
                      </div>
                      {column.items.length === 0 && (
                        <div className="tracker-drop-empty mt-3">
                          Drop job here
                        </div>
                      )}
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
                        <th>Follow-up</th>
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
                          <td>
                            <div className="min-w-36">
                              <span className="text-xs text-muted-foreground">{formatFollowUpLabel(job.followUpAt)}</span>
                              <Input
                                type="date"
                                value={job.followUpAt || ''}
                                onInput={(event) => setApplicationFollowUp(job.id, event.currentTarget.value)}
                                onChange={(event) => setApplicationFollowUp(job.id, event.target.value)}
                                className="mt-1 h-8 text-xs"
                                disabled={followUpMutation.isPending}
                              />
                            </div>
                          </td>
                          <td className="text-muted-foreground">{job.when}</td>
                          <td>
                            {job.sourceUrl && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={job.sourceUrl} target="_blank" rel="noreferrer">
                                  Open
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => advanceApplication(job.id)} disabled={stageUpdateMutation.isPending}>
                              {isLoggedIn ? nextStageLabel[job.stage] : 'Login required'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => createTailoredCvForApplication(job)} disabled={tailoringLoading}>
                              {tailoringLoading ? 'AI tailoring...' : 'Tailor CV'}
                            </Button>
                          </td>
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
                        Paste a job link, then check the draft before saving it to the tracker.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input placeholder="https://jobs.example.com/operations-manager" value={addUrl} onChange={(event) => setAddUrl(event.target.value)} />
                      <Button className="shrink-0" onClick={createDraftApplication} disabled={addReading}>
                        {addReading ? 'Checking...' : 'Create draft'}
                      </Button>
                    </div>
                    {draftApplication && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`organic-tag ${addReadStatus === 'imported' ? 'organic-tag-accent-2' : 'organic-tag-accent'}`}>
                            {addReadStatus === 'imported' ? 'Imported' : 'Draft from link'}
                          </span>
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
                        <label className="field-card block space-y-1.5">
                          <span className="text-xs text-muted-foreground">Follow-up reminder</span>
                          <Input
                            type="date"
                            value={draftApplication.followUpAt || ''}
                            onChange={(event) => setDraftApplication((current) => current ? { ...current, followUpAt: event.target.value || undefined } : current)}
                          />
                        </label>
                        <div className="flex items-center gap-3 rounded-[18px] bg-background p-4 text-sm">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-xs font-bold text-[var(--organic-accent-2-800)]">
                            {draftApplication.score}
                          </span>
                          Match against <strong>{visibleDashboardCvs[0]?.name || selectedCvName}</strong> - {draftApplication.reason}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                      <Button disabled={!draftApplication || applicationSaveMutation.isPending} onClick={saveDraftApplication}>
                        {applicationSaveMutation.isPending ? 'Saving...' : 'Save to Saved'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {screen === 'matcher' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">{t.matcherTitle}</h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {t.matcherDescription}
                  </p>
                  {activeJobAd.length >= 40 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`organic-tag ${aiJobAnalysis ? 'organic-tag-accent-2' : ''}`}>
                        {jobAnalysisSourceLabel}
                      </span>
                      {aiJobAnalysisError && (
                        <span className="text-xs text-muted-foreground">{t.openAiUnavailableLocal}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={openEditor}>{t.backToCv}</Button>
                  <Button onClick={createTailoredCvVersion} disabled={activeJobAd.length < 40 || tailoringLoading}>
                    <Target size={16} />
                    {tailoringLoading ? t.creatingWithAi : t.createAiTailoredVersion}
                  </Button>
                </div>
              </div>
              {tailoringNote && (
                <div className="mt-4 rounded-[18px] bg-card px-4 py-3 text-sm leading-6 text-muted-foreground shadow-[var(--organic-shadow-sm)]">
                  {tailoringNote}
                </div>
              )}

              <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]">
                <aside className="space-y-4 xl:sticky xl:top-8 xl:self-start">
                  <article className="organic-card p-5">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                        <SearchCheck size={18} />
                      </span>
                      <div>
                        <p className="section-kicker">{t.input}</p>
                        <h2 className="font-display text-2xl font-normal">{t.pastePosting}</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {t.pastePostingHelp}
                        </p>
                      </div>
                    </div>
                    <label className="mt-5 block space-y-1.5">
                      <span className="meta-label">{t.jobAd}</span>
                      <Textarea
                        value={matcherJobAd}
                        onChange={(event) => setMatcherJobAd(event.target.value)}
                        placeholder={t.jobAdPlaceholder}
                        rows={16}
                      />
                    </label>
                  </article>

                  <article className="organic-card p-5">
                    <p className="section-kicker">{t.currentCv}</p>
                    <h2 className="mt-2 font-display text-2xl font-normal">{selectedCvName}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {t.currentCvHelp}
                    </p>
                    <Button variant="outline" className="mt-4 w-full" onClick={openEditor}>
                      {t.editCv}
                    </Button>
                  </article>
                </aside>

                <div className="space-y-5">
                  {jobMatchReport && atsCheck ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <article className="organic-card p-5">
                          <p className="section-kicker">{t.matchScore}</p>
                          <p className="mt-3 font-display text-5xl leading-none">{jobMatchReport.score}%</p>
                          <p className="mt-2 text-sm text-muted-foreground">{jobMatchReport.label}</p>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">
                            {t.aiEstimate}
                          </p>
                        </article>
                        <article className="organic-card p-5">
                          <p className="section-kicker">{t.atsCheck}</p>
                          <p className="mt-3 font-display text-5xl leading-none">{atsCheck.score}%</p>
                          <p className="mt-2 text-sm text-muted-foreground">{atsCheck.label}</p>
                        </article>
                        <article className="organic-card p-5">
                          <p className="section-kicker">{t.target}</p>
                          <p className="mt-3 text-lg font-semibold leading-tight">{jobMatchReport.role}</p>
                          <p className="mt-2 text-sm text-muted-foreground">{jobMatchReport.company}</p>
                        </article>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
                        <article className="organic-card p-5">
                          <h2 className="font-display text-2xl font-normal">{t.keywordCoverage}</h2>
                          <div className="mt-5 space-y-5">
                            <div>
                              <h3 className="text-sm font-semibold">{t.matched}</h3>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {jobMatchReport.matchedKeywords.length ? jobMatchReport.matchedKeywords.map((keyword) => (
                                  <span key={keyword} className="organic-tag organic-tag-accent-2">{keyword}</span>
                                )) : <p className="text-sm text-muted-foreground">{t.noKeywordOverlap}</p>}
                              </div>
                            </div>
                            <div className="border-t border-border/70 pt-4">
                              <h3 className="text-sm font-semibold">{t.missing}</h3>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {jobMatchReport.missingKeywords.length ? jobMatchReport.missingKeywords.map((keyword) => (
                                  <span key={keyword} className="organic-tag organic-tag-accent">{keyword}</span>
                                )) : <p className="text-sm text-muted-foreground">{t.noMissingKeywords}</p>}
                              </div>
                            </div>
                          </div>
                        </article>

                        <article className="organic-card p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="section-kicker">{t.suggestions}</p>
                              <h2 className="font-display text-2xl font-normal">{t.applySelectively}</h2>
                            </div>
                            <span className="organic-tag organic-tag-accent-2">{jobMatchReport.suggestions.length} {t.changes}</span>
                          </div>
                          <div className="mt-5 space-y-3">
                            {jobMatchReport.suggestions.map((suggestion) => (
                              <div key={suggestion.id} className="ai-suggestion">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <span className="organic-tag organic-tag-accent">{suggestion.label}</span>
                                    <h3 className="mt-2 text-sm font-semibold">{suggestion.issue}</h3>
                                  </div>
                                  <Button size="sm" onClick={() => applyJobMatchSuggestion(suggestion.id)}>
                                    {t.apply}
                                  </Button>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-foreground">{suggestion.suggestion}</p>
                              </div>
                            ))}
                          </div>
                        </article>
                      </div>

                      <div className="grid gap-5 xl:grid-cols-2">
                        <article className="organic-card p-5">
                          <div className="flex items-center gap-2">
                            <FileSearch size={16} className="text-accent" />
                            <h2 className="font-display text-2xl font-normal">{t.atsChecklist}</h2>
                          </div>
                          <div className="mt-4 divide-y divide-border/70">
                            {atsCheck.checks.map((check) => (
                              <div key={check.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                                <span className={`organic-tag shrink-0 ${check.status === 'Pass' ? 'organic-tag-accent-2' : check.status === 'Fix' ? 'organic-tag-accent' : ''}`}>
                                  {check.status}
                                </span>
                                <div>
                                  <p className="text-sm font-semibold">{check.title}</p>
                                  <p className="text-sm leading-6 text-muted-foreground">{check.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </article>

                        <article className="organic-card p-5">
                          <div className="flex items-center gap-2">
                            <MessageSquareText size={16} className="text-accent" />
                            <h2 className="font-display text-2xl font-normal">{t.interviewPrep}</h2>
                          </div>
                          {interviewPrep ? (
                            <div className="mt-4 space-y-3">
                              {interviewPrep.questions.map((item) => (
                                <div key={item.question} className="border-t border-border/70 pt-3 first:border-t-0 first:pt-0">
                                  <p className="text-sm font-semibold">{item.question}</p>
                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.answerAngle}</p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </article>
                      </div>
                    </>
                  ) : activeJobAd.length >= 40 ? (
                    <div className="empty-state min-h-[420px]">
                      <p className="text-sm font-semibold text-foreground">
                        {aiJobAnalysisError ? t.aiUnavailable : t.aiWorking}
                      </p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {aiJobAnalysisError ? t.openAiUnavailableLocal : t.aiMatcherWorking}
                      </p>
                    </div>
                  ) : (
                    <div className="empty-state flex min-h-[420px] flex-col items-center justify-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                        <FileSearch size={22} />
                      </span>
                      <p className="mt-4 text-sm font-semibold text-foreground">{t.pasteJobToStart}</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {t.matcherEmptyHelp}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {screen === 'writer' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">{t.writerTitle}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.writerDescription}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={openEditor}>{t.editCv}</Button>
                  <Button onClick={() => generateApplicationText()} disabled={writerLoading || writerJobAd.trim().length < 40}>
                    <Wand2 size={16} />
                    {writerLoading ? t.writing : writerResult ? t.regenerate : t.writeNow}
                  </Button>
                </div>
              </div>

              {!isLoggedIn && <div className="mt-6">
                <DemoNotice language={uiLanguage} />
              </div>}

              <div className="mt-7 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <article className="organic-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                        <Mail size={18} />
                      </span>
                      <div>
                        <p className="section-kicker">{t.input}</p>
                        <h2 className="font-display text-2xl font-normal">{t.jobAdAndNotes}</h2>
                      </div>
                    </div>
                    <div className="mt-5 space-y-4">
                      <label className="field-card block space-y-1.5">
                        <span className="meta-label">{t.jobAd}</span>
                        <Textarea
                          value={writerJobAd}
                          onChange={(event) => setWriterJobAd(event.target.value)}
                          placeholder={t.writerJobPlaceholder}
                          rows={9}
                        />
                      </label>
                      <label className="field-card block space-y-1.5">
                        <span className="meta-label">{t.yourMotivation}</span>
                        <Textarea
                          value={writerMotivation}
                          onChange={(event) => setWriterMotivation(event.target.value)}
                          placeholder={t.motivationPlaceholder}
                          rows={4}
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="field-card">
                          <p className="meta-label">{t.tone}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(['Professional', 'Warm', 'Direct'] as WriterTone[]).map((tone) => (
                              <button
                                key={tone}
                                className={`folio-chip ${writerTone === tone ? 'is-active' : ''}`}
                                onClick={() => setWriterTone(tone)}
                              >
                                {tone}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="field-card">
                          <p className="meta-label">{t.outputLanguage}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(['English', 'German'] as WriterLanguage[]).map((language) => (
                              <button
                                key={language}
                                className={`folio-chip ${writerLanguage === language ? 'is-active' : ''}`}
                                onClick={() => setWriterLanguage(language)}
                              >
                                {language === 'German' ? t.german : t.english}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="organic-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[var(--organic-accent-100)] text-[var(--organic-accent-800)]">
                        <MessageSquareText size={18} />
                      </span>
                      <div>
                        <p className="section-kicker">{t.interviewPrep}</p>
                        <h2 className="font-display text-2xl font-normal">{t.questionAngles}</h2>
                      </div>
                      {activeJobAd.length >= 40 && (
                        <span className={`organic-tag ml-auto ${aiJobAnalysis ? 'organic-tag-accent-2' : ''}`}>
                          {jobAnalysisSourceLabel}
                        </span>
                      )}
                    </div>
                    {interviewPrep ? (
                      <div className="mt-5 space-y-3">
                        {interviewPrep.questions.map((item) => (
                          <div key={item.question} className="writer-output-section">
                            <p className="text-sm font-semibold">{item.question}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answerAngle}</p>
                          </div>
                        ))}
                      </div>
                    ) : activeJobAd.length >= 40 ? (
                      <div className="empty-state mt-5">
                        <p className="text-sm font-semibold text-foreground">
                          {aiJobAnalysisError ? t.aiUnavailable : t.aiWorking}
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                          {aiJobAnalysisError ? t.openAiUnavailablePrep : t.aiMatcherWorking}
                        </p>
                      </div>
                    ) : (
                      <div className="empty-state mt-5">
                        <p className="text-sm font-semibold text-foreground">{t.noInterviewPrep}</p>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                          {t.noInterviewPrepHelp}
                        </p>
                      </div>
                    )}
                  </article>
                </div>

                <article className="organic-card p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="section-kicker">{t.output}</p>
                      <h2 className="font-display text-2xl font-normal">{t.applicationPackage}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {writerResult ? t.generatedWithOpenAi : writerLoading ? t.aiWriterWorking : writerError ? t.aiUnavailable : t.autoWriterHint}
                      </p>
                      {writerError && (
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{writerError}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={!writerResult}
                        onClick={() => writerResult && copyApplicationText(formatApplicationDraft(writerResult))}
                      >
                        <Copy size={16} />
                        {t.copyAll}
                      </Button>
                      <Button variant="outline" disabled={!writerResult} onClick={printApplicationText}>
                        <Printer size={16} />
                        {t.pdf}
                      </Button>
                    </div>
                  </div>

                  {writerResult ? (
                    <div className="mt-5 space-y-4">
                      {[
                        [t.coverLetter, writerResult.coverLetter],
                        [t.motivation, writerResult.motivation],
                        [t.email, writerResult.email],
                      ].map(([label, value]) => (
                        <section key={label} className="writer-output-section">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold">{label}</h3>
                            <Button size="sm" variant="ghost" onClick={() => copyApplicationText(value)}>
                              <Copy size={14} />
                              {t.copy}
                            </Button>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">{value}</p>
                        </section>
                      ))}
                      {writerResult.notes && (
                        <p className="rounded-[18px] bg-background/55 px-4 py-3 text-xs leading-5 text-muted-foreground">
                          {writerResult.notes}
                        </p>
                      )}
                    </div>
                  ) : writerLoading ? (
                    <div className="empty-state mt-5">
                      <p className="text-sm font-semibold text-foreground">{t.aiWorking}</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {t.aiWriterWorking}
                      </p>
                    </div>
                  ) : writerError ? (
                    <div className="empty-state mt-5">
                      <p className="text-sm font-semibold text-foreground">{t.aiUnavailable}</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {writerError}
                      </p>
                    </div>
                  ) : (
                    <div className="empty-state mt-5 flex min-h-[360px] flex-col items-center justify-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                        <Sparkles size={22} />
                      </span>
                      <p className="mt-4 text-sm font-semibold text-foreground">{t.noApplicationText}</p>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                        {t.noApplicationTextHelp}
                      </p>
                    </div>
                  )}
                </article>
              </div>
            </section>
          )}

          {screen === 'editor' && (
            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h1 className="font-display text-4xl font-normal">{t.editorTitle}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">{t.editorDescription}</p>
                  {tailoringNote && (
                    <p className="mt-3 max-w-3xl rounded-[18px] bg-card px-4 py-3 text-sm leading-6 text-muted-foreground shadow-[var(--organic-shadow-sm)]">
                      {tailoringNote}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setScreen('matcher')}>
                    <SearchCheck size={16} />
                    {t.jobMatcher}
                  </Button>
                  <Button variant="outline" onClick={() => setReviewOpen((current) => !current)}>
                    {reviewOpen ? t.hideAiJudge : t.aiJudge}
                  </Button>
                  <Button variant="outline" onClick={saveCurrentCv} disabled={saveCvMutation.isPending}>
                    {saveCvMutation.isPending ? (uiLanguage === 'German' ? 'Speichert...' : 'Saving...') : isLoggedIn ? t.saveCv : t.loginToSave}
                  </Button>
                  <Button onClick={openExportStep}>{t.exportPdf}</Button>
                </div>
              </div>

              <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
                <div className="min-w-0 space-y-5">
                  {reviewOpen && cvReview ? (
                    <article className="organic-card p-5">
                      <div className="flex items-center gap-4">
                        <span
                          className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full"
                          style={{ background: `conic-gradient(var(--organic-accent-2) ${cvReview.score}%, var(--organic-neutral-300) 0)` }}
                        >
                          <span className="grid h-[58px] w-[58px] place-items-center rounded-full bg-card font-display text-lg">{cvReview.score}</span>
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-xl font-normal">{cvReview.label}</h2>
                            <span className={`organic-tag ${aiCvReview ? 'organic-tag-accent-2' : ''}`}>
                              {cvReviewSourceLabel}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{cvReview.summary}</p>
                          {aiCvReviewError && (
                          <p className="mt-1 text-xs text-muted-foreground">{t.openAiUnavailableReview}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[22px] bg-background/55 p-4 shadow-[inset_0_0_0_1px_var(--organic-divider)]">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="section-kicker">{t.aiJudge}</p>
                            <h3 className="font-display text-xl font-normal">{t.textSuggestions}</h3>
                          </div>
                          <span className="organic-tag organic-tag-accent-2">{cvReview.suggestions.length} {t.rewrites}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                          {cvReview.suggestions.length ? cvReview.suggestions.map((suggestion) => (
                            <div key={suggestion.id} className="ai-suggestion">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <span className="organic-tag organic-tag-accent">{suggestion.label}</span>
                                  <h4 className="mt-2 text-sm font-semibold">{suggestion.issue}</h4>
                                </div>
                                <Button size="sm" onClick={() => applyCvSuggestion(suggestion)}>
                                  {t.replace}
                                </Button>
                              </div>
                              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                                <div>
                                  <p className="meta-label">{t.current}</p>
                                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{suggestion.current}</p>
                                </div>
                                <div>
                                  <p className="meta-label">{t.suggested}</p>
                                  <p className="mt-1 text-sm leading-6 text-foreground">{suggestion.suggestion}</p>
                                </div>
                              </div>
                            </div>
                          )) : (
                            <div className="empty-state">
                              <p className="text-sm font-semibold text-foreground">{t.noRewriteNeeded}</p>
                              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                                {t.noRewriteNeededHelp}
                              </p>
                            </div>
                          )}
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
                  ) : reviewOpen ? (
                    <article className="organic-card p-5">
                      <div className="flex items-start gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--organic-accent-2-200)] text-[var(--organic-accent-2-800)]">
                          <Sparkles size={18} />
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-xl font-normal">
                              {!hasMeaningfulCvContent(cvData) ? t.cvContentNeeded : aiCvReviewError ? t.aiUnavailable : t.aiWorking}
                            </h2>
                            {hasMeaningfulCvContent(cvData) && (
                              <span className="organic-tag">{cvReviewSourceLabel}</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {!hasMeaningfulCvContent(cvData)
                              ? t.cvContentNeededHelp
                              : aiCvReviewError
                                ? t.openAiUnavailableReview
                                : t.aiJudgeWorking}
                          </p>
                        </div>
                      </div>
                    </article>
                  ) : null}

                  <article className="organic-card p-5">
                    <p className="section-kicker">{t.format}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {dbTemplateOptions.map((item) => (
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
                          <p className="section-kicker">{t.step} {step + 1} / {TOTAL_STEPS}</p>
                          <h2 className="mt-2 font-display text-3xl font-normal text-foreground">{localizedStepTitles[step]}</h2>
                          <p className="mt-1.5 text-sm text-muted-foreground">{localizedStepDescriptions[step]}</p>
                        </div>
                        <div className="rounded-full bg-[var(--organic-accent-100)] px-4 py-2 text-right text-[var(--organic-accent-800)]">
                          <p className="font-mono text-[10px] uppercase tracking-[0.08em] opacity-70">{t.step}</p>
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
                        {step === 5 && <AdditionalSectionsForm data={cvData.additionalSections || []} onChange={(d) => setCvData({ ...cvData, additionalSections: d })} />}
                        {step === 6 && (
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
                        <ArrowLeft size={16} className="mr-1.5" /> {t.back}
                      </Button>
                      {step < lastStep && (
                        <Button onClick={next}>
                          {t.next} <ArrowRight size={16} className="ml-1.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="min-w-0 xl:sticky xl:top-8 xl:self-start">
                  <CVPreviewCanvas
                    data={cvData}
                    template={template}
                    eyebrow={t.livePreview}
                    title={`${template} ${t.template}`}
                    maxHeightClassName="max-h-[calc(100vh-7rem)]"
                    scaleClassName="scale-[0.38] sm:scale-[0.48] lg:scale-[0.54] xl:scale-[0.48] 2xl:scale-[0.58]"
                  />
                </aside>
              </div>
            </section>
          )}
        </main>
      </div>
      {renderAuthDialog()}
      {renderSettingsDialog()}
      </>
    );
  };

  if (screen !== 'landing') return renderAppShell();

  return (
    <>
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
            <Button size="sm" variant="outline" className="hidden sm:inline-flex" onClick={isLoggedIn ? () => setScreen('dashboard') : requestLogin}>
              {isLoggedIn ? 'Dashboard' : 'Log in'}
            </Button>
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
                    <p className="font-display text-3xl leading-none">
                      {`${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`.trim() || 'Mara Ellison'}
                    </p>
                    <p className="mt-2 text-sm text-[var(--organic-accent-700)]">
                      {cvData.personalInfo.title.trim() || 'Operations Lead'} · {profileCity || 'Your city'}
                    </p>
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

        <section id="writer" className="organic-container grid gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-20">
          <div>
            <span className="organic-tag organic-tag-accent">AI application writer</span>
            <h2 className="mt-4 max-w-[14em] font-display text-4xl font-normal leading-[1.08] md:text-5xl">
              Cover letter, motivation, and email from one job ad.
            </h2>
            <p className="mt-5 max-w-[34em] text-base leading-8 text-foreground/80">
              Paste the job description, add your motivation, and generate application text from the CV you already built.
            </p>
            <Button className="mt-6" onClick={() => setScreen('writer')}>Open AI writer</Button>
          </div>
          <div className="organic-card p-6">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="organic-tag">{profileRole}</span>
              <span className="organic-tag">Job ad input</span>
              <span className="organic-tag border border-accent bg-transparent text-accent">Copy or PDF</span>
            </div>
            {[
              ['Cover letter', 'Formal letter tailored to the role and CV profile.'],
              ['Motivation', 'Short answer for forms asking why this company or role.'],
              ['Email', 'Compact application email ready to copy.'],
            ].map(([label, body]) => (
              <article key={label} className="border-t border-border/70 py-4">
                <h3 className="text-sm font-semibold">{label}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
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
          <div className="mt-8 grid gap-3 lg:grid-cols-6">
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
                <p className="mt-3 text-sm leading-7 text-[var(--organic-neutral-300)]">The product shell around saved CVs, AI writing, and the application tracker.</p>
                <div className="mt-5 flex flex-col gap-2 text-sm">
                  <span>Saved CV versions</span>
                  <span>AI cover letter writer</span>
                  <span>Application board and table</span>
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
              <a href="#writer" className="text-muted-foreground transition-colors hover:text-accent">AI writer</a>
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
    {renderAuthDialog()}
    {renderSettingsDialog()}
    </>
  );
};

export default Index;
