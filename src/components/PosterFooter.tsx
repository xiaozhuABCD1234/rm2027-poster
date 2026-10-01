import { asset } from "../lib/util";

/**
 * 两页共用页脚：上海电力大学校徽（正圆白盘 + 标准红 #CC0000）+ 校名。
 * `mt-auto` 把它钉在舞台的下内边距上，所以两页页脚默认落在同一个 y。
 */
export function PosterFooter({ note }: { note?: string }) {
  return (
    <footer className="relative z-[1] mt-auto flex items-center justify-between gap-[30px] border-t border-hair pt-[18px] text-meta tracking-[0.6px] text-faint">
      <div className="flex items-center gap-[16px]">
        <img
          src={asset("school-seal-clean.png")}
          alt="上海电力大学校徽"
          className="block h-[64px] w-auto opacity-92"
        />
        <b className="text-group font-semibold tracking-[1px] text-ink">
          上海电力大学 · 灵晔战队
        </b>
      </div>
      {note && <span>{note}</span>}
    </footer>
  );
}
