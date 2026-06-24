interface MalawiFlagProps {
  className?: string;
  title?: string;
}

/** Malawi national flag — black, red, green with rising sun. */
export function MalawiFlag({ className = "h-6 w-9", title = "Malawi" }: MalawiFlagProps) {
  return (
    <svg
      viewBox="0 0 900 600"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect width="900" height="200" fill="#000000" />
      <rect y="200" width="900" height="200" fill="#CE1126" />
      <rect y="400" width="900" height="200" fill="#339E35" />
      <circle cx="450" cy="300" r="85" fill="#CE1126" />
      <g fill="#000000">
        <rect x="430" y="120" width="40" height="90" rx="4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <rect
            key={deg}
            x="443"
            y="128"
            width="14"
            height="36"
            rx="3"
            transform={`rotate(${deg} 450 300)`}
          />
        ))}
      </g>
    </svg>
  );
}
