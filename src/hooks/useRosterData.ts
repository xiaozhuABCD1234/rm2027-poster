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
        // 卡片宽度改动后容易忘了同步：四张卡宽度 + 3 个 18px 间隔 = 内容区 1828px
        const sumWidth =
          tech.groups.reduce((a, g) => a + g.width, 0) +
          18 * Math.max(0, tech.groups.length - 1);
        if (tech.groups.length && sumWidth !== CONTENT_W) {
          console.warn(
            `tech.json: 卡片宽度合计 ${sumWidth}px 与内容区 ${CONTENT_W}px 不符，海报会溢出或留白`,
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
