export function HeroTrail() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroGlow" x1="0.2" y1="0.1" x2="0.9" y2="0.9">
          <stop offset="0%" stopColor="#f0c14b" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#f0c14b" stopOpacity="0" />
        </linearGradient>
      </defs>
      <ellipse cx="1120" cy="220" rx="280" ry="180" fill="url(#heroGlow)" />
      <path
        className="animate-path-dash"
        d="M120 640C280 520 360 700 520 560C680 420 760 640 920 500C1040 400 1140 460 1280 360"
        stroke="#e8dcc4"
        strokeOpacity="0.45"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <g className="animate-marker-pulse origin-center" style={{ transformBox: "fill-box" }}>
        <circle cx="1280" cy="360" r="14" fill="#f0c14b" />
        <path d="M1260 330l20-36 20 36h-40z" fill="#f0c14b" />
      </g>
      <circle cx="120" cy="640" r="9" fill="#f0c14b" fillOpacity="0.9" />
      <circle cx="520" cy="560" r="9" fill="#f0c14b" fillOpacity="0.9" />
      <circle cx="920" cy="500" r="9" fill="#f0c14b" fillOpacity="0.9" />
      <g stroke="#e8dcc4" strokeOpacity="0.22" strokeWidth="1.5" fill="none">
        <path d="M240 120h80M280 80v80" />
        <circle cx="280" cy="120" r="28" />
      </g>
    </svg>
  );
}
