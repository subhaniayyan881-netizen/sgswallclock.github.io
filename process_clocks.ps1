Add-Type -AssemblyName System.Drawing

function Crop-ImageToCircle {
    param(
        [string]$ImagePath,
        [string]$OutputPath
    )
    
    try {
        $image = [System.Drawing.Image]::FromFile($ImagePath)
        $width = $image.Width
        $height = $image.Height
        $size = [Math]::Min($width, $height)
        
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $bitmap.MakeTransparent([System.Drawing.Color]::White)
        
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.Clear([System.Drawing.Color]::Transparent)
        
        $left = ($width - $size) / 2
        $top = ($height - $size) / 2
        
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $size, $size)
        
        $graphics.SetClip($path)
        
        $sourceRect = New-Object System.Drawing.Rectangle($left, $top, $size, $size)
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $graphics.DrawImage($image, $destRect, $sourceRect, [System.Drawing.GraphicsUnit]::Pixel)
        
        $pngPath = $OutputPath -replace '\.(jpg|jpeg)$', '.png'
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        $graphics.Dispose()
        $bitmap.Dispose()
        $image.Dispose()
        
        Write-Host "Processed: $(Split-Path $ImagePath -Leaf)"
    }
    catch {
        Write-Host "Error: $_"
    }
}

$assetsDir = Split-Path -Parent $MyInvocation.MyCommand.Path | Join-Path -ChildPath 'assets'
$clockImages = @('clock-black-gold.jpeg', 'clock-lcd.jpeg', 'clock-white.jpeg')

foreach ($clockName in $clockImages) {
    $inputPath = Join-Path -Path $assetsDir -ChildPath $clockName
    if (Test-Path $inputPath) {
        Crop-ImageToCircle -ImagePath $inputPath -OutputPath $inputPath
    }
}

Write-Host "Done!"
