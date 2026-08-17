import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Zap, Languages, Eye } from 'lucide-react';

const steps = [
  { icon: User, label: 'Personal' },
  { icon: Briefcase, label: 'Work' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Zap, label: 'Skills' },
  { icon: Languages, label: 'Language' },
  { icon: Eye, label: 'Preview' },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="step-tab-shell">
      <div role="tablist" className="grid w-full grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={index}
              role="tab"
              aria-selected={isActive}
              onClick={() => onStepClick(index)}
              className={`group relative flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 ${
                isActive
                  ? 'bg-card text-foreground shadow-[0_12px_28px_-22px_hsl(165_18%_10%/0.7)]'
                  : isCompleted
                    ? 'text-foreground/70 hover:bg-white/[0.06] hover:text-foreground'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground/70'
              }`}
            >
              <motion.div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200 ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : isCompleted
                      ? 'bg-accent/10 text-accent'
                      : 'bg-transparent text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={15} />
              </motion.div>
              <div className="min-w-0 pr-0.5">
                <p className={`font-mono text-[10px] tabular-nums tracking-[0.06em] ${isActive ? 'text-foreground/50' : 'text-muted-foreground/70'}`}>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <span
                  className={`block truncate text-[13px] font-medium leading-none transition-colors ${
                    isActive
                      ? 'text-foreground'
                      : isCompleted
                        ? 'text-foreground/70'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
