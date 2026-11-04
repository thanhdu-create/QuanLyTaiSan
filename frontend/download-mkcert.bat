@echo off
echo ==========================================
echo   TU DONG TAI VA CAI DAT MKCERT
echo ==========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Script nay can quyen Administrator!
    echo Vui long:
    echo 1. Click phai vao file download-mkcert.bat
    echo 2. Chon "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo [1/3] Dang tai mkcert tu GitHub...
powershell -Command "& {Invoke-WebRequest -Uri 'https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-windows-amd64.exe' -OutFile 'mkcert.exe'}"

if not exist "mkcert.exe" (
    echo [ERROR] Khong the tai mkcert!
    echo Vui long kiem tra ket noi internet.
    pause
    exit /b 1
)

echo.
echo [2/3] Dang chuyen mkcert vao System32...
copy mkcert.exe C:\Windows\System32\mkcert.exe

if %errorlevel% neq 0 (
    echo [ERROR] Khong the copy file vao System32!
    echo Vui long chay lai script voi quyen Administrator.
    pause
    exit /b 1
)

echo.
echo [3/3] Xoa file tam...
del mkcert.exe

echo.
echo ==========================================
echo   CAI DAT THANH CONG!
echo ==========================================
echo.
echo Kiem tra phien ban:
mkcert -version

echo.
echo Tiep theo, chay lenh:
echo   .\setup-https.bat
echo.
pause
