$source = "c:\xampp\htdocs\EMPLOYEE CORNER 1.0"
$tempDir = "c:\xampp\htdocs\Employee_Share_Temp"
$zipFile = "c:\xampp\htdocs\Employee_Corner_Full_Project.zip"

Write-Host "1. Preparing files for sharing..."
# Remove old temp if exists
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Copy Root Files & Folders (Excluding huge ones)
Get-ChildItem -Path $source | Where-Object { 
    $_.Name -notin 'node_modules', '.git', '.vscode', 'Employee_Share_Temp', '*.zip', 'prepare_share.bat' 
} | ForEach-Object {
    if ($_.Name -eq 'medical_gen') {
        # Handle medical_gen separately to exclude .venv
        $medDest = "$tempDir\medical_gen"
        New-Item -ItemType Directory -Force -Path $medDest | Out-Null
        Get-ChildItem -Path $_.FullName | Where-Object { $_.Name -notin '.venv', '__pycache__' } | Copy-Item -Destination $medDest -Recurse
    } else {
        Copy-Item -Path $_.FullName -Destination $tempDir -Recurse
    }
}

Write-Host "2. Creating Zip file (This may take a moment)..."
if (Test-Path $zipFile) { Remove-Item -Path $zipFile -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile

Write-Host "3. Cleaning up..."
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "SUCCESS: Zip file created at: $zipFile"
