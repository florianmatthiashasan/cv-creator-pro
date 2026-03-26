import { CVData } from '@/types/cv';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const ModernTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;

  return (
    <div className="bg-white text-gray-900 p-8 min-h-[297mm] w-[210mm] font-sans text-sm">
      {/* Header */}
      <div className="border-b-2 border-amber-500 pb-6 mb-6 flex items-center gap-6">
        {p.photo && (
          <img src={p.photo} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-amber-500" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{p.firstName} {p.lastName}</h1>
          <p className="text-lg text-amber-600 mt-1">{p.title}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
            {p.email && <span className="flex items-center gap-1"><Mail size={12} /> {p.email}</span>}
            {p.phone && <span className="flex items-center gap-1"><Phone size={12} /> {p.phone}</span>}
            {p.address && <span className="flex items-center gap-1"><MapPin size={12} /> {p.address}</span>}
            {p.website && <span className="flex items-center gap-1"><Globe size={12} /> {p.website}</span>}
            {p.linkedin && <span className="flex items-center gap-1"><Linkedin size={12} /> {p.linkedin}</span>}
          </div>
        </div>
      </div>

      {p.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-2">Profil</h2>
          <p className="text-gray-700 leading-relaxed">{p.summary}</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">Berufserfahrung</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">{exp.position}</h3>
                <span className="text-xs text-gray-500">{formatDate(exp.startDate)} — {exp.current ? 'Heute' : formatDate(exp.endDate)}</span>
              </div>
              <p className="text-amber-600 text-sm">{exp.company}</p>
              <p className="text-gray-600 mt-1 text-xs leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">Bildung</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">{edu.degree} — {edu.field}</h3>
                <span className="text-xs text-gray-500">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
              </div>
              <p className="text-amber-600 text-sm">{edu.institution}</p>
              {edu.grade && <p className="text-xs text-gray-500">Note: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {skills.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">Kenntnisse</h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2">
                  <span className="text-gray-900 text-sm">{skill.name}</span>
                  <div className="flex gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((l) => (
                      <div key={l} className={`w-2 h-2 rounded-full ${l <= skill.level ? 'bg-amber-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-3">Sprachen</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between">
                  <span className="text-gray-900 text-sm">{lang.name}</span>
                  <span className="text-xs text-amber-600 font-medium">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;
