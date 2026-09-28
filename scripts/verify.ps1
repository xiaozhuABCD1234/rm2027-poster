# scripts/verify.ps1 — 起 dev server，把两页各截一张 1920x1080 PNG，输出布局量测（Diag），并自检自动播放
# 用法: pwsh -File scripts\verify.ps1
param([int]$Port = 5173)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$chrome = @(
  'C:\Program Files\Google\Chrome\Application\chrome.exe',
  'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { throw '找不到 chrome.exe' }

$shots = Join-Path $root 'shots'
New-Item -ItemType Directory -Force -Path $shots | Out-Null
$profile = Join-Path $env:TEMP 'chrome-rm2027'

function Test-Up {
  try { (Invoke-WebRequest "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 }
  catch { $false }
}

if (-not (Test-Up)) {
  Write-Host "启动 dev server (:$Port)…"
  Start-Process pwsh -ArgumentList '-NoProfile', '-Command', "Set-Location '$root'; pnpm dev" -WindowStyle Hidden
  $up = $false
  foreach ($i in 1..60) {
    Start-Sleep -Milliseconds 500
    if (Test-Up) { $up = $true; break }
  }
  if (-not $up) { throw "dev server 未在 $Port 起来" }
}

function Wait-File {
  param([string]$Path, [int]$TimeoutMs = 40000)
  $spent = 0
  $last = -1
  while ($spent -lt $TimeoutMs) {
    Start-Sleep -Milliseconds 400
    $spent += 400
    if (Test-Path $Path) {
      $len = (Get-Item $Path).Length
      if ($len -gt 0 -and $len -eq $last) { return $true }   # 连续两次大小一致视为写盘完成
      $last = $len
    }
  }
  return (Test-Path $Path)
}

# Chrome 的启动器会立刻返回、真正落盘在后，所以一律用 Start-Process -Wait，截图再等文件落盘
function Invoke-Chrome {
  param([string[]]$Extra, [string]$Url, [string]$StdOut, [int]$Budget = 6000)
  $argv = @(
    '--headless=old', '--disable-gpu', '--no-first-run', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=1920,1080', "--user-data-dir=$profile",
    "--virtual-time-budget=$Budget"
  ) + $Extra + $Url
  if ($StdOut) {
    Start-Process -FilePath $chrome -ArgumentList $argv -Wait -NoNewWindow -RedirectStandardOutput $StdOut | Out-Null
    return (Get-Content $StdOut -Raw)
  }
  Start-Process -FilePath $chrome -ArgumentList $argv -Wait -NoNewWindow | Out-Null
  return $null
}

function Get-ActiveLayer {
  param([string]$Dom)
  foreach ($pattern in @('id="stage"[^>]*data-layer="([a-z]+)"', 'data-layer="([a-z]+)"[^>]*id="stage"')) {
    $m = [regex]::Match($Dom, $pattern)
    if ($m.Success) { return $m.Groups[1].Value }
  }
  return '?'
}

# ---- 两页截图 + Diag 量测（auto=0 保证停在指定页，截图确定性）----
foreach ($page in @('tech', 'cars')) {
  $png = Join-Path $shots "$page-1920x1080.png"
  Remove-Item $png -Force -ErrorAction SilentlyContinue
  Invoke-Chrome -Extra @("--screenshot=$png") -Url "http://localhost:$Port/?page=$page&bare=1&scale=1&auto=0" | Out-Null
  if (-not (Wait-File -Path $png)) { throw "截图未生成: $png" }
  Write-Host "`n截图 $page -> $png ($([math]::Round((Get-Item $png).Length/1KB)) KB)"

  $domFile = Join-Path $env:TEMP "dom-$page.html"
  $dom = Invoke-Chrome -Extra @('--dump-dom') -Url "http://localhost:$Port/?page=$page&bare=1&scale=1&auto=0&diag=1" -StdOut $domFile
  $m = [regex]::Match([string]$dom, '(?s)<pre id="diag"[^>]*>(.*?)</pre>')
  if ($m.Success) {
    $txt = $m.Groups[1].Value -replace '&lt;', '<' -replace '&gt;', '>' -replace '&amp;', '&' -replace '&quot;', '"'
    Write-Host "DIAG($page)>>"; $txt.Trim() | Write-Host
  } else {
    Write-Host "DIAG($page)>> 未取到 diag（dom: $domFile）"
  }
}

# ---- 自动播放自检：1200ms 一页，虚拟时间走 4000ms -> 换 3 次，应停在 cars ----
$domFile2 = Join-Path $env:TEMP 'dom-autoplay.html'
$dom2 = Invoke-Chrome -Extra @('--dump-dom') -Url "http://localhost:$Port/?bare=1&every=1200" -StdOut $domFile2 -Budget 4000
$active = Get-ActiveLayer ([string]$dom2)
$verdict = if ($active -eq 'cars') { 'OK' } else { 'FAIL' }
Write-Host "`n自动播放自检: every=1200ms / 虚拟时间 4000ms -> 当前页 $active（期望 cars，共换 3 次）[$verdict]"
if ($verdict -eq 'FAIL') { Write-Host "  调试用 DOM: $domFile2" }

# ---- 输入自检：一次滚轮手势（连发 3 个 120px 事件）应只翻一页 tech->cars；再按 ArrowLeft 应回到 tech ----
$domFile3 = Join-Path $env:TEMP 'dom-wheel.html'
$dom3 = Invoke-Chrome -Extra @('--dump-dom') -Url "http://localhost:$Port/?bare=1&auto=0&wheel=1&diag=1" -StdOut $domFile3 -Budget 3500
$dom3txt = ([string]$dom3) -replace '&lt;', '<' -replace '&gt;', '>' -replace '&amp;', '&'
$m3 = [regex]::Match($dom3txt, '输入自检: (.+?)</pre>')
if ($m3.Success) {
  $line = $m3.Groups[1].Value.Trim()
  $ok = $line -match '-> cars OK' -and $line -match 'ArrowLeft -> tech OK'
  Write-Host "输入自检: $line [$($(if ($ok) { 'OK' } else { 'FAIL' }))]"
} else {
  Write-Host "输入自检: 未取到结果（dom: $domFile3）"
}
