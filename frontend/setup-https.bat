@echo off
echo ==========================================
echo   CAI DAT HTTPS CHO CAMERA TREN DIEN THOAI
echo ==========================================
echo.

REM Kiem tra xem mkcert da duoc cai dat chua
where mkcert >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] mkcert chua duoc cai dat!
    echo.
    echo Vui long cai dat mkcert truoc:
    echo 1. Cai dat Chocolatey: https://chocolatey.org/install
    echo 2. Chay lenh: choco install mkcert
    echo.
    echo Hoac tai truc tiep: https://github.com/FiloSottile/mkcert/releases
    pause
    exit /b 1
)

echo [1/3] Cai dat CA root certificate...
mkcert -install

echo.
echo [2/3] Tao SSL certificate cho IP 192.168.2.11...
mkcert 192.168.2.11 localhost 127.0.0.1

echo.
echo [3/3] Hoan thanh!
echo.
echo ==========================================
echo   HUONG DAN SU DUNG
echo ==========================================
echo.
echo 1. Cap nhat file vite.config.js voi noi dung sau:
echo.
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo import fs from 'fs'
echo import path from 'path'
echo.
echo export default defineConfig({
echo   plugins: [react()],
echo   server: {
echo     host: true,
echo     port: 5173,
echo     https: {
echo       key: fs.readFileSync(path.resolve(__dirname, '192.168.2.11+2-key.pem')),
echo       cert: fs.readFileSync(path.resolve(__dirname, '192.168.2.11+2.pem')),
echo     },
echo   },
echo })
echo.
echo 2. Chay lai frontend: npm run dev
echo.
echo 3. Truy cap tren dien thoai: https://192.168.2.11:5173
echo    (Chu y: https thay vi http)
echo.
echo 4. Neu co canh bao certificate, chon "Advanced" -^> "Proceed"
echo.
echo 5. Cho phep quyen camera khi website yeu cau
echo.
echo ==========================================
pause
