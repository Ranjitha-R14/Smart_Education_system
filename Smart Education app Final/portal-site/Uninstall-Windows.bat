@echo off
powershell -NoProfile -Command "Remove-Item \"$env:LOCALAPPDATA\SmartEducationPortal\" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item ([Environment]::GetFolderPath('Desktop')+'\Smart Education Portal.lnk') -ErrorAction SilentlyContinue; Remove-Item ($env:APPDATA+'\Microsoft\Windows\Start Menu\Programs\Smart Education Portal.lnk') -ErrorAction SilentlyContinue"
echo Smart Education Portal has been removed.
pause
