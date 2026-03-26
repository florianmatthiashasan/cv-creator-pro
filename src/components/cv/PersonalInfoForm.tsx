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
      <div className="soft-panel flex flex-col gap-6 p-5 sm:flex-row sm:items-center">
        <div className="relative group">
          <div
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-[28px] border-2 border-dashed border-primary/25 bg-white shadow-[0_18px_40px_-28px_rgba(84,56,24,0.28)] transition-colors hover:border-primary"
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
              className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        <div>
          <p className="section-kicker">Profil</p>
          <p className="mt-2 text-lg font-display text-foreground">Portrait hochladen</p>
          <p className="mt-1 text-sm text-muted-foreground">JPG oder PNG, max. 5MB. Ein gutes Bild hebt die erste Zeile des CVs sofort an.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <div className="space-y-2">
          <Label className="meta-label">Vorname</Label>
          <Input value={data.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Max" />
        </div>
        <div className="space-y-2">
          <Label className="meta-label">Nachname</Label>
          <Input value={data.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Mustermann" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="meta-label">Berufsbezeichnung</Label>
        <Input value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="Senior Software Engineer" />
      </div>
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <div className="space-y-2">
          <Label className="meta-label">E-Mail</Label>
          <Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="max@example.com" />
        </div>
        <div className="space-y-2">
          <Label className="meta-label">Telefon</Label>
          <Input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+49 123 456 789" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="meta-label">Adresse</Label>
        <Input value={data.address} onChange={(e) => update('address', e.target.value)} placeholder="Musterstraße 1, 10115 Berlin" />
      </div>
      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <div className="space-y-2">
          <Label className="meta-label">Website</Label>
          <Input value={data.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://meineseite.de" />
        </div>
        <div className="space-y-2">
          <Label className="meta-label">LinkedIn</Label>
          <Input value={data.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="linkedin.com/in/max" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="meta-label">Zusammenfassung</Label>
        <Textarea value={data.summary} onChange={(e) => update('summary', e.target.value)} placeholder="Kurze Beschreibung deiner Karriere und Stärken..." rows={4} className="resize-none" />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
