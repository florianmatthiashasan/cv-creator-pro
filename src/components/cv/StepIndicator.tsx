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
    <div className="mb-10 overflow-x-auto pb-2">
      <div className="flex min-w-max items-center justify-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex shrink-0 items-center gap-2">
              <button onClick={() => onStepClick(index)} className="flex items-center gap-2 group">
                <motion.div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : isCompleted
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border bg-card'
                  }`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-primary/60'
                          : 'text-muted-foreground'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-primary"
                      layoutId="activeStep"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
                <span
                  className={`hidden text-sm font-display transition-colors xl:block ${
                    isActive
                      ? 'font-semibold text-primary'
                      : isCompleted
                        ? 'text-foreground/60'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`h-px w-6 transition-colors xl:w-10 ${
                    isCompleted ? 'bg-primary/40' : 'bg-border'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
