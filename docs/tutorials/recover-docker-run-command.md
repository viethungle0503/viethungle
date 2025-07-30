---
sidebar_position: 11
---

# Cách xem lại lệnh docker run từ container đang chạy

**Câu hỏi:** Có cách nào để biết ngày trước tôi đã dùng lệnh `docker run` như thế nào dựa trên một container đang chạy không?

**Câu trả lời:** Có — Docker lưu lại hầu hết mọi tuỳ chọn bạn đã dùng khi tạo container, nên bạn có thể "mò" lại gần như đầy đủ câu lệnh `docker run` ban đầu.

## 1. Xác định container bạn cần xem

```bash
docker ps       # liệt kê container đang chạy
# hoặc
docker ps -a    # cả container đã dừng
```

Lấy CONTAINER ID hoặc NAME.

## 2. Xem toàn bộ cấu hình đã ghi

```bash
docker inspect <container_id_or_name> | less
```

`docker inspect` trả về JSON rất dài; các trường quan trọng:

| Trường | Ý nghĩa | Ví dụ sử dụng |
|--------|---------|---------------|
| `.Config.Image` | image gốc | `jq -r '.[0].Config.Image'` |
| `.Path & .Args` | lệnh CMD bạn gõ sau image | `jq -r '.[0].Path, .[0].Args[]'` |
| `.HostConfig.PortBindings` | mapping cổng `-p` | `jq '.[0].HostConfig.PortBindings'` |
| `.HostConfig.Binds` | volume `-v` | `jq -r '.[0].HostConfig.Binds[]'` |
| `.Config.Env` | biến môi trường `-e` | `jq -r '.[0].Config.Env[]'` |

(Dùng `jq` cho tiện đọc; có thể dùng `--format '{{…}}'` nếu không cài `jq`).

## 3. Ráp thành câu lệnh "tái tạo"

### Ví dụ nhanh:

```bash
docker inspect --format \
'{{.Config.Image}} {{.Path}} {{join .Args " "}}' <id>
```

### Mở rộng hơn:

```bash
docker inspect --format '
docker run -d --name={{.Name}}
{{- range $p, $conf := .HostConfig.PortBindings}} -p {{$conf 0}}:{{$p}} {{end}}
{{- range .HostConfig.Binds}} -v {{.}} {{end}}
{{- range .Config.Env}} -e {{.}} {{end}}
{{.Config.Image}}
{{.Path}} {{join .Args " "}}
' <id>
```

**Lưu ý:**
- Một số tuỳ chọn (như `--restart`, `--network`, `--cpus`, ...) nằm trong các nhánh `.HostConfig.*` khác; bạn chỉ cần bổ sung vào khuôn mẫu trên.
- Nếu container được tạo bởi `docker-compose`, các nhãn (`.Config.Labels`) sẽ gợi ý file `docker-compose.yml` ban đầu.
- `docker ps --no-trunc` chỉ hiện lệnh CMD chạy bên trong container, chứ không có port/volume nên thường chưa đủ.

## 4. Công cụ "dùng liền"T ool runlike
```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock assaflavie/runlike <id>
```

Tự động in ra câu lệnh `docker run` gần chính xác.

**Ví dụ sử dụng runlike:**

```bash
$ docker run --rm -v /var/run/docker.sock:/var/run/docker.sock assaflavie/runlike redis

# Kết quả trả về:
docker run --name=redis \
    -e "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
    -e "REDIS_VERSION=2.8.9" \
    -e "REDIS_DOWNLOAD_URL=http://download.redis.io/releases/redis-2.8.9.tar.gz" \
    -e "REDIS_DOWNLOAD_SHA1=003ccdc175816e0a751919cf508f1318e54aac1e" \
    -p 0.0.0.0:6379:6379/tcp \
    --detach=true \
    myrepo/redis:7860c450dbee9878d5215595b390b9be8fa94c89 \
    redis-server --slaveof 172.31.17.84 6379
```

**Sử dụng với tham số `-p` để format đẹp hơn:**

```bash
$ docker run --rm -v /var/run/docker.sock:/var/run/docker.sock assaflavie/runlike -p redis

# Kết quả trả về:
docker run \
    --name=redis \
    -e "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" \
    -e "REDIS_VERSION=2.8.9" \
    -e "REDIS_DOWNLOAD_URL=http://download.redis.io/releases/redis-2.8.9.tar.gz" \
    -e "REDIS_DOWNLOAD_SHA1=003ccdc175816e0a751919cf508f1318e54aac1e" \
    -p 0.0.0.0:6379:6379/tcp \
    --detach=true \
    myrepo/redis:7860c450dbee9878d5215595b390b9be8fa94c89 \
    redis-server --slaveof 172.31.17.84 6379
```

## 5. Lưu ý khi sử dụng

- Tool `runlike` hỗ trợ nhiều tùy chọn Docker nhưng không phải tất cả.
- Một số thông tin như build context của `COPY`/`ADD` sẽ không được phục hồi chính xác.
- Kiểm tra kỹ lệnh được tạo ra trước khi chạy trong môi trường production.
- Nếu container được tạo bởi `docker-compose`, hãy kiểm tra labels để tìm file compose gốc.