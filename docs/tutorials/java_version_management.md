---
sidebar_position: 16
---

# Quản lý phiên bản Java và JVM

## 2.1. Giới thiệu

Java ecosystem có một đặc điểm độc đáo là có nhiều vendor cung cấp JDK implementations khác nhau, khác với các ngôn ngữ như C# được Microsoft kiểm soát hoàn toàn. Việc quản lý nhiều phiên bản Java và chuyển đổi linh hoạt giữa chúng là nhu cầu thiết yếu của Java developers.

## 2.2. JDK vs SDK - Hiểu đúng khái niệm

### 2.2.1. JDK (Java Development Kit)
- **Định nghĩa**: Development toolkit hoàn chỉnh cho Java
- **Bao gồm**: 
  - Compiler (javac)
  - Debugger
  - Documentation tools
  - JRE (Java Runtime Environment)
- **Mục đích**: Dùng để **phát triển** ứng dụng Java

### 2.2.2. SDK (Software Development Kit)
- **Định nghĩa**: Khái niệm **tổng quát hơn** cho bất kỳ ngôn ngữ/platform nào
- **Mối quan hệ**: JDK chính là một loại SDK (SDK của Java)
- **Ví dụ khác**: Android SDK, iOS SDK, .NET SDK

## 2.3. Tại sao Java có nhiều vendor?

### 2.3.1. Lịch sử phát triển
1. **Sun Microsystems** tạo ra Java (1995)
2. **Oracle** mua lại Sun (2010), sở hữu Oracle JDK
3. **OpenJDK** được open-source, trở thành reference implementation
4. Nhiều tổ chức build từ OpenJDK source code

### 2.3.2. Các nhà phát hành phổ biến

#### Oracle JDK
- **Đặc điểm**: Commercial, có support trả phí
- **Sử dụng**: Production environments cần official support

#### Eclipse Temurin (Adoptium)
- **Đặc điểm**: Free, được Eclipse Foundation maintain
- **Identifier trong SDKMAN!**: `-tem`
- **Sử dụng**: Open-source projects, general development

#### Amazon Corretto
- **Đặc điểm**: AWS's distribution, optimized cho cloud
- **Identifier**: `-amzn`
- **Sử dụng**: AWS deployments

#### Azul Zulu
- **Đặc điểm**: Enterprise-focused, có cả free và commercial
- **Identifier**: `-zulu`
- **Sử dụng**: Enterprise applications

#### Red Hat OpenJDK
- **Đặc điểm**: Tích hợp với Red Hat ecosystem
- **Sử dụng**: Red Hat Linux environments

#### Microsoft Build of OpenJDK
- **Đặc điểm**: Optimized cho Azure và Windows
- **Identifier**: `-ms`
- **Sử dụng**: Microsoft Azure, Windows environments

### 2.3.3. So sánh với C#/.NET

#### C#/.NET Model:
- Microsoft kiểm soát hoàn toàn specification và implementation
- Chỉ có Microsoft .NET và .NET Core/5+
- Ecosystem thống nhất nhưng ít lựa chọn
- Vendor lock-in risk cao

#### Java Model:
- OpenJDK làm reference, nhiều vendor tự build
- Mỗi distribution có optimizations riêng (performance, security, support)
- Java specification được kiểm soát bởi JCP (Java Community Process)
- Competition drives innovation và choice flexibility

### 2.3.4. Lợi ích của Java model
- **Tránh vendor lock-in**: Luôn có alternatives
- **Innovation**: Cạnh tranh thúc đẩy cải tiến
- **Specialized distributions**: Tối ưu cho use cases khác nhau
- **Free alternatives**: Luôn có lựa chọn miễn phí

## 2.4. Các công cụ quản lý phiên bản Java

### 2.4.1. SDKMAN! (Khuyến nghị)
- **Hỗ trợ**: Linux, macOS và Windows (qua Git Bash/WSL)
- **Tính năng**: Quản lý không chỉ Java mà còn Gradle, Maven, Kotlin, Scala
- **Ưu điểm**: Feature-rich và community support tốt
- **Cú pháp**: Đơn giản, intuitive

### 2.4.2. jEnv
- **Đặc điểm**: Tương tự pyenv, chuyên biệt cho Java
- **Hỗ trợ**: macOS và Linux
- **Ưu điểm**: Lightweight, dễ sử dụng

### 2.4.3. asdf (với plugin java)
- **Đặc điểm**: Plugin asdf-java rất ổn định
- **Ưu điểm**: Quản lý đa ngôn ngữ trong một tool
- **Consistency**: Syntax nhất quán across languages

### 2.4.4. Jabba
- **Đặc điểm**: Cross-platform (Windows, macOS, Linux)
- **Inspired by**: nvm (Node Version Manager)
- **Ưu điểm**: Đơn giản, nhẹ

### 2.4.5. Các lựa chọn khác
- **Coursier**: Từ Scala ecosystem nhưng hỗ trợ Java tốt
- **Maven Toolchains**: Built-in Maven solution
- **IntelliJ IDEA**: IDE có built-in JDK management

## 2.5. Hướng dẫn sử dụng SDKMAN!

### 2.5.1. Cài đặt trên Windows (Git Bash)

#### Bước 1: Chuẩn bị môi trường
```bash
# Kiểm tra Git Bash có sẵn curl, unzip, zip
curl --version
unzip -v
zip -v
```

#### Bước 2: Cài đặt zip/unzip (nếu thiếu)
```bash
# Download zip.exe và unzip.exe từ GnuWin32
# Copy vào Git Bash directory: C:\Program Files\Git\usr\bin\

# Hoặc tạo alias tạm thời
alias zip='"/c/Program Files/7-Zip/7z.exe" a'
alias unzip='"/c/Program Files/7-Zip/7z.exe" x'
```

#### Bước 3: Cài đặt SDKMAN!
```bash
# Download và cài đặt
curl -s "https://get.sdkman.io" | bash

# Reload shell hoặc source
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Kiểm tra cài đặt
sdk version
```

### 2.5.2. Cú pháp và lệnh cơ bản

#### Structure của SDKMAN! commands:
```bash
sdk <subcommand> <candidate> [version] [options]
```

#### Liệt kê candidates và versions:
```bash
# Liệt kê tất cả candidates có sẵn
sdk list

# Liệt kê Java versions có sẵn
sdk list java

# Lọc chỉ các version Temurin
sdk list java | grep tem

# Tìm cụ thể Java 21 Temurin
sdk list java | grep -E "(21.*tem|tem.*21)"
```

#### Cài đặt và quản lý versions:
```bash
# Cài đặt Java version cụ thể
sdk install java 17.0.9-tem    # Temurin 17
sdk install java 21.0.1-tem    # Temurin 21
sdk install java 11.0.21-zulu  # Azul Zulu 11

# Cài đặt version mới nhất
sdk install java 21-tem

# Cài đặt vào đường dẫn tùy chỉnh
sdk install java 17.0.9-tem /custom/path
```

#### Chuyển đổi versions:
```bash
# Sử dụng tạm thời cho session hiện tại
sdk use java 17.0.9-tem

# Set làm default cho tất cả sessions
sdk default java 17.0.9-tem

# Kiểm tra version hiện tại
sdk current java
java -version
```

#### Quản lý installations:
```bash
# Gỡ cài đặt version
sdk uninstall java 11.0.21-zulu

# Kiểm tra đường dẫn home của version
sdk home java 17.0.9-tem

# Upgrade candidates
sdk upgrade java
```

#### Configuration và utilities:
```bash
# Cấu hình SDKMAN!
sdk config

# Offline mode
sdk offline enable
sdk offline disable

# Update candidate lists
sdk update

# Self update SDKMAN!
sdk selfupdate

# Clear caches
sdk flush tmp
sdk flush metadata
sdk flush version
```

### 2.5.3. Quản lý môi trường project

#### Project-specific Java version:
```bash
# Trong project directory
echo "java=17.0.9-tem" > .sdkmanrc

# Auto-switch khi vào directory
sdk env install
sdk env
```

#### Environment commands:
```bash
# Initialize environment
sdk env init

# Install all candidates từ .sdkmanrc
sdk env install

# Clear environment
sdk env clear
```

## 2.6. Cấu hình JAVA_HOME

### 2.6.1. Tại sao cần JAVA_HOME?

JAVA_HOME là environment variable quan trọng được nhiều tools sử dụng:
- **Maven**: Để compile và run Java applications
- **Gradle**: Build tool cần biết JDK location
- **IDEs**: IntelliJ, Eclipse cần detect JDK
- **Application servers**: Tomcat, JBoss cần JDK path

### 2.6.2. Cấu hình JAVA_HOME với SDKMAN!

#### Automatic setup (SDKMAN! tự động):
```bash
# SDKMAN! tự động set JAVA_HOME khi switch version
sdk use java 17.0.9-tem
echo $JAVA_HOME
# Output: /home/user/.sdkman/candidates/java/current
```

#### Manual setup trên Windows:

##### PowerShell:
```powershell
# Temporary (session hiện tại)
$env:JAVA_HOME = "$env:USERPROFILE\.sdkman\candidates\java\current"

# Permanent (system-wide)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "$env:USERPROFILE\.sdkman\candidates\java\current", "User")
```

##### Git Bash:
```bash
# Temporary
export JAVA_HOME="$HOME/.sdkman/candidates/java/current"

# Permanent (thêm vào ~/.bashrc)
echo 'export JAVA_HOME="$HOME/.sdkman/candidates/java/current"' >> ~/.bashrc
```

##### System Environment Variables (Windows):
1. **Windows + R** → `sysdm.cpl` → **Advanced** → **Environment Variables**
2. **System Variables** → **New**:
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Users\YourName\.sdkman\candidates\java\current`
3. **Restart terminals**

### 2.6.3. Verification:
```bash
# Kiểm tra JAVA_HOME
echo $JAVA_HOME

# Kiểm tra Java executables
java -version
javac -version

# Kiểm tra Maven có nhận JAVA_HOME không
./mvnw --version
```

### 2.6.4. Troubleshooting JAVA_HOME

#### Lỗi "JAVA_HOME not defined correctly":
```bash
# Debug steps
echo $JAVA_HOME
ls -la $JAVA_HOME/bin/java
which java

# Fix bằng cách set lại
sdk current java
sdk use java $(sdk current java | cut -d' ' -f4)
```

#### Multiple Java versions conflict:
```bash
# Unset conflicting variables
unset JAVA_HOME
unset JRE_HOME

# Let SDKMAN! handle it
sdk use java 17.0.9-tem
```

## 2.7. Maven Wrapper và Package Management

### 2.7.1. Maven Wrapper hoạt động như thế nào?

Maven Wrapper (mvnw) là script tự động download và manage Maven version cho project, đảm bảo reproducible builds.

#### Process flow:
1. **Check existing**: Kiểm tra Maven đã có chưa tại `~/.m2/wrapper/dists/`
2. **Download**: Nếu chưa có, tải về temporary directory
3. **Extract**: Giải nén trong temp directory
4. **Move**: Di chuyển từ temp sang permanent location
5. **Execute**: Chạy Maven từ location này
6. **Cleanup**: Xóa temporary files

### 2.7.2. Maven storage locations

#### Permanent Maven storage:
```bash
# Linux/macOS/Git Bash
~/.m2/wrapper/dists/apache-maven-<version>/<hash>/
# Ví dụ: ~/.m2/wrapper/dists/apache-maven-3.9.6/a1b2c3d4e5f6/

# Windows
%USERPROFILE%\.m2\wrapper\dists\apache-maven-<version>\<hash>\
# Ví dụ: C:\Users\YourName\.m2\wrapper\dists\apache-maven-3.9.6\a1b2c3d4e5f6\
```

#### Hash-based directory structure:
```bash
# Hash được tính từ distribution URL
distributionUrl="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip"
hash=$(echo -n "$distributionUrl" | md5sum | cut -d' ' -f1)
```

### 2.7.3. Quản lý Maven Wrapper storage

#### Kiểm tra Maven installations:
```bash
# List all Maven wrapper installations
ls -la ~/.m2/wrapper/dists/
```

#### Cleanup Maven wrapper cache:
```bash
# Xóa tất cả Maven wrapper downloads
rm -rf ~/.m2/wrapper/

# Xóa chỉ temporary files (thường tự động cleanup)
find ~/.m2/wrapper/ -name "*.tmp" -delete
```

#### Maven repository vs wrapper:
```bash
# Maven local repository (dependencies)
~/.m2/repository/

# Maven wrapper installations (Maven tool itself)
~/.m2/wrapper/dists/
```
