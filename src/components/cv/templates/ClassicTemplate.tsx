import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const ClassicTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="min-h-[297mm] w-[210mm] p-10 text-sm"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.bodyColor,
        fontFamily: design.bodyFontFamily,
      }}
    >
      <div className="mb-8 border-b pb-6 text-center" style={{ borderColor: design.dividerColor }}>
        {p.photo && (
          <img src={p.photo} alt="" className="mx-auto mb-4 h-24 w-24 rounded-full border object-cover" style={{ borderColor: design.dividerColor }} />
        )}
        <h1 className="text-3xl font-normal tracking-wide" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{p.firstName} {p.lastName}</h1>
        <p className="mt-1 text-base italic" style={{ color: design.titleColor }}>{p.title}</p>
        <div className="mt-3 flex justify-center gap-4 text-xs" style={{ color: design.mutedColor }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.address && <span>• {p.address}</span>}
        </div>
        <div className="mt-1 flex justify-center gap-4 text-xs" style={{ color: design.mutedColor }}>
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </div>

      {p.summary && (
        <div className="mb-8">
          <h2 className="mb-3 border-b pb-1 text-base font-semibold" style={{ color: design.headingColor, borderColor: design.dividerColor, fontFamily: design.headingFontFamily }}>Über mich</h2>
          <p className="leading-relaxed italic" style={{ color: design.bodyColor }}>{p.summary}</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 border-b pb-1 text-base font-semibold" style={{ color: design.headingColor, borderColor: design.dividerColor, fontFamily: design.headingFontFamily }}>Berufserfahrung</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-5 border-l-2 pl-4" style={{ borderColor: design.dividerColor }}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                  <p className="italic" style={{ color: design.accentColor }}>{exp.company}</p>
                </div>
                <span className="whitespace-nowrap text-xs" style={{ color: design.mutedColor }}>{formatDate(exp.startDate)} - {exp.current ? 'Heute' : formatDate(exp.endDate)}</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: design.bodyColor }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 border-b pb-1 text-base font-semibold" style={{ color: design.headingColor, borderColor: design.dividerColor, fontFamily: design.headingFontFamily }}>Bildung</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4 border-l-2 pl-4" style={{ borderColor: design.dividerColor }}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</h3>
                  <p className="italic" style={{ color: design.accentColor }}>{edu.institution}</p>
                </div>
                <span className="whitespace-nowrap text-xs" style={{ color: design.mutedColor }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
              </div>
              {edu.grade && <p className="mt-1 text-xs" style={{ color: design.mutedColor }}>Note: {edu.grade}</p>}
              {edu.description && <p className="mt-2 text-xs leading-relaxed" style={{ color: design.bodyColor }}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {skills.length > 0 && (
          <div>
            <h2 className="mb-3 border-b pb-1 text-base font-semibold" style={{ color: design.headingColor, borderColor: design.dividerColor, fontFamily: design.headingFontFamily }}>Kenntnisse</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded px-3 py-1 text-xs"
                  style={{ backgroundColor: `${design.accentColor}18`, color: design.bodyColor }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="mb-3 border-b pb-1 text-base font-semibold" style={{ color: design.headingColor, borderColor: design.dividerColor, fontFamily: design.headingFontFamily }}>Sprachen</h2>
            <div className="space-y-1">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-sm">
                  <span style={{ color: design.bodyColor }}>{lang.name}</span>
                  <span style={{ color: design.mutedColor }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
