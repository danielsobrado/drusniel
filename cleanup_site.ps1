# cleanup_site.ps1
# This script cleans up unnecessary files from the 'site' folder before committing.

Write-Host "Starting site cleanup..." -ForegroundColor Cyan

$sitePath = "site"

if (-not (Test-Path $sitePath)) {
    Write-Host "Error: 'site' folder not found in the current directory." -ForegroundColor Red
    exit 1
}

# 1. Delete video files except MP4
Write-Host "`n1. Deleting video files (*.webm, *.avi, *.mov)..." -ForegroundColor Yellow
$videoFiles = Get-ChildItem -Path $sitePath -Include *.webm, *.avi, *.mov -Recurse -ErrorAction SilentlyContinue
$videoCount = 0
foreach ($file in $videoFiles) {
    Remove-Item $file.FullName -Force
    $videoCount++
}
Write-Host "Deleted $videoCount video files. MP4 files were preserved." -ForegroundColor Green

# 2. Delete prompt text files
Write-Host "`n2. Deleting prompt text files (images.txt, imagesNano.txt, video.txt, reference_prompts.txt)..." -ForegroundColor Yellow
$promptFiles = Get-ChildItem -Path $sitePath -Include images.txt, imagesNano.txt, video.txt, reference_prompts.txt -Recurse -ErrorAction SilentlyContinue
$promptCount = 0
foreach ($file in $promptFiles) {
    Remove-Item $file.FullName -Force
    $promptCount++
}
Write-Host "Deleted $promptCount prompt text files." -ForegroundColor Green

# 3. Delete PNGs that have a matching JPG
Write-Host "`n3. Deleting PNG files that have a matching JPG..." -ForegroundColor Yellow
$pngFiles = Get-ChildItem -Path $sitePath -Filter *.png -Recurse -ErrorAction SilentlyContinue
$pngCount = 0
foreach ($png in $pngFiles) {
    $jpgPath = $png.FullName -replace '\.png$', '.jpg'
    if (Test-Path $jpgPath) {
        Remove-Item $png.FullName -Force
        $pngCount++
    }
}
Write-Host "Deleted $pngCount PNG files." -ForegroundColor Green

Write-Host "`nCleanup complete! The site folder is now ready to be committed." -ForegroundColor Cyan
