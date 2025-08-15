---
sidebar_position: 19
title: "19. Chạy script dưới nền: Quản lý background processes và logs"
slug: background-script-management
sidebar_label: Quản lý script background
description: Hướng dẫn chi tiết cách chạy script dưới nền, quản lý logs, tìm và tắt processes. Bao gồm nohup, screen, tmux và MobaXterm quick commands.
---

## Tóm tắt

Bài viết này hướng dẫn các cách chạy script dưới background (nền), quản lý logs của script, cách tìm và tắt script đang chạy. Đặc biệt hữu ích khi cần chạy script liên tục trên server mà không bị gián đoạn khi ngắt kết nối SSH.

**Các phương pháp được đề cập:**
- Background process với `&` và `nohup`
- Quản lý session với `screen` và `tmux`
- Theo dõi logs real-time
- Tìm và kill processes

---

## 1. Các cách chạy script dưới background

### Cách 1: Background đơn giản
```bash
./kick_orphan_players.sh > /dev/null 2>&1 &
```

**Đặc điểm:**
- Chạy background với `&`
- Bỏ qua output (`> /dev/null 2>&1`)
- **Hạn chế**: Script sẽ dừng khi logout SSH

### Cách 2: Sử dụng nohup (khuyến nghị)
```bash
nohup ./kick_orphan_players.sh > /dev/null 2>&1 &
```

**Ưu điểm:**
- `nohup`: Script tiếp tục chạy ngay cả khi logout SSH
- `> /dev/null`: Không lưu output
- `2>&1`: Chuyển stderr thành stdout (cũng vào /dev/null)
- `&`: Chạy background

### Cách 3: Lưu PID để quản lý dễ dàng
```bash
nohup ./kick_orphan_players.sh > /dev/null 2>&1 & echo $! > kick_script.pid
```

**Lợi ích:**
- Lưu Process ID vào file `kick_script.pid`
- Dễ dàng kill process sau này
- Kiểm tra script có đang chạy không

### Cách 4: Chạy với log file
```bash
nohup ./kick_orphan_players.sh > kick_orphan.log 2>&1 &
```

**Ưu điểm:**
- Lưu toàn bộ output vào file log
- Có thể debug khi cần
- Theo dõi hoạt động của script

### Cách 5: Sử dụng screen
```bash
# Tạo screen session
screen -dmS kick_orphan ./kick_orphan_players.sh

# Hoặc tạo session rồi chạy script
screen -S kick_orphan
./kick_orphan_players.sh
# Nhấn Ctrl+A, sau đó D để detach
```

### Cách 6: Sử dụng tmux
```bash
# Tạo tmux session và chạy script
tmux new-session -d -s kick_orphan './kick_orphan_players.sh'

# Hoặc tạo session thủ công
tmux new-session -s kick_orphan
./kick_orphan_players.sh
# Nhấn Ctrl+B, sau đó D để detach
```

---

## 2. Quản lý và theo dõi logs

### Chạy script với log file
```bash
nohup ./kick_orphan_players.sh > kick_orphan.log 2>&1 &
```

### Xem logs theo nhiều cách

#### Xem toàn bộ log
```bash
cat kick_orphan.log
```

#### Xem log real-time (khuyến nghị)
```bash
tail -f kick_orphan.log
```

#### Xem n dòng cuối cùng
```bash
# Xem 20 dòng cuối
tail -20 kick_orphan.log

# Xem 50 dòng cuối
tail -50 kick_orphan.log
```

#### Xem log với timestamps
```bash
# Thêm timestamp vào script
echo "$(date): Script started" >> kick_orphan.log
./kick_orphan_players.sh >> kick_orphan.log 2>&1
```

#### Sử dụng tee để vừa xem vừa lưu
```bash
nohup ./kick_orphan_players.sh 2>&1 | tee kick_orphan.log &
```

### Rotate logs (tránh file quá lớn)
```bash
# Backup log cũ
mv kick_orphan.log kick_orphan.log.$(date +%Y%m%d_%H%M%S)

# Hoặc sử dụng logrotate
sudo nano /etc/logrotate.d/kick_orphan
```

Nội dung file logrotate:
```
/path/to/kick_orphan.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

---

## 3. Tìm và quản lý background processes

### Kiểm tra process đang chạy

#### Tìm theo tên script
```bash
ps aux | grep kick_orphan_players
```

#### Tìm theo tên process chi tiết hơn
```bash
ps aux | grep -v grep | grep kick_orphan
```

#### Sử dụng pgrep (gọn hơn)
```bash
pgrep -f kick_orphan_players.sh
```

#### Hiển thị process tree
```bash
pstree -p | grep kick_orphan
```

### Kill processes

#### Kill bằng PID file (nếu đã lưu)
```bash
kill $(cat kick_script.pid)
```

#### Kill bằng tên process
```bash
pkill -f kick_orphan_players.sh
```

#### Force kill nếu cần
```bash
pkill -9 -f kick_orphan_players.sh
```

#### Kill tất cả processes liên quan
```bash
killall kick_orphan_players.sh
```

### Kiểm tra process có chạy không
```bash
# Kiểm tra bằng PID file
if [ -f kick_script.pid ] && kill -0 $(cat kick_script.pid) 2>/dev/null; then
    echo "Script đang chạy"
else
    echo "Script không chạy"
fi
```

---

## 4. Quản lý session với screen và tmux

### Screen commands

#### Tạo và quản lý session
```bash
# Tạo session mới
screen -S kick_orphan

# List tất cả sessions
screen -ls

# Attach vào session
screen -r kick_orphan

# Detach khỏi session: Ctrl+A + D

# Kill session
screen -X -S kick_orphan quit
```

#### Screen trong chế độ daemon
```bash
# Chạy script ngay trong background
screen -dmS kick_orphan ./kick_orphan_players.sh

# Attach để xem output
screen -r kick_orphan
```

### Tmux commands

#### Tạo và quản lý session
```bash
# Tạo session mới
tmux new-session -s kick_orphan

# List sessions
tmux list-sessions

# Attach vào session
tmux attach-session -t kick_orphan

# Detach: Ctrl+B + D

# Kill session
tmux kill-session -t kick_orphan
```

#### Tmux windows và panes
```bash
# Tạo window mới: Ctrl+B + C
# Chuyển window: Ctrl+B + 0,1,2...
# Split pane ngang: Ctrl+B + "
# Split pane dọc: Ctrl+B + %
```

---

## 5. Best practices và lưu ý

### Khuyến nghị sử dụng
```bash
# Phương pháp tốt nhất cho production
nohup ./kick_orphan_players.sh > kick_orphan.log 2>&1 &

# Theo dõi real-time
tail -f kick_orphan.log
```

### Checklist script background

- [ ] Sử dụng `nohup` để script không bị kill khi logout
- [ ] Redirect output để tránh session hang (`> file.log 2>&1`)
- [ ] Lưu PID để dễ quản lý (`echo $! > script.pid`)
- [ ] Thiết lập log rotation để tránh file quá lớn
- [ ] Test script trước khi chạy production
- [ ] Monitor script định kỳ

### Troubleshooting thường gặp

**Script bị kill khi logout SSH:**
```bash
# Sử dụng nohup
nohup ./script.sh &
```

**Không thể kill script:**
```bash
# Force kill
pkill -9 -f script_name.sh
```

**Log file quá lớn:**
```bash
# Truncate log file
> kick_orphan.log
# Hoặc rotate
mv kick_orphan.log kick_orphan.log.backup
```

**Script chạy nhiều instance:**
```bash
# Kiểm tra trước khi start
pgrep -f script_name.sh || nohup ./script_name.sh &
```

---

## Kết luận

Chạy script dưới background là kỹ năng quan trọng trong quản trị Linux. Tùy vào mục đích sử dụng:

- **Development/Testing**: Sử dụng `screen` hoặc `tmux` để dễ debug
- **Production**: Sử dụng `nohup` với logging đầy đủ

**Lệnh khuyến nghị:**
```bash
nohup ./script.sh > script.log 2>&1 & echo $! > script.pid
```

Cách này đảm bảo script chạy bền vững, có logs để debug và dễ dàng quản lý process.
