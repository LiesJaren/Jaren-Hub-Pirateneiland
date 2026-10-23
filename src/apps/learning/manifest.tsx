import { lazy } from 'react';
import type { AppManifest } from '../../platform/types';

const LearningApp = lazy(() => import('./LearningApp'));

const manifest: AppManifest = {
  id: 'learning',
  title: 'Leerwereld',
  subtitle: 'Lezen, schrijven, rekenen',
  icon: '🚀',
  color: '#34d399',
  route: '/leren',
  order: 4,
  component: LearningApp,
};

export default manifest;
