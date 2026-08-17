import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { contactItems, dateRange, fullName } from './template-utils';

const StudioTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div className="flex min-h-[297mm] w-[210mm] text-[12px]" style={{ backgroundColor: design.backgroundColor, color: design.bodyColor, fontFamily: design.bodyFontFamily }}>
      <aside className="w-[72mm] p-7" style={{ backgroundColor: design.sidebarBackgroundColor, color: design.sidebarTextColor }}>
        {p.photo ? (
          <img src={p.photo} alt="Profile photo" className="mb-7 h-32 w-32 rounded-2xl object-cover" />
        ) : (
          <div className="mb-7 flex h-32 w-32 items-center justify-center rounded-2xl text-4xl font-semibold" style={{ backgroundColor: `${design.accentColor}33`, color: design.accentColor }}>
            {fullName(data).slice(0, 1)}
          </div>
        )}
        <h1 className="text-3xl font-semibold leading-tight" style={{ fontFamily: design.headingFontFamily }}>{fullName(data)}</h1>
        {p.title && <p className="mt-3 text-sm" style={{ color: design.accentColor }}>{p.title}</p>}

        <div className="mt-8 space-y-2 break-words text-[11px] opacity-85">
          {contactItems(data).map((item) => <p key={item}>{item}</p>)}
        </div>

        {skills.length > 0 && (
          <section className="mt-9">
            <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.accentColor }}>Skills</h2>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="mb-1 flex justify-between gap-3"><span>{skill.name}</span><span>{skill.level}/5</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full" style={{ width: `${skill.level * 20}%`, backgroundColor: design.accentColor }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="mt-9">
            <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.accentColor }}>Languages</h2>
            <div className="space-y-2">
              {languages.map((lang) => <p key={lang.id} className="flex justify-between gap-3"><span>{lang.name}</span><span>{lang.level}</span></p>)}
            </div>
          </section>
        )}
      </aside>

      <main className="flex-1 p-8">
        {p.summary && (
          <section className="mb-7 rounded-2xl p-5" style={{ backgroundColor: `${design.accentColor}14` }}>
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: design.headingColor }}>Profile</h2>
            <p className="text-sm leading-7">{p.summary}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mb-7">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: design.headingColor }}>Experience</h2>
            <div className="space-y-5">
              {experiences.map((exp) => (
                <article key={exp.id} className="rounded-2xl border p-5" style={{ borderColor: design.dividerColor }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                      <p style={{ color: design.accentColor }}>{exp.company}</p>
                    </div>
                    <p className="text-right text-[10px] uppercase tracking-[0.12em]" style={{ color: design.mutedColor }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</p>
                  </div>
                  {exp.description && <p className="mt-3 leading-6">{exp.description}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: design.headingColor }}>Education</h2>
            <div className="grid grid-cols-2 gap-4">
              {education.map((edu) => (
                <article key={edu.id} className="border-t pt-3" style={{ borderColor: design.dividerColor }}>
                  <h3 className="font-semibold" style={{ color: design.headingColor }}>{edu.degree} {edu.field}</h3>
                  <p style={{ color: design.accentColor }}>{edu.institution}</p>
                  <p className="text-[10px]" style={{ color: design.mutedColor }}>{dateRange(edu.startDate, edu.endDate)}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default StudioTemplate;
