import { useId, type CSSProperties } from 'react';

export type ExecutionMode = 'SIM' | 'SHADOW' | 'SUPERVISED';
export type AvatarState = 'IDLE' | 'READY' | 'NEEDS_REVIEW';

interface OrbAvatarProps {
  size?: number;
  mode?: ExecutionMode;
  state?: AvatarState;
  animate?: boolean;
  className?: string;
}

export function OrbAvatar({
  size = 36,
  mode = 'SIM',
  state = 'IDLE',
  animate = false,
  className = '',
}: OrbAvatarProps) {
  const uid = useId();
  const id = (s: string) => `orb-${s}-${uid}`;

  // Ring config per mode
  const ringStroke = mode === 'SHADOW' ? 'currentColor' : 'currentColor';
  const ringOpacity = state === 'IDLE' ? 0.25 : state === 'NEEDS_REVIEW' ? 0.4 : 0.35;
  const ringDash = mode === 'SHADOW' ? '3 3' : undefined;
  const ringWidth = mode === 'SUPERVISED' ? 2.2 : 1.8;

  // Halo glow for READY state
  const showHalo = state === 'READY';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Assistant avatar"
      className={className}
      style={{ display: 'block', '--orb-size': `${size}px` } as CSSProperties}
    >
      <defs>
        {/* Orb body: radial gradient giving depth */}
        <radialGradient id={id('body')} cx="0.42" cy="0.38" r="0.55" fx="0.42" fy="0.38">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.45} />
          <stop offset="60%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.08} />
        </radialGradient>

        {/* Specular highlight */}
        <radialGradient id={id('highlight')} cx="0.38" cy="0.32" r="0.35" fx="0.38" fy="0.32">
          <stop offset="0%" stopColor="white" stopOpacity={0.55} />
          <stop offset="50%" stopColor="white" stopOpacity={0.12} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </radialGradient>

        {/* Inner vignette shadow */}
        <radialGradient id={id('vignette')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="60%" stopColor="black" stopOpacity={0} />
          <stop offset="100%" stopColor="black" stopOpacity={0.12} />
        </radialGradient>

        {/* Caustic light band */}
        <linearGradient id={id('caustic')} x1="0.2" y1="0.5" x2="0.8" y2="0.5">
          <stop offset="0%" stopColor="white" stopOpacity={0} />
          <stop offset="40%" stopColor="white" stopOpacity={0.1} />
          <stop offset="60%" stopColor="white" stopOpacity={0.1} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>

        {/* Clip for caustic band */}
        <clipPath id={id('caustic-clip')}>
          <circle cx="32" cy="32" r="18" />
        </clipPath>

        {/* Halo glow filter */}
        {showHalo && (
          <filter id={id('halo')} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
          </filter>
        )}
      </defs>

      {/* READY state halo */}
      {showHalo && (
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="currentColor"
          opacity={animate ? undefined : 0.08}
          filter={`url(#${id('halo')})`}
          className={animate ? 'orb-breathe' : undefined}
        />
      )}

      {/* Outer ring (mode indicator) */}
      <circle
        cx="32"
        cy="32"
        r="28"
        stroke={ringStroke}
        strokeOpacity={ringOpacity}
        strokeWidth={ringWidth}
        strokeDasharray={ringDash}
        fill="none"
        strokeLinecap="round"
      />

      {/* Orb body */}
      <circle cx="32" cy="32" r="19" fill={`url(#${id('body')})`} />

      {/* Caustic light band */}
      <g clipPath={`url(#${id('caustic-clip')})`}>
        <rect
          x="13"
          y="28"
          width="38"
          height="4"
          rx="2"
          fill={`url(#${id('caustic')})`}
          transform="rotate(-18 32 32)"
        />
      </g>

      {/* Specular highlight */}
      <circle cx="27" cy="26" r="10" fill={`url(#${id('highlight')})`} />

      {/* Vignette / inner shadow */}
      <circle cx="32" cy="32" r="19" fill={`url(#${id('vignette')})`} />

      {/* SUPERVISED: minimal lock glyph at bottom-right of ring */}
      {mode === 'SUPERVISED' && (
        <g transform="translate(46, 46)" opacity={0.5}>
          {/* Lock body */}
          <rect x="0" y="3" width="8" height="6" rx="1.2" fill="currentColor" />
          {/* Lock shackle */}
          <path
            d="M2 3V2a2 2 0 0 1 4 0v1"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Inject keyframe via <style> only when animating */}
      {animate && (
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            .orb-breathe {
              animation: orb-breathe-kf 2.2s ease-in-out infinite;
            }
            @keyframes orb-breathe-kf {
              0%, 100% { opacity: 0.06; }
              50% { opacity: 0.13; }
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .orb-breathe { opacity: 0.08; }
          }
        `}</style>
      )}
    </svg>
  );
}
