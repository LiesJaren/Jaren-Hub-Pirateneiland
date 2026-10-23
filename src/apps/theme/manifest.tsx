import type { AppManifest } from '../../platform/types';
import ThemeStudioApp from './ThemeStudioApp';

const manifest: AppManifest = {
  id: 'theme',
  title: 'Thema Studio',
  subtitle: 'Kleuren, fonts & delen',
  icon: '🎨',
  color: '#EC4899',
  route: '/thema',
  order: 5,
  component: ThemeStudioApp,
};

export default manifest;
