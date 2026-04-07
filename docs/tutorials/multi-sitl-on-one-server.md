---
sidebar_position: 22
title: "22. Chạy ArduPilot SITL trên VPS: Đơn lẻ và Multi-instance"
slug: multi-sitl-on-one-server
sidebar_label: ArduPilot SITL trên VPS
description: Hướng dẫn chạy một hoặc nhiều ArduPilot SITL (ArduCopter) trên cùng một máy Linux/VPS headless, bao gồm cách dùng tmux/screen để quản lý session.
---

## Tóm tắt

Tài liệu này hướng dẫn cách chạy **ArduPilot SITL (Software In The Loop)** trên **máy Linux/VPS headless** (không có X11), bao gồm:

- Chạy **1 SITL đơn lẻ** với tmux hoặc screen
- Chạy **nhiều SITL đồng thời** trên cùng một máy, tránh xung đột port
- Quản lý session bằng **tmux** và **screen**

---

## 1. Chạy trên VPS headless: Disable X11

`sim_vehicle.py` sử dụng script `run_in_terminal_window.sh` để mở terminal con. Trên VPS không có X11, script này tự động thử các phương thức theo thứ tự:

1. Biến `SITL_RITW_TERMINAL` (nếu được set)
2. tmux (nếu đang trong tmux session)
3. X11 terminals: xterm, konsole, gnome-terminal (cần `$DISPLAY`)
4. screen (nếu đang trong screen session)
5. zellij
6. Fallback: ghi log ra `/tmp/$name.log`

**Trên VPS headless**, cách đơn giản nhất là export biến môi trường:

```bash
export SITL_RITW_TERMINAL="screen -D -m"
```

Hoặc chạy SITL từ bên trong một tmux/screen session (script sẽ tự detect).

---

## 2. Chạy 1 SITL đơn lẻ

Khi chỉ cần chạy **một instance SITL** trên VPS, dùng tmux hoặc screen để giữ session sống khi ngắt SSH.

### Dùng tmux

```bash
tmux new-session -d -s sitl "sim_vehicle.py -v ArduCopter -f quad -L JAPAN --out tcpin:0.0.0.0:5770"
```

| Flag | Ý nghĩa |
|------|---------|
| `new-session` | Tạo session mới |
| `-d` | Detached — không attach ngay |
| `-s sitl` | Đặt tên session là `sitl` |
| `"..."` | Lệnh chạy trong session |

Quản lý session:

```bash
tmux list-sessions          # Liệt kê sessions
tmux attach-session -t sitl # Attach vào session
# Ctrl+B, D                 # Detach khỏi session
tmux kill-session -t sitl   # Tắt session
```

### Dùng screen

```bash
screen -dmS sitl bash -c "sim_vehicle.py -v ArduCopter -f quad -L JAPAN --out tcpin:0.0.0.0:5770"
```

| Flag | Ý nghĩa |
|------|---------|
| `-d -m` | Detached — tạo session mới không attach |
| `-S sitl` | Đặt tên session là `sitl` |
| `bash -c "..."` | Chạy lệnh trong shell con |

Quản lý session:

```bash
screen -ls            # Liệt kê sessions
screen -r sitl        # Attach vào session
# Ctrl+A, D           # Detach khỏi session
screen -X -S sitl quit # Tắt session
```

### Giải thích tham số sim_vehicle.py

| Tham số | Ý nghĩa |
|---------|---------|
| `-v ArduCopter` | Vehicle type: ArduCopter |
| `-f quad` | Frame: quadcopter |
| `-L JAPAN` | Location preset (tọa độ khởi tạo) |
| `--out tcpin:0.0.0.0:5770` | MAVProxy mở TCP listener trên port 5770, GCS kết nối vào đây |

---

## 3. Chạy nhiều SITL trên cùng một máy

### Vấn đề thường gặp

Khi chạy nhiều SITL mà không cấu hình đúng:

- **Trùng port mặc định** — tất cả SITL đều dùng port `5760`
- **Trùng `MAV_SYSID`** — GCS không phân biệt được vehicle
- **MAVProxy báo lỗi**:
  ```
  MAV> link 1 down
  ```
- **GCS (QGroundControl / Mission Planner) bị trộn vehicle**
- **SITL yêu cầu X11** trên VPS headless → lỗi

### Cơ chế multi-instance (`-I`)

`sim_vehicle.py` hỗ trợ chạy nhiều SITL thông qua tham số **Instance ID** (`-I`). Port được tính theo công thức:

```
port = 5760 + (instance × 10)
```

| Instance | MAVLink TCP Port |
|----------|-----------------|
| `-I0` | 5760 |
| `-I1` | 5770 |
| `-I2` | 5780 |
| `-I3` | 5790 |

### Quy tắc bắt buộc

- Mỗi SITL có **`-I` khác nhau**
- Mỗi SITL có **`--sysid` khác nhau** (hoặc dùng `--auto-sysid`)
- Port MAVLink (`--out`) **không trùng nhau**

### Ví dụ: 2 SITL đồng thời

Trước tiên, export biến môi trường (nếu chưa ở trong tmux/screen):

```bash
export SITL_RITW_TERMINAL="screen -D -m"
```

#### Dùng tmux

```bash
tmux new-session -d -s sitl0 "sim_vehicle.py -v ArduCopter -f quad -L DUY   -I0 --sysid 1 --out tcpin:0.0.0.0:5760"
tmux new-session -d -s sitl1 "sim_vehicle.py -v ArduCopter -f quad -L JAPAN -I1 --sysid 2 --out tcpin:0.0.0.0:5770"
```

#### Dùng screen

```bash
screen -dmS sitl0 bash -c "sim_vehicle.py -v ArduCopter -f quad -L DUY   -I0 --sysid 1 --out tcpin:0.0.0.0:5760"
screen -dmS sitl1 bash -c "sim_vehicle.py -v ArduCopter -f quad -L JAPAN -I1 --sysid 2 --out tcpin:0.0.0.0:5770"
```

:::tip `--auto-sysid`
Thay vì set `--sysid` thủ công, có thể dùng `--auto-sysid`. Flag này tự set `MAV_SYSID = instance + 1`:
- `-I0` → sysid 1
- `-I1` → sysid 2
- `-I2` → sysid 3

**Không dùng `--sysid` và `--auto-sysid` cùng lúc** — sẽ bị lỗi.
:::

---

## 4. MAVProxy và port UDP 14550

Mặc định MAVProxy forward MAVLink qua UDP `127.0.0.1:14550`. Khi chạy nhiều instance, cần tránh trùng:

| Instance | UDP Output |
|----------|-----------|
| `-I0` | 14550 |
| `-I1` | 14560 |
| `-I2` | 14570 |

Có thể thêm `--out udp:127.0.0.1:14560` để chỉ định rõ.

---

## 5. Kiểm tra port

```bash
ss -ltnp | grep -E '5760|5770|5780|5790'
```

Nếu port đã listening thì instance đang chạy.

---

## 6. So sánh tmux vs screen

| | tmux | screen |
|---|------|--------|
| **Tạo detached session** | `tmux new-session -d -s NAME "CMD"` | `screen -dmS NAME bash -c "CMD"` |
| **List sessions** | `tmux list-sessions` | `screen -ls` |
| **Attach** | `tmux attach-session -t NAME` | `screen -r NAME` |
| **Detach** | `Ctrl+B`, `D` | `Ctrl+A`, `D` |
| **Kill session** | `tmux kill-session -t NAME` | `screen -X -S NAME quit` |
| **Split ngang** | `Ctrl+B`, `"` | `Ctrl+A`, `S` |
| **Split dọc** | `Ctrl+B`, `%` | `Ctrl+A`, `\|` |
| **Cài đặt** | Thường có sẵn / `apt install tmux` | `apt install screen` |

Cả hai đều giữ session sống khi ngắt SSH. **tmux** phổ biến hơn và có nhiều tính năng hơn (pane layout, scripting). **screen** nhẹ hơn và có sẵn trên nhiều distro cũ.

---

## 7. Tổng kết

| Tình huống | Lệnh |
|-----------|------|
| 1 SITL, dùng tmux | `tmux new-session -d -s sitl "sim_vehicle.py -v ArduCopter -f quad -L JAPAN --out tcpin:0.0.0.0:5770"` |
| 1 SITL, dùng screen | `screen -dmS sitl bash -c "sim_vehicle.py -v ArduCopter -f quad -L JAPAN --out tcpin:0.0.0.0:5770"` |
| Multi SITL | Dùng `-I`, `--sysid` (hoặc `--auto-sysid`), port khác nhau |
| VPS headless | `export SITL_RITW_TERMINAL="screen -D -m"` hoặc chạy trong tmux/screen |
