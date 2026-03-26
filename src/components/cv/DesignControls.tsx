import { CVDesign } from '@/types/cv';
import { cvFontOptions } from '@/lib/cv-design';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  data: CVDesign;
  onChange: (data: CVDesign) => void;
}

const colorFields: Array<{ key: keyof CVDesign; label: string }> = [
  { key: 'nameColor', label: 'Name' },
  { key: 'titleColor', label: 'Titel' },
  { key: 'headingColor', label: 'Überschriften' },
  { key: 'bodyColor', label: 'Fließtext' },
  { key: 'mutedColor', label: 'Meta / Sekundär' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'backgroundColor', label: 'Seitenhintergrund' },
  { key: 'sidebarBackgroundColor', label: 'Sidebar Hintergrund' },
  { key: 'sidebarTextColor', label: 'Sidebar Text' },
  { key: 'dividerColor', label: 'Linien / Divider' },
];

const DesignControls = ({ data, onChange }: Props) => {
  const update = <K extends keyof CVDesign>(key: K, value: CVDesign[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-5">
      <div className="soft-panel p-4">
        <p className="section-kicker">Design Einstellungen</p>
        <p className="mt-1.5 text-sm font-medium text-foreground">Wähle Schriften und Farben. Die Vorschau reagiert sofort.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-2">
          <Label className="meta-label">Headline Font</Label>
          <Select value={data.headingFont} onValueChange={(value) => update('headingFont', value as CVDesign['headingFont'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cvFontOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="meta-label">Body Font</Label>
          <Select value={data.bodyFont} onValueChange={(value) => update('bodyFont', value as CVDesign['bodyFont'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cvFontOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {colorFields.map((field) => (
          <div key={field.key} className="soft-panel p-3">
            <Label className="meta-label">{field.label}</Label>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="color"
                value={String(data[field.key])}
                onChange={(event) => update(field.key, event.target.value)}
                className="h-11 w-14 cursor-pointer rounded-xl border border-border bg-white p-1"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{String(data[field.key]).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">Live im CV sichtbar</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignControls;
