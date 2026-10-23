import { lazy } from 'react';
import type { AppManifest } from '../../platform/types';

const PlannerApp = lazy(() => import('./PlannerApp'));

const manifest: AppManifest = {
  id: 'planner',
  title: 'Planbord',
  subtitle: 'Wat staat er vandaag?',
  icon: '🗓️',
  color: '#38bdf8',
  route: '/planner',
  order: 1,
  component: PlannerApp,
};

export default manifest;
