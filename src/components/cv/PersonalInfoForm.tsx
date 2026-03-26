import { PersonalInfo } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const PersonalInfoForm = ({ data, onChange }: Props) => {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground/80 font-display">Vorname</Label>
          <Input value={data.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Max" className="bg-surface border-border focus:border-primary" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 font-display">Nachname</Label>
          <Input value={data.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Mustermann" className="bg-surface border-border focus:border-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-foreground/80 font-display">Berufsbezeichnung</Label>
        <Input value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="Senior Software Engineer" className="bg-surface border-border focus:border-primary" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground/80 font-display">E-Mail</Label>
          <Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="max@example.com" className="bg-surface border-border focus:border-primary" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 font-display">Telefon</Label>
          <Input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+49 123 456 789" className="bg-surface border-border focus:border-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-foreground/80 font-display">Adresse</Label>
        <Input value={data.address} onChange={(e) => update('address', e.target.value)} placeholder="Musterstraße 1, 10115 Berlin" className="bg-surface border-border focus:border-primary" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground/80 font-display">Website</Label>
          <Input value={data.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://meineseite.de" className="bg-surface border-border focus:border-primary" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground/80 font-display">LinkedIn</Label>
          <Input value={data.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="linkedin.com/in/max" className="bg-surface border-border focus:border-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-foreground/80 font-display">Zusammenfassung</Label>
        <Textarea value={data.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Kurze Beschreibung deiner Karriere und Stärken..." rows={4} className="bg-surface border-border focus:border-primary resize-none" />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
