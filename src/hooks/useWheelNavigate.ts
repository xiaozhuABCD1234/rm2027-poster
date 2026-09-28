import { useEffect, useRef } from "react";

/**
 * 鼠标滚轮 / 触控板切换页面。
 *
 * 滚轮一次手势会连续吐出很多事件，所以：
 * - 累积位移过 `threshold` 才翻一页；
 * - 翻页后进入 `cooldownMs` 冷却，冷却期内的残余事件直接丢弃（一次手势 = 一次翻页）；
 * - 220ms 没有新事件视为手势结束，清空累积；
 * - 方向反转时清空累积，避免来回抖动误触发；
 * - `deltaMode` 归一成像素（1=行、2=页）；
 * - `ctrlKey`（捏合缩放）与位移为 0 的事件不处理。
 *
 * 监听器是 passive 的：页面本身不滚动，不需要 preventDefault，也不阻塞浏览器手势。
 */
export function useWheelNavigate({
  onNext,
  onPrev,
  threshold = 40,
  cooldownMs = 900,
}: {
  onNext: () => void;
  onPrev: () => void;
  threshold?: number;
  cooldownMs?: number;
}) {
  const handlers = useRef({ onNext, onPrev });
  useEffect(() => {
    handlers.current = { onNext, onPrev };
  }, [onNext, onPrev]);

  useEffect(() => {
    let acc = 0;
    let lastFired = Number.NEGATIVE_INFINITY;
    let idleTimer = 0;

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return;
      // 触控板的横向滚动也算手势
      const raw =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      if (!raw) return;

      const now = performance.now();
      if (now - lastFired < cooldownMs) {
        acc = 0;
        return;
      }

      const px =
        raw * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1);
      if (acc !== 0 && Math.sign(px) !== Math.sign(acc)) acc = 0;
      acc += px;

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        acc = 0;
      }, 220);

      if (Math.abs(acc) < threshold) return;

      lastFired = now;
      const forward = acc > 0;
      acc = 0;
      (forward ? handlers.current.onNext : handlers.current.onPrev)();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("wheel", onWheel);
    };
  }, [threshold, cooldownMs]);
}
