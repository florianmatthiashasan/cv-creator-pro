import { ComponentType } from 'react';
import { CVData, CVTemplate } from '@/types/cv';
import ModernTemplate from './ModernTemplate';
import ClassicTemplate from './ClassicTemplate';
import CreativeTemplate from './CreativeTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import MonoTemplate from './MonoTemplate';
import AtlasTemplate from './AtlasTemplate';
import StudioTemplate from './StudioTemplate';
import CompactTemplate from './CompactTemplate';
import GridTemplate from './GridTemplate';
import DevTemplate from './DevTemplate';

export const templateOptions: Array<{ id: CVTemplate; label: string; desc: string }> = [
  { id: 'modern', label: 'Modern', desc: 'Clean and distinctive' },
  { id: 'classic', label: 'Classic', desc: 'Timeless and elegant' },
  { id: 'creative', label: 'Creative', desc: 'With sidebar layout' },
  { id: 'minimal', label: 'Minimal', desc: 'Reduced and airy' },
  { id: 'executive', label: 'Executive', desc: 'Polished business look' },
  { id: 'mono', label: 'Mono', desc: 'Technical and precise' },
  { id: 'atlas', label: 'Atlas', desc: 'Timeline editorial' },
  { id: 'studio', label: 'Studio', desc: 'Bold sidebar profile' },
  { id: 'compact', label: 'Compact', desc: 'Dense one-page layout' },
  { id: 'grid', label: 'Grid', desc: 'Modular portfolio blocks' },
  { id: 'dev', label: 'Dev', desc: 'Developer-focused profile' },
];

export const templateComponents: Record<CVTemplate, ComponentType<{ data: CVData }>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  creative: CreativeTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  mono: MonoTemplate,
  atlas: AtlasTemplate,
  studio: StudioTemplate,
  compact: CompactTemplate,
  grid: GridTemplate,
  dev: DevTemplate,
};
