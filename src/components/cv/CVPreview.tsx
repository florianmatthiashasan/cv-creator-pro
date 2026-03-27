import { useRef } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import CVPreviewCanvas from './CVPreviewCanvas';
import { templateOptions } from './templates/registry';
import DesignControls from './DesignControls';
import { cvPrintFontHref } from '@/lib/cv-design';
import { trackEvent } from '@/lib/analytics';

interface Props {
  data: CVData;
  template: CVTemplate;
  onTemplateChange: (t: CVTemplate) => void;
  onDesignChange: (data: CVData['design']) => void;
}

const CVPreview = ({ data, template, onTemplateChange, onDesignChange }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;

    trackEvent('download_clicked', {
      template,
      experience_count: data.experiences.length,
      education_count: data.education.length,
      skill_count: data.skills.length,
      language_count: data.languages.length,
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      trackEvent('download_popup_blocked', {
        template,
      });
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personalInfo.firstName} ${data.personalInfo.lastName} - CV</title>
          <link href="${cvPrintFontHref}" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 0; size: A4; }
            body { margin: 0; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div className="space-y-5">
      <DesignControls data={data.design} onChange={onDesignChange} />

      <div className="soft-panel p-4">
        <p className="section-kicker">Template selection</p>
        <p className="mt-1.5 text-sm font-medium text-foreground">Choose a layout, then export your CV as a PDF.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {templateOptions.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={`relative rounded-xl border p-4 text-left transition-all duration-150 ${
              template === t.id
                ? 'border-foreground bg-foreground/[0.03] ring-1 ring-foreground/10'
                : 'border-border bg-white hover:border-foreground/20'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
              template === t.id ? 'bg-foreground text-white' : 'bg-muted text-muted-foreground'
            }`}>
              <FileText size={18} />
            </div>
            <p className={`text-sm font-medium ${template === t.id ? 'text-foreground' : 'text-foreground/80'}`}>{t.label}</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">{t.desc}</p>
          </motion.button>
        ))}
      </div>

      <Button onClick={handleDownload} className="w-full">
        <Download size={16} className="mr-1.5" /> Download as PDF
      </Button>

      <CVPreviewCanvas
        ref={printRef}
        data={data}
        template={template}
        maxHeightClassName="max-h-[70vh]"
        scaleClassName="scale-[0.4] md:scale-[0.5] xl:scale-[0.58]"
      />
    </div>
  );
};

export default CVPreview;
