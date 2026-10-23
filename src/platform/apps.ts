import type { AppManifest } from './types';

const modules = import.meta.glob('../apps/*/manifest.tsx', {
  eager: true,
}) as Record<string, { default: AppManifest }>;

export const apps: AppManifest[] = Object.values(modules)
  .map((module) => module.default)
  .sort((a, b) => a.order - b.order);

export function appForPath(pathname: string): AppManifest | undefined {
  return apps.find((app) => pathname === app.route || pathname.startsWith(`${app.route}/`));
}
