Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\98996\OneDrive\Desktop\startup\lussovi\mobile\metaverse\anime_image\female_singer.png")
$w = $img.Width
$h = $img.Height
Write-Output "female_singer: ${w}x${h}"
$img.Dispose()
