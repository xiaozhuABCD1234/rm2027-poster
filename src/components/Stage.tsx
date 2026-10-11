import { useEffect, useState, type ReactNode } from "react";
import { STAGE_H, STAGE_W } from "../lib/util";

export interface StageLayer {
  key: string;
  node: ReactNode;
}

/**
 * 固定 1920x1080 海报舞台，可叠多页做 PPT 式自动播放。
 *
 * - 舞台随视口等比缩放（不改内部布局）；`force1x` 强制 1:1，供截图/导出。
 * - 所有页都保持挂载（只切 opacity + inert），这样换页前排版已算好，淡入不会跳版。
 * - 淡入用「新页盖着旧页淡入」：新页 z 更高、立刻开始淡入；旧页延迟一个淡入时长再熄灭，
 *   所以过渡期间屏幕不会变暗（不像两边同时半透明那样会透出底色）。
 */
export function StageStack({
  layers,
  active,
  force1x = false,
  fadeMs = 700,
}: {
  layers: StageLayer[];
  active: string;
  force1x?: boolean;
  fadeMs?: number;
}) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (force1x) return;
    const fit = () =>
      setScale(
        Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H),
      );
    fit();
    window.addEventListener("resize", fit);
    window.visualViewport?.addEventListener("resize", fit);
    document.addEventListener("fullscreenchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.visualViewport?.removeEventListener("resize", fit);
      document.removeEventListener("fullscreenchange", fit);
    };
  }, [force1x]);

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden">
      <div
        style={{ width: STAGE_W * scale, height: STAGE_H * scale }}
        className="relative"
      >
        {layers.map((layer) => {
          const on = layer.key === active;
          return (
            <div
              key={layer.key}
              id={on ? "stage" : undefined}
              data-layer={layer.key}
              aria-hidden={!on}
              inert={!on}
              className="poster-canvas absolute top-0 left-0 flex flex-col overflow-hidden px-[46px] pt-[52px] pb-[40px] text-ink"
              style={{
                width: STAGE_W,
                height: STAGE_H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                opacity: on ? 1 : 0,
                zIndex: on ? 2 : 1,
                pointerEvents: on ? "auto" : "none",
                transition: on
                  ? `opacity ${fadeMs}ms ease 0ms`
                  : `opacity 0ms linear ${fadeMs}ms`,
              }}
            >
              {layer.node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
