import {
    countGroup,
    type TechData,
    type TechGroup,
    type TechStats,
    type TechSub,
} from "../data/roster";
import { AccentLabel, ChipRows } from "./blocks";
import { Countdown } from "./Countdown";
import { PosterFooter } from "./PosterFooter";
import { PosterHeader } from "./PosterHeader";

/** 卡内可用宽度 = 卡宽 - 卡内边距 36 - 年级标签 42 - 间隙 10 */
const chipsBoxWidth = (cardWidth: number) => cardWidth - 88;

/**
 * 一行胶囊（大三 / 大二）。
 * - 行带高度固定（--band-g3 / --band-g2）+ 顶部对齐：四张卡的「大三」「大二」落在同一 y 上。
 * - 分行由 packChips 先算好（纯计算），每行内部仍是 flex-wrap：间距一律 8px，
 *   不会出现越出卡片的胶囊，也不会留下「末行只剩一枚」的孤儿。
 */
function ChipLine({
    grade,
    names,
    strong,
    band,
    boxWidth,
    chipClassName = "",
}: {
    grade: string;
    names: string[];
    strong: boolean;
    band: string;
    boxWidth: number;
    chipClassName?: string;
}) {
    if (!names.length) return null;
    return (
        <div
            className="flex items-start gap-[10px]"
            style={{ height: `var(${band})` }}
            data-gradeline={grade}
        >
            <span className="flex-[0_0_42px] pt-[25px] text-meta font-medium tracking-[1.4px] text-dim">
                {grade}
            </span>
            <ChipRows
                names={names}
                strong={strong}
                boxWidth={boxWidth}
                className={chipClassName}
            />
        </div>
    );
}

/**
 * 一个子组。
 * 标题行带恒定（--band-title），即使这个卡只有一个同名子组（不显示标题）也占位，
 * 这样「机械组」的胶囊行与其他卡的胶囊行仍然对齐。
 */
function SubBlock({
    sub,
    group,
    index,
    boxWidth,
}: {
    sub: TechSub;
    group: TechGroup;
    index: number;
    boxWidth: number;
}) {
    const hideTitle = group.subs.length === 1 && sub.name === group.name;
    const shiftG3Only = group.name === "嵌入式组" || group.name === "算法组";
    const g3ChipClassName = shiftG3Only
        ? "translate-y-[12px]"
        : group.name === "综合组"
          ? sub.name === "管理" ? "translate-y-[32px]" : "translate-y-[16px]"
          : "translate-y-[6px]";
    const g2ChipClassName = shiftG3Only
        ? ""
        : group.name === "综合组"
          ? "translate-y-[56px]"
          : "translate-y-[46px]";
    const subgroupGap = group.name === "嵌入式组" ? "mt-[4px]" : "mt-[16px]";

    return (
        <div
            className={index > 0 ? `${subgroupGap} border-t border-dashed border-hair pt-[16px]` : ""}
            data-sub={sub.name}
        >
            <div
                className="flex items-baseline justify-between gap-[10px]"
                style={{ height: "var(--band-title)" }}
            >
                {!hideTitle && (
                    <>
                        <AccentLabel accent={group.accent}>{sub.name}</AccentLabel>
                        <i className="whitespace-nowrap text-meta not-italic tracking-[0.6px] text-dim">
                            大三 {sub.g3.length} · 大二 {sub.g2.length}
                        </i>
                    </>
                )}
            </div>
            <ChipLine
                grade="大三"
                names={sub.g3}
                strong
                chipClassName={g3ChipClassName}
                band="--band-g3"
                boxWidth={boxWidth}
            />
            <ChipLine
                grade="大二"
                names={sub.g2}
                strong={false}
                chipClassName={g2ChipClassName}
                band="--band-g2"
                boxWidth={boxWidth}
            />
        </div>
    );
}

function TechCard({ group }: { group: TechGroup }) {
    const { g3, g2 } = countGroup(group);
    const boxWidth = chipsBoxWidth(group.width);

    return (
        <section
            data-card
            className="relative flex min-w-0 flex-col overflow-hidden rounded-card border bg-[linear-gradient(180deg,var(--color-card-top)_0%,var(--color-card-bottom)_100%)] shadow-[0_14px_34px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.06)]"
            style={{ flex: `0 0 ${group.width}px`, borderColor: group.border }}
        >
            <header
                className="flex h-[58px] items-center justify-between gap-[12px] px-[20px]"
                style={{ background: group.accent }}
            >
                <span className="text-cardtitle font-bold tracking-[4px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,.35)]">
                    {group.name}
                </span>
                <span className="whitespace-nowrap text-label font-bold tracking-[0.5px] text-white opacity-95">
                    编制 {g3} + {g2}
                </span>
            </header>

            <div className="flex min-h-0 flex-1 flex-col px-[18px] pt-[18px] pb-[30px]">
                {group.subs.map((s, i) => (
                    <SubBlock
                        key={s.name}
                        sub={s}
                        group={group}
                        index={i}
                        boxWidth={boxWidth}
                    />
                ))}
            </div>
        </section>
    );
}

export function TechRoster({ data, stats }: { data: TechData; stats: TechStats }) {
    return (
        <>
            <PosterHeader
                title="技术组人员名单"
                badge="RM2027"
                subtitle={
                    <>
                        ROBOMASTER 2027 赛季
                        <span className="mx-[9px] text-faint">|</span>
                        {data.groups.map((g) => g.name).join(" · ")}
                    </>
                }
                slogan="飒沓流星"
                stats={{
                    value: String(stats.total),
                    unit: "人",
                    note: `大三 ${stats.g3} · 大二 ${stats.g2}（去重）`,
                }}
            />
            <Countdown />

            <main className="relative z-[1] mt-[var(--gap-band)] flex h-[var(--band-h)] items-stretch gap-[var(--gap-card)]">
                {data.groups.map((g) => (
                    <TechCard key={g.name} group={g} />
                ))}
            </main>

            <PosterFooter />
        </>
    );
}
