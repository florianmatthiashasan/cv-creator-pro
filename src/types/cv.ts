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
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';
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

export type CVTemplate =
  | 'modern'
  | 'classic'
  | 'creative'
  | 'minimal'
  | 'executive'
  | 'mono'
  | 'atlas'
  | 'studio'
  | 'compact'
  | 'grid';

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
    headingFont: 'space-grotesk',
    bodyFont: 'manrope',
    nameColor: '#101416',
    titleColor: '#2f7668',
    headingColor: '#101416',
    bodyColor: '#263033',
    mutedColor: '#657174',
    accentColor: '#9fcf62',
    backgroundColor: '#ffffff',
    sidebarBackgroundColor: '#11181b',
    sidebarTextColor: '#f4f1e8',
    dividerColor: '#d8ded7',
  },
};
