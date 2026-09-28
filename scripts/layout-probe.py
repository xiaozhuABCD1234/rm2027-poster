"""从海报 PNG 里量出「布局指纹」：卡片页眉色带、每行胶囊的 y 区间与 x 范围。

用法: python scripts/layout-probe.py poster.png
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

path = sys.argv[1]
im = Image.open(path).convert("RGB")
W, H = im.size
data = im.tobytes()
print(f"# {path}  {W}x{H}")

bands: dict[str, list[int]] = defaultdict(lambda: [W, H, 0, 0])
chip_px: dict[int, list[int]] = defaultdict(lambda: [W, 0])

for idx in range(0, len(data), 3):
    rgb = (data[idx], data[idx + 1], data[idx + 2])
    is_band = rgb in ACCENTS
    is_chip = rgb in CHIP_BG
    if not (is_band or is_chip):
        continue
    y, x = divmod(idx // 3, W)
    if is_band:
        b = bands[ACCENTS[rgb]]
        b[0], b[1] = min(b[0], x), min(b[1], y)
        b[2], b[3] = max(b[2], x), max(b[3], y)
    else:
        c = chip_px[y]
        c[0], c[1] = min(c[0], x), max(c[1], x)

for name, (x0, y0, x1, y1) in bands.items():
    print(
        f"页眉带 {name}: x {x0}-{x1}（宽 {x1 - x0 + 1}）  y {y0}-{y1}（高 {y1 - y0 + 1}）"
    )

runs: list[list[int]] = []
for y in sorted(chip_px):
    if runs and y == runs[-1][-1] + 1:
        runs[-1].append(y)
    else:
        runs.append([y])

print(f"\n胶囊行共 {len(runs)} 行")
for run in runs:
    y0, y1 = run[0], run[-1]
    x0 = min(chip_px[y][0] for y in run)
    x1 = max(chip_px[y][1] for y in run)
    print(
        f"  y {y0:>4}-{y1:>4} (h={y1 - y0 + 1:>3})  x {x0:>4}-{x1:>4}  宽 {x1 - x0 + 1}"
    )
