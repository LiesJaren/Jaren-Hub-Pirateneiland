import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Heart, RefreshCw, Wind } from 'lucide-react';
import { Mascot } from '../../components/Mascot';
import { PageHeader } from '../../components/PageHeader';
import { SpeechButton } from '../../components/SpeechButton';
import { moods, type Mood } from '../../platform/moods';
import { usePlatform } from '../../platform/PlatformContext';
import { playPop, playSuccess } from '../../platform/sound';
import {
  bodyPlaces,
  calmTools,
  guideFor,
  intensityOptions,
  type BodyPlaceId,
  type Intensity,
  type ToolId,
} from './emotionGuides';

type Tab = 'gevoel' | 'lichaam' | 'helpen' | 'doen';
type View = 'toolbox' | 'detail' | 'tool';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'gevoel', label: 'Zo voelt het', icon: '💛' },
  { id: 'lichaam', label: 'Waar voel je het?', icon: '🫀' },
  { id: 'helpen', label: 'Wat helpt?', icon: '🧰' },
  { id: 'doen', label: 'Doe mee', icon: '🌬️' },
];

const groundingSteps = [
  {
    count: 5,
    title: '5 dingen die je ziet',
    text: 'Kijk rustig rond. Noem vijf dingen die je ziet.',
  },
  {
    count: 4,
    title: '4 dingen die je hoort',
    text: 'Luister. Noem vier dingen die je hoort.',
  },
  {
    count: 3,
    title: '3 dingen die je voelt',
    text: 'Raak iets aan. Noem drie dingen die je kan voelen.',
  },
  {
    count: 2,
    title: '2 dingen die je ruikt',
    text: 'Snuffel eens. Noem twee dingen die je ruikt.',
  },
  {
    count: 1,
    title: '1 ding dat je proeft',
    text: 'Noem één ding dat je proeft, of denk aan je lievelingssmaak.',
  },
];

const talkLines = [
  'Ik voel me ...',
  'Dat komt omdat ...',
  'Ik wil graag ...',
  'Kun je me helpen?',
];

const moveIdeas = [
  'Stamp 10 keer met je voeten.',
  'Schud je armen los.',
  'Loop een rondje door de kamer.',
  'Duw tegen de muur en tel tot 5.',
];

export default function EmotionsApp() {
  const { addEvent, childName } = usePlatform();
  const [view, setView] = useState<View>('toolbox');
  const [feeling, setFeeling] = useState<Mood | null>(null);
  const [tab, setTab] = useState<Tab>('gevoel');
  const [intensity, setIntensity] = useState<Intensity | null>(null);
  const [places, setPlaces] = useState<BodyPlaceId[]>([]);
  const [helps, setHelps] = useState<string[]>([]);
  const [tool, setTool] = useState<ToolId | null>(null);
  const [standaloneTool, setStandaloneTool] = useState<ToolId | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeGuide = feeling ? guideFor(feeling.id) : null;

  function openMood(mood: Mood) {
    playPop();
    setFeeling(mood);
    setTab('gevoel');
    setIntensity(null);
    setPlaces([]);
    setHelps([]);
    setTool(null);
    setStandaloneTool(null);
    setSaved(false);
    setError(null);
    setView('detail');
  }

  function openTool(toolId: ToolId) {
    playPop();
    setStandaloneTool(toolId);
    setView('tool');
  }

  function backToToolbox() {
    setView('toolbox');
    setFeeling(null);
    setStandaloneTool(null);
    setTab('gevoel');
    setIntensity(null);
    setPlaces([]);
    setHelps([]);
    setTool(null);
    setSaved(false);
    setError(null);
  }

  function togglePlace(id: BodyPlaceId) {
    playPop();
    setPlaces((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleHelp(id: string) {
    playPop();
    setHelps((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function save() {
    if (!feeling) return;
    setSaving(true);
    setError(null);
    try {
      await addEvent({
        app: 'emotions',
        type: 'emotion',
        payload: {
          feeling: feeling.id,
          intensity,
          places,
          helps,
          tool,
        },
        stars: 0,
      });
      playSuccess();
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Opslaan lukte niet.');
    } finally {
      setSaving(false);
    }
  }

  if (saved && feeling) {
    const celebrationGuide = guideFor(feeling.id);
    const chosenIntensity = intensityOptions.find((option) => option.value === intensity);
    const placeLabels = places.map(
      (id) => bodyPlaces.find((place) => place.id === id)?.label.toLowerCase() ?? id,
    );
    const helpLabels = celebrationGuide.helps
      .filter((help) => helps.includes(help.id))
      .map((help) => help.title.toLowerCase());

    return (
      <div className="app-page">
        <PageHeader
          icon="💛"
          title="Dank je wel"
          subtitle="Je gevoel mag er zijn."
          accent="#D9437F"
          speech={`Dank je wel, ${childName}. Je gevoel mag er zijn.`}
        />
        <div className="panel celebration-panel">
          <div className="celebration-mascot">
            <Mascot size={160} />
          </div>
          <div>
            <p className="eyebrow">Gevoel gedeeld</p>
            <h2>Je bent even goed voor jezelf geweest.</h2>
            <p>
              Je voelde je <strong>{feeling.label.toLowerCase()}</strong>
              {chosenIntensity ? ` (${chosenIntensity.label.toLowerCase()})` : ''}. Dat is
              oké.
            </p>
            {placeLabels.length > 0 && (
              <p>Je voelde het {placeLabels.join(' en ')}.</p>
            )}
            {helpLabels.length > 0 && <p>Je koos: {helpLabels.join(' en ')}.</p>}
            <div className="button-row">
              <button
                type="button"
                className="primary-button"
                onClick={() => openMood(feeling)}
              >
                <RefreshCw size={17} /> Nog eens
              </button>
              <button type="button" className="secondary-button" onClick={backToToolbox}>
                Terug naar de toolbox
              </button>
              <Link to="/" className="secondary-button">
                <ArrowLeft size={17} /> Naar het eiland
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'tool' && standaloneTool) {
    const toolInfo = calmTools.find((item) => item.id === standaloneTool);
    if (toolInfo) {
      return (
        <div className="app-page">
          <PageHeader
            icon={toolInfo.emoji}
            title={toolInfo.title}
            subtitle={toolInfo.text}
            accent="#38bdf8"
            speech={`${toolInfo.title}. ${toolInfo.text}`}
          />
          <section className="emotion-tool-panel">
            <ToolRunner tool={standaloneTool} />
          </section>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={backToToolbox}>
              <ArrowLeft size={17} /> Terug naar de toolbox
            </button>
            <Link to="/" className="secondary-button">
              Naar het eiland
            </Link>
          </div>
        </div>
      );
    }
  }

  if (view === 'detail' && feeling && activeGuide) {
    return (
      <div className="app-page">
        <PageHeader
          icon={feeling.emoji}
          title={feeling.label}
          subtitle={activeGuide.intro}
          accent={feeling.color}
          speech={`${feeling.label}. ${activeGuide.intro} ${activeGuide.talk.replace(
            /\s*\.\.\.$/,
            '',
          )}`}
        />

        <div className="emotion-detail-bar">
          <div className="emotion-tabs" role="tablist" aria-label="Gevoelskaart">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={tab === item.id ? 'emotion-tab active' : 'emotion-tab'}
                onClick={() => {
                  playPop();
                  setTab(item.id);
                }}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" className="text-button emotion-switch" onClick={backToToolbox}>
            <ArrowLeft size={16} /> Ander gevoel
          </button>
        </div>

        {tab === 'gevoel' && (
          <section className="panel emotion-panel">
            <div className="emotion-panel-heading">
              <div>
                <p className="eyebrow">Gevoelskaart</p>
                <h2>Zo voelt {feeling.label.toLowerCase()}</h2>
              </div>
              <span className="emotion-panel-emoji" aria-hidden="true">
                {feeling.emoji}
              </span>
            </div>
            <p>{activeGuide.intro}</p>

            <h3 className="emotion-subtitle">Hoe sterk voel je het?</h3>
            <div className="intensity-row">
              {intensityOptions.map((option) => {
                const active = intensity === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={active ? 'intensity-button selected' : 'intensity-button'}
                    aria-pressed={active}
                    onClick={() => {
                      playPop();
                      setIntensity(active ? null : option.value);
                    }}
                  >
                    <span className="intensity-emoji" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <strong>{option.label}</strong>
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="emotion-preview-heading">
              <h3 className="emotion-subtitle">Wat doet je lichaam?</h3>
              <button
                type="button"
                className="text-button emotion-inline-link"
                onClick={() => setTab('lichaam')}
              >
                Bekijk alle plekken <ArrowRight size={15} />
              </button>
            </div>
            <div className="emotion-sign-grid compact">
              {activeGuide.signs.slice(0, 3).map((sign) => (
                <div className="emotion-sign" key={sign.place}>
                  <span className="emotion-sign-emoji" aria-hidden="true">
                    {sign.emoji}
                  </span>
                  <div>
                    <strong>{sign.title}</strong>
                    <p>{sign.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="emotion-talk-card">
              <div>
                <p className="eyebrow">Zeg het eens</p>
                <p className="emotion-talk-line">{activeGuide.talk}</p>
              </div>
              <SpeechButton
                text={activeGuide.talk.replace(/\s*\.\.\.$/, '')}
                label="Lees de zin voor"
              />
            </div>

            <div className="emotion-parent-tip">
              <strong>Voor mama &amp; papa</strong>
              <p>{activeGuide.parentTip}</p>
            </div>
          </section>
        )}

        {tab === 'lichaam' && (
          <section className="panel emotion-panel">
            <div className="emotion-panel-heading">
              <div>
                <p className="eyebrow">Lichaamssignalen</p>
                <h2>Waar voel je het?</h2>
              </div>
              <SpeechButton
                text={`${feeling.label}. ${activeGuide.signs
                  .map((sign) => `${sign.title}. ${sign.text}`)
                  .join(' ')}`}
                label="Lees de lichaamssignalen voor"
              />
            </div>
            <p>
              Bij {feeling.label.toLowerCase()} kan je lichaam dit laten merken. Herken
              je iets?
            </p>
            <div className="emotion-sign-grid">
              {activeGuide.signs.map((sign) => (
                <div className="emotion-sign" key={sign.place}>
                  <span className="emotion-sign-emoji" aria-hidden="true">
                    {sign.emoji}
                  </span>
                  <div>
                    <strong>{sign.title}</strong>
                    <p>{sign.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="emotion-subtitle">Waar voel jij het nu?</h3>
            <p className="emotion-hint">Kies alle plekken die kloppen. Je mag ook niets kiezen.</p>
            <div className="chip-grid">
              {bodyPlaces.map((place) => {
                const active = places.includes(place.id);
                return (
                  <button
                    key={place.id}
                    type="button"
                    className={active ? 'choice-chip selected' : 'choice-chip'}
                    onClick={() => togglePlace(place.id)}
                    aria-pressed={active}
                  >
                    <span aria-hidden="true">{place.emoji}</span>
                    {place.label}
                    {active && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {tab === 'helpen' && (
          <section className="panel emotion-panel">
            <div className="emotion-panel-heading">
              <div>
                <p className="eyebrow">Gereedschap</p>
                <h2>Wat kan helpen?</h2>
              </div>
              <SpeechButton
                text={activeGuide.helps
                  .map((help) => `${help.title}. ${help.text}`)
                  .join(' ')}
                label="Lees de tips voor"
              />
            </div>
            <p>Kies wat jij zou willen proberen. Je hoeft het niet allemaal te doen.</p>
            <div className="emotion-help-grid">
              {activeGuide.helps.map((help) => {
                const active = helps.includes(help.id);
                return (
                  <button
                    key={help.id}
                    type="button"
                    className={active ? 'emotion-help selected' : 'emotion-help'}
                    aria-pressed={active}
                    onClick={() => toggleHelp(help.id)}
                  >
                    <span className="emotion-help-emoji" aria-hidden="true">
                      {help.emoji}
                    </span>
                    <span className="emotion-help-copy">
                      <strong>{help.title}</strong>
                      <span>{help.text}</span>
                    </span>
                    {active && <Check size={18} className="emotion-help-check" />}
                  </button>
                );
              })}
            </div>
            <p className="emotion-hint">
              Als het heel veel is, vraag dan een volwassene om mee te helpen.
            </p>
          </section>
        )}

        {tab === 'doen' && (
          <section className="panel emotion-panel">
            <div className="emotion-panel-heading">
              <div>
                <p className="eyebrow">Oefenen</p>
                <h2>Doe mee</h2>
              </div>
              <SpeechButton text="Kies een oefening. Je mag altijd stoppen." />
            </div>
            <p>Kies een kleine oefening. Je mag altijd stoppen als het niet fijn voelt.</p>
            <div className="emotion-tool-grid">
              {calmTools.map((item) => {
                const active = tool === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={active ? 'emotion-tool selected' : 'emotion-tool'}
                    aria-pressed={active}
                    onClick={() => {
                      playPop();
                      setTool(active ? null : item.id);
                    }}
                  >
                    <span className="emotion-tool-emoji" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className="emotion-tool-copy">
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </span>
                    {active ? <Check size={18} /> : <ArrowRight size={18} />}
                  </button>
                );
              })}
            </div>

            {tool && (
              <div className="emotion-tool-panel">
                <ToolRunner tool={tool} />
              </div>
            )}

            <div className="emotion-talk-card">
              <div>
                <p className="eyebrow">Zeg het eens</p>
                <p className="emotion-talk-line">{activeGuide.talk}</p>
              </div>
              <SpeechButton
                text={activeGuide.talk.replace(/\s*\.\.\.$/, '')}
                label="Lees de zin voor"
              />
            </div>
          </section>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="emotion-save-row">
          <div>
            <p className="eyebrow">Klaar?</p>
            <p>Bewaren mag, maar hoeft niet.</p>
          </div>
          <div className="emotion-save-actions">
            <button
              type="button"
              className="primary-button"
              onClick={() => void save()}
              disabled={saving}
            >
              {saving ? 'Even bewaren...' : 'Bewaar mijn gevoel'} <Heart size={18} />
            </button>
            <Link to="/" className="secondary-button">
              <ArrowLeft size={17} /> Naar het eiland
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <PageHeader
        icon="💛"
        title="Gevoelens"
        subtitle="Ontdek wat je voelt en wat helpt. Je hoeft het niet meteen te delen."
        accent="#D9437F"
        speech={`Welkom bij de gevoelens-toolbox, ${childName}. Kies een gevoel om te ontdekken, of probeer een oefening.`}
      />

      <section className="panel emotion-toolbox-intro">
        <div>
          <p className="eyebrow">Gevoelens-toolbox</p>
          <h2>Elk gevoel is een boodschapper.</h2>
          <p>
            Kies een gevoel om te leren waar je het voelt en wat kan helpen. Of probeer
            meteen een oefening.
          </p>
        </div>
        <div className="emotion-toolbox-badge" aria-hidden="true">
          💛
        </div>
      </section>

      <section className="emotion-section">
        <div className="emotion-section-heading">
          <div>
            <p className="eyebrow">Gevoelskaarten</p>
            <h2>Kies een gevoel</h2>
          </div>
          <SpeechButton text="Kies een gevoel om te ontdekken." />
        </div>
        <div className="emotion-grid">
          {moods.map((mood) => {
            const guide = guideFor(mood.id);
            return (
              <button
                key={mood.id}
                type="button"
                className="emotion-card"
                style={{ '--emotion-color': mood.color } as CSSProperties}
                onClick={() => openMood(mood)}
              >
                <span className="emotion-card-emoji" aria-hidden="true">
                  {mood.emoji}
                </span>
                <span className="emotion-card-copy">
                  <span className="emotion-card-title">{mood.label}</span>
                  <span className="emotion-card-text">{guide.intro}</span>
                </span>
                <ArrowRight size={20} className="emotion-card-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="emotion-section">
        <div className="emotion-section-heading">
          <div>
            <p className="eyebrow">Gereedschap</p>
            <h2>Even doen</h2>
          </div>
          <SpeechButton text="Kies een oefening: ademen, vijf vier drie twee een, praten of bewegen." />
        </div>
        <div className="emotion-tool-grid">
          {calmTools.map((item) => (
            <button
              key={item.id}
              type="button"
              className="emotion-tool"
              onClick={() => openTool(item.id)}
            >
              <span className="emotion-tool-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="emotion-tool-copy">
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </span>
              <ArrowRight size={18} />
            </button>
          ))}
        </div>
      </section>

      <Link to="/" className="back-link">
        <ArrowLeft size={18} /> Terug naar het eiland
      </Link>
    </div>
  );
}

function ToolRunner({ tool }: { tool: ToolId }) {
  if (tool === 'ademen') return <BreathingTool />;
  if (tool === '54321') return <GroundingTool />;
  if (tool === 'praten') return <TalkTool />;
  return <MoveTool />;
}

function BreathingTool() {
  const [breathing, setBreathing] = useState(false);
  const [breathText, setBreathText] = useState('Klaar om samen te ademen?');

  useEffect(() => {
    if (!breathing) {
      setBreathText('Klaar om samen te ademen?');
      return;
    }
    setBreathText('Adem in...');
    const timer = window.setInterval(() => {
      setBreathText((current) => (current === 'Adem in...' ? 'Adem uit...' : 'Adem in...'));
    }, 4000);
    return () => window.clearInterval(timer);
  }, [breathing]);

  return (
    <div className="breathing-panel">
      <div className="breathing-copy">
        <p className="eyebrow">Samen ademen</p>
        <h2>
          <Wind size={22} /> Volg de bel
        </h2>
        <p>
          Adem in als de bel groter wordt, adem uit als ze kleiner wordt. Je hoeft niet
          perfect te ademen. Rustig aan is goed.
        </p>
        <div className="button-row">
          <button
            type="button"
            className={breathing ? 'secondary-button' : 'primary-button'}
            onClick={() => {
              playPop();
              setBreathing((current) => !current);
            }}
          >
            {breathing ? 'Stop even' : 'Start het ademen'}
          </button>
          <span className="breath-text">{breathText}</span>
        </div>
      </div>
      <div className={breathing ? 'breathing-circle active' : 'breathing-circle'}>
        <span>{breathing ? breathText.replace('...', '') : '🌬️'}</span>
      </div>
    </div>
  );
}

function GroundingTool() {
  const [step, setStep] = useState(0);
  const done = step >= groundingSteps.length;
  const current = groundingSteps[Math.min(step, groundingSteps.length - 1)];

  return (
    <div className="grounding-panel">
      <p className="eyebrow">5-4-3-2-1</p>
      <h2>Kom terug in het nu</h2>
      {done ? (
        <>
          <p className="grounding-done">Klaar. Je bent weer even hier.</p>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              playPop();
              setStep(0);
            }}
          >
            <RefreshCw size={17} /> Opnieuw
          </button>
        </>
      ) : (
        <>
          <p className="grounding-progress">
            Stap {step + 1} van {groundingSteps.length}
          </p>
          <div className="grounding-card">
            <span className="grounding-count" aria-hidden="true">
              {current.count}
            </span>
            <div>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
            </div>
          </div>
          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                playPop();
                setStep((currentStep) => currentStep + 1);
              }}
            >
              {step === groundingSteps.length - 1 ? 'Klaar' : 'Volgende'}{' '}
              <ArrowRight size={18} />
            </button>
            <SpeechButton
              text={`${current.title}. ${current.text}`}
              label="Lees deze stap voor"
            />
          </div>
        </>
      )}
    </div>
  );
}

function TalkTool() {
  return (
    <div className="talk-tool">
      <p className="eyebrow">Praten</p>
      <h2>Zeg het in één zin</h2>
      <p>Je hoeft niet alles te zeggen. Kies een zin en maak hem af.</p>
      <div className="talk-lines">
        {talkLines.map((line) => (
          <div className="talk-line" key={line}>
            <span>{line}</span>
            <SpeechButton
              text={line.replace(/\s*\.\.\.$/, '')}
              label="Lees deze zin voor"
            />
          </div>
        ))}
      </div>
      <p className="fine-print">Tegen wie zou je dit willen zeggen?</p>
    </div>
  );
}

function MoveTool() {
  return (
    <div className="move-tool">
      <p className="eyebrow">Bewegen</p>
      <h2>Laat de energie eruit</h2>
      <p>Kies één beweging. Je mag ook iets anders doen dat goed voelt.</p>
      <ul className="move-list">
        {moveIdeas.map((idea) => (
          <li key={idea}>{idea}</li>
        ))}
      </ul>
      <div className="button-row">
        <SpeechButton
          text={`Bewegen. ${moveIdeas.join(' ')}`}
          label="Lees de bewegingen voor"
        />
        <span className="fine-print">Doe wat fijn voelt.</span>
      </div>
    </div>
  );
}
