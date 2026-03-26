import { Skill } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const SkillsForm = ({ data, onChange }: Props) => {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), name: '', level: 3 }]);
  };

  const update = (id: string, field: keyof Skill, value: string | number) => {
    onChange(data.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const remove = (id: string) => {
    onChange(data.filter((s) => s.id !== id));
  };

  const levelLabels = ['', 'Basic', 'Intermediate', 'Good', 'Very good', 'Expert'];

  return (
    <div className="space-y-5">
      <AnimatePresence mode="popLayout">
        {data.map((skill) => (
          <motion.div key={skill.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="soft-panel relative p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <Label className="meta-label">Skill</Label>
                  <Input value={skill.name} onChange={(e) => update(skill.id, 'name', e.target.value)} placeholder="React, Python, Projektmanagement..." />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label className="meta-label">Level</Label>
                    <span className="text-xs font-medium text-foreground/70">{levelLabels[skill.level]}</span>
                  </div>
                  <Slider value={[skill.level]} onValueChange={([val]) => update(skill.id, 'level', val)} min={1} max={5} step={1} className="w-full" />
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(skill.id)} className="text-muted-foreground hover:text-destructive mt-6"><Trash2 size={16} /></Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button onClick={add} variant="outline" className="w-full border-dashed">
        <Plus size={16} className="mr-1.5" /> Add skill
      </Button>
    </div>
  );
};

export default SkillsForm;
