#requires -Version 7.0
<#
.SYNOPSIS
    Khoi dong server tinh de xem truoc SparkMarvel website tren localhost.
.DESCRIPTION
    Uu tien Python (http.server). Neu khong co Python, fallback sang `npx serve`.
    Mac dinh chay tai http://localhost:8080 va tu mo trinh duyet.
.PARAMETER Port
    Cong lang nghe. Mac dinh 8080.
.EXAMPLE
    .\setup.ps1
    .\setup.ps1 -Port 3000
#>
[CmdletBinding()]
param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$url = "http://localhost:$Port"

Write-Host "SparkMarvel - dev server" -ForegroundColor Cyan
Write-Host "Thu muc: $root"
Write-Host "URL    : $url`n"

$python = Get-Command python -ErrorAction SilentlyContinue
$node = Get-Command npx -ErrorAction SilentlyContinue

Start-Process $url

if ($python) {
    Write-Host "Dang chay bang Python http.server (Ctrl+C de dung)..." -ForegroundColor Green
    Set-Location $root
    & python -m http.server $Port
}
elseif ($node) {
    Write-Host "Khong tim thay Python, dung npx serve (Ctrl+C de dung)..." -ForegroundColor Yellow
    & npx --yes serve $root --listen $Port
}
else {
    Write-Error "Can Python hoac Node.js. Cai bang: winget install Python.Python.3.14"
    exit 1
}
