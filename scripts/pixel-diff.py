"""像素级比对两张同尺寸 PNG，输出差异比例、差异区域包围盒，并存一张差异高亮图。

用法: python scripts/pixel-diff.py a.png b.png out-diff.png
"""

import os
import sys

from PIL import Image, ImageChops

a_path, b_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
a = Image.open(a_path).convert("RGB")
b = Image.open(b_path).convert("RGB")
if a.size != b.size:
    print(f"尺寸不同: {a.size} vs {b.size}")
    sys.exit(1)

diff = ImageChops.difference(a, b)
gray = diff.convert("L")
hist = gray.histogram()
total = a.size[0] * a.size[1]
over = sum(hist[16:])  # 阈值 16，忽略抗锯齿级别的微小差异
print(f"尺寸 {a.size}")
print(
    f"完全一致 {100 * hist[0] / total:.2f}%  |  近似一致(≤16) {100 * sum(hist[:17]) / total:.2f}%  |  明显差异 {100 * over / total:.2f}%"
)

# 256 级查找表做阈值，比回调写法更省事也更快
THRESHOLD_LUT = bytes([0] * 17 + [255] * (256 - 17))
mask = gray.point(THRESHOLD_LUT)
bbox = mask.getbbox()
print(f"差异包围盒 {bbox}")

# 差异高亮图：上=原图 下=差异处涂红
w, h = a.size
canvas = Image.new("RGB", (w, h * 2 + 8), (10, 10, 14))
canvas.paste(a, (0, 0))
highlight = b.copy()
highlight.paste((255, 0, 0), mask=mask)
canvas.paste(highlight, (0, h + 8))
canvas.save(out_path)
print("差异图 ->", out_path, os.path.getsize(out_path))
