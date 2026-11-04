# Hướng dẫn cài đặt mkcert cho Windows (Không cần Chocolatey)

## Cách 1: Tải trực tiếp file .exe (Nhanh nhất)

### Bước 1: Tải mkcert
1. Truy cập: https://github.com/FiloSottile/mkcert/releases/latest
2. Tải file: **mkcert-v1.4.4-windows-amd64.exe** (hoặc phiên bản mới nhất)
3. Đổi tên file thành: **mkcert.exe**
4. Di chuyển file vào thư mục: `C:\Windows\System32\` 
   (Cần quyền Administrator - click phải chọn "Run as administrator" khi copy)

### Bước 2: Kiểm tra cài đặt
Mở PowerShell (hoặc CMD) và chạy:
```bash
mkcert -version
```

Nếu hiển thị version → Cài đặt thành công!

### Bước 3: Chạy script setup
```bash
cd frontend
.\setup-https.bat
```

---

## Cách 2: Cài đặt Chocolatey rồi dùng choco install

### Bước 1: Cài đặt Chocolatey
1. Mở PowerShell **AS ADMINISTRATOR** (Click phải → Run as Administrator)
2. Chạy lệnh:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

3. Đợi cài đặt hoàn tất (khoảng 1-2 phút)

### Bước 2: Cài mkcert
```bash
choco install mkcert
```

### Bước 3: Chạy script setup
```bash
cd frontend
.\setup-https.bat
```

---

## Sau khi cài đặt mkcert thành công

Chạy các lệnh sau trong thư mục `frontend`:

```bash
# Bước 1: Cài đặt CA root
mkcert -install

# Bước 2: Tạo certificate cho IP của bạn
mkcert 192.168.2.11 localhost 127.0.0.1
```

Sẽ tạo ra 2 file:
- `192.168.2.11+2.pem`
- `192.168.2.11+2-key.pem`

---

## Hoặc dùng giải pháp KHÔNG cần mkcert - Dùng ngrok (Đơn giản nhất)

### Cài ngrok:
1. Truy cập: https://ngrok.com/download
2. Tải file ngrok-v3-stable-windows-amd64.zip
3. Giải nén ra được file `ngrok.exe`
4. Copy file vào thư mục dự án hoặc `C:\Windows\System32\`

### Chạy ngrok:
```bash
# Trong thư mục frontend (sau khi chạy npm run dev)
ngrok http 5173
```

Ngrok sẽ tạo URL HTTPS như: `https://abc123.ngrok.io`

Truy cập URL này trên điện thoại → Camera hoạt động ngay!

**Ưu điểm ngrok:**
- Không cần cài đặt certificate
- Không cần config gì thêm
- Có thể share link cho người khác test
- HTTPS tự động

**Nhược điểm:**
- URL thay đổi mỗi lần chạy (trừ khi có tài khoản trả phí)
- Cần internet để chạy
- Phụ thuộc vào dịch vụ bên thứ 3
