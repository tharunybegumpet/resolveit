# PowerShell script to reset ResolveIT database
# This will clear all users, complaints, staff applications, and related data

Write-Host "🗑️  ResolveIT Database Reset Tool" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking backend status..." -ForegroundColor Cyan
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/database/stats" -Method GET -ErrorAction Stop
    if ($statsResponse.success) {
        Write-Host "✅ Backend is running" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Current Database Statistics:" -ForegroundColor Cyan
        Write-Host "   Users: $($statsResponse.stats.users)" -ForegroundColor White
        Write-Host "   Complaints: $($statsResponse.stats.complaints)" -ForegroundColor White
        Write-Host "   Staff Applications: $($statsResponse.stats.staffApplications)" -ForegroundColor White
        Write-Host "   Escalations: $($statsResponse.stats.escalations)" -ForegroundColor White
        Write-Host "   Status Codes: $($statsResponse.stats.statusCodes)" -ForegroundColor White
        Write-Host ""
    }
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "   Please start the backend first: mvn spring-boot:run" -ForegroundColor Yellow
    Write-Host "   Backend should be running on http://localhost:8080" -ForegroundColor Yellow
    exit 1
}

# Warning message
Write-Host "⚠️  WARNING: This will permanently delete ALL data!" -ForegroundColor Red -BackgroundColor Yellow
Write-Host "   • All user accounts (admin, staff, users)" -ForegroundColor Red
Write-Host "   • All complaints and their history" -ForegroundColor Red
Write-Host "   • All staff applications" -ForegroundColor Red
Write-Host "   • All escalations" -ForegroundColor Red
Write-Host "   • All file uploads" -ForegroundColor Red
Write-Host ""
Write-Host "🚨 This action CANNOT be undone!" -ForegroundColor Red -BackgroundColor Yellow
Write-Host ""

# Confirmation
$confirmation = Read-Host "Type 'DELETE' to confirm database reset (or press Enter to cancel)"

if ($confirmation -ne "DELETE") {
    Write-Host "❌ Reset cancelled" -ForegroundColor Yellow
    exit 0
}

# Final confirmation
Write-Host ""
Write-Host "🚨 FINAL WARNING: You are about to delete ALL data!" -ForegroundColor Red
$finalConfirmation = Read-Host "Type 'YES' to proceed with database reset"

if ($finalConfirmation -ne "YES") {
    Write-Host "❌ Reset cancelled" -ForegroundColor Yellow
    exit 0
}

# Perform reset
Write-Host ""
Write-Host "🔄 Resetting database..." -ForegroundColor Cyan

try {
    $resetResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/database/reset" -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($resetResponse.success) {
        Write-Host ""
        Write-Host "✅ Database reset successful!" -ForegroundColor Green
        Write-Host "   $($resetResponse.message)" -ForegroundColor White
        Write-Host "   Status codes reinserted: $($resetResponse.statusCodesReinserted)" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Next steps:" -ForegroundColor Cyan
        Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
        Write-Host "   2. Register new user accounts" -ForegroundColor White
        Write-Host "   3. Test the staff application system" -ForegroundColor White
        Write-Host ""
        
        # Get updated stats
        Write-Host "📊 Updated Database Statistics:" -ForegroundColor Cyan
        $newStatsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/database/stats" -Method GET
        if ($newStatsResponse.success) {
            Write-Host "   Users: $($newStatsResponse.stats.users)" -ForegroundColor White
            Write-Host "   Complaints: $($newStatsResponse.stats.complaints)" -ForegroundColor White
            Write-Host "   Staff Applications: $($newStatsResponse.stats.staffApplications)" -ForegroundColor White
            Write-Host "   Escalations: $($newStatsResponse.stats.escalations)" -ForegroundColor White
            Write-Host "   Status Codes: $($newStatsResponse.stats.statusCodes)" -ForegroundColor White
        }
    } else {
        Write-Host "❌ Reset failed: $($resetResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error resetting database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Make sure the backend is running on http://localhost:8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")