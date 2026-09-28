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
