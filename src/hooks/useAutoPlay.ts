import { useEffect, useRef } from "react";

/**
 * PPT 式自动播放：等 `intervalMs` 后调用一次 `onAdvance`；`resetKey` 一变（手动换页 / 自动换页后）
 * 计时重新开始，所以手动操作永远能拿到完整停留时间。
 *
 * 页面不可见（切到别的标签 / 屏幕被盖住 / 锁屏）时暂停，可见后重新计时 —— 数字标牌的标准做法。
 */
export function useAutoPlay({
  enabled,
  intervalMs,
  onAdvance,
  resetKey,
}: {
  enabled: boolean;
  intervalMs: number;
  onAdvance: () => void;
  resetKey: string | number;
}) {
  const advance = useRef(onAdvance);
  useEffect(() => {
    advance.current = onAdvance;
  }, [onAdvance]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    let timer = 0;

    const start = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => advance.current(), intervalMs);
    };
    const stop = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs, resetKey]);
}
