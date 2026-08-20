import { CalendarDays, Link2, Mail, MapPin, Phone } from 'lucide-react';
import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { dateRange, fullName } from './template-utils';

const splitDescription = (description: string) =>
  description
    .split(/\n|•|(?:\.\s+)/)
    .map((item) => item.trim().replace(/\.$/, ''))
    .filter(Boolean);

const SectionTitle = ({ children }: { children: string }) => (
  <h2 className="mb-2 border-b-[3px] pb-1 text-[18px] font-extrabold uppercase tracking-[0.02em] text-[#2f3337]">
    {children}
  </h2>
);

const Divider = () => <div className="my-3 border-t border-dashed border-[#c9ced1]" />;

const DevTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);
  const contacts = [
    p.phone && { icon: Phone, text: p.phone },
    p.email && { icon: Mail, text: p.email },
    p.linkedin && { icon: Link2, text: p.linkedin },
    p.address && { icon: MapPin, text: p.address },
    p.website && { icon: Link2, text: p.website },
  ].filter(Boolean) as Array<{ icon: typeof Phone; text: string }>;

  return (
    <div
      className="min-h-[297mm] w-[210mm] bg-white px-10 py-9 text-[12px] leading-[1.22] text-[#394145]"
      style={{ fontFamily: design.bodyFontFamily }}
    >
      <header className="mb-5">
        <h1 className="text-[34px] font-extrabold uppercase leading-none tracking-[0.06em] text-[#2f3337]">
          {fullName(data)}
        </h1>
        {p.title && (
          <p className="mt-2 text-[17px] font-bold leading-tight text-[#687073]">
            {p.title}
          </p>
        )}
        {contacts.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-1 text-[11px] font-semibold text-[#3f474b]">
            {contacts.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.text} className="flex min-w-0 items-center gap-1.5">
                  <Icon size={10} className="shrink-0 text-[#6d7678]" />
                  <span className="truncate">{item.text}</span>
                </span>
              );
            })}
          </div>
        )}
      </header>

      <div className="grid grid-cols-[1.52fr_1fr] gap-8">
        <main>
          {p.summary && (
            <section className="mb-5">
              <SectionTitle>Summary</SectionTitle>
              <p className="max-w-[44em] text-[12px] leading-[1.24]">{p.summary}</p>
            </section>
          )}

          {experiences.length > 0 && (
            <section className="mb-5">
              <SectionTitle>Experience</SectionTitle>
              {experiences.map((exp, index) => {
                const bullets = splitDescription(exp.description);
                return (
                  <article key={exp.id}>
                    {index > 0 && <Divider />}
                    <h3 className="text-[16px] leading-tight text-[#303438]">{exp.position}</h3>
                    <p className="mt-1 text-[13px] font-extrabold text-[#70787a]">{exp.company}</p>
                    <div className="mt-1 flex flex-wrap gap-5 text-[11px] text-[#4f585b]">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={10} className="text-[#70787a]" />
                        {dateRange(exp.startDate, exp.endDate, exp.current)}
                      </span>
                      {p.address && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={10} className="text-[#70787a]" />
                          {p.address}
                        </span>
                      )}
                    </div>
                    {bullets.length > 0 && (
                      <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[11.5px] leading-[1.18]">
                        {bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle>Education</SectionTitle>
              {education.map((edu, index) => (
                <article key={edu.id}>
                  {index > 0 && <Divider />}
                  <h3 className="text-[16px] leading-tight text-[#303438]">
                    {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                  </h3>
                  <p className="mt-1 text-[13px] font-extrabold text-[#70787a]">{edu.institution}</p>
                  <div className="mt-1 flex flex-wrap gap-5 text-[11px] text-[#4f585b]">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={10} className="text-[#70787a]" />
                      {dateRange(edu.startDate, edu.endDate)}
                    </span>
                    {p.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={10} className="text-[#70787a]" />
                        {p.address}
                      </span>
                    )}
                  </div>
                  {edu.description && <p className="mt-2 text-[11.5px] leading-[1.22]">{edu.description}</p>}
                </article>
              ))}
            </section>
          )}
        </main>

        <aside className="space-y-5">
          {(p.website || p.linkedin) && (
            <section>
              <SectionTitle>Projects</SectionTitle>
              {p.website && (
                <article className="mb-3">
                  <h3 className="text-[16px] leading-tight text-[#303438]">Portfolio / GitHub</h3>
                  <p className="mt-1 text-[11.5px] leading-[1.2]">Developer work, repositories, and technical project examples.</p>
                  <p className="mt-1 break-all text-[11.5px]">{p.website}</p>
                </article>
              )}
              {p.linkedin && (
                <article>
                  {p.website && <Divider />}
                  <h3 className="text-[16px] leading-tight text-[#303438]">Professional profile</h3>
                  <p className="mt-1 break-all text-[11.5px]">{p.linkedin}</p>
                </article>
              )}
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <SectionTitle>Skills</SectionTitle>
              <div className="flex flex-wrap gap-x-4 gap-y-3">
                {skills.map((skill) => (
                  <span key={skill.id} className="border-b border-[#aeb5b8] px-2 pb-1 text-[12px] font-extrabold text-[#394145]">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <SectionTitle>Languages</SectionTitle>
              <div className="space-y-2">
                {languages.map((language) => (
                  <p key={language.id} className="flex justify-between gap-4 border-b border-dashed border-[#c9ced1] pb-2 text-[12px]">
                    <span className="font-extrabold">{language.name}</span>
                    <span>{language.level}</span>
                  </p>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle>Courses</SectionTitle>
              {education.slice(0, 2).map((edu, index) => (
                <article key={edu.id}>
                  {index > 0 && <Divider />}
                  <h3 className="text-[12px] font-extrabold text-[#70787a]">{edu.degree}</h3>
                  <p className="mt-1 text-[11.5px] leading-[1.2]">{edu.institution}{edu.field ? `, ${edu.field}` : ''}</p>
                </article>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

export default DevTemplate;
