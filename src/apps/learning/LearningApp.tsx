import { useEffect, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Calculator, PencilLine, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { usePlatform } from '../../platform/PlatformContext';
import CountGame from './CountGame';
import LetterGame from './LetterGame';
import WritingGame from './WritingGame';

type SubjectId = 'lezen' | 'rekenen' | 'schrijven';
type View = 'menu' | SubjectId;

function isSubject(value: string | null): value is SubjectId {
  return value === 'lezen' || value === 'rekenen' || value === 'schrijven';
}

const subjects = [
  {
    id: 'lezen' as const,
    title: 'Lezen',
    description: 'Letters herkennen en woorden lezen.',
    icon: '📖',
    color: '#38bdf8',
    tag: 'Kern 1',
    ready: true,
    Icon: BookOpen,
  },
  {
    id: 'rekenen' as const,
    title: 'Rekenen',
    description: 'Tellen, vergelijken en hoeveelheden tot 6.',
    icon: '🔢',
    color: '#34d399',
    tag: 'Blok 1',
    ready: true,
    Icon: Calculator,
  },
  {
    id: 'schrijven' as const,
    title: 'Schrijven',
    description: 'Letters typen en de lettervorm oefenen.',
    icon: '✏️',
    color: '#f472b6',
    tag: 'Typen',
    ready: true,
    Icon: PencilLine,
  },
];

export default function LearningApp() {
  const { childName } = usePlatform();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('vak');
  const [view, setView] = useState<View>(isSubject(requested) ? requested : 'menu');

  useEffect(() => {
    setView(isSubject(requested) ? requested : 'menu');
  }, [requested]);

  function openSubject(id: SubjectId) {
    setView(id);
    setSearchParams({ vak: id }, { replace: true });
  }

  function backToMenu() {
    setView('menu');
    setSearchParams({}, { replace: true });
  }

  if (view === 'lezen') return <LetterGame onBack={backToMenu} />;
  if (view === 'rekenen') return <CountGame onBack={backToMenu} />;
  if (view === 'schrijven') return <WritingGame onBack={backToMenu} />;

  return (
    <div className="app-page">
      <PageHeader
        icon="🚀"
        title="Leerwereld"
        subtitle={`Kies een eiland en oefen met lezen, rekenen of schrijven, ${childName}.`}
        accent="#34d399"
        speech={`Welkom in de Leerwereld, ${childName}. Kies lezen, rekenen of schrijven.`}
      />

      <div className="subject-grid">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            type="button"
            className="subject-card"
            style={{ '--subject-color': subject.color } as CSSProperties}
            onClick={() => openSubject(subject.id)}
          >
            <span className="subject-icon" aria-hidden="true">
              {subject.icon}
            </span>
            <span className="subject-copy">
              <span className="subject-topline">
                <span className="subject-title">{subject.title}</span>
                <span className="subject-tag">{subject.tag}</span>
              </span>
              <span className="subject-description">{subject.description}</span>
            </span>
            <span className="subject-arrow" aria-hidden="true">
              <ArrowRight size={20} />
            </span>
          </button>
        ))}
      </div>

      <section className="panel learning-note">
        <div className="learning-note-heading">
          <Sparkles size={20} />
          <h2>Wat oefenen we nu?</h2>
        </div>
        <div className="learning-note-grid">
          <div>
            <p className="eyebrow">Lezen · VLL Kim, kern 1</p>
            <p>
              De letters <strong>i, k, m, s</strong> en <strong>p, aa, r, e, v</strong>.
              We lezen woorden als <em>ik, kim, mis, vis, kip, aap, raam</em> en{' '}
              <em>mes</em>.
            </p>
          </div>
          <div>
            <p className="eyebrow">Rekenen · zoWISo, blok 1</p>
            <p>
              Tellen tot 6, meer en minder, getallen herkennen, de vijfstructuur en
              hoeveelheden vergelijken.
            </p>
          </div>
          <div>
            <p className="eyebrow">Schrijven · op de laptop</p>
            <p>
              We typen de letters. Zo oefen je de lettervorm én het toetsenbord. Een
              echt werkblad blijft natuurlijk ook fijn.
            </p>
          </div>
        </div>
      </section>

      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Terug naar het eiland
      </Link>
    </div>
  );
}
