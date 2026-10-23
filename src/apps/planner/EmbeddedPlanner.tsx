import { useEffect, useState } from 'react';
import Planner from './planner-src/App';

const PLANNER_ID_KEY = 'fp_planner_id';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DEFAULT_PLANNER_ID = '403b870e-29af-4350-b313-ec37bfaaddcc';

async function pickPlannerId(): Promise<void> {
  const fromUrl = new URLSearchParams(window.location.search).get('planner');
  if (fromUrl && UUID.test(fromUrl)) return;

  try {
    const localId = localStorage.getItem(PLANNER_ID_KEY);
    if (!localId || !UUID.test(localId)) {
      localStorage.setItem(PLANNER_ID_KEY, DEFAULT_PLANNER_ID);
    }
  } catch {
    //
  }
}

export default function EmbeddedPlanner() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void pickPlannerId()
      .catch((error: unknown) => {
        console.warn('Kon de standaardplanner niet bepalen:', error);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div className="planner-loading" role="status">
        <span className="planner-loading-dot" aria-hidden="true" />
        Jouw planbord wordt klaargezet...
      </div>
    );
  }

  return <Planner />;
}
