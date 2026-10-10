export const Logo = ({ size = 38, showWordmark = false }: { size?: number; showWordmark?: boolean }) => {
  return (
    <div className="inline-flex items-center gap-2.5 select-none" role="img" aria-label="LearnAI Logo">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        {/* Ambient background glow */}
        <div
          className="absolute rounded-full bg-gradient-to-tr from-stellar-violet via-stellar-purple to-stellar-cyan opacity-40 blur-md"
          style={{ width: size * 0.85, height: size * 0.85 }}
        />

        <svg
          width={size}
          height={size}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]"
        >
          <defs>
            <linearGradient id="learnai-core" x1="8" y1="8" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>

            <linearGradient id="learnai-orbit-1" x1="4" y1="22" x2="40" y2="22" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C084FC" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="learnai-orbit-2" x1="22" y1="4" x2="22" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
            </linearGradient>

            <filter id="core-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer primary orbital ring */}
          <ellipse
            cx="22"
            cy="22"
            rx="18"
            ry="7"
            transform="rotate(-28 22 22)"
            stroke="url(#learnai-orbit-1)"
            strokeWidth="1.8"
            strokeDasharray="40 2"
          />

          {/* Secondary counter-orbital ring */}
          <ellipse
            cx="22"
            cy="22"
            rx="15"
            ry="5.5"
            transform="rotate(38 22 22)"
            stroke="url(#learnai-orbit-2)"
            strokeWidth="1.2"
            strokeDasharray="24 4"
            opacity="0.6"
          />

          {/* Central celestial sphere with glow */}
          <circle
            cx="22"
            cy="22"
            r="8.5"
            fill="url(#learnai-core)"
            filter="url(#core-glow)"
          />

          {/* Inner stellar diamond / AI nexus */}
          <path
            d="M22 17.5L24 22L22 26.5L20 22Z"
            fill="#FFFFFF"
            className="opacity-95 drop-shadow-[0_0_4px_rgba(255,255,255,0.9)]"
          />
          <path
            d="M17.5 22L22 20L26.5 22L22 24Z"
            fill="#FFFFFF"
            className="opacity-70"
          />

          {/* Orbiting satellite star node */}
          <circle
            cx="35.5"
            cy="15"
            r="2"
            fill="#BAE6FD"
            className="drop-shadow-[0_0_6px_#38BDF8]"
          />
          <circle
            cx="8.5"
            cy="29"
            r="1.2"
            fill="#E9D5FF"
            className="drop-shadow-[0_0_4px_#A78BFA]"
          />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-tight">
            <span className="text-xl font-extrabold text-white">Learn</span>
            <span className="text-xl font-extrabold bg-gradient-to-r from-stellar-cyan to-stellar-purple bg-clip-text text-transparent">
              AI
            </span>
          </div>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-stellar-secondary -mt-1">
            Stellar Assistant
          </span>
        </div>
      )}
    </div>
  );
};
