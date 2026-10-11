import { useEffect, useState } from "react";

// 北京时间 2027 年 4 月 1 日零点；时间只参与计算，不显示在海报上。
const targetTime = Date.parse("2027-04-01T00:00:00+08:00");

function secondsUntilTarget() {
  return Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
}

function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

export function Countdown() {
  const [remaining, setRemaining] = useState(secondsUntilTarget);

  useEffect(() => {
    const update = () => setRemaining(secondsUntilTarget());
    update();
    const timer = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <aside
      data-countdown
      aria-label="2027 RMUL 实时倒计时"
      aria-live="off"
      className="pointer-events-none absolute left-[1120px] top-[82px] z-[2] w-[620px] text-ink"
    >
      <div className="text-label font-bold tracking-[1px] text-dim">
        2027 RMUL 倒计时
      </div>
      <div className="mt-[5px] flex items-baseline gap-[10px] whitespace-nowrap">
        <span
          aria-hidden="true"
          className="mr-[8px] h-[9px] w-[9px] self-center rounded-full bg-gold shadow-[0_0_15px_rgba(255,230,72,.55)] animate-pulse"
        />
        <span className="text-display font-bold">{days}</span>
        <span className="text-cardtitle font-bold">天</span>
        <span className="ml-[8px] text-display font-bold tracking-[1px]">
          {twoDigits(hours)}:{twoDigits(minutes)}:{twoDigits(seconds)}
        </span>
      </div>
      <div className="mt-[3px] text-meta text-dim">北京时间 · 实时更新</div>
    </aside>
  );
}
