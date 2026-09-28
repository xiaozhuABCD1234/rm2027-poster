import { asset } from "../lib/util";

/** 两页共用页脚：上海电力大学校徽（正圆白盘 + 标准红 #CC0000）+ 校名 */
export function PosterFooter({ note }: { note?: string }) {
  return (
    <footer className="relative z-[1] mt-[30px] flex items-center justify-between gap-[30px] border-t border-[rgba(200,208,228,.18)] pt-[18px] text-[14.5px] tracking-[0.6px] text-faint">
      <div className="flex items-center gap-[16px]">
        <img
          src={asset("school-seal-clean.png")}
          alt="上海电力大学校徽"
          className="block h-[64px] w-auto opacity-92"
        />
        <b className="text-[17px] font-semibold tracking-[1px] text-[#E8EAF0]">
          上海电力大学 · 灵晔战队
        </b>
      </div>
      {note && <span>{note}</span>}
    </footer>
  );
}
