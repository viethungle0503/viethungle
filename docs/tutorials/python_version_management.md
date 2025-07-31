---
sidebar_position: 15
---

# Quản lý phiên bản Python

## 1.1. Giới thiệu

Việc quản lý nhiều phiên bản Python trên cùng một máy là nhu cầu phổ biến của các developer. Mỗi dự án có thể yêu cầu phiên bản Python khác nhau, và việc chuyển đổi linh hoạt giữa các phiên bản là rất quan trọng.

## 1.2. Các công cụ quản lý phiên bản Python phổ biến

### 1.2.1. pyenv
- **Mô tả**: Công cụ quản lý phiên bản Python phổ biến nhất
- **Hỗ trợ**: Linux, macOS và Windows (qua pyenv-win)
- **Tính năng**: 
  - Cài đặt và chuyển đổi giữa nhiều phiên bản Python
  - Set version global hoặc local cho từng project
  - Cộng đồng lớn, được maintain tích cực
- **Ưu điểm**: Equivalent gần nhất với winnvm về chức năng quản lý version

### 1.2.2. Anaconda/Miniconda
- **Mô tả**: Không chỉ quản lý Python versions mà còn cả packages
- **Tính năng**:
  - Hỗ trợ tạo môi trường ảo (virtual environments)
  - GUI thân thiện với người dùng
  - Package manager tích hợp (conda)
- **Phù hợp**: Data science và machine learning

### 1.2.3. asdf
- **Mô tả**: Công cụ đa ngôn ngữ
- **Tính năng**:
  - Quản lý được nhiều ngôn ngữ lập trình, không chỉ Python
  - Plugin system linh hoạt
  - Cú pháp đơn giản, dễ sử dụng

### 1.2.4. Các lựa chọn khác
- **pipenv**: Kết hợp pip và virtualenv
- **poetry**: Quản lý dependencies hiện đại
- **virtualenv/venv**: Built-in Python, đơn giản

## 1.3. Hướng dẫn sử dụng pyenv

### 1.3.1. Cài đặt pyenv

#### Trên Linux/macOS:
```bash
# Sử dụng pyenv-installer
curl https://pyenv.run | bash

# Hoặc clone từ GitHub
git clone https://github.com/pyenv/pyenv.git ~/.pyenv
```

#### Trên Windows:
```bash
# Cài đặt pyenv-win
git clone https://github.com/pyenv-win/pyenv-win.git %USERPROFILE%\.pyenv
```

### 1.3.2. Cấu hình shell

#### Bash/Zsh:
```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

#### Windows PowerShell:
```powershell
# Thêm vào PowerShell profile
[System.Environment]::SetEnvironmentVariable('PYENV',$env:USERPROFILE + "\.pyenv\pyenv-win\","User")
[System.Environment]::SetEnvironmentVariable('PYENV_ROOT',$env:USERPROFILE + "\.pyenv\pyenv-win\","User")
[System.Environment]::SetEnvironmentVariable('PYENV_HOME',$env:USERPROFILE + "\.pyenv\pyenv-win\","User")
```

### 1.3.3. Các lệnh cơ bản

#### Liệt kê phiên bản có sẵn:
```bash
pyenv install --list
```

#### Cài đặt phiên bản Python:
```bash
# Cài đặt Python 3.11.0
pyenv install 3.11.0

# Cài đặt Python 3.9.18
pyenv install 3.9.18
```

#### Liệt kê phiên bản đã cài:
```bash
pyenv versions
```

#### Chuyển đổi phiên bản:
```bash
# Set global version (cho toàn hệ thống)
pyenv global 3.11.0

# Set local version (cho project hiện tại)
pyenv local 3.9.18

# Sử dụng tạm thời cho shell session
pyenv shell 3.10.0
```

#### Kiểm tra phiên bản hiện tại:
```bash
pyenv version
python --version
```

#### Gỡ cài đặt phiên bản:
```bash
pyenv uninstall 3.9.18
```

### 1.3.4. Sử dụng nâng cao

#### Cài đặt multiple versions cùng lúc:
```bash
pyenv install 3.9.18 3.10.12 3.11.0
```

#### Tạo alias cho phiên bản:
```bash
# Tạo symlink
ln -s ~/.pyenv/versions/3.11.0 ~/.pyenv/versions/latest
pyenv global latest
```

#### Sử dụng với Virtual Environment:
```bash
# Tạo virtual environment
pyenv virtualenv 3.11.0 myproject

# Kích hoạt
pyenv activate myproject

# Deactivate
pyenv deactivate
```

## 1.4. Troubleshooting

### 1.4.1. Lỗi thường gặp

#### Python version không tìm thấy:
```bash
# Refresh pyenv
pyenv rehash

# Kiểm tra PATH
echo $PATH
```

### 1.4.2. Performance tips

- Sử dụng `pyenv install --keep` để giữ lại source code sau khi build
- Cache build artifacts với `PYTHON_CONFIGURE_OPTS="--enable-shared"`
- Sử dụng pre-compiled binaries khi có thể