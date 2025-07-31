---
sidebar_position: 13
---

# Backup và Restore Private Key GPG trên Windows với GPG4win

Khi làm việc với GPG key signing trên Windows, việc backup và restore private key là rất quan trọng để không mất khả năng ký commit hoặc giải mã dữ liệu. Bài viết này hướng dẫn chi tiết cách xử lý lỗi "No secret key" và backup/restore private key đúng cách.

## 1. Hiểu về lỗi "No secret key"

### 1.1 Triệu chứng lỗi phổ biến

Khi thực hiện lệnh Git commit với GPG signing:

```bash
git commit --allow-empty -m "Test ký GPG"
```

Bạn có thể gặp lỗi:

```
error: gpg failed to sign the data:
gpg: skipped "4E238EC3489F5F71": No secret key
[GNUPG:] INV_SGNR 9 4E238EC3489F5F71
[GNUPG:] FAILURE sign 17
gpg: signing failed: No secret key
fatal: failed to write commit object
```

### 1.2 Nguyên nhân gây lỗi

- **Chỉ có public key**: Đã import public key nhưng thiếu private key
- **Key không khớp**: Git config sử dụng key ID không tồn tại trong keyring
- **GPG program sai**: Git đang sử dụng GPG version khác với nơi lưu keys
- **Key bị hỏng**: Private key bị corrupted hoặc không đầy đủ

## 2. Kiểm tra và chẩn đoán

### 2.1 Kiểm tra keys hiện có

```bash
# Liệt kê public keys
gpg --list-keys --keyid-format LONG

# Liệt kê private keys (secret keys)
gpg --list-secret-keys --keyid-format LONG
```

### 2.2 Kiểm tra Git configuration

```bash
# Xem GPG program Git đang dùng
git config --global gpg.program

# Xem signing key được config
git config --global user.signingkey

# Xem có auto-sign không
git config --global commit.gpgsign
```

### 2.3 Kiểm tra trong Cleopatra

1. Mở **Cleopatra** (GPG4win)
2. Vào tab **"My Certificates"**
3. Tìm key của bạn và kiểm tra biểu tượng:
   - 🔑 **Chìa khóa**: Có cả public + private key
   - 🔒 **Ổ khóa**: Chỉ có public key

## 3. Vị trí lưu trữ Private Key trên Windows

### 3.1 Thư mục GPG home directory

GPG4win lưu private keys tại:

```
%APPDATA%\gnupg\
```

Thường là:
```
C:\Users\[username]\AppData\Roaming\gnupg\
```

### 3.2 Cấu trúc files quan trọng

| File | Mô tả |
|------|-------|
| `pubring.kbx` | Public keyring (GPG 2.1+) |
| `private-keys-v1.d\` | Thư mục chứa private keys |
| `trustdb.gpg` | Trust database |
| `gpg.conf` | Configuration file |

**⚠️ Lưu ý**: Không nên copy trực tiếp các files này vì có thể gây lỗi.

## 4. Export Private Key (Backup)

### 4.1 Export qua Cleopatra (GUI)

1. Mở **Cleopatra**
2. Right-click vào key cần backup
3. Chọn **"Export Secret Keys..."** (KHÔNG chọn "Export" thường)
4. Chọn vị trí lưu và đặt tên file (ví dụ: `my-private-key.asc`)
5. Nhập passphrase để bảo vệ private key
6. Lưu file backup

### 4.2 Export qua Command Line

```bash
# Export private key với key ID cụ thể
gpg --export-secret-keys 4E238EC3489F5F71 > private-key.asc

# Export với ASCII armor (text format)
gpg --armor --export-secret-keys 4E238EC3489F5F71 > private-key.asc

# Export full backup (bao gồm trust database)
gpg --output backupkeys.pgp --armor --export-secret-keys --export-options export-backup user@example.com
```

### 4.3 Backup toàn bộ GPG directory (tùy chọn)

```bash
# Copy toàn bộ thư mục gnupg
robocopy "%APPDATA%\gnupg" "D:\Backup\gnupg" /E /COPY:DAT

# Hoặc dùng PowerShell
Copy-Item -Path "$env:APPDATA\gnupg" -Destination "D:\Backup\gnupg" -Recurse
```

## 5. Import Private Key (Restore)

### 5.1 Import qua Cleopatra

1. Mở **Cleopatra**
2. Chọn **File → Import Certificates**
3. Chọn file private key đã backup (`.asc`, `.gpg`, `.pgp`)
4. Nhập passphrase nếu được yêu cầu
5. Đặt passphrase mới để bảo vệ key sau import
6. Xác nhận import thành công

### 5.2 Import qua Command Line

```bash
# Import private key
gpg --import private-key.asc

# Import với verbose output
gpg --import --verbose private-key.asc

# Import từ backup file
gpg --import backupkeys.pgp
```

### 5.3 Kiểm tra sau import

```bash
# Verify private key đã được import
gpg --list-secret-keys --keyid-format LONG

# Test ký thử
echo "test message" | gpg --clearsign
```

## 6. Cấu hình Git sau restore

### 6.1 Cập nhật Git configuration

```bash
# Set signing key
git config --global user.signingkey 4E238EC3489F5F71

# Enable auto-signing
git config --global commit.gpgsign true

# Cấu hình GPG program
git config --global gpg.program "C:\Program Files (x86)\GnuPG\bin\gpg.exe"
```

### 6.2 Alternative GPG program paths

```bash
# Cho Git for Windows bundled GPG
git config --global gpg.program "/c/Program Files/Git/usr/bin/gpg.exe"

# Cho GPG4win installation
git config --global gpg.program "C:\Program Files\GnuPG\bin\gpg.exe"
```