import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowUp, ArrowUpRight, AtSign, Check, MousePointer2, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EASE = [0.16, 1, 0.3, 1] as const;

type Segment = { text: string; italic?: boolean };

/** Headline that blurs in word by word. */
export const BlurWords = ({
  segments,
  className,
  delay = 0,
  breakAfter,
}: {
  segments: Segment[];
  className?: string;
  delay?: number;
  /** Word index after which the line breaks on larger screens. */
  breakAfter?: number;
}) => {
  const reduce = useReducedMotion();
  const words = segments.flatMap((segment) =>
    segment.text.split(' ').filter(Boolean).map((word) => ({ word, italic: segment.italic })),
  );
  const label = segments.map((segment) => segment.text).join(' ').replace(/\s+/g, ' ').trim();

  return (
    <h1 className={className} aria-label={label}>
      {words.map(({ word, italic }, index) => (
        <span key={`${word}-${index}`} aria-hidden="true">
          <motion.span
            className={`inline-block ${italic ? 'italic' : ''}`}
            initial={reduce ? false : { opacity: 0, y: '0.28em', filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.95, delay: delay + index * 0.075, ease: EASE }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? ' ' : null}
          {index === breakAfter ? <br className="hidden sm:inline" /> : null}
        </span>
      ))}
    </h1>
  );
};

const SCRIPT = [
  { prompt: 'Tailor my CV for the Senior Ops Lead role at Nordline', reply: '3 bullets rewritten · match 64% → 86%' },
  { prompt: 'Draft a cover letter from this job ad', reply: 'Cover letter ready · 240 words, formal tone' },
  { prompt: 'Is my CV safe for ATS parsers?', reply: 'Passes 11 of 12 checks · add “S&OP” as a keyword' },
];

type Phase = 'typing' | 'aiming' | 'sent' | 'reply';

/** Drives the self-typing composer: type prompt, move cursor to send, show reply, next prompt. */
const useComposerScript = (active: boolean, reduce: boolean) => {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState(reduce ? SCRIPT[0].prompt : '');
  const [phase, setPhase] = useState<Phase>(reduce ? 'reply' : 'typing');
  const [sentCount, setSentCount] = useState(reduce ? 1 : 0);

  useEffect(() => {
    if (!active || reduce) return;
    const { prompt } = SCRIPT[step];
    const timers: number[] = [];
    const at = (ms: number, run: () => void) => timers.push(window.setTimeout(run, ms));
    const start = step === 0 ? 1600 : 500;

    setPhase('typing');
    setTyped('');
    for (let index = 1; index <= prompt.length; index += 1) {
      at(start + index * 38, () => setTyped(prompt.slice(0, index)));
    }
    const typedAt = start + prompt.length * 38;
    at(typedAt + 300, () => setPhase('aiming'));
    at(typedAt + 1150, () => {
      setPhase('sent');
      setSentCount((count) => count + 1);
    });
    at(typedAt + 1450, () => setPhase('reply'));
    at(typedAt + 5400, () => setStep((current) => (current + 1) % SCRIPT.length));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [active, reduce, step]);

  return { step, typed, phase, sentCount };
};

type Drift = { x: MotionValue<number>; y: MotionValue<number>; opacity: MotionValue<number> };

const FloatingCard = ({
  children,
  className,
  delay,
  drift,
  floatDelay,
}: {
  children: ReactNode;
  className: string;
  delay: number;
  drift?: Drift;
  floatDelay: string;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div className={`absolute z-10 hidden xl:block ${className}`} style={drift} aria-hidden="true">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        <div className="animate-float" style={{ animationDelay: floatDelay }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

const JobMatchCard = ({ score }: { score: MotionValue<string> }) => (
  <div className="organic-artifact w-[232px] px-5 py-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-[13px] text-muted-foreground">Job match</p>
      <span className="organic-tag organic-tag-accent">Nordline</span>
    </div>
    <motion.p className="mt-1 text-[26px] font-medium tracking-[-0.02em]">{score}</motion.p>
    <p className="text-[13px] text-muted-foreground">
      <span className="text-[var(--organic-accent-2-700)]">↑ 22 pts</span> vs. base CV
    </p>
    <svg viewBox="0 0 190 44" className="mt-3 h-11 w-full" fill="none">
      <motion.path
        d="M2 38 C 28 36, 40 28, 60 30 S 96 16, 118 18 S 152 8, 188 5"
        stroke="var(--organic-accent-800)"
        strokeWidth={1.75}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, delay: 1.1, ease: EASE }}
      />
    </svg>
  </div>
);

const AtsRingCard = () => (
  <div className="organic-artifact w-[220px] px-5 py-4">
    <p className="text-[13px] text-muted-foreground">ATS check</p>
    <div className="mt-3 flex items-center gap-4">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r="27" stroke="var(--organic-neutral-200)" strokeWidth="5" fill="none" />
        <motion.circle
          cx="32"
          cy="32"
          r="27"
          stroke="var(--organic-accent-800)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 0.92 }}
          transition={{ duration: 1.8, delay: 1.2, ease: EASE }}
        />
      </svg>
      <div>
        <p className="text-[24px] font-medium leading-none tracking-[-0.02em]">92</p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">Ready to send</p>
      </div>
    </div>
  </div>
);

const trackerBars = [
  { label: 'Saved', value: 0.55 },
  { label: 'Applied', value: 0.92 },
  { label: 'Interview', value: 0.48 },
  { label: 'Offer', value: 0.2 },
];

const TrackerCard = () => (
  <div className="organic-artifact w-[244px] px-5 py-4">
    <div className="flex items-baseline justify-between">
      <p className="text-[13px] text-muted-foreground">Applications</p>
      <p className="text-[12px] text-[var(--organic-neutral-500)]">this month</p>
    </div>
    <p className="mt-1 text-[26px] font-medium tracking-[-0.02em]">14</p>
    <div className="mt-3 flex h-16 items-end gap-2">
      {trackerBars.map((bar, index) => (
        <div key={bar.label} className="flex h-full flex-1 items-end">
          <motion.div
            className={`w-full origin-bottom rounded-md ${index === 2 ? 'bg-[var(--organic-accent-200)]' : 'bg-[var(--organic-neutral-300)]'}`}
            style={{ height: `${bar.value * 100}%` }}
            initial={{ scaleY: 0.3, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.25 + index * 0.08, ease: EASE }}
          />
        </div>
      ))}
    </div>
    <div className="mt-1.5 flex gap-2 text-[11px] text-[var(--organic-neutral-500)]">
      {trackerBars.map((bar) => (
        <span key={bar.label} className="flex-1 truncate text-center">{bar.label}</span>
      ))}
    </div>
  </div>
);

const layoutNames = ['Modern', 'Classic', 'Executive', 'Atlas', 'Mono'];

const LayoutCard = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % layoutNames.length), 2200);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <div className="organic-artifact w-[236px] px-5 py-4">
      <p className="text-[13px] text-muted-foreground">Layout</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {layoutNames.map((name, index) => (
          <span key={name} className="relative rounded-full px-2.5 py-1 text-[12px]">
            {index === active && (
              <motion.span
                layoutId="hero-layout-pill"
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ duration: 0.5, ease: EASE }}
              />
            )}
            <span className={`relative transition-colors duration-300 ${index === active ? 'text-background' : 'text-foreground'}`}>{name}</span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">Same content, new look.</p>
    </div>
  );
};

const Composer = ({ typed, phase, reply }: { typed: string; phase: Phase; reply: string }) => {
  const reduce = useReducedMotion();
  const aimed = phase !== 'typing';

  return (
    <div className="relative mx-auto w-full max-w-[480px]" aria-hidden="true">
      <div className="organic-artifact rounded-2xl p-4 text-left">
        <p className="min-h-[24px] text-[16px] leading-6 text-foreground">
          {typed || <span className="text-[var(--organic-neutral-400)]">Ask Folio to tailor your CV…</span>}
          {phase === 'typing' && typed && <span className="ml-0.5 inline-block h-[1.05em] w-[1.5px] translate-y-[3px] animate-caret bg-foreground" />}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[var(--organic-neutral-400)]">
            <AtSign size={16} />
            <Paperclip size={16} />
          </div>
          <motion.span
            className={`grid h-8 w-8 place-items-center rounded-full text-background transition-colors duration-300 ${typed ? 'bg-foreground' : 'bg-[var(--organic-neutral-300)]'}`}
            animate={{ scale: phase === 'sent' ? 0.84 : 1 }}
            transition={{ duration: 0.18 }}
          >
            <ArrowUp size={16} />
          </motion.span>
        </div>
      </div>

      {!reduce && (
        <motion.div
          className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-start"
          initial={{ x: -170, y: 64, opacity: 0 }}
          animate={aimed ? { x: 6, y: 8, opacity: 1 } : { x: -170, y: 64, opacity: 1 }}
          transition={{ duration: 0.85, ease: EASE, opacity: { duration: 0.4, delay: 1.2 } }}
        >
          <MousePointer2 size={18} className="fill-foreground text-foreground" />
          <span className="ml-0.5 mt-3 rounded-full bg-[var(--organic-accent-200)] px-2 py-0.5 text-[11px] font-medium text-[var(--organic-accent-800)] ring-2 ring-background">
            MA
          </span>
        </motion.div>
      )}

      <div className="absolute inset-x-0 top-full mt-3 flex justify-center">
        <AnimatePresence mode="wait">
          {phase === 'reply' && (
            <motion.span
              key={reply}
              className="organic-tag organic-tag-accent-2 px-3 py-1 text-[13px]"
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <Check size={13} />
              {reply}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const sidebarItems = ['Dashboard', 'CV simulator', 'Job matcher', 'Job tracker', 'AI writer'];

const ProductFrame = ({
  name,
  role,
  city,
  roles,
  tailored,
}: {
  name: string;
  role: string;
  city: string;
  roles: Array<{ title: string; company: string; years: string; detail: string }>;
  tailored: boolean;
}) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 30%'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [90, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const tailoredDetail = 'Led depot planning for 40 staff and 120 daily routes; redesigned the shift model and cut late deliveries by 34%.';

  return (
    <div ref={ref} className="relative z-10 px-5 sm:px-8" style={{ perspective: 1600 }}>
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { scale, y, rotateX, transformOrigin: 'center top' }}
        className="organic-artifact mx-auto max-w-[1120px] overflow-hidden rounded-[28px]"
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((dot) => <span key={dot} className="h-2.5 w-2.5 rounded-full bg-[var(--organic-neutral-200)]" />)}
          </div>
          <span className="mx-auto rounded-full bg-card px-4 py-1 text-[12px] text-muted-foreground">folio-cv.com/dashboard/simulator</span>
          <span className="w-[42px]" />
        </div>

        <div className="grid lg:grid-cols-[208px_minmax(0,1fr)]">
          <aside className="hidden flex-col gap-1 border-r border-border bg-surface p-4 lg:flex">
            <div className="mb-4 flex items-center gap-2 px-2 font-display text-[19px]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[var(--organic-accent-200)]" /></span>
              Folio CV
            </div>
            {sidebarItems.map((item) => (
              <span
                key={item}
                className={`rounded-full px-3.5 py-2 text-[14px] ${item === 'CV simulator' ? 'bg-background text-foreground shadow-folio-sm' : 'text-muted-foreground'}`}
              >
                {item}
              </span>
            ))}
          </aside>

          <div className="min-w-0 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-[28px] leading-none">CV simulator</p>
                <p className="mt-2 text-[13px] text-muted-foreground">Write on the left, watch the A4 page update on the right.</p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <span className="rounded-full border border-foreground/20 px-4 py-2 text-[14px]">Job matcher</span>
                <span className="rounded-full bg-foreground px-4 py-2 text-[14px] text-background">Export PDF</span>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="hidden rounded-3xl bg-card p-5 md:block">
                <p className="text-[13px] text-[var(--organic-neutral-500)]">Step 2 / 7</p>
                <p className="mt-1 font-display text-[22px]">Work experience</p>
                <div className="mt-4 space-y-3">
                  {[
                    ['Role', roles[0]?.title],
                    ['Company', roles[0]?.company],
                    ['Period', roles[0]?.years],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[12px] text-foreground/70">{label}</p>
                      <p className="mt-1 rounded-xl border border-input bg-background px-3.5 py-2 text-[14px]">{value}</p>
                    </div>
                  ))}
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-foreground/70">Description</p>
                      <AnimatePresence>
                        {tailored && (
                          <motion.span
                            className="organic-tag organic-tag-accent"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                          >
                            <Sparkles size={11} />
                            AI rewrite
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="mt-1 rounded-2xl border border-input bg-background px-3.5 py-2.5 text-[13px] leading-5 text-foreground/85">
                      {tailored ? tailoredDetail : roles[0]?.detail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-background p-6 shadow-folio-sm sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-[26px] leading-none">{name}</p>
                    <p className="mt-2 text-[13px] text-muted-foreground">{role} · {city}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--organic-accent-200)] text-[13px] font-medium text-[var(--organic-accent-800)]">
                    {name.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="my-5 h-px bg-border" />
                <p className="text-[13px] text-[var(--organic-neutral-500)]">Experience</p>
                <div className="mt-3 space-y-4">
                  {roles.map((item, index) => (
                    <div key={item.title}>
                      <div className="flex justify-between gap-4">
                        <p className="text-[14px] font-medium">{item.title} — {item.company}</p>
                        <span className="shrink-0 text-[12px] text-muted-foreground">{item.years}</span>
                      </div>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                          key={index === 0 && tailored ? 'tailored' : 'base'}
                          className={`mt-1.5 rounded-md text-[13px] leading-6 text-foreground/75 transition-colors duration-700 ${index === 0 && tailored ? 'bg-[var(--organic-accent-100)] px-1.5 -mx-1.5' : ''}`}
                          initial={{ opacity: 0, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(4px)' }}
                          transition={{ duration: 0.45, ease: EASE }}
                        >
                          {index === 0 && tailored ? tailoredDetail : item.detail}
                        </motion.p>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['Capacity planning', 'S&OP', 'SQL', 'Warehouse ops'].map((skill) => (
                    <span key={skill} className="organic-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface HeroShowcaseProps {
  name: string;
  role: string;
  city: string;
  roles: Array<{ title: string; company: string; years: string; detail: string }>;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

const HeroShowcase = ({ name, role, city, roles, onPrimary, secondaryLabel, onSecondary }: HeroShowcaseProps) => {
  const reduce = Boolean(useReducedMotion());
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { amount: 0.2 });
  const { step, typed, phase, sentCount } = useComposerScript(heroInView, reduce);

  const score = useMotionValue(reduce ? 86 : 64);
  const scoreLabel = useTransform(score, (value) => `${Math.round(value)}%`);
  useEffect(() => {
    if (sentCount > 0) animate(score, 86, { duration: 1.2, ease: EASE });
  }, [sentCount, score]);

  // Scroll choreography: the headline blurs away while the cards drift outward.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -70]);
  const textBlurPx = useTransform(scrollYProgress, [0, 0.5], [0, 10]);
  const textFilter = useMotionTemplate`blur(${textBlurPx}px)`;
  const leftX = useTransform(scrollYProgress, [0, 0.6], [0, -160]);
  const rightX = useTransform(scrollYProgress, [0, 0.6], [0, 160]);
  const cardsY = useTransform(scrollYProgress, [0, 0.6], [0, -90]);
  const cardsOpacity = useTransform(scrollYProgress, [0.05, 0.5], [1, 0]);
  const leftDrift = reduce ? undefined : { x: leftX, y: cardsY, opacity: cardsOpacity };
  const rightDrift = reduce ? undefined : { x: rightX, y: cardsY, opacity: cardsOpacity };

  return (
    <>
      <div ref={heroRef} className="relative">
        <div className="hero-glow" aria-hidden="true">
          <div className="grain" />
        </div>

        <div className="relative mx-auto max-w-[1440px]">
          <FloatingCard className="left-2 top-[16%] 2xl:left-8" delay={0.7} drift={leftDrift} floatDelay="0s">
            <JobMatchCard score={scoreLabel} />
          </FloatingCard>
          <FloatingCard className="left-10 top-[58%] 2xl:left-16" delay={0.85} drift={leftDrift} floatDelay="-2.5s">
            <TrackerCard />
          </FloatingCard>
          <FloatingCard className="right-2 top-[20%] 2xl:right-8" delay={0.8} drift={rightDrift} floatDelay="-1.2s">
            <AtsRingCard />
          </FloatingCard>
          <FloatingCard className="right-10 top-[62%] 2xl:right-16" delay={0.95} drift={rightDrift} floatDelay="-3.6s">
            <LayoutCard />
          </FloatingCard>

          <motion.div
            className="relative z-20 mx-auto flex max-w-[1040px] flex-col items-center px-5 pb-28 pt-32 text-center sm:px-8 lg:pb-36 lg:pt-40"
            style={reduce ? undefined : { opacity: textOpacity, y: textY, filter: textFilter }}
          >
            <motion.button
              type="button"
              onClick={onPrimary}
              className="group mb-8 inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1.5 text-[14px] text-foreground shadow-folio-sm backdrop-blur transition-colors hover:bg-background"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Sparkles size={14} className="text-[var(--organic-accent-800)]" />
              Simulator is free — no account needed
              <span className="arrow-slide text-muted-foreground"><ArrowUpRight size={14} /></span>
            </motion.button>

            <BlurWords
              className="font-display text-[clamp(2.75rem,6.4vw,5.25rem)] leading-[1.06] tracking-[-0.025em] text-foreground"
              segments={[{ text: 'Build a CV that' }, { text: 'reads well', italic: true }, { text: 'and gets sent out.' }]}
              delay={0.15}
              breakAfter={3}
            />

            <motion.p
              className="mt-6 max-w-[34em] text-[17px] leading-[1.55] text-muted-foreground sm:text-lg"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease: EASE }}
            >
              Write your CV in the free simulator, pick a format, export it. When you want saved versions,
              AI rewrites, and an application tracker, Folio CV Pro takes over.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1, ease: EASE }}
            >
              <Button size="lg" className="group" onClick={onPrimary}>
                Open the free simulator
                <span className="arrow-slide"><ArrowUpRight size={16} /></span>
              </Button>
              <Button variant="outline" size="lg" className="border-foreground hover:bg-foreground/[0.04]" onClick={onSecondary}>
                {secondaryLabel}
              </Button>
            </motion.div>

            <motion.div
              className="mt-14 w-full"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
            >
              <Composer typed={typed} phase={phase} reply={SCRIPT[step].reply} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <ProductFrame name={name} role={role} city={city} roles={roles} tailored={sentCount > 0} />
    </>
  );
};

export default HeroShowcase;
