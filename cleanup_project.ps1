# ============================================
# PROJECT CLEANUP SCRIPT
# Removes unnecessary files to reduce size
# ============================================

Write-Host "🧹 Starting Project Cleanup..." -ForegroundColor Cyan
Write-Host ""

$totalSaved = 0

# Function to calculate size
function Get-FolderSize {
    param($path)
    if (Test-Path $path) {
        $size = (Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

# ============================================
# 1. Remove Python Cache Files
# ============================================
Write-Host "1️⃣ Removing Python cache files..." -ForegroundColor Yellow

$pycacheSize = Get-FolderSize "medical_gen\__pycache__"
if (Test-Path "medical_gen\__pycache__") {
    Remove-Item -Recurse -Force "medical_gen\__pycache__"
    Write-Host "   ✅ Removed __pycache__ ($pycacheSize MB)" -ForegroundColor Green
    $totalSaved += $pycacheSize
}

# Remove .pyc files
$pycFiles = Get-ChildItem -Recurse -Filter "*.pyc" -ErrorAction SilentlyContinue
if ($pycFiles) {
    $pycFiles | Remove-Item -Force
    Write-Host "   ✅ Removed .pyc files" -ForegroundColor Green
}

# ============================================
# 2. Remove Test/Debug Python Scripts
# ============================================
Write-Host ""
Write-Host "2️⃣ Removing test and debug scripts..." -ForegroundColor Yellow

$testScripts = @(
    "medical_gen\adjust_layout.py",
    "medical_gen\analyze_layout.py",
    "medical_gen\apply_narrow_margins.py",
    "medical_gen\check_vars_simple.py",
    "medical_gen\check_vars_sorted.py",
    "medical_gen\diagnose_layout.py",
    "medical_gen\diagnose_syntax.py",
    "medical_gen\diagnose_template.py",
    "medical_gen\final_debug_and_fix.py",
    "medical_gen\fix_layout_v2.py",
    "medical_gen\fix_medicine_table.py",
    "medical_gen\fix_table_dates.py",
    "medical_gen\fix_template.py",
    "medical_gen\fix_template_typo.py",
    "medical_gen\fix_template_typo_v2.py",
    "medical_gen\fix_template_typo_v3.py",
    "medical_gen\fix_template_v4.py",
    "medical_gen\get_error_context.py",
    "medical_gen\inspect_context.py",
    "medical_gen\inspect_table_xml.py",
    "medical_gen\inspect_tags.py",
    "medical_gen\inspect_xml.py",
    "medical_gen\locate_broken_tag.py",
    "medical_gen\optimize_template.py",
    "medical_gen\smart_fix.py",
    "medical_gen\temp_check.py",
    "medical_gen\test_generation.py",
    "medical_gen\verify_table_fix.py"
)

$scriptSize = 0
foreach ($script in $testScripts) {
    if (Test-Path $script) {
        $size = (Get-Item $script).Length / 1MB
        $scriptSize += $size
        Remove-Item -Force $script
    }
}
Write-Host "   ✅ Removed 27 test scripts ($([math]::Round($scriptSize, 2)) MB)" -ForegroundColor Green
$totalSaved += $scriptSize

# ============================================
# 3. Remove Backup Template Files
# ============================================
Write-Host ""
Write-Host "3️⃣ Removing backup template files..." -ForegroundColor Yellow

$backupTemplates = @(
    "medical_gen\template.docx.bak",
    "medical_gen\template_brute.docx",
    "medical_gen\template_fixed.docx.bak_before_loop_fix",
    "medical_gen\template_fixed.docx.bak_final",
    "medical_gen\template_fixed.docx.bak_syntax",
    "medical_gen\template_fixed.docx.bak_syntax_v2",
    "medical_gen\template_fixed.docx.bak_syntax_v3",
    "medical_gen\template_fixed.docx.bak_v4",
    "medical_gen\template_fixed_attempt.docx",
    "medical_gen\template_fixed_autoscaled.docx",
    "medical_gen\template_fixed_with_loop.docx",
    "medical_gen\template_layout.docx",
    "medical_gen\statement_template.docx"
)

$backupSize = 0
foreach ($backup in $backupTemplates) {
    if (Test-Path $backup) {
        $size = (Get-Item $backup).Length / 1MB
        $backupSize += $size
        Remove-Item -Force $backup
    }
}
Write-Host "   ✅ Removed 13 backup templates ($([math]::Round($backupSize, 2)) MB)" -ForegroundColor Green
$totalSaved += $backupSize

# ============================================
# 4. Remove Temporary Files
# ============================================
Write-Host ""
Write-Host "4️⃣ Removing temporary files..." -ForegroundColor Yellow

$tempFiles = @(
    "medical_gen\temp_filled_form.docx",
    "medical_gen\temp_filled_form.pdf",
    "medical_gen\~`$mplate.docx",
    "medical_gen\~`$mplate_fixed.docx",
    "medical_gen\~WRL3501.tmp"
)

$tempSize = 0
foreach ($temp in $tempFiles) {
    if (Test-Path $temp) {
        $size = (Get-Item $temp).Length / 1MB
        $tempSize += $size
        Remove-Item -Force $temp
    }
}
Write-Host "   ✅ Removed temporary files ($([math]::Round($tempSize, 2)) MB)" -ForegroundColor Green
$totalSaved += $tempSize

# ============================================
# 5. Remove Documentation Files (Optional)
# ============================================
Write-Host ""
Write-Host "5️⃣ Removing debug documentation..." -ForegroundColor Yellow

$docFiles = @(
    "medical_gen\PDF_LAYOUT_FIX_GUIDE.md",
    "medical_gen\VARIABLE_REFERENCE.md",
    "medical_gen\vars_report.txt",
    "vars_report.txt"
)

$docSize = 0
foreach ($doc in $docFiles) {
    if (Test-Path $doc) {
        $size = (Get-Item $doc).Length / 1MB
        $docSize += $size
        Remove-Item -Force $doc
    }
}
Write-Host "   ✅ Removed debug docs ($([math]::Round($docSize, 2)) MB)" -ForegroundColor Green
$totalSaved += $docSize

# ============================================
# 6. Remove Logs
# ============================================
Write-Host ""
Write-Host "6️⃣ Removing log files..." -ForegroundColor Yellow

if (Test-Path "logs\php_errors.log") {
    $logSize = (Get-Item "logs\php_errors.log").Length / 1MB
    Remove-Item -Force "logs\php_errors.log"
    Write-Host "   ✅ Removed logs ($([math]::Round($logSize, 2)) MB)" -ForegroundColor Green
    $totalSaved += $logSize
}

# ============================================
# 7. Remove Excel File (if not needed)
# ============================================
Write-Host ""
Write-Host "7️⃣ Removing Excel file..." -ForegroundColor Yellow

if (Test-Path "Statement of Med.xlsx") {
    $excelSize = (Get-Item "Statement of Med.xlsx").Length / 1MB
    Remove-Item -Force "Statement of Med.xlsx"
    Write-Host "   ✅ Removed Excel file ($([math]::Round($excelSize, 2)) MB)" -ForegroundColor Green
    $totalSaved += $excelSize
}

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Total Space Saved: $([math]::Round($totalSaved, 2)) MB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your project is now cleaner and smaller!" -ForegroundColor Green
Write-Host ""
