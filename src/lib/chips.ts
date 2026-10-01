/**
 * 胶囊折行的纯计算（没有 React，也不碰 DOM）。
 *
 * 为什么用估算而不是测量：测量要在 effect 里读布局，dev（StrictMode 会跑两遍）
 * 与构建产物容易出现两套结果，而且还要 ResizeObserver；名单只有中文字，
 * 按字号估算足够了（估算偏窄最多让某一行多折一次，不会越出卡片）。
 */

/** 胶囊宽度估算：CJK 字宽 = body 21px + tracking 1px，左右内边距 24，描边 2 */
export const chipWidth = (name: string) => name.length * 22 + 26;

/**
 * 把名字排成尽量均匀的若干行：先贪心折行，再按「平均每行个数」重排一次，
 * 避免末行只剩一枚孤儿（如 4 枚窄卡里 3+1 → 2+2，11 枚宽卡里 5+5+1 → 4+4+3）。
 */
export function packChips(names: string[], boxWidth: number, gap = 8): string[][] {
  const pack = (cap: number) => {
    const lines: string[][] = [];
    let cur: string[] = [];
    let used = 0;
    for (const n of names) {
      const w = chipWidth(n);
      const add = cur.length ? gap + w : w;
      if (cur.length && (used + add > boxWidth || cur.length >= cap)) {
        lines.push(cur);
        cur = [n];
        used = w;
      } else {
        cur.push(n);
        used += add;
      }
    }
    if (cur.length) lines.push(cur);
    return lines;
  };

  const greedy = pack(Number.POSITIVE_INFINITY);
  if (greedy.length < 2) return greedy;
  const even = pack(Math.ceil(names.length / greedy.length));
  return even.length <= greedy.length ? even : greedy;
}
