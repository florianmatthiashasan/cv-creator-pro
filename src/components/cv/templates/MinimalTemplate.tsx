import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const MinimalTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="min-h-[297mm] w-[210mm] px-10 py-12 text-sm"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.bodyColor,
        fontFamily: design.bodyFontFamily,
      }}
    >
      <header className="border-b pb-6" style={{ borderColor: design.dividerColor }}>
        <h1 className="text-4xl font-semibold tracking-tight" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{p.firstName} {p.lastName}</h1>
        <p className="mt-2 text-base" style={{ color: design.titleColor }}>{p.title}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: design.mutedColor }}>
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>{p.phone}</span>}
          {p.address && <span>{p.address}</span>}
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </header>

      {p.summary && (
        <section className="pt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Profil</h2>
          <p className="leading-7" style={{ color: design.bodyColor }}>{p.summary}</p>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="pt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Erfahrung</h2>
          <div className="space-y-5">
            {experiences.map((exp) => (
              <div key={exp.id}>
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
        <section className="pt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Bildung</h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h3 className="font-semibold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</h3>
                    <p style={{ color: design.accentColor }}>{edu.institution}</p>
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

      <section className="grid grid-cols-2 gap-8 pt-8">
        {skills.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Skills</h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3">
                  <span style={{ color: design.bodyColor }}>{skill.name}</span>
                  <span className="text-xs" style={{ color: design.mutedColor }}>{skill.level}/5</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Sprachen</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between gap-3">
                  <span style={{ color: design.bodyColor }}>{lang.name}</span>
                  <span className="text-xs" style={{ color: design.mutedColor }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default MinimalTemplate;
