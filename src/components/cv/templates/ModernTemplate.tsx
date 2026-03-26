import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const ModernTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="min-h-[297mm] w-[210mm] p-8 text-sm"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.bodyColor,
        fontFamily: design.bodyFontFamily,
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-6 border-b-2 pb-6" style={{ borderColor: design.accentColor }}>
        {p.photo && (
          <img src={p.photo} alt="" className="h-20 w-20 rounded-full border-2 object-cover" style={{ borderColor: design.accentColor }} />
        )}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{p.firstName} {p.lastName}</h1>
          <p className="mt-1 text-lg" style={{ color: design.titleColor }}>{p.title}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs" style={{ color: design.mutedColor }}>
            {p.email && <span className="flex items-center gap-1"><Mail size={12} style={{ color: design.accentColor }} /> {p.email}</span>}
            {p.phone && <span className="flex items-center gap-1"><Phone size={12} style={{ color: design.accentColor }} /> {p.phone}</span>}
            {p.address && <span className="flex items-center gap-1"><MapPin size={12} style={{ color: design.accentColor }} /> {p.address}</span>}
            {p.website && <span className="flex items-center gap-1"><Globe size={12} style={{ color: design.accentColor }} /> {p.website}</span>}
            {p.linkedin && <span className="flex items-center gap-1"><Linkedin size={12} style={{ color: design.accentColor }} /> {p.linkedin}</span>}
          </div>
        </div>
      </div>

      {p.summary && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Profile</h2>
          <p className="leading-relaxed" style={{ color: design.bodyColor }}>{p.summary}</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Experience</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                <span className="text-xs" style={{ color: design.mutedColor }}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <p className="text-sm" style={{ color: design.accentColor }}>{exp.company}</p>
              <p className="mt-1 text-xs leading-relaxed" style={{ color: design.bodyColor }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Education</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{edu.degree} {edu.field ? `- ${edu.field}` : ''}</h3>
                <span className="text-xs" style={{ color: design.mutedColor }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
              <p className="text-sm" style={{ color: design.accentColor }}>{edu.institution}</p>
              {edu.grade && <p className="text-xs" style={{ color: design.mutedColor }}>Grade: {edu.grade}</p>}
              {edu.description && <p className="mt-1 text-xs leading-relaxed" style={{ color: design.bodyColor }}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {skills.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Skills</h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: design.bodyColor }}>{skill.name}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((l) => (
                      <div key={l} className="h-2 w-2 rounded-full" style={{ backgroundColor: l <= skill.level ? design.accentColor : design.dividerColor }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Languages</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: design.bodyColor }}>{lang.name}</span>
                  <span className="text-xs font-medium" style={{ color: design.accentColor }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
