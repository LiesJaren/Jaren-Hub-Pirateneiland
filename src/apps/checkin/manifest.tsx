import { lazy } from 'react';
import type { AppManifest } from '../../platform/types';

const CheckinApp = lazy(() => import('./CheckinApp'));

const manifest: AppManifest = {
  id: 'checkin',
  title: 'Dagcheck',
  subtitle: 'Hoe voel je je vandaag?',
  icon: '🌤️',
  color: '#fbbf24',
  route: '/dagcheck',
  order: 2,
  component: CheckinApp,
};

export default manifest;
