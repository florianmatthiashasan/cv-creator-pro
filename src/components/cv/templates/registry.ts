import { ComponentType } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import MonoTemplate from './MonoTemplate';

export const templateOptions: Array<{ id: CVTemplate; label: string; desc: string }> = [
  { id: 'modern', label: 'Modern', desc: 'Clean and distinctive' },
  { id: 'classic', label: 'Classic', desc: 'Timeless and elegant' },
  { id: 'creative', label: 'Creative', desc: 'With sidebar layout' },
  { id: 'minimal', label: 'Minimal', desc: 'Reduced and airy' },
  { id: 'executive', label: 'Executive', desc: 'Polished business look' },
  { id: 'mono', label: 'Mono', desc: 'Technical and precise' },
];

export const templateComponents: Record<CVTemplate, ComponentType<{ data: CVData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  mono: MonoTemplate,
};
