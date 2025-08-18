---
sidebar_position: 20
---

#  Sử dụng S3Express để upload image lên DigitalOcean Spaces

## 1. Giới thiệu

S3Express là công cụ command line cho Windows để quản lý Amazon S3 và các dịch vụ tương thích S3 như DigitalOcean Spaces. Công cụ này cung cấp bản trial 21 ngày miễn phí và hỗ trợ chính thức DigitalOcean Spaces.

**Tại sao cần S3Express:**
- doctl không hỗ trợ upload file lên Spaces
- Cần công cụ S3-compatible để tạo public URL cho custom image
- S3Express dễ cài đặt hơn s3cmd (không cần Python)

## 2. Cài đặt S3Express

### 2.1. Tải S3Express

1. Truy cập: https://www.s3express.com/download.htm
2. Tải phiên bản Windows mới nhất
3. Cài đặt vào thư mục mong muốn (ví dụ: `C:\S3Express\`)

### 2.2. Thêm vào PATH (Tùy chọn)

1. Mở **System Properties** → **Environment Variables**
2. Thêm đường dẫn S3Express vào **PATH**
3. Restart Command Prompt

## 3. Tạo DigitalOcean Spaces Access Keys

### 3.1. Tạo Spaces bucket

1. Đăng nhập DigitalOcean Control Panel
2. Chọn **Create** → **Spaces**
3. Đặt tên bucket, chọn region (nyc3, fra1, sgp1, etc.)
4. **Restrict File Listing** (khuyến nghị)

### 3.2. Tạo Spaces Access Keys

1. Vào **Manage** → **Spaces**
2. Chọn **Manage Keys** (góc phải màn hình)
3. Cuộn xuống **Spaces Access Keys**
4. Chọn **Generate New Key**
5. Đặt tên và lưu ngay **Access Key** và **Secret Key**

**Lưu ý:** Secret Key chỉ hiển thị một lần duy nhất.

## 4. Cấu hình S3Express

### 4.1. Khởi động S3Express

Mở Command Prompt và chạy:
```cmd
s3express
```

### 4.2. Set authorization

```cmd
/>saveauth YOUR_ACCESS_KEY YOUR_SECRET_KEY
```

### 4.3. Cấu hình endpoint và options

```cmd
/>setopt -endpoint:sgp1.digitaloceanspaces.com -region:us-east-1 -protocol:https -disablecertvalidation:on
```

**Các endpoint phổ biến:**
- Singapore: `sgp1.digitaloceanspaces.com`
- New York: `nyc3.digitaloceanspaces.com`
- Frankfurt: `fra1.digitaloceanspaces.com`
- Amsterdam: `ams3.digitaloceanspaces.com`

### 4.4. Kiểm tra cấu hình

```cmd
/>showopt
```

### 4.5. Test kết nối

```cmd
/>ls
```

## 5. Upload image lên Spaces

### 5.1. Upload với cấu hình tối ưu

Để tăng tốc độ upload, sử dụng nhiều threads và tối ưu multipart:

```cmd
/>put "C:\path\to\your\image.qcow2" your-bucket-name/ -cacl:public-read -t:4 -mul:100MB -nomd5existcheck
```

**Giải thích các tham số:**
- `-cacl:public-read`: Đặt quyền public để DigitalOcean có thể truy cập
- `-t:10`: Sử dụng 10 threads (thay vì 1 thread mặc định)
- `-mul:100MB`: Chia file thành các part 100MB cho multipart upload
- `-nomd5existcheck`: Bỏ qua kiểm tra MD5 để tránh lỗi checksum

### 5.2. Upload file lớn với cấu hình cao cấp

Cho file trên 1GB:

```cmd
/>put "C:\path\to\large-image.img" your-bucket-name/ -cacl:public-read -t:8 -mul:200MB -nomd5existcheck -nomulmd5
```

### 5.3. Kiểm tra upload

```cmd
/>ls your-bucket-name/
```

## 6. Xử lý lỗi thường gặp

### 6.1. Lỗi SSL Certificate

Nếu gặp lỗi SSL:
```cmd
/>setopt -disablecertvalidation:on
```

### 6.2. Lỗi XAmzContentSHA256Mismatch

Thử upload lại với:
```cmd
/>put "file.img" bucket/ -cacl:public-read -nomd5existcheck -nomulmd5 -t:2
```

### 6.3. Lỗi timeout cho file lớn

Tăng timeout:
```cmd
/>setopt -timeout:300
```

### 6.4. Xóa multipart uploads bị pending

```cmd
/>lsupl your-bucket-name/
/>rmupl your-bucket-name/
```

## 7. Tạo Custom Image từ Spaces URL

### 7.1. Lấy URL của image

Sau khi upload thành công, URL sẽ có dạng:
```
https://your-bucket-name.region.digitaloceanspaces.com/image-file.qcow2
```

Ví dụ:
```
https://viethungle.sgp1.digitaloceanspaces.com/ubuntu.qcow2
```

### 7.2. Tạo Custom Image bằng doctl

```cmd
doctl compute image create "Ubuntu Custom Image" --image-url "https://viethungle.sgp1.digitaloceanspaces.com/ubuntu.qcow2" --region sgp1
```

### 7.3. Kiểm tra Custom Image

```cmd
doctl compute image list --format ID,Name,Status
```

## 8. Dọn dẹp

### 8.1. Xóa file sau khi tạo image thành công

```cmd
/>del your-bucket-name/image-file.qcow2
```

### 8.2. Thoát S3Express

```cmd
/>quit
```

## 9. Lưu ý quan trọng

### 9.1. Yêu cầu về image format

- **Supported formats:** raw, qcow2, vhdx, vdi, vmdk
- **Kích thước tối đa:** 100GB khi giải nén
- **Hệ điều hành:** Unix-like OS (Linux, BSD, etc.)

### 9.2. Chi phí

- **S3Express:** Trial 21 ngày, sau đó cần mua license
- **DigitalOcean Spaces:** $5/tháng cho 250GB storage + 1TB transfer
- **Lưu ý:** Xóa file sau khi tạo image để tiết kiệm chi phí

### 9.3. Bảo mật

- Không chia sẻ Access Key và Secret Key
- Đặt file private sau khi tạo custom image (nếu cần)
- Sử dụng limited access keys nếu có thể

## 10. Workflow hoàn chỉnh

1. **Chuẩn bị image** đúng format (qcow2, raw, etc.)
2. **Cài đặt S3Express** và cấu hình DigitalOcean Spaces
3. **Upload image** với quyền public-read và tối ưu performance
4. **Tạo Custom Image** bằng doctl với Spaces URL
5. **Dọn dẹp** xóa file khỏi Spaces để tiết kiệm chi phí
6. **Tạo Droplet** từ Custom Image

Workflow này cho phép bạn upload image từ máy local lên DigitalOcean mà không cần sử dụng browser interface, phù hợp cho automation và CI/CD.