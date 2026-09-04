import { CVData } from '@/types/cv';
import { getDesignTokens } from '@/lib/cv-design';

export const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(month) - 1] ?? month} ${year}`;
};

export const dateRange = (startDate: string, endDate: string, current?: boolean) => {
  const start = formatDate(startDate);
  const end = current ? 'Present' : formatDate(endDate);
  return [start, end].filter(Boolean).join(' - ');
};

export const fullName = (data: CVData) => {
  const name = `${data.personalInfo.firstName} ${data.personalInfo.lastName}`.trim();
  return name || 'Your name';
};

export const contactItems = (data: CVData) =>
  [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.address,
    data.personalInfo.website,
    data.personalInfo.linkedin,
  ].filter(Boolean);

const additionalSectionLabels = {
  project: 'Projects',
  certificate: 'Certificates',
  award: 'Awards',
  volunteering: 'Volunteering',
  publication: 'Publications',
};

export const additionalSectionGroups = (data: CVData) =>
  Object.entries(
    (data.additionalSections || []).reduce<Record<string, CVData['additionalSections']>>((groups, item) => {
      if (!item.title.trim() && !item.description.trim()) return groups;
      groups[item.kind] = [...(groups[item.kind] || []), item];
      return groups;
    }, {}),
  ).map(([kind, items]) => ({
    kind,
    label: additionalSectionLabels[kind as keyof typeof additionalSectionLabels] || 'Additional',
    items,
  }));

export const renderAdditionalSections = (data: CVData, mode: 'main' | 'side' = 'main') => {
  const groups = additionalSectionGroups(data);
  if (!groups.length) return null;

  const design = getDesignTokens(data.design);
  const compact = mode === 'side';

  return (
    <>
      {groups.map((group) => (
        <section key={group.kind} className={compact ? 'mt-4' : 'mb-6'}>
          <h2
            className={compact ? 'mb-2 text-[10px] font-bold uppercase tracking-[0.16em]' : 'mb-3 text-sm font-bold uppercase tracking-wider'}
            style={{ color: compact ? design.accentColor : design.headingColor, fontFamily: design.headingFontFamily }}
          >
            {group.label}
          </h2>
          <div className={compact ? 'space-y-2' : 'space-y-3'}>
            {group.items.map((item) => (
              <article key={item.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className={compact ? 'font-bold' : 'font-bold'} style={{ color: design.headingColor }}>
                    {item.title}
                  </h3>
                  {(item.startDate || item.endDate || item.current) && (
                    <span className="shrink-0 text-[10px]" style={{ color: design.mutedColor }}>
                      {dateRange(item.startDate, item.endDate, item.current)}
                    </span>
                  )}
                </div>
                {item.organization && (
                  <p className={compact ? 'text-[10px]' : 'text-xs'} style={{ color: design.titleColor }}>
                    {item.organization}
                  </p>
                )}
                {item.description && (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: design.bodyColor }}>
                    {item.description}
                  </p>
                )}
                {item.url && (
                  <p className="mt-1 break-all text-[10px]" style={{ color: design.mutedColor }}>
                    {item.url}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
};
