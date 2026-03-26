import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  return `${m}/${y}`;
};

const CreativeTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills } = data;

  return (
    <div className="bg-white min-h-[297mm] w-[210mm] font-sans text-sm flex">
      {/* Sidebar */}
      <div className="w-[70mm] bg-gray-900 text-white p-6 flex flex-col">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto">
            {p.firstName?.[0]}{p.lastName?.[0]}
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">Kontakt</h3>
          {p.email && <div className="flex items-center gap-2 text-xs text-gray-300"><Mail size={12} className="text-amber-400" /> {p.email}</div>}
          {p.phone && <div className="flex items-center gap-2 text-xs text-gray-300"><Phone size={12} className="text-amber-400" /> {p.phone}</div>}
          {p.address && <div className="flex items-center gap-2 text-xs text-gray-300"><MapPin size={12} className="text-amber-400" /> {p.address}</div>}
          {p.website && <div className="flex items-center gap-2 text-xs text-gray-300"><Globe size={12} className="text-amber-400" /> {p.website}</div>}
          {p.linkedin && <div className="flex items-center gap-2 text-xs text-gray-300"><Linkedin size={12} className="text-amber-400" /> {p.linkedin}</div>}
        </div>

        {skills.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Skills</h3>
            <div className="space-y-3">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{skill.name}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${skill.level * 20}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Bildung</h3>
            {education.map((edu) => (
              <div key={edu.id} className="mb-4">
                <p className="text-xs font-semibold text-white">{edu.degree}</p>
                <p className="text-xs text-amber-400">{edu.field}</p>
                <p className="text-xs text-gray-400">{edu.institution}</p>
                <p className="text-xs text-gray-500">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</p>
                {edu.grade && <p className="text-xs text-gray-500">Note: {edu.grade}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{p.firstName}</h1>
          <h1 className="text-3xl font-bold text-amber-500">{p.lastName}</h1>
          <p className="text-sm text-gray-500 mt-2 uppercase tracking-widest">{p.title}</p>
        </div>

        {p.summary && (
          <div className="mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Profil</h2>
            <div className="w-8 h-0.5 bg-amber-500 mb-3" />
            <p className="text-gray-600 leading-relaxed text-xs">{p.summary}</p>
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">Erfahrung</h2>
            <div className="w-8 h-0.5 bg-amber-500 mb-4" />
            {experiences.map((exp) => (
              <div key={exp.id} className="mb-5 relative pl-4 border-l-2 border-amber-200">
                <div className="absolute -left-[5px] top-1 w-2 h-2 bg-amber-500 rounded-full" />
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-gray-900 text-sm">{exp.position}</h3>
                  <span className="text-xs text-gray-400">{formatDate(exp.startDate)} — {exp.current ? 'Heute' : formatDate(exp.endDate)}</span>
                </div>
                <p className="text-amber-600 text-xs font-medium">{exp.company}</p>
                <p className="text-gray-500 mt-1 text-xs leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeTemplate;
