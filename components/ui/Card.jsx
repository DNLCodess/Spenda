export default function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-[var(--radius-card)] bg-surface p-4 ring-1 ring-border ${className}`}
    >
      {children}
    </div>
  );
}
