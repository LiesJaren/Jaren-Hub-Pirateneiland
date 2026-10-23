import type { AppManifest } from '../../platform/types';
import IslandDecoratorApp from './IslandDecoratorApp';

const manifest: AppManifest = {
  id: 'decorator',
  title: 'Eiland-Bouwer',
  subtitle: 'Versier jouw eiland met schatten & palmen',
  icon: '🏝️',
  color: '#10B981',
  route: '/versieren',
  order: 6,
  component: IslandDecoratorApp,
};

export default manifest;
