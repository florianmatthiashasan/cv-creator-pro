import { CVDesign, CVFontChoice } from '@/types/cv';

export const cvFontOptions: Array<{ value: CVFontChoice; label: string; family: string }> = [
  { value: 'playfair', label: 'Playfair Display', family: '"Playfair Display", serif' },
  { value: 'dm-sans', label: 'DM Sans', family: '"DM Sans", sans-serif' },
  { value: 'inter', label: 'Inter', family: 'Inter, sans-serif' },
  { value: 'space-grotesk', label: 'Space Grotesk', family: '"Space Grotesk", sans-serif' },
  { value: 'merriweather', label: 'Merriweather', family: 'Merriweather, serif' },
  { value: 'manrope', label: 'Manrope', family: 'Manrope, sans-serif' },
  { value: 'poppins', label: 'Poppins', family: 'Poppins, sans-serif' },
  { value: 'source-sans', label: 'Source Sans 3', family: '"Source Sans 3", sans-serif' },
  { value: 'dm-mono', label: 'DM Mono', family: '"DM Mono", monospace' },
];

const fontMap = Object.fromEntries(cvFontOptions.map((option) => [option.value, option.family])) as Record<CVFontChoice, string>;

export const cvPrintFontHref =
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;700;800&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Merriweather:wght@400;700&family=Playfair+Display:wght@500;600;700;800&family=Poppins:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap';

export const getFontFamily = (value: CVFontChoice) => fontMap[value] ?? fontMap['dm-sans'];

export const getDesignTokens = (design: CVDesign) => ({
  headingFontFamily: getFontFamily(design.headingFont),
  bodyFontFamily: getFontFamily(design.bodyFont),
  nameColor: design.nameColor,
  titleColor: design.titleColor,
  headingColor: design.headingColor,
  bodyColor: design.bodyColor,
  mutedColor: design.mutedColor,
  accentColor: design.accentColor,
  backgroundColor: design.backgroundColor,
  sidebarBackgroundColor: design.sidebarBackgroundColor,
  sidebarTextColor: design.sidebarTextColor,
  dividerColor: design.dividerColor,
});
