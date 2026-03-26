import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const ExecutiveTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="min-h-[297mm] w-[210mm] px-0 text-sm"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.bodyColor,
        fontFamily: design.bodyFontFamily,
      }}
    >
      <header className="px-10 py-10" style={{ backgroundColor: design.sidebarBackgroundColor, color: design.sidebarTextColor }}>
        <p className="text-xs uppercase tracking-[0.45em]" style={{ color: design.accentColor }}>Professional Resume</p>
        <h1 className="mt-3 text-4xl font-semibold" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{p.firstName} {p.lastName}</h1>
        <p className="mt-2 text-base" style={{ color: design.titleColor }}>{p.title}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: design.sidebarTextColor }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>{p.address}</span>}
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </header>

      <div className="grid grid-cols-[1.4fr_0.8fr] gap-8 px-10 py-8">
        <div className="space-y-8">
          {p.summary && (
            <section>
              <h2 className="mb-3 text-sm uppercase tracking-[0.25em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Profil</h2>
              <p className="leading-7" style={{ color: design.bodyColor }}>{p.summary}</p>
            </section>
          )}

          {experiences.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Berufserfahrung</h2>
              <div className="space-y-5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: design.accentColor }}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                        <p style={{ color: design.accentColor }}>{exp.company}</p>
                      </div>
                      <p className="text-xs" style={{ color: design.mutedColor }}>{formatDate(exp.startDate)} - {exp.current ? 'Heute' : formatDate(exp.endDate)}</p>
                    </div>
                    {exp.description && <p className="mt-2 text-xs leading-6" style={{ color: design.bodyColor }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Bildung</h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{edu.degree}</h3>
                        <p style={{ color: design.accentColor }}>{edu.institution}</p>
                        {edu.field && <p className="text-xs" style={{ color: design.bodyColor }}>{edu.field}</p>}
                      </div>
                      <p className="text-xs" style={{ color: design.mutedColor }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                    </div>
                    {edu.grade && <p className="mt-1 text-xs" style={{ color: design.mutedColor }}>Note: {edu.grade}</p>}
                    {edu.description && <p className="mt-2 text-xs leading-6" style={{ color: design.bodyColor }}>{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8 border-l pl-6" style={{ borderColor: design.dividerColor }}>
          {skills.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Skills</h2>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span style={{ color: design.bodyColor }}>{skill.name}</span>
                      <span style={{ color: design.accentColor }}>{skill.level}/5</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: design.dividerColor }}>
                      <div className="h-full rounded-full" style={{ width: `${skill.level * 20}%`, backgroundColor: design.accentColor }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Sprachen</h2>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between text-xs">
                    <span style={{ color: design.bodyColor }}>{lang.name}</span>
                    <span style={{ color: design.accentColor }}>{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default ExecutiveTemplate;
