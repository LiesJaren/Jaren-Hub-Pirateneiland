import { useState } from 'react';
import { playSplash } from '../platform/sound';

const bubbles = [
  { left: '6%', size: 18, delay: '0s', duration: '13s' },
  { left: '14%', size: 9, delay: '4s', duration: '11s' },
  { left: '24%', size: 26, delay: '8s', duration: '17s' },
  { left: '37%', size: 12, delay: '2s', duration: '15s' },
  { left: '49%', size: 8, delay: '10s', duration: '12s' },
  { left: '61%', size: 22, delay: '6s', duration: '18s' },
  { left: '72%', size: 10, delay: '1s', duration: '14s' },
  { left: '83%', size: 30, delay: '9s', duration: '20s' },
  { left: '92%', size: 13, delay: '3s', duration: '16s' },
];

export function OceanBackground() {
  const [dolphinActive, setDolphinActive] = useState(false);

  const triggerDolphin = () => {
    if (dolphinActive) return;
    playSplash();
    setDolphinActive(true);
    setTimeout(() => setDolphinActive(false), 2200);
  };

  return (
    <div className="ocean-bg overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Warme zonne-gloed en lucht */}
      <div className="ocean-glow ocean-glow-one opacity-60" />
      <div className="ocean-glow ocean-glow-two opacity-50" />
      <div className="sun-glow" />

      {/* Drijvende wolkjes */}
      <div className="absolute top-6 left-12 text-3xl opacity-35 animate-pulse">☁️</div>
      <div className="absolute top-14 right-24 text-4xl opacity-25">☁️</div>

      {/* Zeebubbels */}
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="bubble"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDelay: bubble.delay,
            animationDuration: bubble.duration,
          }}
        />
      ))}

      {/* Tropisch Pirateneiland SVG Horizon */}
      <svg
        className="island-svg"
        viewBox="0 0 1200 360"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g>
          {/* Tropische waterlagen */}
          <rect x="0" y="240" width="1200" height="120" fill="#0284c7" opacity="0.25" />
          <path
            d="M0 270 Q 300 250, 600 270 T 1200 270 L 1200 360 L 0 360 Z"
            fill="#0369a1"
            opacity="0.38"
          />
          <path
            d="M0 295 Q 300 280, 600 295 T 1200 295 L 1200 360 L 0 360 Z"
            fill="#0c4a6e"
            opacity="0.5"
          />

          {/* Goudgeel zandstrand en heuvels */}
          <path
            d="M720 270 Q 860 210, 1020 270 L 1020 310 L 720 310 Z"
            fill="#fcd34d"
            opacity="0.5"
          />
          <path
            d="M800 250 Q 880 180, 960 250 Z"
            fill="#84cc16"
            opacity="0.4"
          />

          {/* Klein eilandje links */}
          <path
            d="M120 275 Q 210 230, 300 275 Z"
            fill="#fbbf24"
            opacity="0.45"
          />
        </g>
      </svg>

      {/* Interactieve springende dolfijn */}
      {dolphinActive && (
        <div
          className="absolute bottom-28 left-1/2 transform -translate-x-1/2 text-5xl transition-all animate-bounce"
          style={{ animationDuration: '0.8s' }}
        >
          🐬 <span className="text-xl">💦</span>
        </div>
      )}

      {/* Klikbare hotspot in het water om de dolfijn te laten springen */}
      <button
        type="button"
        onClick={triggerDolphin}
        className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-16 opacity-0 hover:opacity-10 cursor-pointer"
        aria-label="Laat de dolfijn springen"
        title="Tik voor een dolfijnsprong!"
      />
    </div>
  );
}
