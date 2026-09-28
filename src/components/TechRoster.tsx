import {
    countGroup,
    TECH_GROUPS,
    TECH_STATS,
    type TechGroup,
    type TechSub,
} from "../data/tech";
import { useChipBalance } from "../hooks/useChipBalance";
import { PosterFooter } from "./PosterFooter";
import { PosterHeader } from "./PosterHeader";

/** 组内一个年级的一行胶囊 */
function ChipLine({
    grade,
    names,
    grade3,
    sparse,
    first,
}: {
    grade: string;
    names: string[];
    grade3: boolean;
    sparse: boolean;
    first: boolean;
}) {
    if (!names.length) return null;
    const mt = first ? "" : sparse ? "mt-[30px]" : "mt-[8px]";
    return (
        <div className={`flex items-start gap-[10px] ${mt}`}>
            <span className="flex-[0_0_42px] pt-[9px] text-[14.5px] font-medium tracking-[1.4px] text-[#B4C0DA]">
                {grade}
            </span>
            <div
                className={`flex min-w-0 flex-wrap ${sparse ? "gap-[14px]" : "gap-[7px]"}`}
                data-chips
            >
                {names.map((n) => (
                    <span
                        key={n}
                        className={[
                            "whitespace-nowrap rounded-[8px] border px-[12px] py-[9px] text-[21px] leading-[1.2] tracking-[1px]",
                            grade3
                                ? "border-[rgba(214,222,240,.62)] bg-[#414A65] text-ink"
                                : "border-[rgba(210,218,236,.34)] bg-chip text-[#E1E7F5]",
                        ].join(" ")}
                    >
                        {n}
                    </span>
                ))}
            </div>
        </div>
    );
}

function SubBlock({
    sub,
    group,
    index,
    sparse,
}: {
    sub: TechSub;
    group: TechGroup;
    index: number;
    sparse: boolean;
}) {
    const hideTitle = group.subs.length === 1 && sub.name === group.name;
    const border =
        index > 0
            ? "border-t border-dashed border-[rgba(200,208,228,.22)] pt-[16px]"
            : "";

    return (
        <div className={border}>
            {!hideTitle && (
                <div className="mb-[11px] flex items-baseline justify-between gap-[10px]">
                    <b className="relative pl-[12px] text-[19px] font-bold tracking-[2px] text-[#E6EBF8]">
                        <span
                            className="absolute left-0 bottom-[3px] top-[4px] w-[3px] rounded-[2px]"
                            style={{ background: group.accent }}
                        />
                        {sub.name}
                    </b>
                    <i className="whitespace-nowrap text-[14.5px] not-italic tracking-[0.6px] text-[#9DABCD]">
                        大三 {sub.g3.length} · 大二 {sub.g2.length}
                    </i>
                </div>
            )}
            <ChipLine
                grade="大三"
                names={sub.g3}
                grade3
                sparse={sparse}
                first
            />
            <ChipLine
                grade="大二"
                names={sub.g2}
                grade3={false}
                sparse={sparse}
                first={!sub.g3.length}
            />
        </div>
    );
}

function TechCard({ group }: { group: TechGroup }) {
    const { g3, g2 } = countGroup(group);
    const sparse = g3 + g2 <= 12;

    return (
        <section
            data-card
            className="relative flex min-w-0 flex-col overflow-hidden rounded-[14px] border bg-[linear-gradient(180deg,#2F3750_0%,#272E42_100%)] shadow-[0_14px_34px_rgba(0,0,0,.38),inset_0_1px_0_rgba(255,255,255,.06)]"
            style={{ flex: `0 0 ${group.width}px`, borderColor: group.border }}
        >
            <header
                className="flex items-center justify-between gap-[12px] px-[20px] py-[14px]"
                style={{ background: group.accent }}
            >
                <span className="text-[28px] font-bold tracking-[4px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,.35)]">
                    {group.name}
                </span>
                <span className="whitespace-nowrap text-[20px] font-bold tracking-[0.5px] text-white opacity-96">
                    编制 {g3} + {g2}
                </span>
            </header>

            <div className="flex min-h-0 flex-1 flex-col justify-evenly px-[18px] pt-[18px] pb-[30px]">
                {group.subs.map((s, i) => (
                    <SubBlock
                        key={s.name}
                        sub={s}
                        group={group}
                        index={i}
                        sparse={sparse}
                    />
                ))}
            </div>
        </section>
    );
}

export function TechRoster() {
    const ref = useChipBalance();

    return (
        <div ref={ref} className="contents">
            <PosterHeader
                title="技术组人员名单"
                badge="RM2027"
                subtitle={
                    <>
                        ROBOMASTER 2027 赛季
                        <span className="mx-[9px] text-faint">|</span>
                        机械组 · 嵌入式组 · 算法组 · 综合组
                    </>
                }
                slogan="飒沓流星"
                stats={{
                    value: String(TECH_STATS.total),
                    unit: "人",
                    note: `大三 ${TECH_STATS.g3} · 大二 ${TECH_STATS.g2}（去重）`,
                }}
            />

            <main className="relative z-[1] mt-[34px] flex h-[560px] items-stretch gap-[18px]">
                {TECH_GROUPS.map((g) => (
                    <TechCard key={g.name} group={g} />
                ))}
            </main>

            <PosterFooter />
        </div>
    );
}
