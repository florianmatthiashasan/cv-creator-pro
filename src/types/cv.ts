export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  title: string;
  summary: string;
  website?: string;
  linkedin?: string;
  photo?: string; // base64 data URL
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface Language {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Muttersprache';
}

export type CVFontChoice =
  | 'playfair'
  | 'dm-sans'
  | 'inter'
  | 'space-grotesk'
  | 'merriweather'
  | 'manrope'
  | 'poppins'
  | 'source-sans'
  | 'dm-mono';

export interface CVDesign {
  headingFont: CVFontChoice;
  bodyFont: CVFontChoice;
  nameColor: string;
  titleColor: string;
  headingColor: string;
  bodyColor: string;
  mutedColor: string;
  accentColor: string;
  backgroundColor: string;
  sidebarBackgroundColor: string;
  sidebarTextColor: string;
  dividerColor: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  design: CVDesign;
}

export type CVTemplate = 'modern' | 'classic' | 'creative' | 'minimal' | 'executive' | 'mono';

export const emptyCVData: CVData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    title: '',
    summary: '',
  },
  experiences: [],
  education: [],
  skills: [],
  languages: [],
  design: {
    headingFont: 'playfair',
    bodyFont: 'dm-sans',
    nameColor: '#161616',
    titleColor: '#c7662d',
    headingColor: '#161616',
    bodyColor: '#303030',
    mutedColor: '#6c6a66',
    accentColor: '#c7662d',
    backgroundColor: '#ffffff',
    sidebarBackgroundColor: '#1d1a16',
    sidebarTextColor: '#f5efe7',
    dividerColor: '#dbcab2',
  },
};
