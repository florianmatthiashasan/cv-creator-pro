import { ComponentType } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import MonoTemplate from './MonoTemplate';

export const templateOptions: Array<{ id: CVTemplate; label: string; desc: string }> = [
  { id: 'modern', label: 'Modern', desc: 'Klar und markant' },
  { id: 'classic', label: 'Klassisch', desc: 'Zeitlos elegant' },
  { id: 'creative', label: 'Kreativ', desc: 'Mit Sidebar' },
  { id: 'minimal', label: 'Minimal', desc: 'Reduziert und luftig' },
  { id: 'executive', label: 'Executive', desc: 'Edler Business-Look' },
  { id: 'mono', label: 'Mono', desc: 'Technisch und präzise' },
];

export const templateComponents: Record<CVTemplate, ComponentType<{ data: CVData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  mono: MonoTemplate,
};
