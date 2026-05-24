# Check if running as Admin
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ Error: This script must be run as Administrator." -ForegroundColor Red
    Write-Host "Please open PowerShell as Administrator and run:" -ForegroundColor Yellow
    Write-Host "powershell -ExecutionPolicy Bypass -File `"D:\Swayam\Projects\WEB Dev\Verbum\scratch\setup-replica.ps1`"" -ForegroundColor Cyan
    Exit
}

Write-Host "🔍 Locating MongoDB configuration file on Windows..." -ForegroundColor Cyan

# Common paths for MongoDB config on Windows
$cfgPaths = @(
    "C:\Program Files\MongoDB\Server\8.0\bin\mongod.cfg",
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.cfg",
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg",
    "C:\Program Files\MongoDB\Server\5.0\bin\mongod.cfg"
)

$cfgPath = $null
foreach ($path in $cfgPaths) {
    if (Test-Path $path) {
        $cfgPath = $path
        break
    }
}

if ($null -eq $cfgPath) {
    Write-Host "❌ Error: Could not locate mongod.cfg automatically." -ForegroundColor Red
    Write-Host "Please find your mongod.cfg file manually and add the following lines at the bottom:" -ForegroundColor Yellow
    Write-Host "`nreplication:`n  replSetName: rs0`n" -ForegroundColor Green
    Exit
}

Write-Host "Found config file at: $cfgPath" -ForegroundColor Green

# Read file
$cfgContent = Get-Content $cfgPath -Raw

if ($cfgContent -match "replSetName") {
    Write-Host "ℹ️ Replica set configuration already exists in mongod.cfg." -ForegroundColor Yellow
} else {
    Write-Host "Adding replication configuration to mongod.cfg..." -ForegroundColor Cyan
    # Append replication config
    $newConfig = $cfgContent + "`r`n`r`n# Enable replica set for Prisma integration`r`nreplication:`r`n  replSetName: rs0`r`n"
    Set-Content -Path $cfgPath -Value $newConfig -Force
    Write-Host "Successfully updated mongod.cfg!" -ForegroundColor Green
}

Write-Host "🔄 Restarting Windows MongoDB Service..." -ForegroundColor Cyan
try {
    Restart-Service -Name "MongoDB" -Force -ErrorAction Stop
    Write-Host "Service restarted successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Warning: Failed to restart MongoDB service using Restart-Service." -ForegroundColor Yellow
    Write-Host "Attempting net stop / net start..." -ForegroundColor Cyan
    net stop MongoDB
    net start MongoDB
}

Write-Host "⌛ Waiting 5 seconds for MongoDB to spin up..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "🚀 Initiating replica set inside MongoDB..." -ForegroundColor Cyan
# Run mongosh to initiate
$initRes = mongosh --eval "rs.initiate()" 2>&1

if ($initRes -match "ok" -or $initRes -match "already initialized") {
    Write-Host "✅ Replica set successfully initiated!" -ForegroundColor Green
} else {
    Write-Host "Replica set initialization details:" -ForegroundColor Yellow
    Write-Output $initRes
}

Write-Host "`n🎉 Setup complete! You can now run your Next.js application." -ForegroundColor Green
