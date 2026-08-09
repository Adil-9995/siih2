import { useEffect, useState } from "react";

function diff(target: string) {
  const ms = new Date(target).getTime() - Date.now();
  const clamped = Math.max(ms, 0);
  return {
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped / 3600000) % 24),
    minutes: Math.floor((clamped / 60000) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
    over: ms <= 0,
  };
}

export function CountdownTimer({ target, label }: { target: string; label: string }) {
  const [time, setTime] = useState(() => diff(target));

  useEffect(() => {
    setTime(diff(target));
    const id = window.setInterval(() => setTime(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const cells = [
    { v: time.days, l: "Days" },
    { v: time.hours, l: "Hours" },
    { v: time.minutes, l: "Minutes" },
    { v: time.seconds, l: "Seconds" },
  ];

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.3em] text-muted-foreground uppercase">{label}</p>
      {time.over ? (
        <p className="mt-3 font-display text-2xl text-cyan">Now live</p>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {cells.map((c) => (
            <div key={c.l} className="glass rounded-lg px-2 py-3 text-center" style={{ boxShadow: "var(--glow-sm)" }}>
              <div className="font-display text-2xl font-bold text-foreground sm:text-3xl tabular-nums">
                {String(c.v).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[10px] tracking-widest text-muted-foreground uppercase">{c.l}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
