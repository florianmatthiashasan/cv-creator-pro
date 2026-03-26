import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${m}/${y}`;
};

const CreativeTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;
  const design = getDesignTokens(data.design);

  return (
    <div
      className="flex min-h-[297mm] w-[210mm] text-sm"
      style={{
        backgroundColor: design.backgroundColor,
        color: design.bodyColor,
        fontFamily: design.bodyFontFamily,
      }}
    >
      {/* Sidebar */}
      <div
        className="flex w-[70mm] flex-col p-6"
        style={{
          backgroundColor: design.sidebarBackgroundColor,
          color: design.sidebarTextColor,
        }}
      >
        <div className="mb-8">
          {p.photo ? (
            <img src={p.photo} alt="" className="mx-auto h-20 w-20 rounded-full border-2 object-cover" style={{ borderColor: design.accentColor }} />
          ) : (
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold"
              style={{
                backgroundColor: design.accentColor,
                color: design.sidebarBackgroundColor,
                fontFamily: design.headingFontFamily,
              }}
            >
              {p.firstName?.[0]}{p.lastName?.[0]}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: design.accentColor, fontFamily: design.headingFontFamily }}>Kontakt</h3>
          {p.email && <div className="flex items-center gap-2 text-xs" style={{ color: design.sidebarTextColor }}><Mail size={12} style={{ color: design.accentColor }} /> {p.email}</div>}
          {p.phone && <div className="flex items-center gap-2 text-xs" style={{ color: design.sidebarTextColor }}><Phone size={12} style={{ color: design.accentColor }} /> {p.phone}</div>}
          {p.address && <div className="flex items-center gap-2 text-xs" style={{ color: design.sidebarTextColor }}><MapPin size={12} style={{ color: design.accentColor }} /> {p.address}</div>}
          {p.website && <div className="flex items-center gap-2 text-xs" style={{ color: design.sidebarTextColor }}><Globe size={12} style={{ color: design.accentColor }} /> {p.website}</div>}
          {p.linkedin && <div className="flex items-center gap-2 text-xs" style={{ color: design.sidebarTextColor }}><Linkedin size={12} style={{ color: design.accentColor }} /> {p.linkedin}</div>}
        </div>

        {skills.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: design.accentColor, fontFamily: design.headingFontFamily }}>Skills</h3>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: design.sidebarTextColor }}>{skill.name}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: `${design.sidebarTextColor}22` }}>
                    <div className="h-full rounded-full" style={{ width: `${skill.level * 20}%`, backgroundColor: design.accentColor }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: design.accentColor, fontFamily: design.headingFontFamily }}>Sprachen</h3>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-xs">
                  <span style={{ color: design.sidebarTextColor }}>{lang.name}</span>
                  <span className="font-medium" style={{ color: design.accentColor }}>{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: design.accentColor, fontFamily: design.headingFontFamily }}>Bildung</h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <p className="text-xs font-semibold" style={{ color: design.sidebarTextColor, fontFamily: design.headingFontFamily }}>{edu.degree}</p>
                <p className="text-xs" style={{ color: design.accentColor }}>{edu.field}</p>
                <p className="text-xs" style={{ color: design.sidebarTextColor }}>{edu.institution}</p>
                <p className="text-xs" style={{ color: `${design.sidebarTextColor}99` }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                {edu.grade && <p className="text-xs" style={{ color: `${design.sidebarTextColor}99` }}>Note: {edu.grade}</p>}
                {edu.description && <p className="mt-1 text-xs leading-relaxed" style={{ color: `${design.sidebarTextColor}cc` }}>{edu.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: design.nameColor, fontFamily: design.headingFontFamily }}>{p.firstName}</h1>
          <h1 className="text-3xl font-bold" style={{ color: design.titleColor, fontFamily: design.headingFontFamily }}>{p.lastName}</h1>
          <p className="mt-2 text-sm uppercase tracking-widest" style={{ color: design.mutedColor }}>{p.title}</p>
        </div>

        {p.summary && (
          <div className="mb-8">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Profil</h2>
            <div className="mb-3 h-0.5 w-8" style={{ backgroundColor: design.accentColor }} />
            <p className="text-xs leading-relaxed" style={{ color: design.bodyColor }}>{p.summary}</p>
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>Erfahrung</h2>
            <div className="mb-4 h-0.5 w-8" style={{ backgroundColor: design.accentColor }} />
            {experiences.map((exp) => (
              <div key={exp.id} className="relative mb-5 border-l-2 pl-4" style={{ borderColor: `${design.accentColor}55` }}>
                <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full" style={{ backgroundColor: design.accentColor }} />
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold" style={{ color: design.headingColor, fontFamily: design.headingFontFamily }}>{exp.position}</h3>
                  <span className="text-xs" style={{ color: design.mutedColor }}>{formatDate(exp.startDate)} - {exp.current ? 'Heute' : formatDate(exp.endDate)}</span>
                </div>
                <p className="text-xs font-medium" style={{ color: design.accentColor }}>{exp.company}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: design.bodyColor }}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeTemplate;
