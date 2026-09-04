import { Education } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '@/lib/analytics';

interface Props {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const EducationForm = ({ data, onChange }: Props) => {
  const add = () => {
    trackEvent('section_added', {
      section_type: 'education',
    });

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
      {data.length === 0 && (
        <div className="empty-state">
          <p className="text-sm font-semibold text-foreground">No education added yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add degrees, bootcamps, certificates, or relevant training that supports your target role.
          </p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {data.map((edu, index) => (
          <motion.div key={edu.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="soft-panel relative p-5">
            {(() => {
              const fieldId = (field: string) => `education-${edu.id}-${field}`;
              return (
                <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-kicker">Education</p>
                <span className="mt-1 inline-block text-sm font-medium text-foreground">Entry {index + 1}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(edu.id)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove education ${index + 1}`}>
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor={fieldId('institution')} className="meta-label">Institution</Label>
                <Input id={fieldId('institution')} name="education-institution" autoComplete="organization" value={edu.institution} onChange={(e) => update(edu.id, 'institution', e.target.value)} placeholder="Technical University of Munich" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={fieldId('degree')} className="meta-label">Degree</Label>
                  <Input id={fieldId('degree')} name="education-degree" autoComplete="off" value={edu.degree} onChange={(e) => update(edu.id, 'degree', e.target.value)} placeholder="Master of Science" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={fieldId('field')} className="meta-label">Field of study</Label>
                  <Input id={fieldId('field')} name="education-field" autoComplete="off" value={edu.field} onChange={(e) => update(edu.id, 'field', e.target.value)} placeholder="Computer Science" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor={fieldId('start')} className="meta-label">Start</Label>
                  <Input id={fieldId('start')} name="education-start" type="month" value={edu.startDate} onChange={(e) => update(edu.id, 'startDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={fieldId('end')} className="meta-label">End</Label>
                  <Input id={fieldId('end')} name="education-end" type="month" value={edu.endDate} onChange={(e) => update(edu.id, 'endDate', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={fieldId('grade')} className="meta-label">Grade</Label>
                  <Input id={fieldId('grade')} name="education-grade" autoComplete="off" value={edu.grade || ''} onChange={(e) => update(edu.id, 'grade', e.target.value)} placeholder="1.3" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={fieldId('description')} className="meta-label">Description</Label>
                <Textarea
                  id={fieldId('description')}
                  name="education-description"
                  value={edu.description || ''}
                  onChange={(e) => update(edu.id, 'description', e.target.value)}
                  placeholder="What projects, focus areas, or activities did you have there?"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
                </>
              );
            })()}
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
