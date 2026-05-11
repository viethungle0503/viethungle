---
sidebar_position: 23
sidebar_label: SSH Key Guide
title: "23. SSH Key — Kết nối GitHub & VPS"
description: Hướng dẫn tạo và cấu hình SSH key trên Windows, macOS, Linux để kết nối với GitHub và VPS
date: 2026-03-17
tags: [ssh, github, vps, devops]
---

# 23. SSH Key — Kết nối GitHub & VPS

## Tổng quan

| Mục đích | Cơ chế |
|---|---|
| Kết nối GitHub | Public key thêm vào GitHub Settings |
| Kết nối VPS | Public key thêm vào `~/.ssh/authorized_keys` trên server |

:::info
SSH key gồm 2 phần: **private key** (giữ trên máy local, không chia sẻ) và **public key** (`.pub`, upload lên GitHub/server).
:::

---

## 1. Tạo SSH Key

### Windows

```powershell
# Kiểm tra OpenSSH đã có chưa
ssh -V

# Tạo key (Ed25519 — recommended)
ssh-keygen -t ed25519 -C "your_email@example.com" -f "$env:USERPROFILE\.ssh\your-key-name"
```

> **Git Bash** hoặc **PowerShell** đều dùng được. OpenSSH đã có sẵn từ Windows 10.

### macOS

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/your-key-name
```

### Linux

```bash
ssh-keygen -t ed25519 -C "your_email@example.com" -f ~/.ssh/your-key-name
```

:::tip
Khi chạy lệnh, bạn sẽ được hỏi passphrase. Có thể để trống (Enter) nếu muốn tự động hóa, hoặc đặt passphrase để bảo mật hơn.
:::

Sau khi tạo, kiểm tra:

```bash
ls ~/.ssh
# your-key-name      ← private key (KHÔNG chia sẻ)
# your-key-name.pub  ← public key (upload lên GitHub/VPS)
```

---

## 2. Kết nối GitHub

### Bước 1 — Lấy public key

```bash
cat ~/.ssh/your-key-name.pub
```

Copy toàn bộ output (bắt đầu bằng `ssh-ed25519 ...`).

### Bước 2 — Thêm lên GitHub

**GitHub → Settings → SSH and GPG keys → New SSH key** → Paste vào và Save.

### Bước 3 — Cấu hình `~/.ssh/config`

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/your-key-name
```

### Bước 4 — Test

```bash
ssh -T git@github.com
# Hi username! You've successfully authenticated...
```

### Bước 5 — Clone repo

```bash
git clone git@github.com:username/repo.git
```

---

## 3. Kết nối VPS

### Cách 1 — `ssh-copy-id` (Linux/macOS)

```bash
ssh-copy-id -i ~/.ssh/your-key-name.pub user@your-vps-ip
```

Lệnh này tự động append public key vào `~/.ssh/authorized_keys` trên VPS.

### Cách 2 — Manual (Windows hoặc khi không có `ssh-copy-id`)

```bash
cat ~/.ssh/your-key-name.pub | ssh user@your-vps-ip \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### Cấu hình `~/.ssh/config`

```
Host my-vps
    HostName your-vps-ip
    User user
    IdentityFile ~/.ssh/your-key-name
    Port 22
```

### Test kết nối

```bash
# Với alias từ config
ssh my-vps

# Hoặc chỉ định key thủ công
ssh -i ~/.ssh/your-key-name user@your-vps-ip
```

---

## 4. Clone repo trên VPS (sau khi SSH vào)

Có 2 phương án để clone GitHub repo từ bên trong VPS:

### Phương án A — SSH Agent Forwarding (Recommended)

Không cần tạo thêm key trên VPS. Key từ máy local được forward sang VPS trong session SSH.

**Trên máy local** — thêm `ForwardAgent yes` vào config:

```
Host my-vps
    HostName your-vps-ip
    User user
    IdentityFile ~/.ssh/your-key-name
    ForwardAgent yes
```

**Trên máy local** — start agent và add key:

```bash
# Linux/macOS
eval $(ssh-agent -s)
ssh-add ~/.ssh/your-key-name

# Windows (PowerShell — chạy 1 lần, enable service)
Set-Service ssh-agent -StartupType Automatic
Start-Service ssh-agent
ssh-add $env:USERPROFILE\.ssh\your-key-name
```

**SSH vào VPS rồi clone bình thường:**

```bash
ssh my-vps
git clone git@github.com:username/repo.git
```

### Phương án B — Tạo key mới trên VPS

Phù hợp cho CI/CD server hoặc production environment.

```bash
# Trên VPS
ssh-keygen -t ed25519 -C "vps@hostname" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Copy output → thêm lên **GitHub → Settings → SSH keys**.

---

## 5. So sánh Agent Forwarding vs Key trên VPS

| | Agent Forwarding | Key riêng trên VPS |
|---|---|---|
| Bảo mật | ✅ Private key không rời máy local | ⚠️ Private key tồn tại trên server |
| Tiện lợi | Cần agent đang chạy khi SSH | Clone bất cứ lúc nào |
| Phù hợp | Dev machine, personal VPS | CI/CD server, production |

---

## 6. Cấu hình nhiều key (Multi-key Setup)

Nếu có nhiều key (GitHub, VPS khác nhau, work/personal):

```
# ~/.ssh/config

# GitHub personal
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/personal-key

# GitHub work
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/work-key

# VPS 1
Host vps-prod
    HostName 1.2.3.4
    User ubuntu
    IdentityFile ~/.ssh/prod-key

# VPS 2
Host vps-dev
    HostName 5.6.7.8
    User root
    IdentityFile ~/.ssh/dev-key
    ForwardAgent yes
```

Clone với GitHub work account:

```bash
git clone git@github-work:org/repo.git
```

---

## Troubleshooting

### Permission denied (publickey)

```bash
# Kiểm tra key đang được load
ssh-add -l

# Debug verbose
ssh -vT git@github.com
```

### Bad permissions

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/your-key-name
chmod 644 ~/.ssh/your-key-name.pub
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/authorized_keys  # trên VPS
```

### Agent không nhớ key sau khi restart (Linux/macOS)

Thêm vào `~/.bashrc` hoặc `~/.zshrc`:

```bash
if [ -z "$SSH_AUTH_SOCK" ]; then
  eval $(ssh-agent -s)
  ssh-add ~/.ssh/your-key-name
fi
```
