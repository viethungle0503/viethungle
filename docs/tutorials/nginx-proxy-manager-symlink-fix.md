---
sidebar_position: 3
---

# Khắc Phục Symlink Nginx Proxy Manager Sau Backup Thủ Công

Khi bạn backup Nginx Proxy Manager bằng cách copy thủ công thư mục, các symlink của Let's Encrypt có thể bị hỏng, dẫn đến lỗi gia hạn chứng chỉ SSL. Bài hướng dẫn này sẽ giúp bạn khắc phục vấn đề này.

## 1. Hiểu Vấn Đề

### 1.1. Nguyên Nhân Lỗi

Khi backup thủ công, việc copy/paste thư mục có thể làm mất các symbolic link (symlink) của Let's Encrypt. Những symlink này rất quan trọng vì:

- Chúng liên kết các file trong `/etc/letsencrypt/live/` với các file thực tế trong `/etc/letsencrypt/archive/`
- Certbot cần các symlink này để quản lý và gia hạn chứng chỉ
- Khi mất symlink, Certbot không thể tìm thấy chứng chỉ để gia hạn

### 1.2. Lỗi Thường Gặp

```
{
    "error": {
        "message": "Internal Error"
    },
    "debug": {
        "stack": [
            "Renewal configuration file /etc/letsencrypt/renewal/npm-2.conf is broken.",
            "The error was: expected /etc/letsencrypt/live/npm-2/cert.pem to be a symlink",
            "Skipping."
        ]
    }
}
```

## 2. Kiểm Tra Tình Trạng Hiện Tại

### 2.1. Xác Định Đường Dẫn Volume

Đầu tiên, xác định đường dẫn volume của Nginx Proxy Manager trên host:

```bash
docker inspect <container_name> | grep -A 5 -B 5 "letsencrypt"
```

Hoặc kiểm tra trong file `docker-compose.yml`:

```yaml
volumes:
  - /home/ubuntu/nginxproxymanager/letsencrypt:/etc/letsencrypt
```

### 2.2. Kiểm Tra Cấu Trúc Thư Mục

Kiểm tra thư mục live:

```bash
ls -la /home/ubuntu/nginxproxymanager/letsencrypt/live/npm-2/
```

Kiểm tra thư mục archive:

```bash
ls -la /home/ubuntu/nginxproxymanager/letsencrypt/archive/npm-2/
```

### 2.3. Xác Định Các Certificate Bị Lỗi

Liệt kê tất cả các certificate:

```bash
ls /home/ubuntu/nginxproxymanager/letsencrypt/live/
```

## 3. Khắc Phục Symlink

### 3.1. Phương Pháp 1: Tạo Lại Symlink Tương Đối (Khuyến Nghị)

#### 3.1.1. Bước 1: Di Chuyển Vào Thư Mục Live

```bash
cd /home/ubuntu/nginxproxymanager/letsencrypt/live/npm-2
```

#### 3.1.2. Bước 2: Xóa Các File/Symlink Cũ

```bash
sudo rm -f cert.pem privkey.pem chain.pem fullchain.pem
```

#### 3.1.3. Bước 3: Xác Định Số Phiên Bản Certificate

Kiểm tra thư mục archive để xác định số phiên bản mới nhất:

```bash
ls -la ../../archive/npm-2/
```

Bạn sẽ thấy các file như:
- `cert1.pem`, `cert2.pem`, ...
- `privkey1.pem`, `privkey2.pem`, ...
- `chain1.pem`, `chain2.pem`, ...
- `fullchain1.pem`, `fullchain2.pem`, ...

#### 3.1.4. Bước 4: Tạo Symlink Tương Đối

Sử dụng số phiên bản cao nhất (ví dụ: `1`):

```bash
sudo ln -sf ../../archive/npm-2/cert1.pem cert.pem
sudo ln -sf ../../archive/npm-2/privkey1.pem privkey.pem  
sudo ln -sf ../../archive/npm-2/chain1.pem chain.pem
sudo ln -sf ../../archive/npm-2/fullchain1.pem fullchain.pem
```

#### 3.1.5. Bước 5: Xác Minh Symlink

```bash
ls -la
```

Kết quả mong muốn:
```
cert.pem -> ../../archive/npm-2/cert1.pem
privkey.pem -> ../../archive/npm-2/privkey1.pem
chain.pem -> ../../archive/npm-2/chain1.pem
fullchain.pem -> ../../archive/npm-2/fullchain1.pem
```

### 3.2. Phương Pháp 2: Script Tự Động

Tạo script để tự động khắc phục nhiều certificate:

```bash
#!/bin/bash

# Đường dẫn đến thư mục letsencrypt
LETSENCRYPT_PATH="/home/ubuntu/nginxproxymanager/letsencrypt"

# Tìm tất cả các certificate
for cert_dir in "$LETSENCRYPT_PATH/live"/*; do
    if [ -d "$cert_dir" ]; then
        cert_name=$(basename "$cert_dir")
        echo "Đang xử lý certificate: $cert_name"
        
        # Di chuyển vào thư mục live
        cd "$cert_dir"
        
        # Xóa symlink/file cũ
        sudo rm -f cert.pem privkey.pem chain.pem fullchain.pem
        
        # Tìm phiên bản mới nhất
        latest_num=$(ls ../../archive/"$cert_name"/cert*.pem | grep -o '[0-9]\+' | sort -n | tail -1)
        
        # Tạo symlink mới
        sudo ln -sf "../../archive/$cert_name/cert${latest_num}.pem" cert.pem
        sudo ln -sf "../../archive/$cert_name/privkey${latest_num}.pem" privkey.pem
        sudo ln -sf "../../archive/$cert_name/chain${latest_num}.pem" chain.pem
        sudo ln -sf "../../archive/$cert_name/fullchain${latest_num}.pem" fullchain.pem
        
        echo "Hoàn thành $cert_name"
    fi
done
```

## 4. Khởi Động Lại Container

Sau khi khắc phục symlink, khởi động lại container:

```bash
# Với Docker Compose
docker-compose restart nginx-proxy-manager

# Với Docker thường
docker restart <container_name>
```

## 5. Kiểm Tra Kết Quả

### 5.1. Kiểm Tra Logs

```bash
docker logs <container_name>
```

### 5.2. Test Gia Hạn Certificate

Vào trong container và test:

```bash
docker exec -it <container_name> bash
certbot renew --dry-run -v
```

### 5.3. Kiểm Tra Trong NPM Interface

- Đăng nhập vào Nginx Proxy Manager
- Kiểm tra SSL Certificates
- Thử force renew một certificate

## 6. Ngăn Ngừa Vấn Đề Trong Tương Lai

### 6.1. Sử Dụng Docker Volume Backup

Thay vì copy thủ công, sử dụng:

```bash
# Backup volume
docker run --rm -v nginx-proxy-manager_letsencrypt:/source -v $(pwd):/backup alpine tar czf /backup/letsencrypt-backup.tar.gz -C /source .

# Restore volume
docker run --rm -v nginx-proxy-manager_letsencrypt:/target -v $(pwd):/backup alpine tar xzf /backup/letsencrypt-backup.tar.gz -C /target
```

### 6.2. Sử Dụng Rsync Với Symlink

```bash
rsync -avh --links /source/nginxproxymanager/ /backup/nginxproxymanager/
```

### 6.3. Tạo Script Backup Tự Động

```bash
#!/bin/bash

BACKUP_DIR="/backup/npm-$(date +%Y%m%d-%H%M%S)"
SOURCE_DIR="/home/ubuntu/nginxproxymanager"

mkdir -p "$BACKUP_DIR"

# Backup với preserve symlinks
rsync -avh --links "$SOURCE_DIR/" "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
```

## 7. Troubleshooting

### 7.1. Lỗi: "target does not exist"

Nếu bạn thấy lỗi này, có nghĩa là bạn đã tạo symlink tuyệt đối thay vì tương đối:

```bash
# SAI - symlink tuyệt đối
sudo ln -sf /home/ubuntu/nginxproxymanager/letsencrypt/archive/npm-2/cert1.pem cert.pem

# ĐÚNG - symlink tương đối  
sudo ln -sf ../../archive/npm-2/cert1.pem cert.pem
```

### 7.2. Không Tìm Thấy File Archive

Nếu không có file trong archive, có thể certificate đã bị mất hoàn toàn:

1. Xóa certificate cũ:
   ```bash
   docker exec -it <container_name> certbot delete --cert-name npm-2
   ```

2. Tạo certificate mới qua NPM interface

### 7.3. Multiple Certificates

Đối với nhiều certificate (npm-2, npm-4, ...):

```bash
for cert in npm-2 npm-4; do
    echo "Processing $cert..."
    cd "/home/ubuntu/nginxproxymanager/letsencrypt/live/$cert"
    sudo rm -f *.pem
    latest=$(ls ../../archive/$cert/cert*.pem | grep -o '[0-9]\+' | sort -n | tail -1)
    sudo ln -sf "../../archive/$cert/cert${latest}.pem" cert.pem
    sudo ln -sf "../../archive/$cert/privkey${latest}.pem" privkey.pem
    sudo ln -sf "../../archive/$cert/chain${latest}.pem" chain.pem
    sudo ln -sf "../../archive/$cert/fullchain${latest}.pem" fullchain.pem
done
```

## 8. Kết Luận

Việc khắc phục symlink sau backup thủ công là cần thiết để đảm bảo Nginx Proxy Manager hoạt động bình thường. Hãy nhớ:

1. Luôn sử dụng symlink tương đối, không phải tuyệt đối
2. Xác định đúng số phiên bản certificate mới nhất
3. Khởi động lại container sau khi sửa
4. Sử dụng phương pháp backup đúng cách để tránh vấn đề này

Trong tương lai, hãy cân nhắc sử dụng các công cụ backup chuyên dụng hoặc Docker volume backup để đảm bảo tính toàn vẹn của dữ liệu. 