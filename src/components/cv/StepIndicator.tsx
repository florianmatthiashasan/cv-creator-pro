import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Zap, Languages, Eye } from 'lucide-react';

const steps = [
  { icon: User, label: 'Persönlich' },
  { icon: Briefcase, label: 'Erfahrung' },
  { icon: GraduationCap, label: 'Bildung' },
  { icon: Zap, label: 'Skills' },
  { icon: Languages, label: 'Sprachen' },
  { icon: Eye, label: 'Vorschau' },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="step-tab-shell overflow-x-auto">
      <div role="tablist" className="flex min-w-max items-center gap-0.5">
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
              className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors duration-150 ${
                isActive
                  ? 'bg-white text-foreground shadow-sm'
                  : isCompleted
                    ? 'text-foreground/70 hover:bg-white/80 hover:text-foreground'
                    : 'text-muted-foreground hover:bg-white/60 hover:text-foreground/70'
              }`}
            >
              <motion.div
                className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150 ${
                  isActive
                    ? 'bg-foreground text-white'
                    : isCompleted
                      ? 'bg-foreground/10 text-foreground'
                      : 'bg-transparent text-muted-foreground'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={15} />
              </motion.div>
              <div className="pr-0.5">
                <p className={`font-mono text-[10px] tabular-nums tracking-[0.06em] ${isActive ? 'text-foreground/50' : 'text-muted-foreground/70'}`}>
                  {String(index + 1).padStart(2, '0')}
                </p>
                <span
                  className={`text-[13px] font-medium leading-none transition-colors ${
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
