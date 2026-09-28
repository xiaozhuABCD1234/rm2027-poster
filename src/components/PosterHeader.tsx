import type { ReactNode } from "react";
import { asset } from "../lib/util";

interface Props {
  title: string;
  badge?: string;
  subtitle: ReactNode;
  slogan: string;
  /** 右上角统计区 */
  stats: { value: string; unit: string; note: string };
  /** 车辆页要塞下 9 行矩阵，用紧凑版页眉 */
  compact?: boolean;
}

/** 两页共用的页眉：战队 logo + 竖线 + 标题/副标题/口号；右侧 RoboMaster 标记 + 总人数 */
export function PosterHeader({
  title,
  badge,
  subtitle,
  slogan,
  stats,
  compact,
}: Props) {
  const logoH = compact ? 118 : 148;
  const titleSize = compact ? 54 : 60;

  return (
    <header className="relative z-[1] flex items-start justify-between gap-[36px]">
      <div className="flex items-center gap-[26px]">
        <img
          src={asset("lightning-text.png")}
          alt="灵晔战队 logo"
          className="block w-auto"
          style={{ height: logoH }}
        />
        <div
          className="w-px bg-[linear-gradient(180deg,transparent,rgba(200,208,228,.42),transparent)]"
          style={{ height: compact ? 96 : 112 }}
        />
        <div>
          <h1
            className="font-bold leading-[1.04] tracking-[4px]"
            style={{ fontSize: titleSize }}
          >
            {title}
            {badge && (
              <em className="ml-[18px] align-[7px] text-[26px] font-medium not-italic tracking-[5px] text-[#B4C1DC]">
                {badge}
              </em>
            )}
          </h1>
          <p className="mt-[14px] text-[19px] tracking-[1.4px] text-dim">
            {subtitle}
          </p>
          <p className="mt-[12px] text-[17px] tracking-[4px] text-gold opacity-94">
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
        <div
          className="mt-[14px] font-bold leading-none tracking-[1px]"
          style={{ fontSize: compact ? 72 : 80 }}
        >
          {stats.value}
          <span className="ml-[7px] text-[24px] font-medium tracking-[2px] text-dim">
            {stats.unit}
          </span>
        </div>
        <div className="mt-[14px] text-[19px] tracking-[1.2px] text-dim">
          {stats.note}
        </div>
      </div>
    </header>
  );
}
