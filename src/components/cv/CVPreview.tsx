import { useRef } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import CVPreviewCanvas from './CVPreviewCanvas';
import { templateOptions } from './templates/registry';

interface Props {
  data: CVData;
  template: CVTemplate;
  onTemplateChange: (t: CVTemplate) => void;
}

const CVPreview = ({ data, template, onTemplateChange }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.personalInfo.firstName} ${data.personalInfo.lastName} - CV</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
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
    <div className="space-y-6">
      <div className="soft-panel p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Template Auswahl</p>
        <p className="mt-2 font-display text-lg text-foreground">Wähle ein Layout, dann exportiere als PDF.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        {templateOptions.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={`relative rounded-[24px] border p-4 text-left transition-all ${
              template === t.id
                ? 'border-primary/30 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-[0_24px_50px_-32px_rgba(235,117,25,0.45)]'
                : 'border-white/70 bg-white/80 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white'
            }`}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/90">
              <FileText size={20} className={template === t.id ? 'text-primary' : 'text-muted-foreground'} />
            </div>
            <p className={`text-sm font-display ${template === t.id ? 'text-primary' : 'text-foreground'}`}>{t.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
          </motion.button>
        ))}
      </div>

      <Button onClick={handleDownload} className="w-full font-display">
        <Download size={16} className="mr-2" /> Als PDF herunterladen
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
