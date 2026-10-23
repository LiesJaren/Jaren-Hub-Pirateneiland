import type { AppManifest } from '../../platform/types';
import PietPiraatApp from './PietPiraatApp';

const manifest: AppManifest = {
  id: 'piet',
  title: 'De Scheve Schuit',
  subtitle: 'Praat met Kapitein Piet Piraat & zijn crew',
  icon: '🏴‍☠️',
  color: '#b45309',
  route: '/piet',
  order: 5,
  component: PietPiraatApp,
};

export default manifest;
