export const STAGE_W = 1920;
export const STAGE_H = 1080;

/** 页面（海报）清单，顺序即自动播放顺序 */
export const PAGES = ["tech", "cars"] as const;
export type Page = (typeof PAGES)[number];

export const isPage = (v: string | null): v is Page =>
  v !== null && (PAGES as readonly string[]).includes(v);

/** public/assets 下的素材用相对 base 取，dev / preview / 子路径托管都能用 */
export const asset = (file: string) =>
  `${import.meta.env.BASE_URL}assets/${file}`;

/** public/data 下的名单 JSON（可配置数据，运行时读取，改完刷新即可） */
export const dataPath = (file: string) =>
  `${import.meta.env.BASE_URL}data/${file}`;

/** 海报内容区宽度（px）：技术组四张卡的宽度之和 + 3 个间隔应等于它 */
export const CONTENT_W = 1828;

/** 同一个名字在多个组里出现 -> 去重后的名单（保持出现顺序） */
export const unique = <T>(list: T[]) => [...new Set(list)];
