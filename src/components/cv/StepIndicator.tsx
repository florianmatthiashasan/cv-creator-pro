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
      <div role="tablist" className="grid w-full grid-cols-6 gap-1">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <button
              key={index}
              role="tab"
              aria-selected={isActive}
              aria-label={`Step ${index + 1}: ${step.label}`}
              title={step.label}
              onClick={() => onStepClick(index)}
              className={`group relative flex min-w-0 items-center justify-center rounded-full px-1.5 py-1.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 ${
                isActive
                  ? 'bg-background text-foreground shadow-[var(--organic-shadow-sm)]'
                  : isCompleted
                    ? 'text-foreground/70 hover:bg-foreground/[0.06] hover:text-foreground'
                    : 'text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground/70'
              }`}
            >
              <motion.div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : isCompleted
                      ? 'bg-accent/10 text-accent'
                      : 'bg-transparent text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={17} />
              </motion.div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
