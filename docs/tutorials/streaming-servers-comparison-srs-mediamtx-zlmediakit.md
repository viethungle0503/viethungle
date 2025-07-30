---
sidebar_position: 10
---

# So sánh các Streaming Server: SRS vs MediaMTX vs ZLMediaKit

Ba nền tảng streaming mã nguồn mở hàng đầu hiện nay là **SRS (Simple Realtime Server)**, **MediaMTX**, và **ZLMediaKit**. Bài viết này sẽ so sánh chi tiết về độ trễ, tính năng, độ ổn định và các định dạng hỗ trợ của từng platform.

## 1. Tổng quan các Platform

### 1.1. SRS (Simple Realtime Server) - ossrs/srs:5

**SRS** là một high-performance streaming server được viết bằng C++, tập trung vào độ trễ thấp và hiệu suất cao.

**Đặc điểm nổi bật:**
- Thiết kế tối ưu cho low-latency streaming
- **Mạnh về**: RTMP, HTTP-FLV, HLS, WebRTC, SRT
- **KHÔNG hỗ trợ**: RTSP (version 5), chỉ từ version 7 mới thử nghiệm RTMP sang RTSP
- Architecture đơn luồng với event-driven
- Có thể thay thế TURN server cho WebRTC-over-TCP
- Docker image: `ossrs/srs:5` (Stable)

### 1.2. MediaMTX (formerly rtsp-simple-server) - bluenviron/mediamtx

**MediaMTX** là một ready-to-use media server được viết bằng Go, nổi bật với tính linh hoạt và ease of use.

**Đặc điểm nổi bật:**
- Zero-dependency, single binary deployment
- **Hỗ trợ nhiều protocol nhất**: RTSP, RTMP, SRT, WebRTC, HLS, UDP/MPEG-TS
- Automatic protocol conversion giữa các formats
- Cross-platform support tốt nhất (Linux/Windows/macOS)
- Built-in authentication và recording
- Docker image: `bluenviron/mediamtx:latest-ffmpeg`

### 1.3. ZLMediaKit - ZLMediaKit/ZLMediaKit

**ZLMediaKit** là một commercial-grade streaming framework được viết bằng C++11, tập trung vào tính năng đầy đủ và hiệu suất cao.

**Đặc điểm nổi bật:**
- Framework approach với complete SDK
- **Hỗ trợ đầy đủ**: RTSP, RTMP, WebRTC, HLS, HTTP-FLV, WebSocket-FLV, HTTP-TS, WebSocket-TS
- Excellent performance (10,000+ concurrent players)
- Multi-track support và cluster deployment
- Comprehensive REST API và Web Hook
- Docker image: `zlmediakit/zlmediakit:master`

## 2. So sánh Độ trễ (Latency)

| Platform | WebRTC | RTMP | RTSP | SRT | Tối ưu |
|----------|--------|------|------|-----|-------|
| **SRS** | **0.1-1s** | 0.8-3s | ❌ (v5) | **0.1-1s** | **Tốt nhất** |
| **MediaMTX** | 0.5-2s | 1-5s | **0.5-2s** | **0.2-1s** | Tốt |
| **ZLMediaKit** | 0.5-2s | **0.8-3s** | 1-3s | 1-3s | Tốt |

### Kết luận Latency:
- **SRS**: Tốt nhất cho WebRTC với min-latency mode có thể đạt 100ms
- **MediaMTX**: Cân bằng tốt giữa các protocol, tốt nhất cho SRT
- **ZLMediaKit**: Latency ổn định nhưng không xuất sắc như SRS

## 3. So sánh Tính năng

### 3.1. Protocols Hỗ trợ

| Protocol | SRS v5 | MediaMTX | ZLMediaKit |
|----------|---------|----------|------------|
| **WebRTC** | ✅ WHIP/WHEP | ✅ WHIP/WHEP | ✅ Full |
| **RTMP/RTMPS** | ✅ Enhanced | ✅ Standard | ✅ Enhanced |
| **RTSP/RTSPS** | ❌ (v7 thử nghiệm) | ✅ Full | ✅ Full |
| **HLS** | ✅ LL-HLS | ✅ LL-HLS | ✅ LL-HLS |
| **HTTP-FLV** | ✅ | ❌ | ✅ |
| **SRT** | ✅ | ✅ | ✅ |
| **GB28181** | ✅ | ❌ | ✅ |
| **WebSocket** | ✅ | ✅ | ✅ |
| **UDP/MPEG-TS** | ❌ | ✅ | ✅ |

### 3.2. Codecs Hỗ trợ

| Codec | SRS | MediaMTX | ZLMediaKit |
|-------|-----|----------|------------|
| **H.264** | ✅ | ✅ | ✅ |
| **H.265** | ✅ | ✅ | ✅ |
| **AV1** | ❌ | ✅ | ✅ |
| **VP8/VP9** | ❌ | ✅ | ✅ |
| **AAC** | ✅ | ✅ | ✅ |
| **Opus** | ✅ | ✅ | ✅ |
| **G.711** | ✅ | ✅ | ✅ |
| **MP3** | ❌ | ✅ | ✅ |

### 3.3. Tính năng Nâng cao

| Tính năng | SRS | MediaMTX | ZLMediaKit |
|-----------|-----|----------|------------|
| **Recording** | ✅ HLS/MP4 | ✅ fMP4/MPEG-TS | ✅ FLV/HLS/MP4 |
| **Transcoding** | ❌ | ❌ | ✅ Pro |
| **Authentication** | ✅ HTTP | ✅ Built-in | ✅ Full |
| **Clustering** | ✅ Edge/Origin | ❌ | ✅ |
| **Multi-track** | ❌ | ✅ | ✅ |
| **WebRTC Simulcast** | ✅ | ❌ | ✅ |
| **API/Hooks** | ✅ Extensive | ✅ Basic | ✅ Comprehensive |

## 4. So sánh Độ ổn định

### 4.1. Production Readiness

| Aspect | SRS | MediaMTX | ZLMediaKit |
|--------|-----|----------|------------|
| **Battle-tested** | ✅ 10+ năm | ✅ 5+ năm | ✅ 8+ năm |
| **Memory Safety** | ⚠️ C++ | ✅ Go | ⚠️ C++ |
| **Crash Recovery** | ✅ | ✅ | ✅ |
| **Resource Usage** | **Thấp** | Trung bình | **Thấp** |
| **Documentation** | ✅ Xuất sắc | ✅ Tốt | ✅ Tốt |
| **Community** | ✅ Lớn | ✅ Đang phát triển | ✅ Lớn |

### 4.2. Performance Benchmarks

| Metric | SRS | MediaMTX | ZLMediaKit |
|--------|-----|----------|------------|
| **Max Concurrent** | 100K+ players | 10K+ players | **100K+ players** |
| **CPU Usage** | **Thấp** | Trung bình | **Thấp** |
| **Memory Usage** | **Hiệu quả** | Trung bình | **Hiệu quả** |
| **Startup Time** | Nhanh | **Rất nhanh** | Nhanh |

## 5. Docker Commands Mẫu

### 5.1. SRS với WebRTC Streaming

```bash
# Thiết lập biến môi trường cho IP candidate
CANDIDATE="100.105.238.63"  # Thay bằng IP public của bạn

# Chạy SRS container với WebRTC support
docker run --rm -itd \
    -p 1935:1935 \
    -p 1985:1985 \
    -p 8080:8080 \
    -p 8554:8554 \
    --env CANDIDATE=$CANDIDATE \
    -p 8000:8000/udp \
    -v $(pwd)/rtmp2rtc.conf:/usr/local/srs/conf/rtmp2rtc.conf \
    ossrs/srs:5 ./objs/srs -c conf/rtmp2rtc.conf

# Cấu hình rtmp2rtc.conf cho WebRTC
cat > rtmp2rtc.conf << EOF
listen              1935;
max_connections     1000;
daemon              off;
srs_log_tank        console;

http_server {
    enabled         on;
    listen          8080;
    dir             ./objs/nginx/html;
}

http_api {
    enabled         on;
    listen          1985;
}

rtc_server {
    enabled on;
    listen 8000;
    candidate $CANDIDATE;
}

vhost __defaultVhost__ {
    rtc {
        enabled     on;
        rtmp_to_rtc on;
        rtc_to_rtmp on;
    }
    http_remux {
        enabled     on;
        mount       [vhost]/[app]/[stream].flv;
    }
}
EOF
```

### 5.2. MediaMTX với WebRTC Support

```bash
# Thiết lập IP candidate linh động
MTX_CANDIDATE="100.105.238.63"  # Thay bằng IP public của bạn

# Chạy MediaMTX container
docker run --rm -itd \
    -e MTX_RTSPTRANSPORTS=tcp \
    -e MTX_WEBRTCADDITIONALHOSTS=$MTX_CANDIDATE \
    -p 8554:8554 \
    -p 1935:1935 \
    -p 8888:8888 \
    -p 8889:8889 \
    -p 8890:8890/udp \
    -p 8189:8189/udp \
    bluenviron/mediamtx:latest-ffmpeg

# Hoặc với cấu hình file tùy chỉnh
cat > mediamtx.yml << EOF
api: yes
apiAddress: :9997
webrtcadditionalhosts: [$MTX_CANDIDATE]
paths:
  all:
EOF

docker run --rm -itd \
    --network=host \
    -v $(pwd)/mediamtx.yml:/mediamtx.yml \
    bluenviron/mediamtx:latest-ffmpeg
```

### 5.3. ZLMediaKit với Full Features

```bash
# ZLMediaKit với đầy đủ tính năng
docker run --rm -itd \
    -p 1935:1935 \
    -p 8080:80 \
    -p 8443:443 \
    -p 8554:554 \
    -p 10000:10000 \
    -p 10000:10000/udp \
    -p 8000:8000/udp \
    -p 9000:9000/udp \
    zlmediakit/zlmediakit:master

# Với cấu hình tùy chỉnh
cat > config.ini << EOF
[api]
apiDebug=1
secret=035c73f7-bb6b-4889-a715-d9eb2d1925cc

[general]
mediaServerId=your-media-server

[rtc]
externIP=100.105.238.63
EOF

docker run --rm -itd \
    -v $(pwd)/config.ini:/opt/media/conf/config.ini \
    -p 1935:1935 \
    -p 8080:80 \
    -p 8554:554 \
    zlmediakit/zlmediakit:master
```

## 6. Integration: SRS với MediaMTX

Bạn có thể kết hợp SRS và MediaMTX để tận dụng ưu điểm của cả hai:

```yaml
# SRS Configuration với Forward
# rtmp2rtc.conf
listen              1935;

vhost __defaultVhost__ {
    # Cấu hình forward stream từ SRS sang MediaMTX
    forward {
        enabled on;
        destination 127.0.0.1:1936;  # MediaMTX RTMP port
    }
    
    rtc {
        enabled     on;
        rtmp_to_rtc on;
    }
}
```

### 6.1. Workflow Architecture

```
┌─────────────┐    RTMP     ┌─────────────┐    WebRTC
│   OBS/App   │─────────────▶│   SRS       │─────────────▶ Browser
└─────────────┘  :1935      │   :1935     │    :1985
                            │             │
                            │  Forward    │
                            │             ▼
                            └─────────────┐    RTSP/SRT
                                           │─────────────▶ Player  
                                           │   MediaMTX  │
                                           │   :1936     │
                                           └─────────────┘
```

### 6.2 Setup Commands

```bash
# 1. Start MediaMTX để nhận RTMP forward
docker run --rm -itd \
    -p 1936:1935 \
    -p 8554:8554 \
    -p 8890:8890/udp \
    -e MTX_RTMPADDRESS=:1935 \
    bluenviron/mediamtx:latest-ffmpeg

# 2. Start SRS với forward config
docker run --rm -itd \
    -p 1935:1935 \
    -p 1985:1985 \
    -p 8080:8080 \
    -p 8000:8000/udp \
    --env CANDIDATE="100.105.238.63" \
    -v $(pwd)/forward.conf:/usr/local/srs/conf/srs.conf \
    ossrs/srs:5

# 3. Test workflow
# Push to SRS
ffmpeg -re -stream_loop -1 -i test.mp4 -c copy -f flv rtmp://localhost:1935/live/test

# Play WebRTC from SRS  
curl http://localhost:8080/players/rtc_player.html?stream=test

# Play RTSP from MediaMTX
ffplay rtsp://localhost:8554/live/test

# Play SRT from MediaMTX
ffplay srt://localhost:8890?streamid=read:live/test
```

### 6.3 Integration Benefits

**Ưu điểm của kiến trúc này:**
- **SRS**: Xử lý WebRTC với latency thấp nhất
- **MediaMTX**: Provide SRT và protocol diversity
- **Load balancing**: Phân tải giữa các protocol
- **Protocol specialization**: Mỗi server tối ưu cho use case riêng
- **Redundancy**: Backup khi một server gặp sự cố

## 7. Kết luận và Khuyến nghị

### 7.1 Chọn SRS khi:
- **Ưu tiên latency thấp** (đặc biệt WebRTC)
- Cần **clustering** và **edge/origin** architecture
- Focus vào **live streaming** và **broadcasting**
- Có **team kinh nghiệm C++** để customize

### 7.2 Chọn MediaMTX khi:
- Cần **protocol diversity** (nhiều protocol nhất)
- **Quick deployment** và **ease of use**
- Cần **SRT** hoặc **UDP/MPEG-TS**
- **Cross-platform** deployment
- **Small to medium scale**

### 7.3 Chọn ZLMediaKit khi:
- Cần **framework approach** với **full SDK**
- **Commercial features** như transcoding
- **Maximum codec support** (VP8/VP9/AV1)
- **High-performance** requirements (100K+ concurrent)
- Cần **comprehensive API** và **webhooks**

### 7.4 Performance Summary

| Use Case | Recommendation | Lý do |
|----------|----------------|-------|
| **Ultra-low latency WebRTC** | SRS | Best latency optimization |
| **Multi-protocol hub** | MediaMTX | Most protocols supported |
| **High-scale production** | ZLMediaKit | Best performance/features |
| **Quick prototyping** | MediaMTX | Easiest setup |
| **Custom development** | ZLMediaKit | Best SDK/framework |

Cả ba platform đều là lựa chọn tuyệt vời tùy thuộc vào requirements cụ thể. Hãy test với use case thực tế của bạn để đưa ra quyết định cuối cùng.