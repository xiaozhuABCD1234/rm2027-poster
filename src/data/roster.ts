/**
 * 海报数据层。
 *
 * 数据放在 `public/data/tech.json` 与 `public/data/cars.json`，页面运行时 fetch 读取 ——
 * 改名单只改这两个 JSON，刷新页面即可，不需要重新构建（不用碰任何 TS）。
 *
 * 这里只做三件事：类型定义、JSON 校验（出错时报清楚是哪个文件哪个字段）、
 * 由数据实时派生统计口径（页眉人数、人次、跨组兼任等，全部算出来，JSON 里不写死数字）。
 */
import { unique } from "../lib/util";

/* ---------- 类型 ---------- */

export interface TechSub {
  name: string;
  g3: string[];
  g2: string[];
}

export interface TechGroup {
  name: string;
  /** 卡头底色 */
  accent: string;
  /** 卡片描边色 */
  border: string;
  /** 卡片宽度(px) */
  width: number;
  subs: TechSub[];
}

export interface TechData {
  groups: TechGroup[];
}

export interface TechStats {
  /** 去重后的大三 / 大二人数 */
  g3: number;
  g2: number;
  total: number;
  /** 出现两次以上的人（跨组兼任） */
  shared: string[];
}

/** 一个工作（方向）：海报上的一行 */
export interface Discipline {
  name: string;
  accent: string;
}

/** 一台车：海报上的一列 */
export interface Robot {
  name: string;
  /** 顶部一级分组（相邻同名会合并成一条跨列标题）；不写则没有分组标题 */
  group?: string;
  /** 该车负责人（可多人） */
  lead: string[];
  /** 按年级分块的人员名单：{ "2024级": { "机械": ["张三"] } } */
  crew: Record<string, Record<string, string[]>>;
}

export interface CarsData {
  /** 年级块的上下顺序 */
  grades: string[];
  /** 工作的行顺序与配色 */
  disciplines: Discipline[];
  /** 负责人行的标题与配色 */
  leadRow: { label: string; accent: string };
  robots: Robot[];
}

export interface CarStats {
  /** 去重后参与车组的人数（含负责人） */
  unique: number;
  /** 全部人次 = 所有格子里的人数之和（同一人管多台车会重复计） */
  slots: number;
  /** 各年级人数（去重，不含负责人） */
  byGrade: Record<string, number>;
  /** 出现次数 > 1 的人 [姓名, 次数]，按次数降序（跨车重复计） */
  multiRobot: [string, number][];
}

/* ---------- JSON 校验小工具 ---------- */

const bad = (file: string, path: string, msg: string): never => {
  throw new Error(`${file} · ${path} ${msg}`);
};

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const obj = (v: unknown, file: string, path: string) =>
  isObj(v) ? v : bad(file, path, "必须是对象");

const arr = (v: unknown, file: string, path: string) =>
  Array.isArray(v) ? v : bad(file, path, "必须是数组");

const str = (v: unknown, file: string, path: string) =>
  typeof v === "string" && v.trim() ? v : bad(file, path, "必须是非空字符串");

const num = (v: unknown, file: string, path: string) =>
  typeof v === "number" && Number.isFinite(v)
    ? v
    : bad(file, path, "必须是数字");

const names = (v: unknown, file: string, path: string): string[] =>
  arr(v, file, path).map((n, i) => str(n, file, `${path}[${i}]`));

/* ---------- 技术组 ---------- */

export function parseTech(raw: unknown, file = "tech.json"): TechData {
  const root = obj(raw, file, "");
  const groups = arr(root.groups, file, "groups").map((g, gi) => {
    const at = `groups[${gi}]`;
    const group = obj(g, file, at);
    return {
      name: str(group.name, file, `${at}.name`),
      accent: str(group.accent, file, `${at}.accent`),
      border: str(group.border, file, `${at}.border`),
      width: num(group.width, file, `${at}.width`),
      subs: arr(group.subs, file, `${at}.subs`).map((s, si) => {
        const sat = `${at}.subs[${si}]`;
        const sub = obj(s, file, sat);
        return {
          name: str(sub.name, file, `${sat}.name`),
          g3: names(sub.g3, file, `${sat}.g3`),
          g2: names(sub.g2, file, `${sat}.g2`),
        };
      }),
    };
  });
  return { groups };
}

/** 各卡「编制 大三 + 大二」= 名额数（含跨组兼任重复计） */
export const countGroup = (g: TechGroup) => ({
  g3: g.subs.reduce((a, s) => a + s.g3.length, 0),
  g2: g.subs.reduce((a, s) => a + s.g2.length, 0),
});

/** 表头总数 = 去重后人数；shared = 出现两次以上的人 */
export function computeTechStats(groups: TechGroup[]): TechStats {
  const flat3 = groups.flatMap((g) => g.subs.flatMap((s) => s.g3));
  const flat2 = groups.flatMap((g) => g.subs.flatMap((s) => s.g2));
  const g3 = unique(flat3).length;
  const g2 = unique(flat2).length;
  const all = [...flat3, ...flat2];
  return {
    g3,
    g2,
    total: g3 + g2,
    shared: unique(all.filter((n) => all.indexOf(n) !== all.lastIndexOf(n))).sort(),
  };
}

/* ---------- 车组 ---------- */

export function parseCars(raw: unknown, file = "cars.json"): CarsData {
  const root = obj(raw, file, "");

  const grades = names(root.grades, file, "grades");
  if (!grades.length) bad(file, "grades", "至少要有一个年级");

  const disciplines = arr(root.disciplines, file, "disciplines").map((d, di) => {
    const at = `disciplines[${di}]`;
    const item = obj(d, file, at);
    return {
      name: str(item.name, file, `${at}.name`),
      accent: str(item.accent, file, `${at}.accent`),
    };
  });
  if (!disciplines.length) bad(file, "disciplines", "至少要有一个工作");
  const discNames = disciplines.map((d) => d.name);

  const leadRaw = obj(root.leadRow, file, "leadRow");
  const leadRow = {
    label: str(leadRaw.label, file, "leadRow.label"),
    accent: str(leadRaw.accent, file, "leadRow.accent"),
  };

  const robots: Robot[] = arr(root.robots, file, "robots").map((r, ri) => {
    const at = `robots[${ri}]`;
    const item = obj(r, file, at);
    const crewRaw = obj(item.crew, file, `${at}.crew`);

    // 年级 / 工作的键都必须在 grades / disciplines 里，避免打错字后静默少人
    const crew: Robot["crew"] = {};
    for (const g of grades) {
      const byDiscRaw = crewRaw[g];
      if (byDiscRaw === undefined) continue;
      const byDisc = obj(byDiscRaw, file, `${at}.crew.${g}`);
      const ordered: Record<string, string[]> = {};
      for (const d of discNames) {
        if (byDisc[d] === undefined) continue;
        ordered[d] = names(byDisc[d], file, `${at}.crew.${g}.${d}`);
      }
      for (const key of Object.keys(byDisc)) {
        if (!discNames.includes(key)) {
          bad(
            file,
            `${at}.crew.${g}.${key}`,
            `工作不在 disciplines 里（可用：${discNames.join(" / ")}）`,
          );
        }
      }
      crew[g] = ordered;
    }
    for (const key of Object.keys(crewRaw)) {
      if (!grades.includes(key)) {
        bad(
          file,
          `${at}.crew.${key}`,
          `年级不在 grades 里（可用：${grades.join(" / ")}）`,
        );
      }
    }

    const lead =
      item.lead === undefined
        ? []
        : typeof item.lead === "string"
          ? [str(item.lead, file, `${at}.lead`)]
          : names(item.lead, file, `${at}.lead`);

    const group =
      item.group === undefined ? undefined : str(item.group, file, `${at}.group`);

    return {
      name: str(item.name, file, `${at}.name`),
      ...(group ? { group } : {}),
      lead,
      crew,
    };
  });

  if (!robots.length) bad(file, "robots", "至少要有一台车");
  const seen = new Set<string>();
  for (const r of robots) {
    if (seen.has(r.name)) bad(file, "robots", `车名重复：${r.name}`);
    seen.add(r.name);
  }

  return { grades, disciplines, leadRow, robots };
}

/** 所有格子里的人（按车逐格展开，同一人管多台车会重复出现） */
const carCrewNames = (data: CarsData) =>
  data.robots.flatMap((r) =>
    Object.values(r.crew).flatMap((byDisc) => Object.values(byDisc).flat()),
  );

export function computeCarStats(data: CarsData): CarStats {
  const slots = [...carCrewNames(data), ...data.robots.flatMap((r) => r.lead)];
  const byGrade: Record<string, number> = {};
  for (const g of data.grades) {
    byGrade[g] = unique(
      data.robots.flatMap((r) => Object.values(r.crew[g] ?? {}).flat()),
    ).length;
  }
  return {
    unique: unique(slots).length,
    slots: slots.length,
    byGrade,
    multiRobot: Object.entries(
      slots.reduce<Record<string, number>>((acc, n) => {
        acc[n] = (acc[n] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .filter(([, n]) => n > 1)
      .sort((a, b) => b[1] - a[1]),
  };
}
