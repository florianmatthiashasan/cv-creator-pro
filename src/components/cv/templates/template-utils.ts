import { CVData } from '@/types/cv';

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
