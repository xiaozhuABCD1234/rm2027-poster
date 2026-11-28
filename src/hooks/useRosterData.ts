import { useEffect, useState } from "react";
import {
  computeCarStats,
  computeTechStats,
  parseCars,
  parseTech,
  type CarStats,
  type CarsData,
  type TechData,
  type TechStats,
} from "../data/roster";
import { CONTENT_W, dataPath } from "../lib/util";

export interface Roster {
  tech: TechData;
  cars: CarsData;
  techStats: TechStats;
  carStats: CarStats;
}

export type RosterState =
  | { status: "loading" }
  | { status: "ready"; roster: Roster }
  | { status: "error"; error: string };

/** fetch 一个数据文件；失败信息带上文件名与 HTTP 状态，方便直接定位 */
async function loadJson(file: string): Promise<unknown> {
  const url = dataPath(file);
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-cache" });
  } catch (e) {
    throw new Error(
      `${file} 读取失败（${url}）：${e instanceof Error ? e.message : String(e)}`,
    );
  }
  if (!res.ok) {
    throw new Error(`${file} 读取失败（${url} HTTP ${res.status}）`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    throw new Error(`${file} 不是合法 JSON：${e instanceof Error ? e.message : String(e)}`);
  }
}

/**
 * 读取 public/data/ 下的名单 JSON（两页数据一起加载，加载完再挂载海报，
 * 这样卡片的折行平衡只算一次，也不会出现空名单的画⾯）。
 */
export function useRosterData(): RosterState {
  const [state, setState] = useState<RosterState>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [techRaw, carsRaw] = await Promise.all([
          loadJson("tech.json"),
          loadJson("cars.json"),
        ]);
        const tech = parseTech(techRaw, "tech.json");
        const cars = parseCars(carsRaw, "cars.json");
        // 三列信息板：机械与综合共用第一列，其余两组各占一列。
        const sumWidth =
          tech.groups.slice(0, 3).reduce((a, g) => a + g.width, 0) + 36;
        if (tech.groups.length !== 4 || sumWidth !== CONTENT_W || tech.groups[0]?.width !== tech.groups[3]?.width) {
          console.warn(
            `tech.json: 需四组，前三组宽度合计加间隔应为 ${CONTENT_W}px（当前 ${sumWidth}px），机械与综合须同宽`,
          );
        }
        if (!alive) return;
        setState({
          status: "ready",
          roster: {
            tech,
            cars,
            techStats: computeTechStats(tech.groups),
            carStats: computeCarStats(cars),
          },
        });
      } catch (e) {
        if (!alive) return;
        setState({
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
