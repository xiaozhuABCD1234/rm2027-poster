import { Fragment, type CSSProperties, type ReactNode } from "react";
import { packChips } from "../lib/chips";

/**
 * 两页共用的展示构件。技术组与车组都从这里取，避免两套近似但不同的实现。
 * 结构：AccentLabel（带配色标签）→ 3px 竖条 + 19px 粗体，两页唯一写法
 *       Block（结构块：年级 / 工作 / 列头 / 跨列顶栏）
 *       Chip（技术组人名胶囊）/ PersonCell（车组人名格子）
 */

/** 「带配色的标签」：技术组子组标题、车组行标签共用 */
export function AccentLabel({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <b className="relative pl-[12px] text-label font-bold tracking-[2px] text-ink">
      <span className="accent-bar" style={{ background: accent }} />
      {children}
    </b>
  );
}

/** 结构块：统一圆角，面层级由调用方给（surface-2 标签 / surface-3 列头 / surface-4 顶栏） */
export function Block({
  style,
  className,
  col,
  children,
}: {
  style: CSSProperties;
  className: string;
  /** 仅供 ?diag=1 量列宽 */
  col?: number;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-block ${className}`}
      style={style}
      data-col={col}
    >
      {children}
    </div>
  );
}

/** 技术组人名胶囊：一个名字一枚，靠外层 flex-wrap 折行（不在 JS 里搬 DOM） */
export function Chip({ name, strong }: { name: string; strong: boolean }) {
  return (
    <span
      data-chip
      className={[
        "whitespace-nowrap rounded-block border px-[12px] py-[9px] text-body leading-[1.2] tracking-[1px] text-ink",
        strong ? "border-edge-strong bg-chip-strong" : "border-edge bg-chip",
      ].join(" ")}
    >
      {name}
    </span>
  );
}

/**
 * 技术组的胶囊行组：每个年级块内的名字按 packChips 分好行，逐行渲染。
 * 行是 flex-wrap，万一估算偏窄也只会行内折行，不会越出卡片。
 */
export function ChipRows({
  names,
  strong,
  boxWidth,
}: {
  names: string[];
  strong: boolean;
  /** 可用宽度 = 卡宽 - 卡内边距 36 - 年级标签 42 - 间隙 10 */
  boxWidth: number;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-[8px]" data-chips>
      {packChips(names, boxWidth).map((line) => (
        <div key={line.join("|")} className="flex flex-wrap gap-[8px]">
          {line.map((n) => (
            <Chip key={n} name={n} strong={strong} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** 车组人名格子：一台车 × 一个年级 × 一个工作，多人用「、」分隔并自动折行 */
export function PersonCell({
  names,
  accent,
  style,
}: {
  names: string[];
  accent: string;
  style: CSSProperties;
}) {
  return (
    <div
      data-cell
      className="flex flex-wrap content-center items-center justify-center gap-x-[2px] gap-y-[1px] rounded-block px-[6px] py-[3px] text-cell leading-[1.25] tracking-[0.5px] text-ink"
      style={{
        ...style,
        background: `${accent}1A`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: "inset 0 0 0 1px var(--color-inset)",
      }}
    >
      {names.map((n, i) => (
        <Fragment key={n}>
          {i > 0 && <span className="opacity-40">、</span>}
          <span>{n}</span>
        </Fragment>
      ))}
    </div>
  );
}
