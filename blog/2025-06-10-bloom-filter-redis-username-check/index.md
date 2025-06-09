---
slug: bloom-filter-redis-username-check
title: 'Kiểm tra tên đăng nhập trong 1 tỷ người dùng với Bloom Filter và Redis'
authors: viethungle0503
tags: [redis, bloom-filter, database, system-design, performance, interview, development]
---

# Phỏng vấn: Làm thế nào để kiểm tra tên đăng nhập đã tồn tại trong 1 tỷ người dùng?

*P/s: Đừng trả lời kiểu "hệ thống của em đâu có đến 1 tỷ user đâu anh ơi…" nha! Ở công ty có quy mô từ vừa đến lớn thì việc tiết kiệm tài nguyên và phản hồi nhanh rất được quan tâm, phỏng vấn thì phải có tí challenge mới vui chứ!*

<!--truncate-->

Với hàng tỷ người dùng, làm sao hệ thống có thể kiểm tra nhanh tên đăng nhập đã được sử dụng hay chưa? Nếu mỗi lần đều truy vấn trực tiếp vào database thì sẽ rất chậm và tốn tài nguyên.

## 🚀 Giải pháp tối ưu: RedisBloom - Bloom Filter trên Redis!

### Bloom Filter là gì?

Một cấu trúc dữ liệu "thông minh", chuyên dùng kiểm tra xem phần tử có thuộc tập hợp không, với các điểm mạnh sau:

✅ **Siêu tiết kiệm bộ nhớ**: Chỉ cần một phần nhỏ dung lượng so với việc lưu toàn bộ dữ liệu.  
✅ **Tốc độ truy vấn cực nhanh**: Chỉ vài thao tác hash là có ngay kết quả.  
⚠️ **Nhưng có thể trả về "dương tính giả" (false positive)**: Đôi lúc báo tên đã tồn tại, mặc dù thật ra chưa (trong trường hợp này không gây ảnh hưởng gì cả).

Tuy vậy, trong thực tế (như kiểm tra tên đăng nhập), mức "nhầm" này hoàn toàn kiểm soát và chấp nhận được – đổi lại bạn có tốc độ xử lý cực nhanh và bộ nhớ siêu tối ưu!

## 🎯 Bài toán: Kiểm tra tên đăng nhập trong 1 tỷ người dùng

### Thách thức chính:

- Với 1 tỷ người dùng, việc truy vấn trực tiếp database mỗi lần kiểm tra sẽ rất chậm
- Tốn nhiều tài nguyên hệ thống (CPU, I/O, network)
- Trải nghiệm người dùng kém do phải chờ đợi

## 💡 Giải pháp: Bloom Filter với RedisBloom

### Bloom Filter hoạt động như thế nào?

#### 1. Cấu trúc dữ liệu:
- Là một mảng bit có kích thước cố định (ví dụ: 10 triệu bit)
- Ban đầu tất cả bit đều = 0
- Sử dụng nhiều hàm hash khác nhau (thường 3-7 hàm)

#### 2. Thêm phần tử (username):
```
Username "john123" → 
Hash1("john123") = 1247 → set bit[1247] = 1
Hash2("john123") = 8932 → set bit[8932] = 1  
Hash3("john123") = 5681 → set bit[5681] = 1
```

#### 3. Kiểm tra phần tử:
```
Kiểm tra "mary456" →
Hash1("mary456") = 1247 → bit[1247] = 1 ✓
Hash2("mary456") = 3421 → bit[3421] = 0 ✗
→ Kết quả: KHÔNG tồn tại (chắc chắn 100%)

Kiểm tra "bob789" →
Hash1("bob789") = 1247 → bit[1247] = 1 ✓
Hash2("bob789") = 8932 → bit[8932] = 1 ✓
Hash3("bob789") = 2156 → bit[2156] = 1 ✓
→ Kết quả: CÓ THỂ tồn tại (cần kiểm tra thêm)
```

## 🏆 Ưu điểm của giải pháp:

### 1. Tiết kiệm bộ nhớ cực kỳ:
- **1 tỷ username nếu lưu trực tiếp**: ~50GB (trung bình 50 ký tự/username)
- **Bloom Filter**: chỉ cần ~1.2GB với tỷ lệ false positive 1%

### 2. Tốc độ siêu nhanh:
- Chỉ cần vài phép hash đơn giản
- Không cần truy vấn database
- Thời gian trả lời: O(k) với k là số hàm hash

### 3. False Positive được kiểm soát:
- Có thể điều chỉnh tỷ lệ false positive (1%, 0.1%, 0.01%...)
- Không bao giờ có False Negative (nếu nó nói "không tồn tại" thì chắc chắn không tồn tại)

## ⚙️ Triển khai thực tế với RedisBloom:

```bash
# Tạo Bloom Filter
BF.RESERVE usernames 0.01 1000000000

# Thêm username
BF.ADD usernames "john123"

# Kiểm tra username
BF.EXISTS usernames "mary456"
```

### Quy trình kiểm tra tối ưu:

```python
def check_username_exists(username):
    # Bước 1: Kiểm tra Bloom Filter (siêu nhanh)
    if not bloom_filter.exists(username):
        return False  # Chắc chắn không tồn tại
    
    # Bước 2: Chỉ khi Bloom Filter báo "có thể tồn tại" 
    # mới truy vấn database để xác nhận
    return database.exists(username)
```

## 📊 Lợi ích trong thực tế:

- **Giảm 99%+ truy vấn database**: Chỉ những trường hợp false positive mới cần truy vấn DB
- **Tăng tốc độ phản hồi**: Từ 100ms xuống còn 1ms
- **Tiết kiệm chi phí**: Ít tải cho database server, giảm chi phí cloud

## 🔧 Điều chỉnh tỷ lệ False Positive

Có 3 tham số chính ảnh hưởng đến false positive:

### a) Kích thước mảng bit (m):
- Mảng bit càng lớn → false positive càng thấp
- Nhưng tốn nhiều bộ nhớ hơn

### b) Số hàm hash (k):
- Có công thức tối ưu: `k = (m/n) × ln(2)`
- Với m = kích thước mảng bit, n = số phần tử
- Quá ít hash → nhiều collision
- Quá nhiều hash → tăng xác suất false positive

### c) Số phần tử thực tế (n):
- Càng nhiều phần tử → false positive càng cao

**Công thức false positive:**
```
p ≈ (1 - e^(-kn/m))^k
```

### Cấu hình RedisBloom:

```bash
# Cách 1: Thiết lập false positive rate trực tiếp
BF.RESERVE usernames 0.01 1000000000
#                     ↑     ↑
#               false_rate capacity

# Cách 2: Thiết lập thủ công các tham số
BF.RESERVE usernames 0.01 1000000000 EXPANSION 2 NONSCALING
```

## 🗄️ Redis KHÔNG lưu cache toàn bộ username

**Điểm quan trọng**: Redis không lưu trữ các username thực tế, mà chỉ lưu mảng bit của Bloom Filter.

### Cách hoạt động thực tế:

#### Bước 1: Khởi tạo Bloom Filter rỗng
```bash
BF.RESERVE usernames 0.01 1000000000
# Tạo mảng bit rỗng, kích thước ~1.2GB
```

#### Bước 2: Dần dần thêm username vào filter
```python
# Khi user đăng ký thành công
def register_user(username):
    # Lưu vào database
    database.insert_user(username)
    
    # Đồng thời đánh dấu trong Bloom Filter
    redis.execute_command("BF.ADD", "usernames", username)
```

#### Bước 3: Kiểm tra username
```python
def check_username_available(username):
    # Chỉ kiểm tra mảng bit, KHÔNG cần truy cập username gốc
    exists_in_filter = redis.execute_command("BF.EXISTS", "usernames", username)
    
    if not exists_in_filter:
        return True  # Chắc chắn username available
    else:
        # False positive có thể xảy ra, cần kiểm tra DB
        return not database.exists(username)
```

### Ví dụ cụ thể:

```python
# Giả sử có username "john123"
username = "john123"

# Khi thêm vào Bloom Filter:
hash1 = hash_func1("john123") % array_size  # = 1247
hash2 = hash_func2("john123") % array_size  # = 8932  
hash3 = hash_func3("john123") % array_size  # = 5681

# Redis chỉ lưu:
bit_array[1247] = 1
bit_array[8932] = 1
bit_array[5681] = 1

# KHÔNG lưu chuỗi "john123" ở đâu cả!
```

## 📈 So sánh bộ nhớ:

### Lưu trực tiếp trong Redis:
```python
# Tốn ~50GB cho 1 tỷ username
redis.set("user:john123", "exists")
redis.set("user:mary456", "exists")
# ... 1 tỷ records
```

### Dùng Bloom Filter:
```python
# Chỉ tốn ~1.2GB cho mảng bit
# Chứa thông tin về 1 tỷ username nhưng không lưu username gốc
bit_array = [0,1,0,1,1,0,0,1,0,1,...]  # 10 tỷ bit
```

## 🔄 Quy trình đồng bộ dữ liệu:

```python
# Khi khởi động hệ thống lần đầu
def initialize_bloom_filter():
    redis.execute_command("BF.RESERVE", "usernames", 0.01, 1000000000)
    
    # Load tất cả username từ DB và thêm vào filter
    for username in database.get_all_usernames():
        redis.execute_command("BF.ADD", "usernames", username)
```

## 🎯 Kết luận

Đây là một ví dụ điển hình về cách tối ưu hóa hệ thống lớn bằng cách chấp nhận trade-off thông minh: **đổi một chút độ chính xác lấy hiệu suất vượt trội**.

Redis chỉ lưu trữ một cấu trúc dữ liệu nhỏ gọn (mảng bit) đại diện cho 1 tỷ username, chứ không phải lưu cache 1 tỷ string username!

---

*Bài viết này giải đáp chi tiết về một câu hỏi phỏng vấn system design phổ biến và cách áp dụng Bloom Filter trong thực tế để xây dựng hệ thống có hiệu suất cao.* 