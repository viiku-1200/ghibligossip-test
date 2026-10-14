Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\98996\OneDrive\Desktop\startup\lussovi\mobile\metaverse\anime_image\female_singer.png")
$bmp = new-object System.Drawing.Bitmap($img)

$inSprite = $false
$startX = 0
$sprites = @()

for ($x = 0; $x -lt $bmp.Width; $x++) {
    $hasContent = $false
    for ($y = 0; $y -lt 305; $y++) {
        if ($bmp.GetPixel($x, $y).A -gt 20) {
            $hasContent = $true
            break
        }
    }
    
    if ($hasContent -and -not $inSprite) {
        $inSprite = $true
        $startX = $x
    }
    elseif (-not $hasContent -and $inSprite) {
        $inSprite = $false
        $w = $x - $startX
        $sprites += @{ start = $startX; end = ($x - 1); width = $w }
    }
}
if ($inSprite) {
    $w = $bmp.Width - $startX
    $sprites += @{ start = $startX; end = ($bmp.Width - 1); width = $w }
}

$i = 1
foreach ($s in $sprites) {
    Write-Output "Frame $i : x=$($s.start), w=$($s.width)"
    $i++
}

$bmp.Dispose()
$img.Dispose()
