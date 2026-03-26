import { motion } from 'framer-motion';
import { User, Briefcase, GraduationCap, Zap, Eye } from 'lucide-react';

const steps = [
  { icon: User, label: 'Persönlich' },
  { icon: Briefcase, label: 'Erfahrung' },
  { icon: GraduationCap, label: 'Bildung' },
  { icon: Zap, label: 'Skills' },
  { icon: Eye, label: 'Vorschau' },
];

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const StepIndicator = ({ currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <button
            key={index}
            onClick={() => onStepClick(index)}
            className="flex items-center gap-2 group"
          >
            <motion.div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-300 ${
                isActive
                  ? 'border-primary bg-primary/10'
                  : isCompleted
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-card'
              }`}
              whileHover={{ scale: 1.1 }}
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
              className={`text-sm font-display hidden md:block transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : isCompleted
                  ? 'text-foreground/60'
                  : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-px mx-1 transition-colors ${
                  isCompleted ? 'bg-primary/40' : 'bg-border'
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StepIndicator;
