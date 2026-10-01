import type { ReactNode } from "react";
import { asset } from "../lib/util";

interface Props {
  title: string;
  badge?: string;
  subtitle: ReactNode;
  slogan: string;
  /** 右上角统计区 */
  stats: { value: string; unit: string; note: string };
}

/**
 * 两页共用的页眉 —— 只有一套规格（页高由 --head-h 钉死），所以两页的页眉、
 * 内容带、页脚落在同样的 y 上：战队 logo + 竖线 + 标题/副标题/口号，
 * 右侧 RoboMaster 标记 + 总人数。
 */
export function PosterHeader({ title, badge, subtitle, slogan, stats }: Props) {
  return (
    <header className="relative z-[1] flex h-[var(--head-h)] items-start justify-between gap-[36px]">
      <div className="flex items-center gap-[26px]">
        <img
          src={asset("lightning-text.png")}
          alt="灵晔战队 logo"
          className="block h-[118px] w-auto"
        />
        <div className="h-[96px] w-px bg-[linear-gradient(180deg,transparent,var(--color-dim),transparent)]" />
        <div>
          <h1 className="text-display font-bold tracking-[4px]">
            {title}
            {badge && (
              <em className="ml-[18px] align-[7px] text-badge font-medium not-italic tracking-[5px] text-dim">
                {badge}
              </em>
            )}
          </h1>
          <p className="mt-[14px] text-label tracking-[1.4px] text-dim">
            {subtitle}
          </p>
          <p className="mt-[12px] text-group tracking-[4px] text-gold">
            飞云掣电
            <span className="inline-block w-[22px]" />
            {slogan}
          </p>
        </div>
      </div>

      <div className="flex flex-col items-end text-right">
        <img
          src={asset("rm-mark.png")}
          alt="RoboMaster"
          className="block h-[62px] w-auto opacity-95"
        />
        <div className="mt-[14px] text-stat font-bold tracking-[1px]" data-stat-total>
          {stats.value}
          <span className="ml-[7px] text-statunit font-medium tracking-[2px] text-dim">
            {stats.unit}
          </span>
        </div>
        <div className="mt-[14px] text-label tracking-[1.2px] text-dim" data-stat-note>
          {stats.note}
        </div>
      </div>
    </header>
  );
}
