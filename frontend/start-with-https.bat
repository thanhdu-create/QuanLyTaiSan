@echo off
chcp 65001 >nul
echo ==========================================
echo   KHỞI ĐỘNG FRONTEND VỚI HTTPS
echo   (Sử dụng ngrok - Không cần quyền Admin)
echo ==========================================
echo.

REM Kiểm tra xem ngrok đã có chưa
if not exist "ngrok.exe" (
    echo [1/3] Đang tải ngrok...
    echo Vui lòng đợi...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile 'ngrok.zip'}"
    
    if not exist "ngrok.zip" (
        echo [LỖI] Không thể tải ngrok!
        echo.
        echo Vui lòng:
        echo 1. Kiểm tra kết nối internet
        echo 2. Hoặc tải thủ công từ: https://ngrok.com/download
        echo 3. Giải nén file ngrok.exe vào thư mục frontend
        pause
        exit /b 1
    )
    
    echo [2/3] Đang giải nén...
    powershell -Command "Expand-Archive -Path 'ngrok.zip' -DestinationPath '.' -Force"
    del ngrok.zip
    echo Đã cài đặt ngrok thành công!
    echo.
)

echo [3/3] Đang khởi động...
echo.
echo ==========================================
echo   HƯỚNG DẪN
echo ==========================================
echo.
echo 1. Đang mở 2 cửa sổ:
echo    - Frontend (npm run dev)
echo    - Ngrok (tạo HTTPS tunnel)
echo.
echo 2. Chờ frontend khởi động xong
echo.
echo 3. Trong cửa sổ ngrok, tìm dòng:
echo    "Forwarding: https://XXXXX.ngrok-free.app"
echo.
echo 4. Copy URL đó và mở trên điện thoại
echo.
echo 5. Click "Visit Site" trên trang ngrok
echo.
echo 6. Camera sẽ hoạt động! 📱
echo.
echo ==========================================
echo.
pause

REM Mở frontend trong terminal mới
start cmd /k "title FRONTEND && cd /d %~dp0 && npm run dev"

REM Đợi 5 giây để frontend khởi động
echo Đang đợi frontend khởi động...
timeout /t 5 /nobreak >nul

REM Chạy ngrok
echo.
echo Đang khởi động ngrok...
echo.
start cmd /k "title NGROK - HTTPS && cd /d %~dp0 && ngrok http 5173"

echo.
echo ==========================================
echo   ĐÃ KHỞI ĐỘNG!
echo ==========================================
echo.
echo Kiểm tra cửa sổ NGROK để lấy URL HTTPS
echo.
