import { Fragment } from "react";
import {
  CAR_BLOCKS,
  CAR_LEADS,
  CAR_STATS,
  DISCIPLINE_STYLE,
  ROBOT_COLUMNS,
  ROBOT_GROUPS,
} from "../data/cars";
import { PosterFooter } from "./PosterFooter";
import { PosterHeader } from "./PosterHeader";

/** 列模板：年级(58) + 方向(76) + 12 台机器人，两页内容区同宽 1828px */
const COLS = "58px 76px repeat(12, minmax(0, 1fr))";
const ROW_H = 60;
const ROWS = 9; // 2024级 4 行 + 2025级 4 行 + 负责人 1 行

const SEP = <span className="opacity-40">、</span>;

function Names({ names }: { names: string[] }) {
  return (
    <>
      {names.map((n, i) => (
        <Fragment key={n}>
          {i > 0 && SEP}
          <span>{n}</span>
        </Fragment>
      ))}
    </>
  );
}

/** 一个格子：按列号显式定位，span 对应原表合并单元格 */
function Cell({
  col,
  span = 1,
  row,
  accent,
  names,
}: {
  col: number;
  span?: number;
  row: number;
  accent: string;
  names: string[];
}) {
  return (
    <div
      className="flex flex-wrap content-center items-center justify-center gap-x-[2px] gap-y-[1px] rounded-[6px] px-[6px] py-[3px] text-[15px] leading-[1.25] tracking-[0.5px] text-[#E6EBF8]"
      style={{
        gridColumn: `${col + 3} / span ${span}`,
        gridRow: row,
        background: `${accent}1A`,
        borderLeft: `3px solid ${accent}`,
        boxShadow: "inset 0 0 0 1px rgba(200,208,228,.07)",
      }}
    >
      <Names names={names} />
    </div>
  );
}

export function CarMatrix() {
  return (
    <div className="contents">
      <PosterHeader
        compact
        title="车组人员名单"
        badge="RM2027"
        subtitle={
          <>
            ROBOMASTER 2027 赛季
            <span className="mx-[9px] text-faint">|</span>
            12 台机器人 · 2024 级 / 2025 级 · 机械 / 硬件 / 电控 / 算法
          </>
        }
        slogan="飒沓流星"
        stats={{
          value: String(CAR_STATS.unique),
          unit: "人",
          note: `人次 ${CAR_STATS.slots} · 12 台机器人`,
        }}
      />

      <section className="relative z-[1] mt-[22px] flex flex-col gap-[2px]">
        {/* 一级分组：步兵 / 哨兵（原表 C1:G1、H1:I1 合并单元格） */}
        <div
          className="grid gap-x-[2px]"
          style={{ gridTemplateColumns: COLS, height: 38 }}
        >
          {ROBOT_GROUPS.map((g, gi) => (
            <div
              key={g.name}
              className="flex items-center justify-center rounded-[6px] bg-[#2E3649] text-[17px] font-bold tracking-[6px] text-[#D3DBEE]"
              style={{
                gridColumn: `${(gi === 0 ? 0 : 5) + 3} / span ${g.span}`,
              }}
            >
              {g.name}
            </div>
          ))}
        </div>

        {/* 二级表头：12 台机器人 / 技术方向 */}
        <div
          className="grid gap-x-[2px]"
          style={{ gridTemplateColumns: COLS, height: 52 }}
        >
          {ROBOT_COLUMNS.map((label, i) => (
            <div
              key={label}
              className="flex items-center justify-center rounded-[6px] bg-[#232A3C] px-[4px] text-center text-[13px] font-medium leading-[1.25] tracking-[0.5px] text-[#B9C4DC]"
              style={{ gridColumn: i + 3 }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* 正文矩阵 */}
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: COLS,
            gridTemplateRows: `repeat(${ROWS}, ${ROW_H}px)`,
          }}
        >
          {/* 每行底衬：空白格子多，铺一条淡底让视线能横向跟住一行 */}
          {Array.from({ length: ROWS }, (_, i) => (
            <div
              key={`row-bg-${i}`}
              className="rounded-[6px]"
              style={{
                gridColumn: "3 / span 12",
                gridRow: i + 1,
                background: i < 4 ? "#1B2030" : i < 8 ? "#181D2B" : "#201D2E",
              }}
            />
          ))}

          {CAR_BLOCKS.map((block, bi) => (
            <Fragment key={block.grade}>
              <div
                className="flex items-center justify-center rounded-[6px] bg-[#20263A] text-[18px] font-bold tracking-[6px] text-[#C9D4EA] [writing-mode:vertical-rl]"
                style={{ gridColumn: 1, gridRow: `${bi * 4 + 1} / span 4` }}
              >
                {block.grade}
              </div>
              {block.rows.map((row, ri) => {
                const rowIndex = bi * 4 + ri + 1;
                const accent = DISCIPLINE_STYLE[row.disc].accent;
                return (
                  <Fragment key={row.disc}>
                    <div
                      className="flex items-center justify-center rounded-[6px] bg-[#20263A] text-[19px] font-bold tracking-[4px]"
                      style={{
                        gridColumn: 2,
                        gridRow: rowIndex,
                        color: accent,
                      }}
                    >
                      {row.disc}
                    </div>
                    {row.cells.map((c) => (
                      <Cell
                        key={`${c.col}-${c.span ?? 1}`}
                        col={c.col}
                        span={c.span}
                        row={rowIndex}
                        accent={accent}
                        names={c.names}
                      />
                    ))}
                  </Fragment>
                );
              })}
            </Fragment>
          ))}

          {/* 负责人行：末行，程一夫一格横跨 5 个步兵构型 */}
          <div
            className="flex items-center justify-center rounded-[6px] bg-[#221F33] text-[19px] font-bold tracking-[4px] text-[#C4B6DE]"
            style={{ gridColumn: "1 / span 2", gridRow: ROWS }}
          >
            负责人
          </div>
          {CAR_LEADS.cells.map((c) => (
            <Cell
              key={`lead-${c.col}`}
              col={c.col}
              span={c.span}
              row={ROWS}
              accent={DISCIPLINE_STYLE.负责人.accent}
              names={c.names}
            />
          ))}
        </div>
      </section>

      <PosterFooter />
    </div>
  );
}
