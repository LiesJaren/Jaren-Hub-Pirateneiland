import { lazy } from 'react';
import type { AppManifest } from '../../platform/types';

const EmotionsApp = lazy(() => import('./EmotionsApp'));

const manifest: AppManifest = {
  id: 'emotions',
  title: 'Gevoelens',
  subtitle: 'Ontdek wat je voelt',
  icon: '💛',
  color: '#D9437F',
  route: '/gevoelens',
  order: 3,
  component: EmotionsApp,
};

export default manifest;
