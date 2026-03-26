import { Language } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Native'] as const;

interface Props {
  data: Language[];
  onChange: (data: Language[]) => void;
}

const LanguagesForm = ({ data, onChange }: Props) => {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), name: '', level: 'B1' }]);
  };

  const update = (id: string, field: keyof Language, value: string) => {
    onChange(data.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const remove = (id: string) => {
    onChange(data.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="popLayout">
        {data.map((lang) => (
          <motion.div key={lang.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="soft-panel relative p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="meta-label">Language</Label>
                <Input value={lang.name} onChange={(e) => update(lang.id, 'name', e.target.value)} placeholder="German, English, French..." />
              </div>
              <div className="space-y-1.5 sm:w-40">
                <Label className="meta-label">Level</Label>
                <Select value={lang.level} onValueChange={(val) => update(lang.id, 'level', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" onClick={() => remove(lang.id)} className="text-muted-foreground hover:text-destructive mb-0.5">
                <Trash2 size={16} />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button onClick={add} variant="outline" className="w-full border-dashed">
        <Plus size={16} className="mr-1.5" /> Add language
      </Button>
    </div>
  );
};

export default LanguagesForm;
