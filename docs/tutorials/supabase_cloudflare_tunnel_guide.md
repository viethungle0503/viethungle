---
sidebar_position: 17
---

# Cấu hình Cloudflare Tunnel cho Supabase Self-hosted

## 1. Tổng quan

Khi self-host Supabase, việc cấu hình HTTPS với domain tùy chỉnh thường gặp khó khăn do cần thiết lập SSL certificate và reverse proxy. Cloudflare Tunnel cung cấp một giải pháp đơn giản, cho phép truy cập Supabase qua HTTPS mà không cần cấu hình phức tạp.

### 1.1. Lợi ích của Cloudflare Tunnel

- **Tự động có HTTPS** qua Cloudflare
- **Không cần quản lý SSL certificate** thủ công
- **Bảo mật cao** với khả năng giới hạn truy cập
- **Dễ dàng setup và maintain**

### 1.2. Kiến trúc hệ thống

```
User → Cloudflare → Tunnel → Docker Network → Supabase Services
```

## 2. Yêu cầu trước khi bắt đầu

- Supabase đã được cài đặt và chạy bằng Docker
- Domain đã được thêm vào Cloudflare
- Truy cập vào Cloudflare Zero Trust Dashboard
- Docker và Docker Compose đã cài đặt

## 3. Tạo Cloudflare Tunnel

### 3.1. Truy cập Zero Trust Dashboard

1. Đăng nhập vào Cloudflare Dashboard
2. Chuyển đến **Zero Trust** → **Networks** → **Tunnels**
3. Click **"Create a tunnel"**

### 3.2. Cấu hình Tunnel

1. Chọn **"Cloudflared"** → Next
2. Đặt tên tunnel (ví dụ: `supabase-tunnel`)
3. Click **"Save tunnel"**
4. Trong tab **"Install and run a connector"**, chọn **Docker**
5. **Copy token** từ lệnh Docker được generate (phần sau `--token`)

**Lưu ý:** Token này sẽ được sử dụng trong bước tiếp theo.

## 4. Thêm Cloudflared vào Docker Compose

### 4.1. Chỉnh sửa docker-compose.yml

Thêm service cloudflared vào file `docker-compose.yml` của Supabase:

```yaml
services:
  # ... các services khác của Supabase

  cloudflared:
    container_name: supabase-cloudflared
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token YOUR_TUNNEL_TOKEN_HERE
    networks:
      - default
```

**Thay `YOUR_TUNNEL_TOKEN_HERE`** bằng token đã copy từ bước 3.2.

### 4.2. Khởi động lại containers

```bash
cd supabase-project
docker compose down
docker compose up -d
```

## 5. Cấu hình Public Hostnames

### 5.1. Truy cập tab Public Hostnames

Quay lại Cloudflare Zero Trust Dashboard, vào tunnel vừa tạo và chuyển đến tab **"Public Hostnames"**.

### 5.2. Thêm hostname cho Supabase Studio

1. Click **"Add a public hostname"**
2. **Subdomain:** `supabase`
3. **Domain:** `rtrobotics.tech` (thay bằng domain của bạn)
4. **Service Type:** `HTTP`
5. **URL:** `studio:3000`
6. Click **"Save hostname"**

### 5.3. Thêm hostname cho Supabase API

1. Click **"Add a public hostname"**
2. **Subdomain:** `api`
3. **Domain:** `rtrobotics.tech` (thay bằng domain của bạn)  
4. **Service Type:** `HTTP`
5. **URL:** `kong:8000`
6. Click **"Save hostname"**

Cloudflare sẽ tự động thêm các CNAME records tương ứng trong DNS Records với định dạng như sau:
1. **Record 1:**
   - Type: `CNAME`
   - Name: `supabase`
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy status: **Proxied (Orange cloud)**

2. **Record 2:**
   - Type: `CNAME`
   - Name: `api`
   - Target: `YOUR_TUNNEL_ID.cfargotunnel.com`
   - Proxy status: **Proxied (Orange cloud)**

**Lưu ý:** 
- `YOUR_TUNNEL_ID` có thể tìm thấy trong URL tunnel hoặc trong dashboard.
- Sử dụng tên service Docker (`studio`, `kong`) thay vì `localhost` để đảm bảo connectivity trong Docker network.

## 7. Cập nhật cấu hình Supabase

### 7.1. Chỉnh sửa file .env

Cập nhật các biến môi trường trong file `.env` của Supabase:

```bash
# URL cho API endpoints (Kong gateway)
API_EXTERNAL_URL=https://api.rtrobotics.tech

# URL cho Supabase Studio dashboard  
SUPABASE_PUBLIC_URL=https://supabase.rtrobotics.tech

# Base URL của site (dùng cho auth redirects)
SITE_URL=https://supabase.rtrobotics.tech
URI_ALLOW_LIST=https://supabase.rtrobotics.tech
```
Xem thêm docs của Supabase dành cho từng front-end framwork: 
- https://supabase.com/docs/guides/auth/server-side
- https://github.com/supabase/auth

### 7.2. Ý nghĩa các biến môi trường

- **`API_EXTERNAL_URL`**: URL mà GoTrue (Auth service) sử dụng để tạo links trong email xác thực và các API calls. Đây là URL mà client applications sẽ sử dụng để kết nối với Supabase API.

- **`SUPABASE_PUBLIC_URL`**: URL để truy cập Supabase Studio dashboard.

- **`SITE_URL`**: URL cơ sở của website/application, được sử dụng làm allow-list cho redirects và để tạo URLs trong emails.

### 7.3. Khởi động lại services

```bash
docker compose down
docker compose up -d
```

## 8. Kiểm tra kết nối

### 8.1. Test các endpoints

- **Supabase Studio:** `https://supabase.rtrobotics.tech`
- **API Health Check:** `https://api.rtrobotics.tech/rest/v1/`
- **Auth endpoint:** `https://api.rtrobotics.tech/auth/v1/`

### 8.2. Troubleshooting thường gặp

**Lỗi 502 Bad Gateway:**
- Kiểm tra container cloudflared có đang chạy không
- Đảm bảo service names (`studio:3000`, `kong:8000`) đúng trong tunnel config

**Không thể truy cập:**
- Kiểm tra DNS propagation (có thể mất 5-10 phút)
- Xác nhận CNAME records đã được tạo và proxied

**Auth không hoạt động:**
- Kiểm tra `API_EXTERNAL_URL` đã được cấu hình đúng trong `.env`
- Đảm bảo `SITE_URL` match với domain đang sử dụng

## 9. Kết luận

Cloudflare Tunnel cung cấp một giải pháp elegant để expose Supabase self-hosted ra internet với HTTPS. Phương pháp này đặc biệt phù hợp cho:

- **Development environments** cần truy cập từ xa
- **Small to medium production deployments** 
- **Prototyping** và testing
- Các trường hợp cần **setup nhanh** mà không muốn quản lý infrastructure phức tạp

Với cách tiếp cận này, bạn có thể có được một Supabase instance an toàn, có HTTPS và dễ dàng truy cập chỉ trong vài phút setup.