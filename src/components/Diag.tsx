import { useLayoutEffect, useState } from "react";
import { STAGE_H, STAGE_W } from "../lib/util";

const wheelTest =
  new URLSearchParams(window.location.search).get("wheel") === "1";

/**
 * 量测叠加层（只在 ?diag=1 时渲染，放在舞台之外，不污染海报）：
 * 溢出元素、图片加载、滚动高度、每张卡的上下留白，都写进 <pre id="diag">，供 --dump-dom 读取。
 */
export function Diag() {
  const [text, setText] = useState("等待布局稳定…");

  useLayoutEffect(() => {
    const timer = window.setTimeout(() => {
      const stage = document.getElementById("stage");
      if (!stage) return;
      const sb = stage.getBoundingClientRect();
      const lines: string[] = [];

      const overflow: string[] = [];
      for (const el of stage.querySelectorAll<HTMLElement>("*")) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (
          r.left < sb.left - 0.5 ||
          r.top < sb.top - 0.5 ||
          r.right > sb.right + 0.5 ||
          r.bottom > sb.bottom + 0.5
        ) {
          const cls = String(el.className ?? "")
            .split(" ")
            .slice(0, 2)
            .join(".");
          overflow.push(
            `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} [${Math.round(r.left - sb.left)},${Math.round(r.top - sb.top)} ${Math.round(r.width)}x${Math.round(r.height)}]`,
          );
        }
      }

      const imgs = [...stage.querySelectorAll("img")].map(
        (i) =>
          `${i.getAttribute("src")?.split("/").pop()}=${i.complete && i.naturalWidth > 0 ? "ok" : "FAIL"}`,
      );

      lines.push(
        `当前页 ${document.getElementById("stage")?.dataset.layer ?? "?"}`,
        `stage ${Math.round(sb.width)}x${Math.round(sb.height)} 内尺寸 ${STAGE_W}x${STAGE_H} 缩放 ${(sb.width / STAGE_W).toFixed(3)}`,
      );
      lines.push(
        `stage client ${stage.clientWidth}x${stage.clientHeight} padding ${getComputedStyle(stage).paddingLeft}/${getComputedStyle(stage).paddingTop}/${getComputedStyle(stage).paddingBottom}`,
      );
      const main = stage.querySelector<HTMLElement>("main, section");
      if (main) {
        lines.push(
          `内容区 ${Math.round(main.getBoundingClientRect().width)}px gap=${getComputedStyle(main).columnGap} 左 ${Math.round(main.getBoundingClientRect().left - sb.left)}`,
        );
      }
      const cards = [...stage.querySelectorAll<HTMLElement>("[data-card]")];
      if (cards.length) {
        lines.push(
          `卡宽 ${cards.map((c) => Math.round(c.getBoundingClientRect().width)).join(" / ")}  卡左 ${cards.map((c) => Math.round(c.getBoundingClientRect().left - sb.left)).join(" / ")}`,
        );
      }
      lines.push(`图片: ${imgs.join(" ")}`);
      lines.push(
        `溢出: ${overflow.length ? overflow.join(" | ") : "OK 无溢出无越界"}`,
      );
      lines.push(
        `scrollHeight ${stage.scrollHeight} / clientHeight ${stage.clientHeight}`,
      );
      const footer = stage.querySelector("footer");
      lines.push(
        `footer 底 ${footer ? Math.round(footer.getBoundingClientRect().bottom - sb.top) : "-"} / 舞台高 ${STAGE_H}`,
      );

      // 视觉脊柱：两页的页眉 / 内容区 / 页脚必须落在同样的 y 上
      const header = stage.querySelector("header");
      const section = stage.querySelector("main, section");
      const band = (el: Element | null) =>
        el
          ? `${Math.round(el.getBoundingClientRect().top - sb.top)}..${Math.round(el.getBoundingClientRect().bottom - sb.top)}`
          : "-";
      lines.push(`脊柱 页眉 ${band(header)} 内容 ${band(section)} 页脚 ${band(footer)}`);

      // 技术组：固定行带装得下胶囊吗（改名单稿把行带撑破时会在这里报出来）
      const bandOverflow = [...stage.querySelectorAll<HTMLElement>("[data-gradeline]")].map(
        (el) => {
          const chips = el.querySelector<HTMLElement>("[data-chips]");
          if (!chips) return null;
          const over = Math.round(
            chips.getBoundingClientRect().height - el.getBoundingClientRect().height,
          );
          if (over <= 0) return null;
          const sub = el.closest<HTMLElement>("[data-sub]")?.dataset.sub ?? "?";
          return `${sub}·${el.dataset.gradeline} 超出 ${over}px`;
        },
      );
      if (bandOverflow.length) {
        const over = bandOverflow.filter(Boolean);
        lines.push(`行带溢出: ${over.length ? over.join(" | ") : "OK 无溢出"}`);
      }

      // 技术组：每张卡里「大三 / 大二」行第一枚胶囊的 y（跨卡应对齐）
      const gradeLines = [...stage.querySelectorAll<HTMLElement>("[data-gradeline]")].map(
        (el) => {
          const chip = el.querySelector<HTMLElement>("[data-chips] > *");
          const r = (chip ?? el).getBoundingClientRect();
          return `${el.dataset.gradeline}@${Math.round(r.top - sb.top)}`;
        },
      );
      if (gradeLines.length) lines.push(`年级行 y: ${gradeLines.join(" ")}`);

      // 技术组：每张卡的胶囊折行结构（行: 每行胶囊数@该行 y）+ 年级行占位
      const chipLines = [...stage.querySelectorAll<HTMLElement>("[data-card]")].map(
        (card) => {
          const top = card.getBoundingClientRect().top;
          const rows = new Map<number, number>();
          for (const chip of card.querySelectorAll<HTMLElement>("[data-chip]")) {
            const y = Math.round(chip.getBoundingClientRect().top - top);
            rows.set(y, (rows.get(y) ?? 0) + 1);
          }
          const name = card.querySelector("span")?.textContent ?? "?";
          return `${name}:${[...rows.entries()].map(([y, n]) => `${n}@${y}`).join(" ")}`;
        },
      );
      if (chipLines.length) lines.push(`卡内胶囊行(卡顶起): ${chipLines.join(" | ")}`);

      const bands = [...stage.querySelectorAll<HTMLElement>("[data-gradeline]")].map(
        (el) => {
          const r = el.getBoundingClientRect();
          const sub = el.closest<HTMLElement>("[data-sub]")?.dataset.sub ?? "?";
          return `${sub}·${el.dataset.gradeline} ${Math.round(r.top - sb.top)}..${Math.round(r.bottom - sb.top)}`;
        },
      );
      if (bands.length) lines.push(`年级行占位: ${bands.join(" | ")}`);

      // 技术组：行标签文字中心与首枚胶囊文字中心的 y 差（应为 0，才算「对齐」）
      const labelDelta = [...stage.querySelectorAll<HTMLElement>("[data-gradeline]")]
        .slice(0, 4)
        .map((el) => {
          const label = el.firstElementChild as HTMLElement | null;
          const chip = el.querySelector<HTMLElement>("[data-chip]");
          if (!label || !chip) return null;
          const a = label.getBoundingClientRect();
          const b = chip.getBoundingClientRect();
          return `${el.dataset.gradeline} Δ${(a.top + a.height / 2 - (b.top + b.height / 2)).toFixed(1)}`;
        })
        .filter(Boolean);
      if (labelDelta.length) lines.push(`行标签 vs 胶囊文字中心: ${labelDelta.join(" ")}`);

      // 车组：12 列是否等宽、左右边界是否与内容区对齐
      const cellCols = [...stage.querySelectorAll<HTMLElement>("[data-col]")];
      if (cellCols.length) {
        const w = [...new Set(cellCols.map((c) => Math.round(c.getBoundingClientRect().width)))];
        const lefts = cellCols.map((c) => Math.round(c.getBoundingClientRect().left - sb.left));
        lines.push(
          `列宽去重 ${w.join("/")} 首列左 ${lefts[0]} 末列右 ${Math.round(cellCols[cellCols.length - 1].getBoundingClientRect().right - sb.left)}`,
        );
      }

      for (const card of stage.querySelectorAll<HTMLElement>("[data-card]")) {
        const cb = card.getBoundingClientRect();
        const body = card.lastElementChild!;
        const kids = [...body.children].filter(
          (k) => (k as HTMLElement).getBoundingClientRect().height > 0,
        );
        if (!kids.length) continue;
        const first = kids[0].getBoundingClientRect();
        const last = kids[kids.length - 1].getBoundingClientRect();
        const name = card.querySelector("span")?.textContent ?? "?";
        lines.push(
          `${name} 卡 ${Math.round(cb.width)}x${Math.round(cb.height)} 顶余 ${Math.round(first.top - cb.top)} 底余 ${Math.round(cb.bottom - last.bottom)}`,
        );
      }

      setText(lines.join("\n"));
    }, 400);

    return () => window.clearTimeout(timer);
  }, []);

  /** ?wheel=1：依次验证「一次滚轮手势只翻一页」与「方向键翻页」 */
  useLayoutEffect(() => {
    if (!wheelTest) return;
    const activeLayer = () =>
      document.getElementById("stage")?.dataset.layer ?? "?";
    const results: string[] = [];

    const fireWheel = window.setTimeout(() => {
      for (let i = 0; i < 3; i += 1) {
        window.dispatchEvent(
          new WheelEvent("wheel", { deltaY: 120, bubbles: true }),
        );
      }
    }, 700);

    const checkWheel = window.setTimeout(() => {
      const layer = activeLayer();
      results.push(
        `一次手势 3×120px -> ${layer} ${layer === "cars" ? "OK" : "FAIL（翻多了或没翻）"}`,
      );
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    }, 1300);

    const checkKey = window.setTimeout(() => {
      const layer = activeLayer();
      results.push(
        `方向键 ArrowLeft -> ${layer} ${layer === "tech" ? "OK" : "FAIL"}`,
      );
      setText((t) => `${t}\n输入自检: ${results.join("；")}`);
    }, 2000);

    return () => {
      window.clearTimeout(fireWheel);
      window.clearTimeout(checkWheel);
      window.clearTimeout(checkKey);
    };
  }, []);

  return (
    <pre
      id="diag"
      className="fixed left-0 top-0 z-50 max-h-[40vh] overflow-hidden bg-black/80 p-2 text-[11px] leading-[1.5] text-[#7CFC9A]"
      style={{ width: 1500 }}
    >
      {text}
    </pre>
  );
}
