import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { contactItems, dateRange, fullName, renderAdditionalSections } from './template-utils';

const GridTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div className="min-h-[297mm] w-[210mm] p-7 text-[12px]" style={{ backgroundColor: design.backgroundColor, color: design.bodyColor, fontFamily: design.bodyFontFamily }}>
      <header className="mb-5 rounded-[2rem] p-7" style={{ backgroundColor: design.sidebarBackgroundColor, color: design.sidebarTextColor }}>
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.32em]" style={{ color: design.accentColor }}>Selected profile</p>
            <h1 className="text-5xl font-semibold leading-none tracking-[-0.05em]" style={{ fontFamily: design.headingFontFamily }}>{fullName(data)}</h1>
            {p.title && <p className="mt-4 text-lg opacity-80">{p.title}</p>}
          </div>
          {p.photo && <img src={p.photo} alt="Profile photo" className="h-24 w-24 rounded-2xl object-cover" />}
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-[10px]">
          {contactItems(data).map((item) => <span key={item} className="rounded-full border border-white/20 px-3 py-1">{item}</span>)}
        </div>
      </header>

      <main className="grid grid-cols-12 gap-4">
        {p.summary && (
          <section className="col-span-12 rounded-2xl border p-5" style={{ borderColor: design.dividerColor }}>
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.accentColor }}>Profile</h2>
            <p className="text-sm leading-7">{p.summary}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="col-span-8 rounded-2xl border p-5" style={{ borderColor: design.dividerColor }}>
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.accentColor }}>Experience</h2>
            <div className="space-y-5">
              {experiences.map((exp) => (
                <article key={exp.id}>
                  <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: design.mutedColor }}>{dateRange(exp.startDate, exp.endDate, exp.current)}</p>
                  <h3 className="mt-1 text-base font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                  <p style={{ color: design.titleColor }}>{exp.company}</p>
                  {exp.description && <p className="mt-2 leading-6">{exp.description}</p>}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="col-span-8">
          {renderAdditionalSections(data)}
        </section>

        <aside className="col-span-4 space-y-4">
          {skills.length > 0 && (
            <section className="rounded-2xl p-5" style={{ backgroundColor: `${design.accentColor}18` }}>
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.headingColor }}>Skills</h2>
              <div className="space-y-2">
                {skills.map((skill) => <p key={skill.id} className="flex justify-between gap-3"><span>{skill.name}</span><span style={{ color: design.mutedColor }}>{skill.level}/5</span></p>)}
              </div>
            </section>
          )}
          {languages.length > 0 && (
            <section className="rounded-2xl border p-5" style={{ borderColor: design.dividerColor }}>
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.accentColor }}>Languages</h2>
              <div className="space-y-2">
                {languages.map((lang) => <p key={lang.id} className="flex justify-between gap-3"><span>{lang.name}</span><span>{lang.level}</span></p>)}
              </div>
            </section>
          )}
          {education.length > 0 && (
            <section className="rounded-2xl border p-5" style={{ borderColor: design.dividerColor }}>
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: design.accentColor }}>Education</h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <article key={edu.id}>
                    <h3 className="font-semibold" style={{ color: design.headingColor }}>{edu.degree}</h3>
                    <p>{edu.field}</p>
                    <p className="text-[10px]" style={{ color: design.mutedColor }}>{edu.institution}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </aside>
      </main>
    </div>
  );
};

export default GridTemplate;
