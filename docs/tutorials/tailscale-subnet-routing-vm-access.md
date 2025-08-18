---
sidebar_position: 21
---

# Truy Cập Máy Tính Không Cài Đặt Tailscale Bằng Subnet Routing

Trong một số trường hợp, bạn cần truy cập từ xa vào các thiết bị trong mạng nội bộ mà không thể cài đặt Tailscale trực tiếp trên chúng. Điều này thường xảy ra với:

- Máy ảo (VM) cũ hoặc có hạn chế quyền truy cập
- Máy chủ riêng tư (private server) không cho phép cài đặt phần mềm bổ sung
- Thiết bị nhúng hoặc IoT device
- Máy chủ production có chính sách bảo mật nghiêm ngặt

Tailscale cung cấp tính năng **Subnet Routing** cho phép bạn truy cập các thiết bị này thông qua một máy chủ trung gian đã cài đặt Tailscale.

## 1. Chuẩn Bị Môi Trường

### 1.1. Yêu Cầu Hệ Thống

- Một máy chủ trung gian (host) có thể cài đặt Tailscale
- Máy chủ này phải có kết nối mạng đến các thiết bị cần truy cập
- Quyền quản trị (sudo) trên máy chủ trung gian

### 1.2. Sơ Đồ Mạng Mẫu

```
Internet ↔ Tailscale Network ↔ Host (192.168.11.1) ↔ VM/Server (192.168.11.36)
```

## 2. Cấu Hình Tailscale Trên Máy Chủ Trung Gian

### 2.1. Cài Đặt Tailscale

Nếu chưa cài đặt Tailscale, thực hiện lệnh sau:

```bash
# Trên Ubuntu/Debian
curl -fsSL https://tailscale.com/install.sh | sh

# Hoặc trên CentOS/RHEL
curl -fsSL https://pkgs.tailscale.com/stable/centos/7/tailscale.repo | sudo tee /etc/yum.repos.d/tailscale.repo
sudo yum install tailscale
```

### 2.2. Kích Hoạt Subnet Routing

Khởi động Tailscale với tùy chọn quảng bá dải mạng:

```bash
# Trên máy host
sudo tailscale up --advertise-routes=192.168.11.0/24 --accept-routes
```

**Lưu ý**: Thay thế `192.168.11.0/24` bằng dải mạng thực tế mà VM/server đang sử dụng.

### 2.3. Kiểm Tra Trạng Thái

```bash
tailscale status
```

Bạn sẽ thấy thông tin về các route đã được quảng bá.

## 3. Phê Duyệt Subnet Routes Trong Admin Console

### 3.1. Truy Cập Admin Console

1. Vào [https://login.tailscale.com/admin/machines](https://login.tailscale.com/admin/machines)
2. Đăng nhập với tài khoản Tailscale của bạn

### 3.2. Enable Subnet Routes

1. Tìm máy host của bạn trong danh sách
2. Click vào máy đó để xem chi tiết
3. Tìm phần "Subnet routes" 
4. Enable dải mạng `192.168.11.0/24` đã advertise

## 4. Cấu Hình IP Forwarding cho Linux

IP Forwarding là **bắt buộc** để máy chủ trung gian có thể chuyển tiếp gói tin giữa mạng Tailscale và mạng nội bộ.

### 4.1. Enable IP Forwarding Tạm Thời

```bash
# Trên máy host Linux
sudo sysctl net.ipv4.ip_forward=1
```

### 4.2. Enable IP Forwarding Vĩnh Viễn

```bash
# Thêm vào file cấu hình
echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 4.3. Kiểm Tra Cấu Hình

```bash
cat /proc/sys/net/ipv4/ip_forward
# Kết quả phải là 1
```

## 5. Cấu Hình Firewall Trên Thiết Bị Đích

### 5.1. Kiểm Tra Trạng Thái Firewall

```bash
# Trên VM/server đích
sudo ufw status
```

### 5.2. Mở Các Cổng Cần Thiết

```bash
# Nếu firewall đang active, cần allow các ports cần thiết
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3389  # RDP (nếu là Windows)
```

### 5.3. Cho Phép Traffic Từ Dải Mạng Cụ Thể

```bash
# Cho phép toàn bộ traffic từ dải Tailscale
sudo ufw allow from 100.64.0.0/10
```

## 6. Kết Luận

Bằng cách sử dụng tính năng Subnet Routing của Tailscale, bạn có thể:

- Truy cập các thiết bị không thể cài Tailscale một cách an toàn
- Mở rộng mạng Tailscale đến các hệ thống legacy
- Tạo bridge giữa cloud và on-premises infrastructure
- Simplified management cho các môi trường phức tạp

Phương pháp này đặc biệt hữu ích trong các trường hợp:
- Quản lý máy ảo từ xa
- Truy cập server production qua VPN an toàn
- Integration với hệ thống hiện có mà không cần thay đổi infrastructure

**Lưu ý**: Luôn tuân thủ chính sách bảo mật của tổ chức và test kỹ lưỡng trước khi triển khai trên môi trường production.
