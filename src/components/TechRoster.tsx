import { countGroup, type TechData, type TechGroup, type TechStats, type TechSub } from "../data/roster";
import { AccentLabel } from "./blocks";
import { Countdown } from "./Countdown";
import { PosterFooter } from "./PosterFooter";
import { PosterHeader } from "./PosterHeader";

const areas = ["mechanical", "embedded", "algorithm", "support"];

function GradeRow({ grade, names, columns }: { grade: string; names: string[]; columns: number }) {
    if (!names.length) return null;
    return (
        <div className="tech-grade" data-gradeline={grade}>
            <span className="tech-grade-label">{grade}</span>
            <div className="tech-name-grid" data-chips style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                {names.map(name => <span className="tech-name" data-chip key={name}>{name}</span>)}
            </div>
        </div>
    );
}

function SubBlock({ sub, group, compact, embedded }: {
    sub: TechSub;
    group: TechGroup;
    compact: boolean;
    embedded: boolean;
}) {
    const single = group.subs.length === 1 && sub.name === group.name;
    return (
        <div className="tech-sub" data-sub={sub.name}>
            <div className="tech-sub-title" aria-hidden={single || undefined}>
                {!single && <>
                    <AccentLabel accent={group.accent}>{sub.name}</AccentLabel>
                    <span className="tech-sub-count">{sub.g3.length + sub.g2.length} 人</span>
                </>}
            </div>
            <div className="tech-sub-grades">
                <GradeRow grade="大三" names={sub.g3} columns={compact ? 2 : embedded ? 5 : group.subs.length === 1 ? 4 : 3} />
                <GradeRow grade="大二" names={sub.g2} columns={compact ? 2 : embedded ? 4 : 3} />
            </div>
        </div>
    );
}

function TechCard({ group, index }: { group: TechGroup; index: number }) {
    const { g3, g2 } = countGroup(group);
    const compact = index === 3;
    return (
        <section data-card className={`tech-card ${compact ? "tech-card-support" : ""}`} style={{ gridArea: areas[index], borderColor: group.border }}>
            <header className="tech-card-head" style={{ background: group.accent }}>
                <div className="tech-card-heading">
                    <span className="tech-card-title">{group.name}</span>
                    <span className="tech-card-total" data-group-total>{g3 + g2}<span>人</span></span>
                </div>
                <div className="tech-card-note">大三 {g3} · 大二 {g2}</div>
            </header>
            <div className="tech-card-body" style={compact ? undefined : { gridTemplateRows: `repeat(${group.subs.length}, minmax(0, 1fr))` }}>
                {group.subs.map(sub => <SubBlock key={sub.name} sub={sub} group={group} compact={compact} embedded={index === 1} />)}
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
                subtitle={<>
                    ROBOMASTER 2027 赛季
                    <span className="mx-[9px] text-faint">|</span>
                    {data.groups.map(g => g.name).join(" · ")}
                </>}
                slogan="飒沓流星"
                stats={{ value: String(stats.total), unit: "人", note: `大三 ${stats.g3} · 大二 ${stats.g2}` }}
            />
            <Countdown />
            <main className="tech-roster" style={{ gridTemplateColumns: data.groups.slice(0, 3).map(group => `${group.width}px`).join(" ") }}>
                {data.groups.map((group, index) => <TechCard key={group.name} group={group} index={index} />)}
            </main>
            <PosterFooter />
        </>
    );
}
