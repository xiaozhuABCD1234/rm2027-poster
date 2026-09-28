/**
 * 车组人员名单（源：rm2027人员分配.xlsx ->「车组人员名单」表）
 *
 * 原表是「机器人构型 × 年级 × 方向」矩阵：12 列机器人，2 个年级块，每块 4 个方向（机械/硬件/电控/算法），
 * 末尾一行是各车负责人。原表的合并单元格用 span 表达（例如 2025 级算法的步兵人员横跨 5 个步兵构型）。
 */

export type Discipline = "机械" | "硬件" | "电控" | "算法" | "负责人";
export type GradeBlock = "2024级" | "2025级";

/** 12 台机器人 / 技术方向的列定义（顺序即原表 C..N 列） */
export const ROBOT_COLUMNS = [
  "麦轮构型步兵（交兵）",
  "全向构型步兵",
  "并腿构型步兵",
  "串腿构型步兵",
  "（新）舵轮步兵",
  "舵轮构型哨兵",
  "全向构型哨兵",
  "重装",
  "超级电容",
  "无人机",
  "飞镖",
  "裁判系统",
] as const;

/** 顶部一级分组：步兵占前 5 列、哨兵占其后 2 列，其余为单列 */
export const ROBOT_GROUPS = [
  { name: "步兵", span: 5 },
  { name: "哨兵", span: 2 },
] as const;

/** 一个格子；col 为 0 基列号，span 对应原表合并单元格 */
export interface CarCell {
  col: number;
  span?: number;
  names: string[];
}

export interface CarRow {
  disc: Discipline;
  cells: CarCell[];
}

export const DISCIPLINE_STYLE: Record<
  Discipline,
  { accent: string; label: string }
> = {
  机械: { accent: "#7C8CAE", label: "机械" },
  硬件: { accent: "#6E9479", label: "硬件" },
  电控: { accent: "#5FA0B8", label: "电控" },
  算法: { accent: "#A07078", label: "算法" },
  负责人: { accent: "#8B7CAE", label: "负责人" },
};

export const CAR_BLOCKS: { grade: GradeBlock; rows: CarRow[] }[] = [
  {
    grade: "2024级",
    rows: [
      {
        disc: "机械",
        cells: [
          { col: 1, names: ["章效闻"] },
          { col: 2, names: ["章效闻"] },
          { col: 3, names: ["潘沉毅"] },
          { col: 4, names: ["潘沉毅"] },
          { col: 5, names: ["章效闻"] },
          { col: 6, names: ["鲍澐鲲"] },
          { col: 7, names: ["章效闻", "蒋烨阳"] },
          { col: 10, names: ["鲍澐鲲", "郝恩泽", "封思宇"] },
        ],
      },
      {
        disc: "硬件",
        cells: [
          { col: 0, names: ["陈振忠"] },
          { col: 1, names: ["朱家乐"] },
          { col: 2, names: ["朱家乐"] },
          { col: 3, names: ["朱家乐"] },
          { col: 6, names: ["陈振忠"] },
          { col: 7, names: ["徐志成"] },
          { col: 8, names: ["周毅"] },
          { col: 9, names: ["周毅"] },
          { col: 10, names: ["朱家乐"] },
          { col: 11, names: ["田茂瑜"] },
        ],
      },
      {
        disc: "电控",
        cells: [
          { col: 0, names: ["陈振忠"] },
          { col: 1, names: ["程一夫"] },
          { col: 2, names: ["程一夫"] },
          { col: 3, names: ["程一夫"] },
          { col: 5, names: ["杨泽"] },
          { col: 6, names: ["杨泽"] },
          { col: 7, names: ["徐志成"] },
          { col: 9, names: ["潘沉毅", "陈振忠"] },
          { col: 10, names: ["潘亦心"] }, // 原表此格写作「潘艺心」，与技术组表「潘亦心」不一致，统一按技术组表
        ],
      },
      {
        disc: "算法",
        cells: [
          { col: 5, names: ["朱建诚"] },
          { col: 6, names: ["朱建诚"] },
          { col: 9, names: ["朱建诚"] },
          { col: 10, names: ["杜马辰"] },
        ],
      },
    ],
  },
  {
    grade: "2025级",
    rows: [
      {
        disc: "机械",
        cells: [
          { col: 1, names: ["栾宇杰", "张欣妤"] },
          { col: 3, names: ["杨政达", "张欣妤"] },
          { col: 4, names: ["栾宇杰", "杨政达", "张欣妤"] },
          { col: 6, names: ["黄梓谦", "吴思汉"] },
          { col: 7, names: ["孙昊瑜", "冯心越", "吴正恺", "徐晨希"] },
          { col: 9, names: ["吴思汉"] },
        ],
      },
      {
        disc: "硬件",
        cells: [
          { col: 0, names: ["刘奇"] },
          { col: 1, names: ["黄逸博", "马新蕊"] },
          { col: 6, names: ["刘语馨", "杨诗堃", "李思涵", "潘俊成"] },
          { col: 7, names: ["罗语馨", "仝语馨", "李司闻"] },
          { col: 8, names: ["汪鑫", "李司闻", "马新蕊", "黄逸博"] },
          { col: 11, names: ["刘语馨", "李佳芮"] },
        ],
      },
      {
        disc: "电控",
        cells: [
          { col: 0, names: ["白炳麒", "陶锐"] },
          { col: 1, names: ["王天懿", "汪鑫"] },
          { col: 6, names: ["钟靖凯"] },
          { col: 7, names: ["刘张淑雅", "李永昕", "尚小艺"] },
        ],
      },
      {
        disc: "算法",
        cells: [
          { col: 0, span: 5, names: ["李佳芮", "陈昊", "汤丰恺", "简明轩"] },
          { col: 5, names: ["卢俊霖", "程奕菲"] },
          { col: 6, names: ["卢俊霖", "管喆俊", "刘鑫琳"] },
          { col: 7, names: ["王庆洋", "马丽娅"] },
          { col: 9, names: ["朱亦辰", "范诗涵"] },
        ],
      },
    ],
  },
];

/** 各车负责人（原表末行，程一夫一格横跨 5 个步兵构型） */
export const CAR_LEADS: CarRow = {
  disc: "负责人",
  cells: [
    { col: 0, span: 5, names: ["程一夫"] },
    { col: 5, names: ["杨泽"] },
    { col: 6, names: ["杨泽"] },
    { col: 7, names: ["徐志成"] },
  ],
};

const allCells = [
  ...CAR_BLOCKS.flatMap((b) => b.rows.flatMap((r) => r.cells)),
  ...CAR_LEADS.cells,
];
const allNames = allCells.flatMap((c) => c.names);
const uniqueNames = [...new Set(allNames)];

export const CAR_STATS = {
  /** 去重后参与车组的人数（含负责人） */
  unique: uniqueNames.length,
  /** 全部人次（同一人负责多台车会重复计） */
  slots: allNames.length,
  byGrade: {
    "2024级": [
      ...new Set(
        CAR_BLOCKS[0].rows.flatMap((r) => r.cells.flatMap((c) => c.names)),
      ),
    ].length,
    "2025级": [
      ...new Set(
        CAR_BLOCKS[1].rows.flatMap((r) => r.cells.flatMap((c) => c.names)),
      ),
    ].length,
  },
  /** 只算车组成员（不含负责人行），用于页脚口径说明 */
  get members() {
    return uniqueNames.length;
  },
  /** 负责多台车的人 */
  multiRobot: Object.entries(
    allNames.reduce<Record<string, number>>((acc, n) => {
      acc[n] = (acc[n] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1]),
};
