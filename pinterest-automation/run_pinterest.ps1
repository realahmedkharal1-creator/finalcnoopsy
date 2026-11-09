# buildpc.store - Pinterest scheduler (pins #20 -> #100)
# Usage (PowerShell):  .\run_pinterest.ps1            full run
#                      .\run_pinterest.ps1 -Prepare   only build images
#                      .\run_pinterest.ps1 -DryRun    only print the queue
param([switch]$Prepare, [switch]$DryRun, [string]$Board = "PC Build Guides")

Set-Location "C:\Users\ahmed\Desktop\buildpc-seo-pages"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Get the LTS from https://nodejs.org and reopen PowerShell." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path ".\pinterest_automation.js")) {
    Write-Host "pinterest_automation.js is missing from $(Get-Location)" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path ".\package.json")) { npm init -y | Out-Null }
if (-not (Test-Path ".\node_modules\puppeteer")) { npm install puppeteer }

$env:PIN_BOARD = $Board
if ($DryRun)      { node .\pinterest_automation.js --dry-run }
elseif ($Prepare) { node .\pinterest_automation.js --prepare }
else              { node .\pinterest_automation.js }
