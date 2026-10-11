type Props = { remainingMs: number | null; totalSeconds: number; label: string };

export function formatTime(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function TimerBar({ remainingMs, totalSeconds, label }: Props) {
  if (remainingMs === null) return null;
  const pct = Math.min(100, (remainingMs / (totalSeconds * 1000)) * 100);
  const low = remainingMs <= 10_000;
  return (
    <div className={`timer${low ? ' timer-low' : ''}`}>
      <div className="timer-text">
        <span>{label}</span>
        <strong role="timer">{formatTime(remainingMs)}</strong>
      </div>
      <div className="timer-track" aria-hidden="true">
        <div className="timer-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
