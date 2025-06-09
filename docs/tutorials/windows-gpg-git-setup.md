---
sidebar_position: 6
---

# Thiết Lập GPG Signing Cho Git Trên Windows

Hướng dẫn chi tiết cách thiết lập và sử dụng GPG để ký commit trên Windows bằng Gpg4win (Kleopatra) và tích hợp với Git.

## Tổng Quan

GPG (GNU Privacy Guard) cho phép bạn ký số các commit Git để xác thực danh tính tác giả. Trên Windows, bạn có thể sử dụng **Gpg4win** (bao gồm **Kleopatra**) để tạo và quản lý GPG key, sau đó tích hợp với Git Bash.

## 1. Cài Đặt Gpg4win

### Bước 1: Tải Gpg4win

1. **Truy cập trang web chính thức:**
   ```
   https://www.gpg4win.org/
   ```

2. **Tải phiên bản mới nhất**
   - Chọn phiên bản phù hợp với hệ điều hành (32-bit hoặc 64-bit)

### Bước 2: Cài Đặt

1. **Chạy file cài đặt** với quyền Administrator
2. **Chọn cài đặt đầy đủ** bao gồm:
   - ✅ Kleopatra (giao diện quản lý key)
   - ✅ GnuPG (core GPG functionality)
   - ✅ GpgOL (tùy chọn - cho Outlook)
   - ✅ GpgEX (tùy chọn - tích hợp Windows Explorer)

3. **Khởi động Kleopatra** sau khi cài đặt hoàn tất

## 2. Tạo Cặp Khóa GPG

### Bước 1: Tạo Certificate Mới

1. **Mở Kleopatra**
2. **Chọn menu:**
   ```
   File → New Certificate
   ```

3. **Chọn loại certificate:**
   ```
   Create a personal OpenPGP key pair
   ```
   Nhấn **Next**

### Bước 2: Nhập Thông Tin Cá Nhân

1. **Your Name:** Tên hiển thị của bạn
2. **Email address:** 
   ⚠️ **Quan trọng:** Phải trùng với email bạn sử dụng trên GitHub
3. Nhấn **Next**

### Bước 3: Cấu Hình Key

1. **Key type:** RSA (khuyến nghị)
2. **Key size:** **4096 bits** (bảo mật cao nhất)
3. **Valid until:** Thời hạn key (ví dụ: 1 năm)
4. Nhấn **Next**

### Bước 4: Thiết Lập Passphrase

1. **Nhập passphrase mạnh** (mật khẩu để bảo vệ private key)
2. **Xác nhận passphrase**
3. Kleopatra sẽ bắt đầu tạo key

### Bước 5: Backup Key (Khuyến Nghị)

Sau khi tạo xong, Kleopatra sẽ hỏi có muốn export private key:
- ✅ **Nên export** để sao lưu an toàn
- Lưu file backup ở nơi bảo mật

## 3. Lấy Thông Tin Key

### Bước 1: Lấy Key ID

1. **Trong Kleopatra, chọn key vừa tạo**
2. **Nhấn nút "Details"**
3. **Ghi nhớ "Key ID"** (ví dụ: `ABCDEF1234567890`)

### Bước 2: Xuất Public Key

1. **Chọn key trong danh sách**
2. **Nhấn nút "Export..."**
3. **Chọn định dạng:**
   ```
   ASCII armored (*.asc)
   ```
4. **Lưu file** (ví dụ: `mykey.pub.asc`)

### Bước 3: Copy Public Key Content

1. **Mở file `.asc` bằng Notepad**
2. **Copy toàn bộ nội dung** từ:
   ```
   -----BEGIN PGP PUBLIC KEY BLOCK-----
   ```
   đến:
   ```
   -----END PGP PUBLIC KEY BLOCK-----
   ```

## 4. Thêm GPG Key Lên GitHub

### Bước 1: Truy Cập GitHub Settings

1. **Đăng nhập GitHub**
2. **Vào Settings** (góc phải trên → Settings)
3. **Chọn "SSH and GPG keys"** trong sidebar trái

### Bước 2: Thêm GPG Key

1. **Nhấn "New GPG key"**
2. **Dán public key content** đã copy
3. **Nhấn "Add GPG key"**
4. **Xác nhận** bằng password GitHub nếu được yêu cầu

## 5. Cấu Hình Git

### Bước 1: Thiết Lập Key ID

Mở **Git Bash** và chạy các lệnh sau:

```bash
# Thiết lập key id (thay bằng Key ID của bạn)
git config --global user.signingkey ABCDEF1234567890

# Cho phép ký tự động cho mọi commit
git config --global commit.gpgsign true
```

### Bước 2: Cấu Hình Đường Dẫn GPG

```bash
# Cấu hình để Git tìm được gpg.exe
git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
```

### Kiểm Tra Đường Dẫn GPG

Nếu lệnh trên không hoạt động, hãy kiểm tra đường dẫn thực tế:

**Các vị trí có thể:**
- `C:\Program Files\GnuPG\bin\gpg.exe`
- `C:\Program Files (x86)\GnuPG\bin\gpg.exe`
- `C:\Program Files\Gpg4win\bin\gpg.exe`

**Kiểm tra bằng Windows Explorer:**
```bash
# Kiểm tra GPG có hoạt động không
gpg --version
```

## 6. Thử Nghiệm GPG Signing

### Bước 1: Tạo Test Commit

```bash
# Tạo commit rỗng để test
git commit --allow-empty -m "Test ký GPG"
```

Vì đã bật `commit.gpgsign true`, Git sẽ tự động hỏi passphrase.

### Bước 2: Kiểm Tra Chữ Ký

```bash
# Kiểm tra chữ ký của commit cuối
git log --show-signature -1
```

**Kết quả thành công:**
```
gpg: Good signature from "Tên Của Bạn <email@example.com>"
```

### Bước 3: Kiểm Tra Trên GitHub

1. **Push commit lên GitHub**
2. **Xem commit trên web interface**
3. **Commit sẽ có badge "Verified"** ✅

## 7. Tối Ưu Passphrase Management

### Phương Pháp 1: Cấu Hình Cache Trong Kleopatra

1. **Mở Kleopatra**
2. **Settings → Configure Kleopatra**
3. **GnuPG System → Private Keys**
4. **Thiết lập cache time** (ví dụ: 600 giây)

### Phương Pháp 2: Cấu Hình gpg-agent.conf

1. **Tạo file cấu hình:**
   ```
   C:\Users\<username>\.gnupg\gpg-agent.conf
   ```

2. **Thêm nội dung:**
   ```
   default-cache-ttl 600
   max-cache-ttl 7200
   ```

3. **Khởi động lại agent:**
   ```bash
   gpg-connect-agent reloadagent /bye
   ```

## 8. Sử Dụng Hàng Ngày

### Commit Với Auto-Signing

```bash
# Commit sẽ tự động được ký
git commit -m "Nội dung commit"
```

### Commit Với Manual Signing

```bash
# Ký thủ công (nếu chưa bật auto-sign)
git commit -S -m "Nội dung commit"
```

### Kiểm Tra Tất Cả Commits

```bash
# Xem tất cả commits với signature
git log --show-signature
```

## 9. Troubleshooting

### Lỗi: "gpg failed to sign the data"

**Nguyên nhân:** Git không tìm thấy GPG hoặc key không đúng

**Giải pháp:**
1. Kiểm tra đường dẫn GPG:
   ```bash
   git config --global gpg.program "C:/Program Files (x86)/GnuPG/bin/gpg.exe"
   ```

2. Kiểm tra Key ID:
   ```bash
   git config --global user.signingkey YOUR_KEY_ID
   ```

### Lỗi: "No secret key"

**Nguyên nhân:** Private key không có sẵn

**Giải pháp:**
1. Kiểm tra key trong Kleopatra
2. Đảm bảo private key chưa bị xóa
3. Import lại private key từ backup nếu cần

### Lỗi: "Inappropriate ioctl for device"

**Nguyên nhân:** TTY configuration issue

**Giải pháp:**
```bash
export GPG_TTY=$(tty)
echo 'export GPG_TTY=$(tty)' >> ~/.bashrc
```

### Passphrase Không Được Hỏi

**Giải pháp:**
1. Restart gpg-agent:
   ```bash
   gpg-connect-agent reloadagent /bye
   ```

2. Kiểm tra pinentry program:
   ```bash
   echo "GETINFO version" | gpg-connect-agent
   ```

## 10. Bảo Mật Best Practices

### 1. Bảo Vệ Private Key
- ✅ Sử dụng passphrase mạnh
- ✅ Backup private key an toàn
- ✅ Không chia sẻ private key

### 2. Quản Lý Key Lifecycle
- ✅ Thiết lập expiration date
- ✅ Revoke key cũ khi cần
- ✅ Update key trên GitHub khi đổi

### 3. Team Collaboration
- ✅ Chỉ chia sẻ public key
- ✅ Verify signatures của team members
- ✅ Document key management process

## Kết Luận

Việc thiết lập GPG signing cho Git trên Windows giúp:

- **Xác thực danh tính** commit author
- **Tăng độ tin cậy** trong team collaboration
- **Đảm bảo integrity** của code history
- **Hiển thị "Verified" badge** trên GitHub

Sau khi hoàn thành setup, mọi commit của bạn sẽ được ký tự động và hiển thị trạng thái "Verified" trên GitHub, tăng độ tin cậy cho các contributors khác trong dự án. 