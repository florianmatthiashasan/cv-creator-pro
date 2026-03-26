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
          <div
            onClick={() => fileRef.current?.click()}
            className="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/40 transition-colors hover:border-foreground/30 hover:bg-muted/60"
          >
            {data.photo ? (
              <img src={data.photo} alt="Profile photo" className="w-full h-full object-cover" />
            ) : (
              <Camera size={22} className="text-muted-foreground" />
            )}
          </div>
          {data.photo && (
            <button
              onClick={removePhoto}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={10} />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
        <div>
          <p className="section-kicker">Profile</p>
          <p className="mt-1 text-sm font-medium text-foreground">Upload portrait</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">JPG or PNG, max. 5 MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="meta-label">First name</Label>
          <Input value={data.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Max" />
        </div>
        <div className="space-y-1.5">
          <Label className="meta-label">Last name</Label>
          <Input value={data.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Mustermann" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="meta-label">Job title</Label>
        <Input value={data.title} onChange={(e) => update('title', e.target.value)} placeholder="Senior Software Engineer" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
        <Label className="meta-label">Email</Label>
          <Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="max@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label className="meta-label">Phone</Label>
          <Input value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+49 123 456 789" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="meta-label">Address</Label>
        <Input value={data.address} onChange={(e) => update('address', e.target.value)} placeholder="Sample Street 1, 10115 Berlin" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="meta-label">Website</Label>
          <Input value={data.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://mywebsite.com" />
        </div>
        <div className="space-y-1.5">
          <Label className="meta-label">LinkedIn</Label>
          <Input value={data.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="linkedin.com/in/max" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="meta-label">Summary</Label>
        <Textarea value={data.summary} onChange={(e) => update('summary', e.target.value)} placeholder="A short summary of your career, strengths, and focus..." rows={4} className="resize-none" />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
