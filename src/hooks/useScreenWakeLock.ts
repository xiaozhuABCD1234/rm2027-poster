import { useEffect } from "react";

/**
 * 自动播放时申请屏幕唤醒锁，避免长期展示时显示器自动休眠（浏览器不支持或被系统策略拒绝就静默跳过）。
 * 页面重新可见后需要再次申请 —— 系统在切后台时会自动释放锁。
 */
export function useScreenWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let disposed = false;

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch {
        // 非 https、省电模式、用户策略等都会抛，忽略即可
      }
    };

    void acquire();
    const onVisibility = () => {
      if (!document.hidden && !disposed) void acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [enabled]);
}
