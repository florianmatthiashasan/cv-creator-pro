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
      <div className="preview-shell animate-fade-up">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">Preview</p>
            <p className="mt-0.5 text-[13px] font-medium text-foreground">Live-Vorschau</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
        </div>

        <div className={`overflow-auto bg-muted/40 p-4 ${maxHeightClassName}`}>
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
