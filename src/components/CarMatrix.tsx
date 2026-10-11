import { Fragment } from "react";
import type { CarStats, CarsData } from "../data/roster";
import { CONTENT_W } from "../lib/util";
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

  // 顶部一级分组：相邻且 group 同名的车合成一条跨列标题（JSON 里不用写 span）；
  // 没有 group 的车合成一条「无分组」的暗条，让顶栏成为连续的一条，不留洞。
  const groupRuns = robots.reduce<
    { group?: string; start: number; span: number }[]
  >((acc, robot, i) => {
    const last = acc[acc.length - 1];
    if (last && last.group === robot.group && last.start + last.span === i) {
      return [...acc.slice(0, -1), { ...last, span: last.span + 1 }];
    }
    return [...acc, { group: robot.group, start: i, span: 1 }];
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
            {`${robots.length} 台机器人 · ${grades
              .map(gradeText)
              .join(" / ")} · ${disciplines.map((d) => d.name).join(" / ")}`}
          </>
        }
        slogan="飒沓流星"
        stats={{
          // 暂按两页统一的展示人数显示，车组名单统计仍保留在 stats 中。
          value: "52",
          unit: "人",
          note: `人次 ${stats.slots} · ${robots.length} 台机器人`,
        }}
      />
      <Countdown />

      <section
        className="relative z-[1] mt-[var(--gap-band)] flex flex-col gap-[var(--gap-cell)]"
        style={{ width: CONTENT_W }}
      >
        {/* 一级分组：步兵 / 哨兵（由各车的 group 自动合并成一格） */}
        <div
          className="grid gap-x-[var(--gap-cell)]"
          style={{ gridTemplateColumns: COLS, height: GROUP_BAR_H }}
        >
          {groupRuns.map((g) => (
            <Block
              key={`${g.group ?? "nogroup"}-${g.start}`}
              style={{
                gridColumn: `${g.start + 3} / span ${g.span}`,
                background: g.group
                  ? "var(--color-surface-4)"
                  : "var(--color-surface-2)",
              }}
              className="text-group font-bold tracking-[6px] text-ink"
            >
              {g.group}
            </Block>
          ))}
        </div>

        {/* 二级表头：各车名 */}
        <div
          className="grid gap-x-[var(--gap-cell)]"
          style={{ gridTemplateColumns: COLS, height: COL_HEAD_H }}
        >
          {robots.map((robot, i) => (
            <Block
              key={robot.name}
              col={i}
              style={{
                gridColumn: i + 3,
                background: "var(--color-surface-3)",
              }}
              className="px-[4px] text-center text-colhead font-medium leading-[1.25] tracking-[0.5px] text-dim"
            >
              {robot.name}
            </Block>
          ))}
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
                      {robots.map((robot, ci) => {
                        const list = robot.crew[grade]?.[disc.name];
                        if (!list?.length) return null;
                        return (
                          <PersonCell
                            key={`${grade}-${disc.name}-${robot.name}`}
                            names={list}
                            accent={disc.accent}
                            style={{ gridColumn: ci + 3, gridRow: rowIndex }}
                          />
                        );
                      })}
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}

          {/* 负责人行：末行，每台车各写自己的负责人 */}
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
          {robots.map((robot, ci) => {
            if (!robot.lead.length) return null;
            return (
              <PersonCell
                key={`lead-${robot.name}`}
                names={robot.lead}
                accent={leadRow.accent}
                style={{ gridColumn: ci + 3, gridRow: totalRows }}
              />
            );
          })}
        </div>
      </section>

      <PosterFooter />
    </>
  );
}
