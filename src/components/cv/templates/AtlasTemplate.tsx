import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { contactItems, dateRange, fullName } from './template-utils';

const AtlasTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="min-h-[297mm] w-[210mm] p-9 text-[12px]"
      style={{ backgroundColor: design.backgroundColor, color: design.bodyColor, fontFamily: design.bodyFontFamily }}
    >
      <header className="grid grid-cols-[1.2fr_0.8fr] gap-8 border-b pb-7" style={{ borderColor: design.dividerColor }}>
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.35em]" style={{ color: design.accentColor }}>Curriculum vitae</p>
          <h1 className="text-5xl font-semibold leading-none tracking-[-0.04em]" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>
            {fullName(data)}
          </h1>
          {p.title && <p className="mt-4 text-lg" style={{ color: design.titleColor }}>{p.title}</p>}
        </div>
        <div className="space-y-2 text-right text-[11px]" style={{ color: design.mutedColor }}>
          {contactItems(data).map((item) => <p key={item}>{item}</p>)}
        </div>
      </header>

      {p.summary && (
        <section className="grid grid-cols-[9rem_1fr] gap-7 border-b py-6" style={{ borderColor: design.dividerColor }}>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: design.headingColor }}>Profile</h2>
          <p className="text-base leading-8" style={{ color: design.bodyColor }}>{p.summary}</p>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="grid grid-cols-[9rem_1fr] gap-7 border-b py-6" style={{ borderColor: design.dividerColor }}>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: design.headingColor }}>Experience</h2>
          <div className="space-y-5">
            {experiences.map((exp) => (
              <article key={exp.id} className="relative border-l pl-5" style={{ borderColor: design.accentColor }}>
                <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: design.accentColor }} />
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-base font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                  <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: design.mutedColor }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</p>
                </div>
                <p className="mt-1 font-semibold" style={{ color: design.accentColor }}>{exp.company}</p>
                {exp.description && <p className="mt-2 leading-6" style={{ color: design.bodyColor }}>{exp.description}</p>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-[9rem_1fr] gap-7 py-6">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: design.headingColor }}>Details</h2>
        <div className="grid grid-cols-2 gap-7">
          {education.length > 0 && (
            <div>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: design.accentColor }}>Education</h3>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-semibold" style={{ color: design.headingColor }}>{edu.degree} {edu.field}</p>
                    <p style={{ color: design.mutedColor }}>{edu.institution}</p>
                    <p className="text-[10px]" style={{ color: design.mutedColor }}>{dateRange(edu.startDate, edu.endDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-5">
            {skills.length > 0 && (
              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: design.accentColor }}>Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => <span key={skill.id} className="border px-2 py-1 text-[11px]" style={{ borderColor: design.dividerColor }}>{skill.name}</span>)}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: design.accentColor }}>Languages</h3>
                <div className="space-y-1">
                  {languages.map((lang) => <p key={lang.id}>{lang.name} <span style={{ color: design.mutedColor }}>({lang.level})</span></p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AtlasTemplate;
