import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Mascot } from './Mascot';

export function NotFound() {
  return (
    <div className="app-page">
      <div className="panel celebration-panel">
        <div className="celebration-mascot">
          <Mascot size={150} />
        </div>
        <div>
          <p className="eyebrow">Oei</p>
          <h1>Deze plek bestaat niet.</h1>
          <p>Kaptein Koraal brengt je terug naar het eiland.</p>
          <Link to="/" className="primary-button">
            <ArrowLeft size={18} /> Naar het eiland
          </Link>
        </div>
      </div>
    </div>
  );
}
