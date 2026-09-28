/**
 * 技术组人员名单（源：rm2027人员分配.xlsx ->「技术组人员名单」表）
 *
 * accent / border 沿用流程图取色：机械组蓝灰、嵌入式组灰绿、算法组赭红、综合组紫。
 * width 是四张卡的固定宽度（总和 + 间隔 = 1828px，与海报内容区等宽）。
 */
export interface TechSub {
  name: string;
  g3: string[];
  g2: string[];
}

export interface TechGroup {
  name: string;
  accent: string;
  border: string;
  width: number;
  subs: TechSub[];
}

export const TECH_GROUPS: TechGroup[] = [
  {
    name: "机械组",
    accent: "#46546F",
    border: "#7C8CAE",
    width: 320,
    subs: [
      {
        name: "机械组",
        g3: ["章效闻", "鲍澐鲲", "潘沉毅", "蒋烨阳"],
        g2: [
          "栾宇杰",
          "杨政达",
          "张欣妤",
          "黄梓谦",
          "孙昊瑜",
          "吴正恺",
          "冯心越",
          "吴思汉",
        ],
      },
    ],
  },
  {
    name: "嵌入式组",
    accent: "#3E5A4B",
    border: "#6E9479",
    width: 672,
    subs: [
      {
        name: "电控组",
        g3: ["程一夫", "杨泽", "徐志成", "潘亦心", "陈振忠"],
        g2: [
          "白炳麒",
          "陶锐",
          "汪鑫",
          "王天懿",
          "钟靖凯",
          "刘张淑雅",
          "李永昕",
          "尚小艺",
        ],
      },
      {
        name: "电路组",
        g3: ["朱家乐", "周毅"],
        g2: [
          "李司闻",
          "马新蕊",
          "黄逸博",
          "刘奇",
          "罗语馨",
          "仝语馨",
          "刘语馨",
          "杨诗堃",
          "李思涵",
          "潘俊成",
          "杨政达",
        ],
      },
    ],
  },
  {
    name: "算法组",
    accent: "#5F4046",
    border: "#A07078",
    width: 480,
    subs: [
      {
        name: "自瞄组",
        g3: ["朱建诚"],
        g2: [
          "李佳芮",
          "陈昊",
          "卢俊霖",
          "符忆东",
          "汤丰恺",
          "简明轩",
          "王庆洋",
        ],
      },
      {
        name: "导航组",
        g3: ["朱建诚"],
        g2: ["程奕菲", "刘鑫琳", "朱亦辰", "范诗涵", "马丽娅"],
      },
    ],
  },
  {
    name: "综合组",
    accent: "#4E4363",
    border: "#8B7CAE",
    width: 302,
    subs: [
      {
        name: "运营",
        g3: ["程一夫", "徐志成", "邓晴", "田茂瑜"],
        g2: ["潘俊成", "杨诗堃"],
      },
      { name: "管理", g3: ["程一夫", "蒋烨阳"], g2: [] },
    ],
  },
];

const flat3 = TECH_GROUPS.flatMap((g) => g.subs.flatMap((s) => s.g3));
const flat2 = TECH_GROUPS.flatMap((g) => g.subs.flatMap((s) => s.g2));

/** 各卡「编制 大三 + 大二」= 名额数（含跨组兼任重复计），表头总数 = 去重后人数 */
export const countGroup = (g: TechGroup) => ({
  g3: g.subs.reduce((a, s) => a + s.g3.length, 0),
  g2: g.subs.reduce((a, s) => a + s.g2.length, 0),
});

export const TECH_STATS = {
  g3: [...new Set(flat3)].length,
  g2: [...new Set(flat2)].length,
  get total() {
    return this.g3 + this.g2;
  },
  /** 出现两次以上的人（跨组兼任） */
  shared: [
    ...new Set(
      [...flat3, ...flat2].filter(
        (n, _idx, all) => all.indexOf(n) !== all.lastIndexOf(n),
      ),
    ),
  ].sort(),
};
