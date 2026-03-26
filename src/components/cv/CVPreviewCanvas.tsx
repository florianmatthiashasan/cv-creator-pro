import { forwardRef } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { templateComponents } from './templates/registry';

interface Props {
  data: CVData;
  template: CVTemplate;
  maxHeightClassName?: string;
  scaleClassName?: string;
}

const CVPreviewCanvas = forwardRef<HTMLDivElement, Props>(
  (
    {
      data,
      template,
      maxHeightClassName = 'max-h-[70vh]',
      scaleClassName = 'scale-[0.42] lg:scale-[0.5] xl:scale-[0.62]',
    },
    ref,
  ) => {
    const TemplateComponent = templateComponents[template];

    return (
      <div className="border border-border rounded-2xl overflow-hidden bg-card/80 shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-border bg-surface/80 px-4 py-3">
          <div>
            <p className="text-sm font-display text-foreground">Live Vorschau</p>
            <p className="text-xs text-muted-foreground">Dein Lebenslauf aktualisiert sich sofort.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
        </div>

        <div className={`overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 ${maxHeightClassName}`}>
          <div className={`origin-top-left w-[210mm] ${scaleClassName}`}>
            <div ref={ref}>
              <TemplateComponent data={data} />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

CVPreviewCanvas.displayName = 'CVPreviewCanvas';

export default CVPreviewCanvas;
