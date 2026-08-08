import { useEffect, useState } from "react";

function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(Number(ms) || 0));
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  if (days > 0) return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Live countdown against server expiresAt (device-bound clock). */
export default function TrialCountdown({ expiresAt, expired, className = "" }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (expired || !expiresAt) {
    return <span className={className}>00:00:00</span>;
  }

  const ms = new Date(expiresAt).getTime() - now;
  return <span className={`tabular-nums ${className}`}>{formatRemaining(ms)}</span>;
}
