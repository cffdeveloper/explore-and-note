import { useEffect, useState } from "react";

type Props = { startedAt: string; durationYears: number };

type Parts = {
  years: number; months: number; weeks: number; days: number;
  hours: number; minutes: number; seconds: number; micro: number;
  done: boolean;
};

function compute(startedAt: string, years: number): Parts {
  const start = new Date(startedAt).getTime();
  const end = start + years * 365.25 * 24 * 60 * 60 * 1000;
  const now = performance.timeOrigin + performance.now();
  let diff = end - now;
  if (diff <= 0) {
    return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, micro: 0, done: true };
  }
  const yMs = 365.25 * 24 * 3600 * 1000;
  const mMs = 30.4375 * 24 * 3600 * 1000;
  const wMs = 7 * 24 * 3600 * 1000;
  const dMs = 24 * 3600 * 1000;

  const y = Math.floor(diff / yMs); diff -= y * yMs;
  const mo = Math.floor(diff / mMs); diff -= mo * mMs;
  const w = Math.floor(diff / wMs); diff -= w * wMs;
  const d = Math.floor(diff / dMs); diff -= d * dMs;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const mi = Math.floor(diff / 60000); diff -= mi * 60000;
  const s = Math.floor(diff / 1000); diff -= s * 1000;
  const micro = Math.floor(diff * 1000); // ms → µs
  return { years: y, months: mo, weeks: w, days: d, hours: h, minutes: mi, seconds: s, micro, done: false };
}

export function CountdownTimer({ startedAt, durationYears }: Props) {
  const [p, setP] = useState<Parts>(() => compute(startedAt, durationYears));

  useEffect(() => {
    let raf = 0;
    const tick = () => { setP(compute(startedAt, durationYears)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startedAt, durationYears]);

  if (p.done) return <div className="text-2xl font-display text-gold">🎉 The decade is complete.</div>;

  const cells: [string, number, number][] = [
    ["Years", p.years, 2], ["Months", p.months, 2], ["Weeks", p.weeks, 2], ["Days", p.days, 2],
    ["Hours", p.hours, 2], ["Mins", p.minutes, 2], ["Secs", p.seconds, 2], ["µSecs", p.micro, 6],
  ];

  return (
    <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
      {cells.map(([label, val, pad]) => (
        <div key={label} className="border border-border rounded-lg bg-card/40 p-3 text-center">
          <div className="font-display text-xl lg:text-2xl tabular-nums text-gold">
            {String(val).padStart(pad, "0")}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
