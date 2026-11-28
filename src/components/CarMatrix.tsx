import { Fragment } from "react";
import type { CarStats, CarsData } from "../data/roster";
import { CONTENT_W } from "../lib/util";
import { carCellRuns, carWorkRuns } from "../lib/car-cells";
import { AccentLabel, Block, PersonCell } from "./blocks";
import { Countdown } from "./Countdown";
import { PosterFooter } from "./PosterFooter";
import { PosterHeader } from "./PosterHeader";

/** 矩阵前面两列固定：年级(58px) + 工作(76px)，其余列按车数均分 */
const LEAD_COLS = "58px 76px";
const DESIGN_ROWS = 9; // 车组页按 9 行设计：2 个年级 × 4 个工作 + 负责人
const DESIGN_ROW_H = 62; // 9 行 × 62 + 8 缝 + 顶栏 44 + 列头 58 + 2 缝 = 680 = 内容带高
const GROUP_BAR_H = 44;
const COL_HEAD_H = 58;

export function CarMatrix({ data, stats }: { data: CarsData; stats: CarStats }) {
  const { grades, disciplines, leadRow, robots } = data;
  const COLS = `${LEAD_COLS} repeat(${robots.length}, minmax(0, 1fr))`;
  /** 年级块标签：「2024级」->「2024 级」，与页眉原有排版一致 */
  const gradeText = (g: string) => g.replace(/\s*级$/, " 级");

  const bodyRows = grades.length * disciplines.length;
  const totalRows = bodyRows + 1; // + 负责人行
  const rowH =
    totalRows <= DESIGN_ROWS
      ? DESIGN_ROW_H
      : Math.floor((DESIGN_ROW_H * DESIGN_ROWS) / totalRows);

  // 每行底衬：年级块交替底色（surface-1 / surface-0），负责人行单独一档
  const BLOCK_TINTS = ["var(--color-surface-1)", "var(--color-surface-0)"];
  const rowTints = [
    ...grades.flatMap((_grade, gi) =>
      disciplines.map(() => BLOCK_TINTS[gi % BLOCK_TINTS.length]),
    ),
    "var(--color-surface-lead)",
  ];

  // 有构型的车合并分类标题；独立项目直接以车名作为一级标题。
  const groupRuns = robots.reduce<
    { label: string; start: number; span: number; hasVariants: boolean }[]
  >((acc, robot, i) => {
    const last = acc[acc.length - 1];
    if (robot.group && last?.hasVariants && last.label === robot.group && last.start + last.span === i) {
      return [...acc.slice(0, -1), { ...last, span: last.span + 1 }];
    }
    return [...acc, { label: robot.group ?? robot.name, start: i, span: 1, hasVariants: Boolean(robot.group) }];
  }, []);

  return (
    <>
      <PosterHeader
        title="车组人员名单"
        badge="RM2027"
        subtitle={
          <>
            ROBOMASTER 2027 赛季
            <span className="mx-[9px] text-faint">|</span>
            {`${robots.length} 个车组 · ${grades
              .map(gradeText)
              .join(" / ")} · ${disciplines.map((d) => d.name).join(" / ")}`}
          </>
        }
        slogan="飒沓流星"
        stats={{
          value: String(stats.unique),
          unit: "人",
          note: `人次 ${stats.slots} · ${robots.length} 个车组`,
        }}
      />
      <Countdown />

      <section
        className="relative z-[1] mt-[var(--gap-band)] flex flex-col gap-[var(--gap-cell)]"
        style={{ width: CONTENT_W }}
      >
        {/* 分类与独立项目同级；只有步兵、哨兵在第二行列出构型。 */}
        <div
          className="grid gap-[var(--gap-cell)]"
          style={{ gridTemplateColumns: COLS, gridTemplateRows: `${GROUP_BAR_H}px ${COL_HEAD_H}px` }}
        >
          {groupRuns.map((g) => (
            <Block
              key={`${g.label}-${g.start}`}
              col={g.hasVariants ? undefined : g.start}
              style={{
                gridColumn: `${g.start + 3} / span ${g.span}`,
                gridRow: g.hasVariants ? "1" : "1 / span 2",
                alignItems: "flex-start",
                background: "var(--color-surface-4)",
              }}
              className="text-group font-bold tracking-[3px] text-ink"
            >
              <span data-car-category className="flex w-full items-center justify-center" style={{ height: GROUP_BAR_H }}>{g.label}</span>
            </Block>
          ))}
          {robots.map((robot, i) => robot.group ? (
            <Block
              key={robot.name}
              col={i}
              style={{
                gridColumn: i + 3,
                gridRow: 2,
                background: "var(--color-surface-3)",
              }}
              className="px-[4px] text-center text-colhead font-medium leading-[1.25] tracking-[0.5px] text-dim"
            >
              <span data-car-variant>{robot.name}</span>
            </Block>
          ) : null)}
        </div>

        {/* 正文矩阵：行 = 年级 × 工作，列 = 车 */}
        <div
          className="grid gap-[var(--gap-cell)]"
          style={{
            gridTemplateColumns: COLS,
            gridTemplateRows: `repeat(${totalRows}, ${rowH}px)`,
          }}
        >
          {/* 每行底衬：空白格子多，铺一条淡底让视线能横向跟住一行 */}
          {rowTints.map((tint, i) => (
            <div
              key={`row-bg-${i}`}
              className="rounded-block"
              style={{
                gridColumn: `3 / span ${robots.length}`,
                gridRow: i + 1,
                background: tint,
              }}
            />
          ))}

          {grades.map((grade, gi) => {
            const startRow = gi * disciplines.length + 1;
            return (
              <Fragment key={grade}>
                <Block
                  style={{
                    gridColumn: 1,
                    gridRow: `${startRow} / span ${disciplines.length}`,
                    background: "var(--color-surface-2)",
                  }}
                  className="text-label font-bold tracking-[6px] text-ink [writing-mode:vertical-rl]"
                >
                  {grade}
                </Block>
                {disciplines.map((disc, di) => {
                  const rowIndex = startRow + di;
                  return (
                    <Fragment key={disc.name}>
                      {/* 工作标签：与技术组子组标题同一套语言（3px 竖条 + 19px 粗体） */}
                      <Block
                        style={{
                          gridColumn: 2,
                          gridRow: rowIndex,
                          background: "var(--color-surface-2)",
                        }}
                        className="justify-start"
                      >
                        <AccentLabel accent={disc.accent}>{disc.name}</AccentLabel>
                      </Block>
                      {carWorkRuns(robots, grade, disc.name).map(run => run.rowSpan > 1 ? (
                        <div
                          key={`${grade}-${disc.name}-${run.start}`}
                          data-cell
                          data-joint-work={run.work}
                          data-names={run.names.join("、")}
                          className="car-joint-cell"
                          style={{ gridColumn: `${run.start + 3} / span ${run.span}`, gridRow: `${rowIndex} / span ${run.rowSpan}` }}
                        >
                          <div className="car-joint-names" style={{ gridTemplateColumns: run.span > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)" }}>
                            {run.names.map(name => <span key={name}>{name}</span>)}
                          </div>
                        </div>
                      ) : (
                        <PersonCell
                            key={`${grade}-${disc.name}-${run.start}`}
                            names={run.names}
                            accent={disc.accent}
                            style={{ gridColumn: `${run.start + 3} / span ${run.span}`, gridRow: rowIndex }}
                          />
                      ))}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}

          {/* 相邻项目负责人相同时，合并显示一次。 */}
          <Block
            style={{
              gridColumn: "1 / span 2",
              gridRow: totalRows,
              background: "var(--color-surface-lead)",
            }}
            className="text-label font-bold tracking-[4px] text-ink"
          >
            {leadRow.label}
          </Block>
          {carCellRuns(robots, robot => robot.lead).map(run => (
              <PersonCell
                key={`lead-${run.start}`}
                names={run.names}
                accent={leadRow.accent}
                style={{ gridColumn: `${run.start + 3} / span ${run.span}`, gridRow: totalRows }}
              />
          ))}
        </div>
      </section>

      <PosterFooter />
    </>
  );
}
