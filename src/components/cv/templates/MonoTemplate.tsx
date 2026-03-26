import { CVData } from '@/types/cv';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${m}.${y}`;
};

const MonoTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;

  return (
    <div className="min-h-[297mm] w-[210mm] bg-[#fafafa] px-9 py-10 font-mono text-[12px] leading-6 text-zinc-900">
      <header className="border border-zinc-900 px-5 py-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-[0.18em]">{p.firstName} {p.lastName}</h1>
            <p className="mt-2 uppercase tracking-[0.25em] text-zinc-500">{p.title}</p>
          </div>
          <div className="space-y-1 text-right text-[11px] text-zinc-600">
            {p.email && <p>{p.email}</p>}
            {p.phone && <p>{p.phone}</p>}
            {p.address && <p>{p.address}</p>}
            {p.website && <p>{p.website}</p>}
            {p.linkedin && <p>{p.linkedin}</p>}
          </div>
        </div>
      </header>

      {p.summary && (
        <section className="mt-6 border-t border-dashed border-zinc-300 pt-4">
          <h2 className="mb-2 font-bold uppercase tracking-[0.2em]">Summary</h2>
          <p className="text-zinc-700">{p.summary}</p>
        </section>
      )}

      {experiences.length > 0 && (
        <section className="mt-6 border-t border-dashed border-zinc-300 pt-4">
          <h2 className="mb-3 font-bold uppercase tracking-[0.2em]">Experience</h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold">{exp.position} / {exp.company}</h3>
                  <span className="text-[11px] text-zinc-500">{formatDate(exp.startDate)} - {exp.current ? 'current' : formatDate(exp.endDate)}</span>
                </div>
                {exp.description && <p className="text-zinc-700">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mt-6 border-t border-dashed border-zinc-300 pt-4">
          <h2 className="mb-3 font-bold uppercase tracking-[0.2em]">Education</h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold">{edu.degree} / {edu.field}</h3>
                  <span className="text-[11px] text-zinc-500">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                </div>
                <p className="text-zinc-600">{edu.institution}</p>
                {edu.grade && <p className="text-zinc-500">grade: {edu.grade}</p>}
                {edu.description && <p className="text-zinc-700">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-6 border-t border-dashed border-zinc-300 pt-4">
        {skills.length > 0 && (
          <div>
            <h2 className="mb-3 font-bold uppercase tracking-[0.2em]">Skills</h2>
            <div className="space-y-1">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3">
                  <span>{skill.name}</span>
                  <span className="text-zinc-500">{'#'.repeat(skill.level)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="mb-3 font-bold uppercase tracking-[0.2em]">Languages</h2>
            <div className="space-y-1">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between gap-3">
                  <span>{lang.name}</span>
                  <span className="text-zinc-500">{lang.level}</span>
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
