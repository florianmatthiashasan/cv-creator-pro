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
  { key: 'titleColor', label: 'Title' },
  { key: 'headingColor', label: 'Headings' },
  { key: 'bodyColor', label: 'Body text' },
  { key: 'mutedColor', label: 'Meta / Secondary' },
  { key: 'accentColor', label: 'Accent' },
  { key: 'backgroundColor', label: 'Page background' },
  { key: 'sidebarBackgroundColor', label: 'Sidebar background' },
  { key: 'sidebarTextColor', label: 'Sidebar text' },
  { key: 'dividerColor', label: 'Lines / Divider' },
];

const DesignControls = ({ data, onChange }: Props) => {
  const update = <K extends keyof CVDesign>(key: K, value: CVDesign[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="soft-panel p-4">
        <p className="section-kicker">Design settings</p>
        <p className="mt-1.5 text-sm font-medium text-foreground">Choose fonts and colors. The preview updates instantly.</p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="field-card space-y-1.5">
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

        <div className="field-card space-y-1.5">
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {colorFields.map((field) => (
          <div key={field.key} className="field-card min-w-0">
            <Label className="meta-label">{field.label}</Label>
            <div className="mt-2 flex min-w-0 items-center gap-2">
              <input
                type="color"
                value={String(data[field.key])}
                onChange={(event) => update(field.key, event.target.value)}
                className="h-9 w-10 shrink-0 cursor-pointer rounded-full border border-border bg-card p-1 shadow-[var(--organic-shadow-sm)]"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-medium text-foreground">{String(data[field.key]).toUpperCase()}</p>
                <p className="truncate text-[11px] text-muted-foreground">Live preview</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignControls;
