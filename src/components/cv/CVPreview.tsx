import { useRef } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import DesignControls from './DesignControls';
import { templateComponents } from './templates/registry';
import { cvPrintFontHref } from '@/lib/cv-design';
import { trackEvent } from '@/lib/analytics';

interface Props {
  data: CVData;
  template: CVTemplate;
  onDesignChange: (data: CVData['design']) => void;
}

const getSectionCount = (data: CVData) => {
  const hasPersonalInfo = Object.values(data.personalInfo).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );

  return [
    hasPersonalInfo,
    data.experiences.length > 0,
    data.education.length > 0,
    data.skills.length > 0,
    data.languages.length > 0,
    (data.additionalSections || []).length > 0,
  ].filter(Boolean).length;
};

const CVPreview = ({ data, template, onDesignChange }: Props) => {
  const printRef = useRef<HTMLDivElement>(null);
  const TemplateComponent = templateComponents[template];

  const handleDownload = () => {
    const content = printRef.current;
    if (!content) return;

    trackEvent('pdf_export_clicked');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

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
    setTimeout(() => {
      printWindow.print();
      trackEvent('pdf_export_success', {
        template_name: template,
        section_count: getSectionCount(data),
      });
      printWindow.close();
    }, 500);
  };

  return (
    <div className="space-y-5">
      <DesignControls data={data.design} onChange={onDesignChange} />

      <div className="soft-panel p-4">
        <p className="section-kicker">Export</p>
        <p className="mt-1.5 text-sm font-medium text-foreground">Review the live layout on the right, adjust design details, then export your CV as a PDF.</p>
      </div>

      <Button onClick={handleDownload} className="w-full">
        <Download size={16} className="mr-1.5" /> Download as PDF
      </Button>

      <div className="hidden" aria-hidden="true">
        <div ref={printRef}>
          <TemplateComponent data={data} />
        </div>
      </div>
    </div>
  );
};

export default CVPreview;
