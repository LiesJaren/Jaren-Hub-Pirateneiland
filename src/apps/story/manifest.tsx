import type { AppManifest } from '../../platform/types';
import StoryApp from './StoryApp';

const manifest: AppManifest = {
  id: 'story',
  title: 'Avontuur',
  subtitle: 'Kies-je-eigen-verhaal',
  icon: '📖',
  color: '#8B5CF6',
  route: '/verhaal',
  order: 4,
  component: StoryApp,
};

export default manifest;
