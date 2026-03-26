import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${m}.${y}`;
};

const MonoTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="min-h-[297mm] w-[210mm] px-9 py-10 text-[12px] leading-6"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.bodyColor,
        fontFamily: design.bodyFontFamily,
      }}
    >
      <header className="border px-5 py-4" style={{ borderColor: design.headingColor }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-[0.18em]" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{p.firstName} {p.lastName}</h1>
            <p className="mt-2 uppercase tracking-[0.25em]" style={{ color: design.titleColor }}>{p.title}</p>
          </div>
          <div className="space-y-1 text-right text-[11px]" style={{ color: design.mutedColor }}>
            {p.email && <p>{p.email}</p>}
            {p.phone && <p>{p.phone}</p>}
            {p.address && <p>{p.address}</p>}
            {p.website && <p>{p.website}</p>}
            {p.linkedin && <p>{p.linkedin}</p>}
          </div>
        </div>
      </header>

      {p.summary && (
        <section className="mt-6 border-t border-dashed pt-4" style={{ borderColor: design.dividerColor }}>
          <h2 className="mb-2 font-bold uppercase tracking-[0.2em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Summary</h2>
          <p style={{ color: design.bodyColor }}>{p.summary}</p>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mt-6 border-t border-dashed pt-4" style={{ borderColor: design.dividerColor }}>
          <h2 className="mb-3 font-bold uppercase tracking-[0.2em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Experience</h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position} / {exp.company}</h3>
                  <span className="text-[11px]" style={{ color: design.mutedColor }}>{formatDate(exp.startDate)} - {exp.current ? 'current' : formatDate(exp.endDate)}</span>
                </div>
                {exp.description && <p style={{ color: design.bodyColor }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mt-6 border-t border-dashed pt-4" style={{ borderColor: design.dividerColor }}>
          <h2 className="mb-3 font-bold uppercase tracking-[0.2em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Education</h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{edu.degree} / {edu.field}</h3>
                  <span className="text-[11px]" style={{ color: design.mutedColor }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                </div>
                <p style={{ color: design.accentColor }}>{edu.institution}</p>
                {edu.grade && <p style={{ color: design.mutedColor }}>grade: {edu.grade}</p>}
                {edu.description && <p style={{ color: design.bodyColor }}>{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-6 border-t border-dashed pt-4" style={{ borderColor: design.dividerColor }}>
        {skills.length > 0 && (
          <div>
            <h2 className="mb-3 font-bold uppercase tracking-[0.2em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Skills</h2>
            <div className="space-y-1">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3">
                  <span style={{ color: design.bodyColor }}>{skill.name}</span>
                  <span style={{ color: design.accentColor }}>{'#'.repeat(skill.level)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="mb-3 font-bold uppercase tracking-[0.2em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Languages</h2>
            <div className="space-y-1">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between gap-3">
                  <span style={{ color: design.bodyColor }}>{lang.name}</span>
                  <span style={{ color: design.mutedColor }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MonoTemplate;
