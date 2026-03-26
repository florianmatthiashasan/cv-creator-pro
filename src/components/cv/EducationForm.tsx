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
    <div className="space-y-5">
      <AnimatePresence mode="popLayout">
        {data.map((edu, index) => (
          <motion.div key={edu.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="soft-panel relative p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-kicker">Education</p>
                <span className="mt-1 inline-block text-sm font-medium text-foreground">Entry {index + 1}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(edu.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={16} /></Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="meta-label">Institution</Label>
                <Input value={edu.institution} onChange={(e) => update(edu.id, 'institution', e.target.value)} placeholder="Technical University of Munich" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="meta-label">Degree</Label>
                  <Input value={edu.degree} onChange={(e) => update(edu.id, 'degree', e.target.value)} placeholder="Master of Science" />
                </div>
                <div className="space-y-1.5">
                  <Label className="meta-label">Field of study</Label>
                  <Input value={edu.field} onChange={(e) => update(edu.id, 'field', e.target.value)} placeholder="Computer Science" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="meta-label">Start</Label>
                  <Input type="month" value={edu.startDate} onChange={(e) => update(edu.id, 'startDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="meta-label">End</Label>
                  <Input type="month" value={edu.endDate} onChange={(e) => update(edu.id, 'endDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="meta-label">Grade</Label>
                  <Input value={edu.grade || ''} onChange={(e) => update(edu.id, 'grade', e.target.value)} placeholder="1.3" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="meta-label">Description</Label>
                <Textarea
                  value={edu.description || ''}
                  onChange={(e) => update(edu.id, 'description', e.target.value)}
                  placeholder="What projects, focus areas, or activities did you have there?"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button onClick={add} variant="outline" className="w-full border-dashed">
        <Plus size={16} className="mr-1.5" /> Add education
      </Button>
    </div>
  );
};

export default EducationForm;
