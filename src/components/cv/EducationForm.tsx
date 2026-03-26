import { Education } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const EducationForm = ({ data, onChange }: Props) => {
  const add = () => {
    onChange([
      ...data,
      {
        id: crypto.randomUUID(),
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        grade: '',
        description: '',
      },
    ]);
  };

  const update = (id: string, field: keyof Education, value: string) => {
    onChange(data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const remove = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id));
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {data.map((edu, index) => (
          <motion.div key={edu.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="relative p-6 rounded-xl bg-surface border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-display text-primary">Bildung {index + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => remove(edu.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground/80 font-display">Institution</Label>
                <Input value={edu.institution} onChange={(e) => update(edu.id, 'institution', e.target.value)} placeholder="TU München" className="bg-card border-border focus:border-primary" />
              </div>
              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-display">Abschluss</Label>
                  <Input value={edu.degree} onChange={(e) => update(edu.id, 'degree', e.target.value)} placeholder="Master of Science" className="bg-card border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-display">Fachrichtung</Label>
                  <Input value={edu.field} onChange={(e) => update(edu.id, 'field', e.target.value)} placeholder="Informatik" className="bg-card border-border focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-display">Start</Label>
                  <Input type="month" value={edu.startDate} onChange={(e) => update(edu.id, 'startDate', e.target.value)} className="bg-card border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-display">Ende</Label>
                  <Input type="month" value={edu.endDate} onChange={(e) => update(edu.id, 'endDate', e.target.value)} className="bg-card border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80 font-display">Note</Label>
                  <Input value={edu.grade || ''} onChange={(e) => update(edu.id, 'grade', e.target.value)} placeholder="1.3" className="bg-card border-border focus:border-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/80 font-display">Beschreibung</Label>
                <Textarea
                  value={edu.description || ''}
                  onChange={(e) => update(edu.id, 'description', e.target.value)}
                  placeholder="Welche Schwerpunkte, Projekte oder Aktivitäten hattest du dort?"
                  rows={3}
                  className="bg-card border-border focus:border-primary resize-none"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button onClick={add} variant="outline" className="w-full border-dashed border-border hover:border-primary hover:text-primary">
        <Plus size={16} className="mr-2" /> Bildung hinzufügen
      </Button>
    </div>
  );
};

export default EducationForm;
