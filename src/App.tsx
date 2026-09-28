import { useCallback, useEffect, useState } from "react";
import { CarMatrix } from "./components/CarMatrix";
import { Diag } from "./components/Diag";
import { StageStack } from "./components/Stage";
import { TechRoster } from "./components/TechRoster";
import { useAutoPlay } from "./hooks/useAutoPlay";
import { useScreenWakeLock } from "./hooks/useScreenWakeLock";
import { useWheelNavigate } from "./hooks/useWheelNavigate";
import { isPage, PAGES, type Page } from "./lib/util";

const params = new URLSearchParams(window.location.search);
const initialPage: Page = isPage(params.get("page"))
  ? (params.get("page") as Page)
  : "tech";
const bare = params.get("bare") === "1";
const diag = params.get("diag") === "1";
const force1x = params.get("scale") === "1" || bare;
const everyParam = Number(params.get("every"));
/** 默认 12 秒一页；?auto=0 关自动播，?every=6000 改间隔 */
const everyMs =
  Number.isFinite(everyParam) && everyParam > 0 ? everyParam : 12_000;
const autoEnabled = params.get("auto") !== "0";

const toggleFullscreen = () => {
  try {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen();
  } catch {
    // 不支持全屏（iframe / 权限策略）时忽略
  }
};

export default function App() {
  const [page, setPage] = useState<Page>(initialPage);
  const [auto, setAuto] = useState(autoEnabled);

  const go = useCallback((p: Page) => {
    setPage(p);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("page", p);
      window.history.replaceState(null, "", url);
    } catch {
      // 地址栏不可写（例如 file:// 打开）时只切页，不回写 URL
    }
  }, []);

  /** 按页序前进/后退一页（只有两页时就是互相切换，多页也能直接用） */
  const step = useCallback((dir: 1 | -1) => {
    setPage((current) => {
      const total = PAGES.length;
      const index = PAGES.indexOf(current);
      return PAGES[(index + dir + total) % total];
    });
  }, []);

  const next = useCallback(() => step(1), [step]);
  const prev = useCallback(() => step(-1), [step]);

  useAutoPlay({
    enabled: auto,
    intervalMs: everyMs,
    onAdvance: next,
    resetKey: page,
  });
  useScreenWakeLock(auto);
  useWheelNavigate({ onNext: next, onPrev: prev });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "1":
          go("tech");
          break;
        case "2":
          go("cars");
          break;
        case "ArrowRight":
        case "ArrowDown":
          next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
          prev();
          break;
        case " ":
          e.preventDefault();
          setAuto((v) => !v);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, next, prev]);

  return (
    <>
      <StageStack
        active={page}
        force1x={force1x}
        layers={[
          { key: "tech", node: <TechRoster /> },
          { key: "cars", node: <CarMatrix /> },
        ]}
      />
      {diag && <Diag />}
    </>
  );
}
