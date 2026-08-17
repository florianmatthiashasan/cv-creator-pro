import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { contactItems, dateRange, fullName } from './template-utils';

const CompactTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div className="min-h-[297mm] w-[210mm] px-8 py-7 text-[11px] leading-5" style={{ backgroundColor: design.backgroundColor, color: design.bodyColor, fontFamily: design.bodyFontFamily }}>
      <header className="mb-5 grid grid-cols-[1fr_0.9fr] gap-6">
        <div>
          <h1 className="text-4xl font-bold leading-none tracking-[-0.05em]" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{fullName(data)}</h1>
          {p.title && <p className="mt-2 text-base font-semibold" style={{ color: design.titleColor }}>{p.title}</p>}
        </div>
        <div className="grid content-start gap-1 text-right text-[10px]" style={{ color: design.mutedColor }}>
          {contactItems(data).map((item) => <p key={item}>{item}</p>)}
        </div>
      </header>

      <div className="grid grid-cols-[1.35fr_0.65fr] gap-7 border-t pt-5" style={{ borderColor: design.dividerColor }}>
        <main className="space-y-5">
          {p.summary && (
            <section>
              <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: design.accentColor }}>Profile</h2>
              <p>{p.summary}</p>
            </section>
          )}
          {experiences.length > 0 && (
            <section>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: design.accentColor }}>Experience</h2>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <article key={exp.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-bold" style={{ color: design.headingColor }}>{exp.position}</h3>
                      <span className="text-[10px]" style={{ color: design.mutedColor }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</span>
                    </div>
                    <p className="font-semibold" style={{ color: design.titleColor }}>{exp.company}</p>
                    {exp.description && <p className="mt-1">{exp.description}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-5 border-l pl-5" style={{ borderColor: design.dividerColor }}>
          {education.length > 0 && (
            <section>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: design.accentColor }}>Education</h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <article key={edu.id}>
                    <h3 className="font-bold" style={{ color: design.headingColor }}>{edu.degree}</h3>
                    <p>{edu.field}</p>
                    <p style={{ color: design.mutedColor }}>{edu.institution}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
          {skills.length > 0 && (
            <section>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: design.accentColor }}>Skills</h2>
              <div className="space-y-1">
                {skills.map((skill) => <p key={skill.id} className="flex justify-between gap-3"><span>{skill.name}</span><span style={{ color: design.mutedColor }}>{skill.level}/5</span></p>)}
              </div>
            </section>
          )}
          {languages.length > 0 && (
            <section>
              <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: design.accentColor }}>Languages</h2>
              <div className="space-y-1">
                {languages.map((lang) => <p key={lang.id} className="flex justify-between gap-3"><span>{lang.name}</span><span style={{ color: design.mutedColor }}>{lang.level}</span></p>)}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default CompactTemplate;
