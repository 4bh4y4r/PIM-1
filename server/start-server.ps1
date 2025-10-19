# Check if port 5001 is in use
$portInUse = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "Port 5001 is in use. Attempting to free it..."
    try {
        Stop-Process -Id (Get-Process -Id $portInUse.OwningProcess).Id -Force
        Write-Host "Successfully freed port 5001"
    } catch {
        Write-Host "Failed to free port 5001. Please close any applications using it."
        exit 1
    }
}

# Add firewall rule for inbound traffic
$ruleName = "PersonHubAPI"
$ruleExists = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue

if (-not $ruleExists) {
    Write-Host "Adding firewall rule for port 5001..."
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
    Write-Host "Firewall rule added successfully"
} else {
    Write-Host "Firewall rule already exists"
}

# Start the server
Write-Host "Starting server..."
npm run dev