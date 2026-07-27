# 누락 미디어 자동 보충 (Windows PowerShell - PHP 불필요)
# 실행: download-missing-WINDOWS.bat 더블클릭 (또는 이 파일 우클릭 > PowerShell 실행)
$ErrorActionPreference = 'Continue'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Live = 'https://www.jk-withme.com'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root      = Split-Path -Parent $scriptDir
$siteDir   = Join-Path $root 'site'
$listFile  = Join-Path $scriptDir 'missing-assets.txt'

if (-not (Test-Path $listFile)) { Write-Host "목록 파일이 없습니다: $listFile"; exit 1 }

$items = Get-Content -Path $listFile -Encoding UTF8 | Where-Object { $_.Trim() -ne '' }
Write-Host ("받을 파일: {0}개`n" -f $items.Count)

$ok = 0; $fail = 0
foreach ($rel in $items) {
    $rel = $rel.Trim()
    $enc = ($rel -split '/' | ForEach-Object { [uri]::EscapeDataString($_) }) -join '/'
    $url = "$Live/$enc"
    $dest = Join-Path $siteDir ($rel -replace '/', '\')
    $destDir = Split-Path -Parent $dest
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Force -Path $destDir | Out-Null }
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -TimeoutSec 40
        $ok++;  Write-Host ("  OK   {0}" -f $rel)
    } catch {
        $fail++; Write-Host ("  실패 {0}" -f $rel)
    }
}
Write-Host ("`n완료: 성공 {0}개 / 실패 {1}개" -f $ok, $fail)
if ($fail -gt 0) { Write-Host "실패분은 원본 사이트에도 없거나 경로가 바뀐 파일입니다." }
Write-Host "`n창을 닫으려면 아무 키나 누르세요."
[void][System.Console]::ReadKey($true)
