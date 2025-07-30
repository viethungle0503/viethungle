---
sidebar_position: 9
---

# MTR, iperf3 và Tailscale - Công cụ đo mạng chuyên nghiệp

Khi quản lý hạ tầng mạng hoặc debug vấn đề kết nối, việc có công cụ đo mạng chính xác là rất quan trọng. Bài viết này giới thiệu ba công cụ thiết yếu: MTR cho phân tích routing, iperf3 cho đo băng thông, và các tính năng monitoring của Tailscale.

## 1. MTR (My Traceroute)

**MTR** là công cụ kết hợp sức mạnh của `traceroute` và `ping` để theo dõi route mạng và đo packet loss/latency liên tục.

### 1.1 Cài đặt MTR

```bash
# Ubuntu/Debian
sudo apt install mtr-tiny

# CentOS/RHEL/Rocky Linux
sudo yum install mtr
# hoặc với dnf
sudo dnf install mtr

# macOS (với Homebrew)
brew install mtr

# Windows (với WSL hoặc cygwin)
# Hoặc sử dụng WinMTR (GUI version)
```

### 1.2 Sử dụng MTR

```bash
# Sử dụng cơ bản
mtr google.com

# Monitoring liên tục với interval 1 giây, 100 packets
mtr -r -c 100 -i 1 8.8.8.8

# Xuất kết quả ra file
mtr -r -c 100 8.8.8.8 > network_report.txt

# Hiển thị cả IP và hostname
mtr -b google.com

# Chỉ hiển thị IP (nhanh hơn)
mtr -n google.com

# Sử dụng IPv6
mtr -6 2001:4860:4860::8888

# Real-time monitoring (không kết thúc)
mtr --report-cycles=0 8.8.8.8
```

### 1.3 Thông số MTR cung cấp

| Cột | Ý nghĩa |
|-----|---------|
| **Loss%** | Tỷ lệ packet loss tại mỗi hop (%) |
| **Snt** | Số packet đã gửi |
| **Last** | Latency của packet gần nhất (ms) |
| **Avg** | Latency trung bình (ms) |
| **Best** | Latency tốt nhất (ms) |
| **Wrst** | Latency tệ nhất (ms) |
| **StDev** | Độ lệch chuẩn - jitter (ms) |

### 1.4 Phân tích kết quả MTR

```
                             My traceroute  [v0.95]
Start: 2024-01-15T10:30:00+0700
HOST: client.local               Loss%   Snt   Last   Avg  Best  Wrst StDev
  1.|-- gateway.local             0.0%    10    1.2   1.3   1.1   1.8   0.2
  2.|-- 10.0.1.1                  0.0%    10    5.4   5.6   4.9   7.2   0.8
  3.|-- isp-router.net           10.0%    10   15.2  16.8  14.1  25.3   3.4
  4.|-- 8.8.8.8                   0.0%    10   18.4  19.1  17.8  22.1   1.2
```

**Phân tích**:
- **Hop 1-2**: Kết nối nội bộ tốt, latency thấp
- **Hop 3**: ISP router có 10% packet loss - vấn đề tại nhà mạng
- **Hop 4**: Google DNS ổn định

## 2. iperf3 - Đo băng thông mạng

**iperf3** là công cụ chuẩn để đo băng thông TCP/UDP giữa hai điểm.

### 2.1 Cài đặt iperf3

```bash
# Ubuntu/Debian
sudo apt install iperf3

# CentOS/RHEL/Rocky Linux
sudo yum install iperf3
# hoặc với dnf
sudo dnf install iperf3

# macOS
brew install iperf3

# Windows
# Download từ https://iperf.fr/iperf-download.php
# Hoặc qua chocolatey: choco install iperf3
```

### 2.2 Sử dụng iperf3

#### Server Setup
```bash
# Khởi động server trên máy đích (ví dụ: GCS instance)
iperf3 -s -p 5201

# Server với bind interface cụ thể
iperf3 -s -B 192.168.1.100 -p 5201

# Server daemon mode (background)
iperf3 -s -D
```

#### Client Testing
```bash
# Test TCP cơ bản (từ drone/gateway đến server)
iperf3 -c <server_ip> -p 5201 -t 30 -i 1

# Test UDP với bandwidth limit
iperf3 -c <server_ip> -u -b 10M -t 30

# Bidirectional test (đo cả upload và download)
iperf3 -c <server_ip> -d -t 30

# Multiple parallel connections
iperf3 -c <server_ip> -P 4 -t 30

# Test với window size cụ thể
iperf3 -c <server_ip> -w 64K -t 30

# Reverse mode (server gửi data đến client)
iperf3 -c <server_ip> -R -t 30
```

### 2.3 Thông số iperf3 cung cấp

#### TCP Metrics
- **Bandwidth**: Băng thông thực tế (Mbits/sec, Gbits/sec)
- **Transfer**: Tổng lượng data truyền (MBytes, GBytes)
- **Retransmissions**: Số lần truyền lại gói tin
- **Cwnd**: TCP congestion window size

#### UDP Metrics
- **Bandwidth**: Băng thông đạt được
- **Jitter**: Độ biến thiên delay (ms)
- **Lost/Total**: Tỷ lệ packet loss
- **Datagrams**: Số UDP datagram gửi/nhận

### 2.4 Ví dụ kết quả iperf3

```
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  11.2 MBytes  94.4 Mbits/sec    0    138 KBytes
[  5]   1.00-2.00   sec  11.2 MBytes  94.2 Mbits/sec    0    152 KBytes
[  5]   2.00-3.00   sec  11.2 MBytes  94.0 Mbits/sec    0    152 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.00  sec   336 MBytes  94.1 Mbits/sec    0             sender
[  5]   0.00-30.04  sec   335 MBytes  93.6 Mbits/sec                  receiver
```

## 3. Tailscale - Monitoring và Access Control

### 3.1 Thông tin kết nối Tailscale từ client

#### Commands cơ bản
```bash
# Xem status và connection type
tailscale status

# Status dạng JSON (dễ parse cho scripts)
tailscale status --json

# Kiểm tra network conditions chi tiết
tailscale netcheck

# Thông tin về peer connections
tailscale status --peers

# Xem exit node hiện tại
tailscale status --active
```

#### 3.2 Real-time metrics
```bash
# In metrics trực tiếp ra console
tailscale metrics print

# Enable web interface để thu thập metrics
tailscale set --webclient

# Truy cập metrics qua web (sau khi enable webclient)
# http://100.100.100.100/metrics (local)
# http://<tailscale-ip>:5252/metrics (từ tailnet khác)
```

### 3.3 Tailscale Access Control Lists (ACLs)

Tailscale ACL cho phép kiểm soát kết nối giữa các thiết bị cụ thể, rất hữu ích cho trường hợp drone A chỉ kết nối với tay cầm A.

#### Cấu trúc ACL cơ bản

```json
{
  "tagOwners": {
    "tag:drone-a": ["user1@example.com"],
    "tag:controller-a": ["user1@example.com"],
    "tag:drone-b": ["user2@example.com"], 
    "tag:controller-b": ["user2@example.com"]
  },
  
  "acls": [
    {
      "action": "accept",
      "src": ["tag:controller-a"],
      "dst": ["tag:drone-a:*"]
    },
    {
      "action": "accept", 
      "src": ["tag:controller-b"],
      "dst": ["tag:drone-b:*"]
    },
    {
      "action": "accept",
      "src": ["tag:drone-a"],
      "dst": ["tag:controller-a:*"]
    },
    {
      "action": "accept",
      "src": ["tag:drone-b"], 
      "dst": ["tag:controller-b:*"]
    }
  ]
}
```

#### Ví dụ ACL cho drone system

```json
{
  "tagOwners": {
    "tag:mission-alpha": ["pilot-alpha@company.com"],
    "tag:mission-beta": ["pilot-beta@company.com"],
    "tag:ground-station": ["ops@company.com"]
  },
  
  "acls": [
    // Chỉ cho phép pilot-alpha điều khiển drone mission-alpha
    {
      "action": "accept",
      "src": ["tag:mission-alpha"], 
      "dst": ["tag:mission-alpha:22,8080,9000-9010"]
    },
    
    // Ground station có thể monitor tất cả
    {
      "action": "accept",
      "src": ["tag:ground-station"],
      "dst": ["tag:mission-alpha:80,443,8080", "tag:mission-beta:80,443,8080"]
    },
    
    // Chặn cross-mission communication
    {
      "action": "drop",
      "src": ["tag:mission-alpha"],
      "dst": ["tag:mission-beta:*"]
    }
  ],
  
  "grants": [
    {
      "src": ["tag:ground-station"],
      "dst": ["autogroup:admin"],
      "app": {
        "tailscale.com/cap/file-sharing": [{
          "shareAs": "ops-readonly"
        }]
      }
    }
  ]
}
```

### 3.4 Áp dụng ACL

1. **Truy cập Tailscale Admin Console**: https://login.tailscale.com/admin/acls
2. **Edit ACL policy** theo format JSON ở trên
3. **Test ACL** bằng built-in simulator
4. **Apply** thay đổi

### 3.5 Commands kiểm tra ACL

```bash
# Kiểm tra ACL hiện tại có cho phép kết nối không
tailscale ping <target-ip>

# Test connection đến port cụ thể
nc -zv <tailscale-ip> <port>

# Kiểm tra routing table
tailscale status --json | jq '.Peer'
```

## 5. Best Practices ⚠️

### 5.1 MTR
- Chạy ít nhất 100 packets để có kết quả chính xác
- Monitor trong thời gian dài để phát hiện pattern
- Loss% > 5% ở bất kỳ hop nào cần điều tra

### 5.2 iperf3
- Test cả TCP và UDP cho complete picture
- Sử dụng multiple connections (-P) cho saturate bandwidth
- Test bidirectional để phát hiện asymmetric issues
- Firewall cần mở port 5201 (hoặc port custom)

### 5.3 Tailscale ACL
- Test ACL trên staging environment trước
- Sử dụng tags thay vì hardcode user emails
- Tận dụng `autogroup:members` cho internal access
- Backup ACL configuration trước khi thay đổi lớn

Với ba công cụ này, bạn có thể monitor và troubleshoot mạng một cách toàn diện từ layer 3 routing cho đến application-level bandwidth và access control.