import { useLayoutEffect, useRef } from "react";

/**
 * 胶囊折行平衡：末行个数明显少于上一行时，把上一行末尾若干个胶囊打包成一个不可拆分组挪到末行，
 * 避免出现「最后一个字独占一行」的孤儿。逻辑与 rm2027-tech-roster.html 的 balanceChips 一致。
 */
export function useChipBalance() {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const root = ref.current;
        if (!root) return;

        const boxes = [...root.querySelectorAll<HTMLElement>("[data-chips]")];
        const originals = boxes.map((b) => [...b.children] as HTMLElement[]);

        const run = () => {
            boxes.forEach((box, i) => {
                const chips = originals[i];
                box.replaceChildren(...chips); // 幂等：每次先复位
                if (chips.length < 4) return;

                const lineOf = (c: HTMLElement) =>
                    Math.round(c.getBoundingClientRect().top);
                const tops = [...new Set(chips.map(lineOf))].sort(
                    (a, b) => a - b,
                );
                if (tops.length < 2) return;

                const per = tops.map((t) =>
                    chips.filter((c) => lineOf(c) === t),
                );
                const target = Math.ceil(chips.length / per.length);
                const last = per[per.length - 1];
                const prev = per[per.length - 2];
                const moveCount = Math.min(
                    target - last.length,
                    prev.length - last.length - 1,
                );
                if (moveCount < 1) return;

                const moveStart = chips.indexOf(prev[prev.length - moveCount]);
                const group = document.createElement("div");
                const gap = getComputedStyle(box).columnGap || "7px";
                group.style.cssText = `display:flex;gap:${gap};flex:0 0 auto`;
                box.replaceChildren(...chips.slice(0, moveStart), group);
                group.append(...chips.slice(moveStart));
            });
        };

        run();
        let alive = true;
        void document.fonts?.ready.then(() => {
            if (alive) run(); // 字体度量会改变换行，加载完再算一遍
        });
        return () => {
            alive = false;
        };
    }, []);

    return ref;
}
