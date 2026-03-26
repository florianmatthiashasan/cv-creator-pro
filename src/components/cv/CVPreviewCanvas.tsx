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
      <div className="preview-shell overflow-hidden animate-fade-up">
        <div className="flex items-center justify-between border-b border-border/70 bg-white/90 px-4 py-3">
          <div>
            <p className="section-kicker">Live Vorschau</p>
            <p className="mt-1 text-sm font-display text-foreground">Dein Lebenslauf aktualisiert sich sofort.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
        </div>

        <div className={`overflow-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,239,230,0.95)),radial-gradient(circle_at_top_left,rgba(248,153,60,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(123,202,187,0.15),transparent_28%)] p-4 ${maxHeightClassName}`}>
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
