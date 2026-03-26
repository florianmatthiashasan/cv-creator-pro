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
    <div className="step-tab-shell mb-6 overflow-x-auto">
      <div role="tablist" className="flex min-w-max items-center gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="shrink-0">
              <button
                role="tab"
                aria-selected={isActive}
                onClick={() => onStepClick(index)}
                className={`group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-foreground shadow-[0_20px_44px_-30px_rgba(235,117,25,0.42)]'
                    : isCompleted
                      ? 'bg-orange-50/75 text-foreground/80 hover:bg-white'
                      : 'text-muted-foreground hover:bg-white/80 hover:text-foreground/80'
                }`}
              >
                <div
                  className={`absolute inset-x-4 bottom-1 h-[2px] rounded-full transition-all duration-300 ${
                    isActive ? 'bg-primary opacity-100' : 'bg-transparent opacity-0'
                  }`}
                />
                <motion.div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300 ${
                    isActive
                      ? 'border-primary/20 bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'border-primary/15 bg-orange-100 text-primary'
                        : 'border-white/70 bg-white/70 text-muted-foreground'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon
                    size={18}
                    className={`transition-colors ${
                      isActive
                        ? 'text-primary-foreground'
                        : isCompleted
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }`}
                  />
                </motion.div>
                <div className="pr-1">
                  <p className={`font-mono text-[10px] uppercase tracking-[0.24em] ${isActive ? 'text-primary/80' : 'text-muted-foreground'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <span
                    className={`text-sm font-body font-medium transition-colors ${
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
