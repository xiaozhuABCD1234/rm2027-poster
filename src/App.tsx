import { useCallback, useEffect, useState } from "react";
import { CarMatrix } from "./components/CarMatrix";
import { Diag } from "./components/Diag";
import { StageStack } from "./components/Stage";
import { TechRoster } from "./components/TechRoster";
import { useAutoPlay } from "./hooks/useAutoPlay";
import { useRosterData } from "./hooks/useRosterData";
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

/** 名单 JSON 读取失败时的兜底提示（不进舞台，直接铺在页面上） */
function DataError({ error }: { error: string }) {
  return (
    <div className="fixed inset-0 grid place-items-center p-10">
      <div className="max-w-[900px] rounded-card border border-hair bg-surface-1 p-8">
        <h1 className="text-badge font-bold tracking-[2px] text-ink">
          名单数据读取失败
        </h1>
        <p className="mt-4 text-group leading-[1.7] text-dim">{error}</p>
        <p className="mt-4 text-meta leading-[1.7] text-faint">
          名单在 <code>public/data/tech.json</code> 与{" "}
          <code>public/data/cars.json</code>；改完保存后刷新本页即可，字段说明见文件里的
          <code>$comment</code>。
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(initialPage);
  const [auto, setAuto] = useState(autoEnabled);
  const roster = useRosterData();

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

  // 名单没读出来之前不挂载海报：卡片的折行平衡只算一次，也不会闪空名单
  if (roster.status === "loading") return diag ? <Diag /> : null;
  if (roster.status === "error")
    return (
      <>
        <DataError error={roster.error} />
        {diag && <Diag />}
      </>
    );

  return (
    <>
      <StageStack
        active={page}
        force1x={force1x}
        layers={[
          {
            key: "tech",
            node: (
              <TechRoster data={roster.roster.tech} stats={roster.roster.techStats} />
            ),
          },
          {
            key: "cars",
            node: (
              <CarMatrix data={roster.roster.cars} stats={roster.roster.carStats} />
            ),
          },
        ]}
      />
      {diag && <Diag />}
    </>
  );
}
