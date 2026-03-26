import { useRef } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import CVPreviewCanvas from './CVPreviewCanvas';

interface Props {
  data: CVData;
  template: CVTemplate;
  onTemplateChange: (t: CVTemplate) => void;
}

const templates: { id: CVTemplate; label: string; desc: string }[] = [
  { id: 'modern', label: 'Modern', desc: 'Clean & Bold' },
  { id: 'classic', label: 'Klassisch', desc: 'Zeitlos elegant' },
  { id: 'creative', label: 'Kreativ', desc: 'Sidebar-Layout' },
];

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
      {/* Template Selector */}
      <div className="grid grid-cols-3 gap-3">
        {templates.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => onTemplateChange(t.id)}
            className={`relative p-4 rounded-xl border-2 transition-all text-left ${
              template === t.id ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/30'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText size={20} className={template === t.id ? 'text-primary' : 'text-muted-foreground'} />
            <p className={`text-sm font-display mt-2 ${template === t.id ? 'text-primary' : 'text-foreground'}`}>{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Download Button */}
      <Button onClick={handleDownload} className="w-full bg-primary text-primary-foreground font-display hover:bg-primary/90">
        <Download size={16} className="mr-2" /> Als PDF herunterladen
      </Button>

      {/* Preview */}
      <CVPreviewCanvas
        ref={printRef}
        data={data}
        template={template}
        maxHeightClassName="max-h-[70vh]"
        scaleClassName="scale-[0.5] md:scale-[0.58]"
      />
    </div>
  );
};

export default CVPreview;
