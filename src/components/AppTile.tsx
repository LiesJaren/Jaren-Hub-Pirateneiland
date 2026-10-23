import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import type { AppManifest } from '../platform/types';

export function AppTile({ app }: { app: AppManifest }) {
  return (
    <Link
      to={app.route}
      className="app-tile"
      style={{ '--tile-color': app.color } as CSSProperties}
    >
      <span className="app-tile-icon" aria-hidden="true">
        {app.icon}
      </span>
      <span className="app-tile-copy">
        <span className="app-tile-title">{app.title}</span>
        <span className="app-tile-subtitle">{app.subtitle}</span>
      </span>
      <span className="app-tile-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
