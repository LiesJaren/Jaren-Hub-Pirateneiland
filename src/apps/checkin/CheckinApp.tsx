import { useState, type CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { Mascot } from '../../components/Mascot';
import { PageHeader } from '../../components/PageHeader';
import { SpeechButton } from '../../components/SpeechButton';
import { moods, type Mood } from '../../platform/moods';
import { usePlatform } from '../../platform/PlatformContext';
import { playPop, playSuccess } from '../../platform/sound';

const lookingForwardOptions = [
  { id: 'school', emoji: '🎒', label: 'School' },
  { id: 'spelen', emoji: '🧩', label: 'Spelen' },
  { id: 'vrienden', emoji: '🧑‍🤝‍🧑', label: 'Vrienden' },
  { id: 'zwemmen', emoji: '🏊', label: 'Zwemmen' },
  { id: 'thuis', emoji: '🏠', label: 'Thuis' },
  { id: 'verrassing', emoji: '🎁', label: 'Een verrassing' },
];

const energyLabels = ['Heel moe', 'Een beetje moe', 'Gaat wel', 'Veel energie', 'Superveel!'];

export default function CheckinApp() {
  const navigate = useNavigate();
  const { addEvent, childName } = usePlatform();
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [lookingForward, setLookingForward] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function chooseMood(next: Mood) {
    playPop();
    setMood(next);
    window.setTimeout(() => setStep(2), 320);
  }

  function chooseEnergy(value: number) {
    playPop();
    setEnergy(value);
    window.setTimeout(() => setStep(3), 320);
  }

  function toggleLookingForward(id: string) {
    playPop();
    setLookingForward((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function save() {
    if (!mood || !energy) return;
    setSaving(true);
    setError(null);
    try {
      await addEvent({
        app: 'checkin',
        type: 'checkin',
        payload: {
          mood: mood.id,
          energy,
          lookingForward,
        },
        stars: 1,
      });
      playSuccess();
      void confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.68 },
        colors: ['#fbbf24', '#34d399', '#38bdf8', '#f472b6'],
      });
      setDone(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Opslaan lukte niet.');
    } finally {
      setSaving(false);
    }
  }

  function restart() {
    setStep(1);
    setMood(null);
    setEnergy(null);
    setLookingForward([]);
    setDone(false);
    setError(null);
  }

  if (done && mood) {
    return (
      <div className="app-page">
        <PageHeader
          icon="🌟"
          title="Goed gedaan!"
          subtitle="Je dagcheck is bewaard."
          accent="#fbbf24"
          speech={`Goed gedaan, ${childName}! Je dagcheck is bewaard. Je hebt een ster verdiend.`}
        />
        <div className="panel celebration-panel">
          <div className="celebration-mascot">
            <Mascot size={170} />
          </div>
          <div>
            <p className="eyebrow">Ster verdiend</p>
            <h2>Je bent er even bij stilgestaan.</h2>
            <p>
              Vandaag voel je je <strong>{mood.label.toLowerCase()}</strong>
              {energy ? ` en je energie is "${energyLabels[energy - 1].toLowerCase()}".` : '.'}
            </p>
            <div className="button-row">
              <button type="button" className="primary-button" onClick={() => navigate('/')}>
                Naar het eiland <ArrowRight size={18} />
              </button>
              <button type="button" className="secondary-button" onClick={restart}>
                <RefreshCw size={17} /> Nog eens
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <PageHeader
        icon="🌤️"
        title="Dagcheck"
        subtitle="Even voelen hoe het vandaag met je gaat."
        accent="#fbbf24"
        speech="Hoe voel je je vandaag? Kies het gezichtje dat het beste past."
      />

      <div className="step-dots" aria-label={`Stap ${step} van 3`}>
        {[1, 2, 3].map((item) => (
          <span key={item} className={item <= step ? 'step-dot active' : 'step-dot'} />
        ))}
      </div>

      {step === 1 && (
        <section className="panel">
          <div className="question-row">
            <div>
              <p className="eyebrow">Stap 1</p>
              <h2>Hoe voel je je vandaag?</h2>
            </div>
            <SpeechButton text="Hoe voel je je vandaag? Kies het gezichtje dat het beste past." />
          </div>
          <div className="mood-grid">
            {moods.map((item) => (
              <button
                key={item.id}
                type="button"
                className={mood?.id === item.id ? 'mood-button selected' : 'mood-button'}
                style={{ '--mood-color': item.color } as CSSProperties}
                onClick={() => chooseMood(item)}
                aria-pressed={mood?.id === item.id}
              >
                <span className="mood-emoji" aria-hidden="true">
                  {item.emoji}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="panel">
          <div className="question-row">
            <div>
              <p className="eyebrow">Stap 2</p>
              <h2>Hoeveel energie heb je?</h2>
            </div>
            <SpeechButton text="Hoeveel energie heb je? Kies een bliksem." />
          </div>
          <div className="energy-row">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={energy === value ? 'energy-button selected' : 'energy-button'}
                onClick={() => chooseEnergy(value)}
                aria-pressed={energy === value}
                aria-label={energyLabels[value - 1]}
              >
                <span aria-hidden="true">{'⚡'}</span>
                <span className="energy-label">{energyLabels[value - 1]}</span>
              </button>
            ))}
          </div>
          <button type="button" className="secondary-button" onClick={() => setStep(1)}>
            <ArrowLeft size={17} /> Terug
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="panel">
          <div className="question-row">
            <div>
              <p className="eyebrow">Stap 3</p>
              <h2>Waar kijk je naar uit?</h2>
            </div>
            <SpeechButton text="Waar kijk je naar uit? Je mag meerdere dingen kiezen." />
          </div>
          <div className="chip-grid">
            {lookingForwardOptions.map((item) => {
              const active = lookingForward.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={active ? 'choice-chip selected' : 'choice-chip'}
                  onClick={() => toggleLookingForward(item.id)}
                  aria-pressed={active}
                >
                  <span aria-hidden="true">{item.emoji}</span>
                  {item.label}
                  {active && <Check size={17} />}
                </button>
              );
            })}
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => void save()}
              disabled={saving}
            >
              {saving ? 'Even bewaren...' : 'Klaar!'} <ArrowRight size={18} />
            </button>
            <button type="button" className="secondary-button" onClick={() => setStep(2)}>
              <ArrowLeft size={17} /> Terug
            </button>
          </div>
          <p className="fine-print">Je kunt dit later nog eens invullen.</p>
        </section>
      )}

      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Terug naar het eiland
      </Link>
    </div>
  );
}
