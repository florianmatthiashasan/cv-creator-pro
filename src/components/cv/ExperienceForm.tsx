import { Experience } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

const ExperienceForm = ({ data, onChange }: Props) => {
  const addExperience = () => {
    onChange([
      ...data,
      {
        id: crypto.randomUUID(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const removeExperience = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id));
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="popLayout">
        {data.map((exp, index) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="soft-panel relative p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-kicker">Berufserfahrung</p>
                <span className="mt-1 inline-block text-sm font-medium text-foreground">Position {index + 1}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="meta-label">Unternehmen</Label>
                  <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Google GmbH" />
                </div>
                <div className="space-y-1.5">
                  <Label className="meta-label">Position</Label>
                  <Input value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} placeholder="Senior Developer" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="meta-label">Start</Label>
                  <Input type="month" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="meta-label">Ende</Label>
                  <Input type="month" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} disabled={exp.current} className="disabled:opacity-40" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                <Checkbox checked={exp.current} onCheckedChange={(checked) => updateExperience(exp.id, 'current', !!checked)} />
                <Label className="text-sm text-foreground/70">Aktuell hier beschäftigt</Label>
              </div>
              <div className="space-y-1.5">
                <Label className="meta-label">Beschreibung</Label>
                <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Hauptaufgaben und Erfolge..." rows={3} className="resize-none" />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button onClick={addExperience} variant="outline" className="w-full border-dashed">
        <Plus size={16} className="mr-1.5" /> Erfahrung hinzufügen
      </Button>
    </div>
  );
};

export default ExperienceForm;
