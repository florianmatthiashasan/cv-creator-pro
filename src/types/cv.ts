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

export type CVAdditionalSectionKind = 'project' | 'certificate' | 'award' | 'volunteering' | 'publication';

export interface CVAdditionalSection {
  id: string;
  kind: CVAdditionalSectionKind;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  url?: string;
}

export type CVFontChoice =
  | 'caprasimo'
  | 'figtree'
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
  additionalSections: CVAdditionalSection[];
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
  | 'grid'
  | 'dev';

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
  additionalSections: [],
  design: {
    headingFont: 'caprasimo',
    bodyFont: 'figtree',
    nameColor: '#201e1d',
    titleColor: '#8c491a',
    headingColor: '#201e1d',
    bodyColor: '#474238',
    mutedColor: '#82796a',
    accentColor: '#c67139',
    backgroundColor: '#fffdf8',
    sidebarBackgroundColor: '#ebddc5',
    sidebarTextColor: '#201e1d',
    dividerColor: '#dcd3c4',
  },
};
