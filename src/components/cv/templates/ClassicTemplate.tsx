import { CVData } from '@/types/cv';

const formatDate = (d: string) => {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${months[parseInt(m) - 1]} ${y}`;
};

const ClassicTemplate = ({ data }: { data: CVData }) => {
  const { personalInfo: p, experiences, education, skills, languages } = data;

  return (
    <div className="bg-white text-gray-900 p-10 min-h-[297mm] w-[210mm] font-serif text-sm">
      <div className="text-center border-b border-gray-300 pb-6 mb-8">
        {p.photo && (
          <img src={p.photo} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border border-gray-300" />
        )}
        <h1 className="text-3xl font-normal tracking-wide text-gray-900">{p.firstName} {p.lastName}</h1>
        <p className="text-base text-gray-600 mt-1 italic">{p.title}</p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
          {p.email && <span>{p.email}</span>}
          {p.phone && <span>• {p.phone}</span>}
          {p.address && <span>• {p.address}</span>}
        </div>
        <div className="flex justify-center gap-4 mt-1 text-xs text-gray-500">
          {p.website && <span>{p.website}</span>}
          {p.linkedin && <span>• {p.linkedin}</span>}
        </div>
      </div>

      {p.summary && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-3">Über mich</h2>
          <p className="text-gray-700 leading-relaxed italic">{p.summary}</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-4">Berufserfahrung</h2>
          {experiences.map((exp) => (
            <div key={exp.id} className="mb-5 pl-4 border-l-2 border-gray-200">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-gray-600 italic">{exp.company}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(exp.startDate)} — {exp.current ? 'Heute' : formatDate(exp.endDate)}</span>
              </div>
              <p className="text-gray-600 mt-2 text-xs leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-4">Bildung</h2>
          {education.map((edu) => (
            <div key={edu.id} className="mb-4 pl-4 border-l-2 border-gray-200">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}, {edu.field}</h3>
                  <p className="text-gray-600 italic">{edu.institution}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
              </div>
              {edu.grade && <p className="text-xs text-gray-500 mt-1">Note: {edu.grade}</p>}
              {edu.description && <p className="mt-2 text-xs leading-relaxed text-gray-600">{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {skills.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-3">Kenntnisse</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded">{skill.name}</span>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-3">Sprachen</h2>
            <div className="space-y-1">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-sm">
                  <span className="text-gray-900">{lang.name}</span>
                  <span className="text-gray-500">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;
