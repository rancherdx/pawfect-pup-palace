import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const PawIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="13" r="8" opacity="0.2" />
    <circle cx="13" cy="11" r="2" />
    <circle cx="9" cy="9" r="2" />
    <circle cx="15" cy="9" r="2" />
    <circle cx="18" cy="13" r="2" />
    <circle cx="6" cy="13" r="2" />
  </svg>
);

export const BoneIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <rect x="7" y="9" width="10" height="6" rx="2" />
  </svg>
);

export const DogHouseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 3L3 9v12h18V9l-9-6z" />
    <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

export const HeartPawIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" opacity="0.2" />
    <circle cx="12" cy="10" r="1.5" />
    <circle cx="9.5" cy="8" r="1" />
    <circle cx="14.5" cy="8" r="1" />
  </svg>
);

export const TailWagIcon: React.FC<IconProps & { animate?: boolean }> = ({ 
  className = '', 
  size = 24,
  animate = false 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} ${animate ? 'animate-tail-wag origin-right' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="8" cy="12" r="6" />
    <circle cx="7" cy="11" r="1" fill="currentColor" />
    <circle cx="9" cy="11" r="1" fill="currentColor" />
    <path d="M8 14c1 0 2-1 2-1" />
    <path d="M14 12c2-2 4-3 6-2" />
  </svg>
);

export const PuppyFaceIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
    <path d="M12 13v2" />
    <path d="M10 15h4" />
    <path d="M8 8c-1-1-2-1-3 0" />
    <path d="M16 8c1-1 2-1 3 0" />
  </svg>
);

export const AnimatedPawPrints: React.FC<{ className?: string; count?: number }> = ({ 
  className = '',
  count = 5 
}) => (
  <div className={`flex gap-4 ${className}`}>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="animate-paw-print text-accent/30"
        style={{
          animationDelay: `${i * 0.2}s`,
        }}
      >
        <PawIcon size={20} />
      </div>
    ))}
  </div>
);
