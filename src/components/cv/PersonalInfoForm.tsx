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
    <div className="space-y-5">
      <div className="soft-panel flex flex-col gap-5 p-4 sm:flex-row sm:items-center">
        <div className="relative group">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border bg-background/50 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/10"
            aria-label={data.photo ? 'Change profile photo' : 'Upload profile photo'}
          >
            {data.photo ? (
              <img src={data.photo} alt="Profile photo" className="w-full h-full object-cover" />
            ) : (
              <Camera size={22} className="text-muted-foreground" aria-hidden="true" />
            )}
          </button>
          {data.photo && (
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground opacity-0 transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
              aria-label="Remove profile photo"
            >
              <X size={10} aria-hidden="true" />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" aria-label="Profile photo file" />
        </div>
        <div>
          <p className="section-kicker">Profile</p>
          <p className="mt-1 text-sm font-medium text-foreground">Upload portrait</p>
          <p className="mt-0.5 max-w-md text-[13px] leading-6 text-muted-foreground">Use a clear headshot when it fits your market. You can remove it any time.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="field-card space-y-1.5">
          <Label htmlFor="personal-first-name" className="meta-label">First name</Label>
          <Input id="personal-first-name" name="given-name" autoComplete="given-name" value={data.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Max" />
        </div>
        <div className="field-card space-y-1.5">
          <Label htmlFor="personal-last-name" className="meta-label">Last name</Label>
          <Input id="personal-last-name" name="family-name" autoComplete="family-name" value={data.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Mustermann" />
        </div>
      </div>
      <div className="field-card space-y-1.5">
        <Label htmlFor="personal-job-title" className="meta-label">Job title</Label>
        <Input id="personal-job-title" name="job-title" autoComplete="organization-title" value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="Senior Software Engineer" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="field-card space-y-1.5">
        <Label htmlFor="personal-email" className="meta-label">Email</Label>
          <Input id="personal-email" name="email" autoComplete="email" type="email" spellCheck={false} value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="max@example.com" />
        </div>
        <div className="field-card space-y-1.5">
          <Label htmlFor="personal-phone" className="meta-label">Phone</Label>
          <Input id="personal-phone" name="tel" autoComplete="tel" type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+49 123 456 789" />
        </div>
      </div>
      <div className="field-card space-y-1.5">
        <Label htmlFor="personal-address" className="meta-label">Address</Label>
        <Input id="personal-address" name="street-address" autoComplete="street-address" value={data.address} onChange={(e) => update('address', e.target.value)} placeholder="Sample Street 1, 10115 Berlin" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="field-card space-y-1.5">
          <Label htmlFor="personal-website" className="meta-label">Website</Label>
          <Input id="personal-website" name="url" autoComplete="url" type="url" value={data.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://mywebsite.com" />
        </div>
        <div className="field-card space-y-1.5">
          <Label htmlFor="personal-linkedin" className="meta-label">LinkedIn</Label>
          <Input id="personal-linkedin" name="linkedin" autoComplete="off" type="url" value={data.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/max" />
        </div>
      </div>
      <div className="field-card space-y-1.5">
        <Label htmlFor="personal-summary" className="meta-label">Summary</Label>
        <Textarea id="personal-summary" name="summary" value={data.summary} onChange={(e) => update('summary', e.target.value)} placeholder="A short summary of your career, strengths, and focus…" rows={4} className="resize-none" />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
