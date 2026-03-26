import { useRef } from 'react';
import { PersonalInfo } from '@/types/cv';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, X } from 'lucide-react';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const PersonalInfoForm = ({ data, onChange }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange({ ...data, photo: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    onChange({ ...data, photo: undefined });
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Photo Upload */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-full border-2 border-dashed border-border hover:border-primary bg-surface flex items-center justify-center cursor-pointer overflow-hidden transition-colors"
          >
            {data.photo ? (
              <img src={data.photo} alt="Profilbild" className="w-full h-full object-cover" />
            ) : (
              <Camera size={28} className="text-muted-foreground" />
            )}
          </div>
          {data.photo && (
            <button
              onClick={removePhoto}
              className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        <div>
          <p className="text-sm font-display text-foreground">Profilbild</p>
          <p className="text-xs text-muted-foreground mt-1">JPG oder PNG, max. 5MB</p>
        </div>
      </div>

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
