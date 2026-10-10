export const Logo = ({ size = 40 }: { size?: number }) => {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute rounded-full bg-gradient-to-br from-[#00E5FF] to-[#5A00FF]"
        style={{ width: size * 0.6, height: size * 0.6 }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        className="relative"
      >
        <circle
          cx="20"
          cy="20"
          r="8"
          fill="url(#planetGradient)"
          className="drop-shadow-[0_0_20px_rgba(0,229,255,0.6)]"
        />
        <ellipse
          cx="20"
          cy="20"
          rx="16"
          ry="6"
          stroke="url(#orbitGradient)"
          strokeWidth="2"
          fill="none"
          className="opacity-80"
        />
        <circle
          cx="32"
          cy="20"
          r="2"
          fill="#D3F5FF"
          className="drop-shadow-[0_0_10px_rgba(211,245,255,0.8)]"
        />
        <defs>
          <linearGradient id="planetGradient" x1="12" y1="12" x2="28" y2="28">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#5A00FF" />
          </linearGradient>
          <linearGradient id="orbitGradient" x1="4" y1="20" x2="36" y2="20">
            <stop offset="0%" stopColor="#5A00FF" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#5A00FF" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
