Add-Type -AssemblyName System.Drawing
$sheet = [System.Drawing.Image]::FromFile("c:\Users\98996\OneDrive\Desktop\startup\lussovi\mobile\metaverse\anime_image\female_singer.png")
$w = $sheet.Width
$h = $sheet.Height
Write-Output "female_singer.png: ${w}x${h}"
$sheet.Dispose()
