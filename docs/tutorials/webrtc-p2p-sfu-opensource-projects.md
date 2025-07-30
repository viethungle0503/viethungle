---
sidebar_position: 8
---

# Các dự án mã nguồn mở cho P2P và SFU WebRTC Streaming

Tổng hợp các dự án mã nguồn mở hàng đầu phục vụ cho việc xây dựng ứng dụng WebRTC, từ P2P đến multi-party conferencing.

## **STUN/TURN Servers (Phục vụ P2P WebRTC)**

### **coturn**
- **GitHub**: [https://github.com/coturn/coturn](https://github.com/coturn/coturn)
- **Mô tả**: STUN/TURN server phổ biến nhất, được viết bằng C/C++
- **Đặc điểm**: 
  - Hỗ trợ đầy đủ RFC 5766, có REST API
  - Hiệu năng cao, chạy được trên Docker
  - Cấu hình linh hoạt cho cả STUN và TURN
  - Hỗ trợ UDP, TCP, TLS, DTLS
- **Sử dụng khi**: Cần đảm bảo 100% kết nối P2P qua NAT khó tính
- **Lưu ý**: Phiên bản Docker hiện tại có 116 security vulnerabilities

### **STUNner**
- **GitHub**: [https://github.com/l7mp/stunner](https://github.com/l7mp/stunner)
- **Website**: [https://docs.l7mp.io/en/latest/stunner/](https://docs.l7mp.io/en/latest/stunner/)
- **Mô tả**: STUN/TURN server được thiết kế riêng cho Kubernetes
- **Đặc điểm**:
  - Cloud-native, tích hợp tốt với K8s và Service Mesh
  - Có support từ công ty L7mp Technologies
  - Zero security vulnerabilities trong bản release gần nhất
  - Dựa trên Pion Go libraries
- **Sử dụng khi**: Triển khai trên Kubernetes, cần orchestration tự động

### **Rel**
- **GitHub**: [https://github.com/elixir-webrtc/rel](https://github.com/elixir-webrtc/rel)
- **Mô tả**: TURN server được viết bằng Elixir
- **Đặc điểm**:
  - Minimalist, chỉ tập trung vào STUN & TURN
  - Có bundled authentication provider
  - Còn trong giai đoạn phát triển sớm
- **Sử dụng khi**: Cần giải pháp đơn giản, không cần nhiều tính năng phức tạp

## **SFU Media Servers (Phục vụ multi-party WebRTC)**

### **Janus Gateway**
- **GitHub**: [https://github.com/meetecho/janus-gateway](https://github.com/meetecho/janus-gateway)
- **Website**: [https://janus.conf.meetecho.com/](https://janus.conf.meetecho.com/)
- **Mô tả**: SFU mạnh mẽ với kiến trúc plugin linh hoạt
- **Đặc điểm**:
  - Kiến trúc plugin linh hoạt (video-room, streaming, SIP...)
  - Hỗ trợ multistream PeerConnections
  - Có AV1, H.265 support và E2E encryption via Insertable Streams
  - Documentation rất chi tiết
  - Hỗ trợ JavaScript/Lua plugins
- **Sử dụng khi**: Cần flexibility cao, custom plugins, feature-rich
- **Phiên bản**: v1.3.2 (stable), legacy 0.x branch

### **mediasoup**
- **GitHub**: [https://github.com/versatica/mediasoup](https://github.com/versatica/mediasoup)
- **Website**: [https://mediasoup.org/](https://mediasoup.org/)
- **Mô tả**: SFU hiệu năng cao được viết bằng Node.js với core C++
- **Đặc điểm**:
  - API low-level, control chi tiết từng media stream
  - Scalable architecture với Worker processes
  - Hỗ trợ simulcast, SVC
  - Multi-stream support, congestion control
  - ISC license
- **Sử dụng khi**: Cần control tối đa, hiệu năng cao, custom logic

### **LiveKit**
- **GitHub**: [https://github.com/livekit/livekit](https://github.com/livekit/livekit)
- **Website**: [https://livekit.io/](https://livekit.io/)
- **Mô tả**: Platform WebRTC hiện đại, cloud-native
- **Đặc điểm**:
  - Go + Pion WebRTC, có AI agent framework
  - SDKs đa platform (web, iOS, Android, backend)
  - Deployment flexibility (cloud hoặc self-hosted)
  - Hỗ trợ millions concurrent calls
  - Có SIP integration, Egress/Ingress
- **Sử dụng khi**: Cần solution complete, AI integration, enterprise scale

### **Jitsi Videobridge**
- **GitHub**: [https://github.com/jitsi/jitsi-videobridge](https://github.com/jitsi/jitsi-videobridge)
- **Website**: [https://jitsi.org/](https://jitsi.org/)
- **Mô tả**: SFU của Jitsi Meet ecosystem
- **Đặc điểm**:
  - Mature, battle-tested trong production
  - Horizontal scaling support
  - AV1 codec support mới nhất với Dependency Descriptor
  - Cộng đồng lớn, documentation tốt
  - SSRC rewriting cho large calls
- **Sử dụng khi**: Cần solution proven, easy deployment, community support

## **Complete Platforms & Specialized Solutions**

### **SRS (Simple Realtime Server)**
- **GitHub**: [https://github.com/ossrs/srs](https://github.com/ossrs/srs)
- **Website**: [https://ossrs.net/](https://ossrs.net/)
- **Mô tả**: Media server đa năng, SFU + streaming gateway
- **Đặc điểm**:
  - SFU + gateway RTMP/HLS/WebRTC
  - Hỗ trợ WHIP/WHEP standards
  - Có thể thay thế một phần TURN cho WebRTC-over-TCP
  - Tự sinh ICE candidate cho public IP
- **Lưu ý**: **KHÔNG** thay thế TURN server chuẩn cho P2P thuần
- **Sử dụng khi**: Cần streaming gateway kết hợp với SFU

### **MiroTalk SFU**
- **GitHub**: [https://github.com/miroslavpejic85/mirotalksfu](https://github.com/miroslavpejic85/mirotalksfu)
- **Mô tả**: Video conferencing solution dựa trên MediaSoup
- **Đặc điểm**:
  - Built với Node.js + MediaSoup core
  - Simple, secure, scalable up to 4k
  - Compatible với mọi browser và platform
- **Sử dụng khi**: Cần ready-to-use conferencing app

### **Mafalda SFU**
- **Website**: [https://mafalda.io/](https://mafalda.io/)
- **Mô tả**: Massively parallel scalable SFU built on MediaSoup
- **Đặc điểm**:
  - Vertical và horizontal scalable
  - API tương thích với MediaSoup
  - Fully self-managed, transparent cho developers
  - Automated scaling và service discovery

## **So sánh Architecture**

| **Loại** | **Bandwidth (Client)** | **CPU (Server)** | **Scalability** | **Use Case** |
|-----------|------------------------|------------------|-----------------|--------------|
| **P2P + STUN/TURN** | Cao (N×N) | Thấp | Hạn chế | 1-1 hoặc nhóm nhỏ |
| **SFU** | Thấp (1×N) | Trung bình | Cao | Multi-party meetings |
| **MCU** | Thấp (1×1) | Cao | Trung bình | Legacy/mobile optimization |

## **Gợi ý lựa chọn**

### **Cho P2P WebRTC thuần:**
- **coturn**: Lựa chọn chính, mature và reliable
- **STUNner**: Nếu dùng Kubernetes
- **Rel**: Nếu cần giải pháp đơn giản với Elixir

### **Cho multi-party (SFU):**
- **LiveKit**: Modern, AI-ready, enterprise-grade
- **mediasoup**: Control tối đa, custom development  
- **Janus**: Flexibility cao, plugin ecosystem
- **Jitsi**: Proven solution, easy deployment

### **Kết hợp thường dùng:**
- STUN (Google public) + coturn (TURN fallback) + SFU (Janus/LiveKit) cho 99% coverage
- SRS có thể bổ sung cho streaming use cases nhưng không thay thế hoàn toàn TURN

## **Tài nguyên tham khảo**

- [WebRTC Architecture Patterns](https://webrtc.org/)
- [Janus Documentation](https://janus.conf.meetecho.com/docs/)
- [LiveKit Documentation](https://docs.livekit.io/)
- [MediaSoup Documentation](https://mediasoup.org/documentation/)
- [coturn Configuration Examples](https://github.com/coturn/coturn/blob/master/examples/etc/turnserver.conf)

Tất cả các solution trên đều có active development trong 2024-2025 và có community support tốt.