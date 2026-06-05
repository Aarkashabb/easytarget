# PowerShell script to optimize images using ImageMagick or FFmpeg
# Install ImageMagick: https://imagemagick.org/script/download.php#windows

$imgPath = "hugo/static/img/workflows"
$webpQuality = 80

# Check if magick is available
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ImageMagick not found. Install from: https://imagemagick.org/script/download.php#windows" -ForegroundColor Red
    exit 1
}

Write-Host "🖼️  Converting PNG to WebP..." -ForegroundColor Cyan
Write-Host "📁 Working directory: $imgPath" -ForegroundColor Gray

Get-ChildItem "$imgPath/*.png" | ForEach-Object {
    $inputFile = $_.FullName
    $outputFile = $inputFile -replace '\.png$', '.webp'
    $inputSize = (Get-Item $inputFile).Length / 1KB

    Write-Host "`n Converting: $($_.Name)" -ForegroundColor Yellow
    magick convert "$inputFile" -quality $webpQuality "$outputFile"

    $outputSize = (Get-Item $outputFile).Length / 1KB
    $saved = [Math]::Round(100 - ($outputSize / $inputSize * 100), 1)

    Write-Host "  Input:  $([Math]::Round($inputSize, 1)) KB" -ForegroundColor Gray
    Write-Host "  Output: $([Math]::Round($outputSize, 1)) KB" -ForegroundColor Green
    Write-Host "  Saved:  $saved%" -ForegroundColor Green
}

Write-Host "`n✅ Image optimization complete!" -ForegroundColor Green
Write-Host "`n📊 Total sizes:" -ForegroundColor Cyan
Write-Host "  PNG total: $([Math]::Round((Get-ChildItem "$imgPath/*.png" | Measure-Object -Property Length -Sum).Sum / 1KB, 1)) KB"
Write-Host "  WebP total: $([Math]::Round((Get-ChildItem "$imgPath/*.webp" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1KB, 1)) KB"
