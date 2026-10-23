import type { ReactNode } from 'react';
import { SpeechButton } from './SpeechButton';

type PageHeaderProps = {
  icon: string;
  title: string;
  subtitle?: string;
  accent?: string;
  speech?: string;
  children?: ReactNode;
};

export function PageHeader({
  icon,
  title,
  subtitle,
  accent = '#38bdf8',
  speech,
  children,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-icon" style={{ background: accent }} aria-hidden="true">
        {icon}
      </div>
      <div className="page-header-copy">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
      {speech && <SpeechButton text={speech} className="page-header-speech" />}
    </header>
  );
}
