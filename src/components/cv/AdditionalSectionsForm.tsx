import { CVAdditionalSection, CVAdditionalSectionKind } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface Props {
  data: CVAdditionalSection[];
  onChange: (data: CVAdditionalSection[]) => void;
}

const sectionKinds: Array<{ id: CVAdditionalSectionKind; label: string; emptyTitle: string }> = [
  { id: 'project', label: 'Project', emptyTitle: 'Portfolio project, case study, or launch' },
  { id: 'certificate', label: 'Certificate', emptyTitle: 'Course, license, or certification' },
  { id: 'award', label: 'Award', emptyTitle: 'Prize, recognition, or honor' },
  { id: 'volunteering', label: 'Volunteering', emptyTitle: 'Community, club, or nonprofit work' },
  { id: 'publication', label: 'Publication', emptyTitle: 'Article, paper, talk, or media feature' },
];

const getKindMeta = (kind: CVAdditionalSectionKind) => sectionKinds.find((item) => item.id === kind) || sectionKinds[0];

const AdditionalSectionsForm = ({ data, onChange }: Props) => {
  const add = (kind: CVAdditionalSectionKind) => {
    trackEvent('section_added', {
      section_type: kind,
    });

    onChange([
      ...data,
      {
        id: crypto.randomUUID(),
        kind,
        title: '',
        organization: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        url: '',
      },
    ]);
  };

  const update = (id: string, field: keyof CVAdditionalSection, value: string | boolean) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      {data.length === 0 && (
        <div className="empty-state">
          <p className="text-sm font-semibold text-foreground">No extra sections yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add projects, certificates, awards, volunteering, or publications when they prove fit for the role.
          </p>
        </div>
      )}

      <AnimatePresence mode="popLayout">
        {data.map((item, index) => {
          const kind = getKindMeta(item.kind);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="soft-panel relative p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="section-kicker">{kind.label}</p>
                  <span className="mt-1 inline-block text-sm font-medium text-foreground">Extra section {index + 1}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="field-card">
                  <p className="meta-label">Type</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sectionKinds.map((option) => (
                      <button
                        key={option.id}
                        className={`folio-chip ${item.kind === option.id ? 'is-active' : ''}`}
                        onClick={() => update(item.id, 'kind', option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="meta-label">Title</Label>
                    <Input value={item.title} onChange={(event) => update(item.id, 'title', event.target.value)} placeholder={kind.emptyTitle} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="meta-label">Organization</Label>
                    <Input value={item.organization} onChange={(event) => update(item.id, 'organization', event.target.value)} placeholder="Issuer, company, client, or publisher" />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="meta-label">Start</Label>
                    <Input type="month" value={item.startDate} onChange={(event) => update(item.id, 'startDate', event.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="meta-label">End</Label>
                    <Input type="month" value={item.endDate} onChange={(event) => update(item.id, 'endDate', event.target.value)} disabled={item.current} className="disabled:opacity-40" />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-full border border-border bg-background/50 px-3 py-2.5">
                  <Checkbox checked={item.current} onCheckedChange={(checked) => update(item.id, 'current', !!checked)} />
                  <Label className="text-sm text-foreground/70">Currently active</Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="meta-label">Link</Label>
                  <Input value={item.url || ''} onChange={(event) => update(item.id, 'url', event.target.value)} placeholder="https://..." />
                </div>

                <div className="space-y-1.5">
                  <Label className="meta-label">Description</Label>
                  <Textarea
                    value={item.description}
                    onChange={(event) => update(item.id, 'description', event.target.value)}
                    placeholder="What did you build, earn, publish, or contribute? Add scope and result where possible."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sectionKinds.map((kind) => (
          <Button key={kind.id} onClick={() => add(kind.id)} variant="outline" className="justify-start border-dashed">
            <Plus size={16} className="mr-1.5" />
            {kind.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AdditionalSectionsForm;
