# Windows DApp Diagnostic & Fix Script
# Run from project root or use full paths

# ============================================
# PART 1: CHECK GANACHE CHAIN ID
# ============================================

Write-Host "=== CHECKING GANACHE ===" -ForegroundColor Cyan
Write-Host "Ganache should be running on http://127.0.0.1:7545" -ForegroundColor Yellow

# Send JSON-RPC request to get chain ID
try {
    $body = @{
        jsonrpc = "2.0"
        method = "eth_chainId"
        params = @()
        id = 1
    } | ConvertTo-Json

    Write-Host "Sending JSON-RPC to Ganache..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:7545" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $body `
        -UseBasicParsing

    $result = $response.Content | ConvertFrom-Json
    
    if ($result.result) {
        # Convert hex to decimal
        $chainIdDec = [System.Convert]::ToInt64($result.result, 16)
        Write-Host "✓ Ganache Chain ID: $chainIdDec (hex: $($result.result))" -ForegroundColor Green
    } else {
        Write-Host "✗ Could not get chain ID. Ganache may not be running." -ForegroundColor Red
        Write-Host "Error: $($result.error)" -ForegroundColor Red
    }
}
catch {
    Write-Host "✗ Cannot reach Ganache on http://127.0.0.1:7545" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. Ganache is running" -ForegroundColor Yellow
    Write-Host "2. Port 7545 is not blocked by firewall" -ForegroundColor Yellow
    Write-Host "3. No other service is using port 7545" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PART 2: CHECK TRUFFLE CONFIG
# ============================================

Write-Host "=== CHECKING TRUFFLE CONFIG ===" -ForegroundColor Cyan

if (Test-Path "truffle-config.js") {
    Write-Host "✓ truffle-config.js found" -ForegroundColor Green
    
    # Read and display network_id
    $config = Get-Content truffle-config.js -Raw
    if ($config -match 'network_id\s*:\s*["\']?(\d+|[\*])["\']?') {
        $network_id = $matches[1]
        if ($network_id -eq "*") {
            Write-Host "⚠ network_id is set to '*' (wildcard)" -ForegroundColor Yellow
            Write-Host "  This often causes chain ID mismatches!" -ForegroundColor Yellow
            Write-Host "  Change to explicit: network_id: '1337' (or '5777')" -ForegroundColor Yellow
        } else {
            Write-Host "✓ network_id set to: $network_id" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ Could not parse network_id from truffle-config.js" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ truffle-config.js not found" -ForegroundColor Red
}

Write-Host ""

# ============================================
# PART 3: CHECK BUILD ARTIFACTS
# ============================================

Write-Host "=== CHECKING BUILD ARTIFACTS ===" -ForegroundColor Cyan

$buildPath = ".\build\contracts\Land.json"
$artifactPath = ".\client\src\artifacts\Land.json"

if (Test-Path $buildPath) {
    Write-Host "✓ Build artifact found: $buildPath" -ForegroundColor Green
    
    $artifact = Get-Content $buildPath | ConvertFrom-Json
    $networks = $artifact.networks | Get-Member -Type NoteProperty | Select-Object -ExpandProperty Name
    Write-Host "  Deployed to networks: [$($networks -join ', ')]" -ForegroundColor Cyan
    
    foreach ($net in $networks) {
        $addr = $artifact.networks.$net.address
        Write-Host "    Network $net : $addr" -ForegroundColor Gray
    }
} else {
    Write-Host "✗ Build artifact not found: $buildPath" -ForegroundColor Red
    Write-Host "  Run: truffle compile && truffle migrate" -ForegroundColor Yellow
}

Write-Host ""

if (Test-Path $artifactPath) {
    Write-Host "✓ Frontend artifact found: $artifactPath" -ForegroundColor Green
    
    $artifact = Get-Content $artifactPath | ConvertFrom-Json
    $networks = $artifact.networks | Get-Member -Type NoteProperty | Select-Object -ExpandProperty Name
    Write-Host "  Frontend has networks: [$($networks -join ', ')]" -ForegroundColor Cyan
} else {
    Write-Host "✗ Frontend artifact not found: $artifactPath" -ForegroundColor Red
    Write-Host "  Copy from build/contracts/Land.json" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PART 4: RECOMMENDED FIXES
# ============================================

Write-Host "=== RECOMMENDED FIXES ===" -ForegroundColor Cyan

Write-Host "If chain ID mismatch detected, run these commands:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Edit truffle-config.js - Change network_id to '1337' (or match Ganache)" -ForegroundColor White
Write-Host ""
Write-Host "2. Recompile and redeploy:" -ForegroundColor White
Write-Host "   rm -r build/" -ForegroundColor Gray
Write-Host "   truffle compile" -ForegroundColor Gray
Write-Host "   truffle migrate --reset --network development" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Clear React cache:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   rm -r node_modules/.cache" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check package.json scripts section has:" -ForegroundColor White
Write-Host "   'start': 'cross-env SKIP_PREFLIGHT_CHECK=true react-scripts start'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Restart React dev server:" -ForegroundColor White
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray

Write-Host ""
Write-Host "=== VERIFICATION ===" -ForegroundColor Cyan
Write-Host "After fixes:" -ForegroundColor Green
Write-Host "1. Open browser to http://localhost:3001" -ForegroundColor White
Write-Host "2. Press F12 to open browser console" -ForegroundColor White
Write-Host "3. Look for messages starting with '==='" -ForegroundColor White
Write-Host "4. Should see green ✓ checkmarks for each step" -ForegroundColor White
Write-Host "5. No ✗ symbols means success!" -ForegroundColor White

Write-Host ""
