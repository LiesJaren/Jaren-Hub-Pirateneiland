type MascotProps = {
  className?: string;
  size?: number;
};

export function Mascot({ className = '', size = 190 }: MascotProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 220 220"
      role="img"
      aria-label="Kaptein Koraal, de vriendelijke piraatsschildpad"
    >
      <ellipse cx="110" cy="199" rx="72" ry="12" fill="#031c2e" opacity="0.28" />
      <g>
        <rect x="34" y="142" width="34" height="20" rx="10" fill="#5eead4" />
        <rect x="152" y="142" width="34" height="20" rx="10" fill="#5eead4" />
        <rect x="32" y="166" width="28" height="16" rx="8" fill="#2dd4bf" />
        <rect x="160" y="166" width="28" height="16" rx="8" fill="#2dd4bf" />
      </g>
      <g shapeRendering="crispEdges">
        <rect x="48" y="98" width="124" height="82" rx="26" fill="#15803d" />
        <rect x="62" y="112" width="26" height="24" rx="6" fill="#22c55e" />
        <rect x="96" y="126" width="26" height="24" rx="6" fill="#22c55e" />
        <rect x="132" y="112" width="26" height="24" rx="6" fill="#22c55e" />
        <rect x="78" y="154" width="24" height="18" rx="5" fill="#166534" />
        <rect x="118" y="154" width="24" height="18" rx="5" fill="#166534" />
        <rect x="82" y="60" width="56" height="54" rx="17" fill="#86efac" />
        <rect x="74" y="48" width="72" height="18" rx="8" fill="#4ade80" />
      </g>
      <g>
        <circle cx="99" cy="87" r="8" fill="#f8fafc" />
        <circle cx="122" cy="87" r="8" fill="#f8fafc" />
        <circle cx="101" cy="88" r="4" fill="#0f172a" />
        <circle cx="124" cy="88" r="4" fill="#0f172a" />
        <circle cx="93" cy="101" r="4.3" fill="#fda4af" opacity="0.8" />
        <circle cx="128" cy="101" r="4.3" fill="#fda4af" opacity="0.8" />
        <path
          d="M98 103 Q110 113 122 103"
          fill="none"
          stroke="#0f172a"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
      <g>
        <path
          d="M62 62 Q110 18 158 62 L146 76 Q110 50 74 76 Z"
          fill="#1e293b"
        />
        <path
          d="M74 64 Q110 42 146 64 L140 74 Q110 56 80 74 Z"
          fill="#334155"
        />
        <rect x="82" y="62" width="56" height="9" rx="4" fill="#fbbf24" />
        <path
          d="M110 54 l6 12 14 2 -10 10 2 14 -12 -7 -12 7 2 -14 -10 -10 14 -2 z"
          fill="#fef08a"
          stroke="#b45309"
          strokeWidth="1.5"
        />
        <rect x="103" y="38" width="14" height="18" rx="4" fill="#b91c1c" />
        <path d="M117 40 L134 46 L117 52 Z" fill="#f87171" />
      </g>
      <g>
        <rect x="56" y="132" width="10" height="18" rx="5" fill="#166534" />
        <rect x="154" y="132" width="10" height="18" rx="5" fill="#166534" />
      </g>
    </svg>
  );
}
