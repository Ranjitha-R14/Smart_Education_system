$ErrorActionPreference = "Stop"
try {
  $src  = Split-Path -Parent $MyInvocation.MyCommand.Path
  $dest = Join-Path $env:LOCALAPPDATA "SmartEducationPortal"

  # 1. Copy the app to a permanent place (so you can delete the downloaded folder afterwards)
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  New-Item -ItemType Directory -Path $dest | Out-Null
  Copy-Item -Path (Join-Path $src "*") -Destination $dest -Recurse -Force

  # 2. Find Microsoft Edge (built into Windows) or Google Chrome
  $candidates = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
  )
  $browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $browser) { throw "Microsoft Edge or Google Chrome was not found on this PC." }

  # 3. Create desktop + Start menu shortcuts that open the portal in its own app window
  $url  = ([System.Uri](Join-Path $dest "index.html")).AbsoluteUri
  $icon = Join-Path $dest "images\app.ico"
  $ws   = New-Object -ComObject WScript.Shell
  $folders = @(
    [Environment]::GetFolderPath("Desktop"),
    (Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs")
  )
  foreach ($f in $folders) {
    $lnk = $ws.CreateShortcut((Join-Path $f "Smart Education Portal.lnk"))
    $lnk.TargetPath       = $browser
    $lnk.Arguments        = "--app=`"$url`""
    $lnk.IconLocation     = $icon
    $lnk.WorkingDirectory = $dest
    $lnk.Description      = "Smart Education Portal"
    $lnk.Save()
  }
  Write-Host "  Done! 'Smart Education Portal' is now on your Desktop and Start menu." -ForegroundColor Green
  Start-Process $browser -ArgumentList "--app=`"$url`""
} catch {
  Write-Host "  Install failed: $($_.Exception.Message)" -ForegroundColor Red
}
