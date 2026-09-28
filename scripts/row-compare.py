"""逐卡比较两张海报 PNG 的胶囊行位置：按卡片 x 区间分别聚行，输出每一行的 y 区间与左端 x。

用法: python scripts/row-compare.py a.png b.png
"""

import sys
from collections import defaultdict

from PIL import Image

ACCENTS = {
    (0x46, 0x54, 0x6F): "机械组",
    (0x3E, 0x5A, 0x4B): "嵌入式组",
    (0x5F, 0x40, 0x46): "算法组",
    (0x4E, 0x43, 0x63): "综合组",
}
CHIP_BG = {(0x39, 0x41, 0x5A), (0x41, 0x4A, 0x65)}


def scan(path: str) -> dict[str, list[tuple[int, int, int, int]]]:
    im = Image.open(path).convert("RGB")
    W, H = im.size
    data = im.tobytes()

    bands: dict[str, list[int]] = defaultdict(lambda: [W, H, 0, 0])
    for idx in range(0, len(data), 3):
        acc = ACCENTS.get((data[idx], data[idx + 1], data[idx + 2]))
        if acc is None:
            continue
        y, x = divmod(idx // 3, W)
        b = bands[acc]
        b[0], b[1] = min(b[0], x), min(b[1], y)
        b[2], b[3] = max(b[2], x), max(b[3], y)

    ranges = {name: (b[0], b[2]) for name, b in bands.items()}
    chips: dict[str, dict[int, list[int]]] = {
        name: defaultdict(lambda: [W, 0]) for name in bands
    }
    for idx in range(0, len(data), 3):
        if (data[idx], data[idx + 1], data[idx + 2]) not in CHIP_BG:
            continue
        y, x = divmod(idx // 3, W)
        for name, (x0, x1) in ranges.items():
            if x0 - 4 <= x <= x1 + 4:
                c = chips[name][y]
                c[0], c[1] = min(c[0], x), max(c[1], x)

    out: dict[str, list[tuple[int, int, int, int]]] = {}
    for name, rows in chips.items():
        runs: list[list[int]] = []
        for y in sorted(rows):
            if runs and y <= runs[-1][-1] + 1:
                runs[-1].append(y)
            else:
                runs.append([y])
        out[name] = [
            (
                r[0],
                r[-1],
                min(rows[y][0] for y in r),
                max(rows[y][1] for y in r),
            )
            for r in runs
        ]
    return out


a, b = scan(sys.argv[1]), scan(sys.argv[2])
for name in a:
    ra, rb = a[name], b.get(name, [])
    print(f"\n=== {name}  行数 A={len(ra)} B={len(rb)} ===")
    for i in range(max(len(ra), len(rb))):
        sa = (
            f"y {ra[i][0]:>4}-{ra[i][1]:>4} 左{ra[i][2]:>5} 右{ra[i][3]:>5}"
            if i < len(ra)
            else "—"
        )
        sb = (
            f"y {rb[i][0]:>4}-{rb[i][1]:>4} 左{rb[i][2]:>5} 右{rb[i][3]:>5}"
            if i < len(rb)
            else "—"
        )
        mark = ""
        if i < len(ra) and i < len(rb):
            dy, dx = rb[i][0] - ra[i][0], rb[i][2] - ra[i][2]
            mark = f"  Δy={dy:+} Δ左={dx:+}" + (
                "  ✗" if abs(dy) > 1 or abs(dx) > 1 else "  ✓"
            )
        print(f"  行{i + 1}: A {sa}   |   B {sb}{mark}")
