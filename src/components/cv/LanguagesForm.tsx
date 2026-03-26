import { Language } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Muttersprache'] as const;

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
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {data.map((lang) => (
          <motion.div key={lang.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="soft-panel relative p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              <div className="flex-1 space-y-2">
                <Label className="meta-label">Sprache</Label>
                <Input value={lang.name} onChange={(e) => update(lang.id, 'name', e.target.value)} placeholder="Deutsch, Englisch, Französisch..." />
              </div>
              <div className="space-y-2 xl:w-44">
                <Label className="meta-label">Niveau</Label>
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
      <Button onClick={add} variant="outline" className="w-full border-dashed font-display">
        <Plus size={16} className="mr-2" /> Sprache hinzufügen
      </Button>
    </div>
  );
};

export default LanguagesForm;
