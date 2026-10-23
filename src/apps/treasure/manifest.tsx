import type { AppManifest } from '../../platform/types';
import TreasureApp from './TreasureApp';

const manifest: AppManifest = {
  id: 'treasure',
  title: 'Schatkamer',
  subtitle: 'Avatar, outfits & beloningen',
  icon: '🪙',
  color: '#F59E0B',
  route: '/schatkamer',
  order: 3,
  component: TreasureApp,
};

export default manifest;
