import { CVData } from '@/types/cv';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const ExecutiveTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;

  return (
    <div className="min-h-[297mm] w-[210mm] bg-[#f7f3ec] px-0 font-serif text-sm text-[#1d1a16]">
      <header className="bg-[#1d1a16] px-10 py-10 text-[#f7f3ec]">
        <p className="text-xs uppercase tracking-[0.45em] text-[#d8b36a]">Professional Resume</p>
        <h1 className="mt-3 text-4xl font-semibold">{p.firstName} {p.lastName}</h1>
        <p className="mt-2 text-base text-[#e8dcc8]">{p.title}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#e8dcc8]">
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
              <h2 className="mb-3 text-sm uppercase tracking-[0.25em] text-[#8c6a2f]">Profil</h2>
              <p className="leading-7 text-[#433d36]">{p.summary}</p>
            </section>
          )}

          {experiences.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em] text-[#8c6a2f]">Berufserfahrung</h2>
              <div className="space-y-5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-[#d8b36a] pl-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-[#8c6a2f]">{exp.company}</p>
                      </div>
                      <p className="text-xs text-[#7c746c]">{formatDate(exp.startDate)} - {exp.current ? 'Heute' : formatDate(exp.endDate)}</p>
                    </div>
                    {exp.description && <p className="mt-2 text-xs leading-6 text-[#4b443d]">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em] text-[#8c6a2f]">Bildung</h2>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-[#8c6a2f]">{edu.institution}</p>
                        {edu.field && <p className="text-xs text-[#5b544d]">{edu.field}</p>}
                      </div>
                      <p className="text-xs text-[#7c746c]">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                    </div>
                    {edu.grade && <p className="mt-1 text-xs text-[#5b544d]">Note: {edu.grade}</p>}
                    {edu.description && <p className="mt-2 text-xs leading-6 text-[#4b443d]">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8 border-l border-[#d8c8b2] pl-6">
          {skills.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em] text-[#8c6a2f]">Skills</h2>
              <div className="space-y-3">
                {skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span>{skill.name}</span>
                      <span className="text-[#8c6a2f]">{skill.level}/5</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#ddd2c2]">
                      <div className="h-full rounded-full bg-[#8c6a2f]" style={{ width: `${skill.level * 20}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm uppercase tracking-[0.25em] text-[#8c6a2f]">Sprachen</h2>
              <div className="space-y-2">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between text-xs">
                    <span>{lang.name}</span>
                    <span className="text-[#8c6a2f]">{lang.level}</span>
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
