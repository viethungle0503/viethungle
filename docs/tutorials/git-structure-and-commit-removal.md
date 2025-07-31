---
sidebar_position: 14
---

# Cấu trúc thư mục Git và cách loại bỏ commit không mong muốn

Bài viết này giải thích cấu trúc thư mục `.git` và hướng dẫn cách loại bỏ các commit không mong muốn (như thêm `node_modules`) khỏi lịch sử Git mà không làm thay đổi thông tin author và thời gian commit.

## 1. Cấu trúc thư mục .git

### 1.1 Các thư mục cốt lõi

| Thư mục/File | Chức năng |
|-------------|-----------|
| `objects/` | Lưu trữ tất cả dữ liệu của Git (commits, trees, blobs) dưới dạng hash SHA-1 |
| `refs/` | Chứa các tham chiếu (references) như branches, tags, remote branches |
| `logs/` | Lưu lịch sử thay đổi của các refs (reflog) |
| `info/` | Chứa thông tin bổ sung như exclude patterns |
| `config` | Cấu hình repository cụ thể |
| `description` | Mô tả repository (dùng cho GitWeb) |
| `HEAD` | Trỏ đến branch hiện tại |
| `index` | Staging area (những thay đổi chuẩn bị commit) |
| `packed-refs` | Các refs được pack để tối ưu hiệu suất |

### 1.2 Giải thích chi tiết objects/pack

Thư mục `objects/pack/` chứa:
- **File .pack**: Chứa nhiều objects được nén lại để tiết kiệm không gian
- **File .idx**: Index của pack file, giúp Git tìm kiếm nhanh objects
- **File .rev**: Reverse index, tối ưu cho việc truy cập pack file

**Tại sao file pack có dung lượng lớn?**
- Git tự động "pack" các objects để tiết kiệm không gian
- Repository có lịch sử phát triển lâu dài với nhiều commits
- Chứa binary files, images, hoặc assets lớn trong lịch sử
- Delta compression lưu trữ sự khác biệt giữa các versions

## 2. Liệt kê commit theo dung lượng

### 2.1 Lệnh cơ bản liệt kê commit theo kích thước

```bash
# Liệt kê commit theo tổng số thay đổi (insertions + deletions)
git log --oneline --shortstat | awk '
/^[a-f0-9]/{commit=$0}
/files? changed/{
    insertions=0; deletions=0
    if($0 ~ /[0-9]+ insertions?/) {
        match($0, /([0-9]+) insertions?/, arr)
        insertions=arr[1]
    }
    if($0 ~ /[0-9]+ deletions?/) {
        match($0, /([0-9]+) deletions?/, arr)
        deletions=arr[1]
    }
    total=insertions+deletions
    print total "\t" commit
}' | sort -nr | head -20
```

### 2.2 Tìm các file lớn nhất trong repository

```bash
git rev-list --objects --all | 
git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | 
awk '/^blob/ {print substr($0,6)}' | 
sort -k3 -n | 
tail -20
```

### 2.3 Phân tích commit chi tiết

```bash
#!/bin/bash
echo "Commit Hash | Files Changed | Insertions | Deletions | Total Changes"
echo "------------|---------------|------------|-----------|---------------"

git log --pretty=format:'%h' --shortstat | while read line; do
    if [[ $line =~ ^[a-f0-9]{7}$ ]]; then
        commit_hash=$line
        read stats
        if [[ -n $stats ]]; then
            files=$(echo $stats | grep -o '[0-9]\+ files\? changed' | grep -o '[0-9]\+')
            insertions=$(echo $stats | grep -o '[0-9]\+ insertions\?' | grep -o '[0-9]\+')
            deletions=$(echo $stats | grep -o '[0-9]\+ deletions\?' | grep -o '[0-9]\+')
            
            files=${files:-0}
            insertions=${insertions:-0}
            deletions=${deletions:-0}
            total=$((insertions + deletions))
            
            printf "%s | %s | %s | %s | %s\n" "$commit_hash" "$files" "$insertions" "$deletions" "$total"
        fi
    fi
done | sort -k5 -nr | head -20
```

## 3. Loại bỏ commit không mong muốn với git filter-repo

### 3.1 Cài đặt [git-filter-repo](https://github.com/newren/git-filter-repo)

```bash
# Cài đặt qua pip
pip install git-filter-repo

# Hoặc trên macOS
brew install git-filter-repo
```

### 3.2 Loại bỏ thư mục khỏi toàn bộ lịch sử

```bash
# Loại bỏ thư mục node_modules khỏi toàn bộ history
git filter-repo --path node_modules --invert-paths --force

# Loại bỏ nhiều patterns cùng lúc
git filter-repo --path node_modules --path package-lock.json --invert-paths --force
```

### 3.3 Xử lý lỗi "not a fresh clone"

Khi gặp lỗi:
```
Aborting: Refusing to destructively overwrite repo history since
this does not look like a fresh clone.
```

**Giải pháp 1: Sử dụng --force**
```bash
git filter-repo --path node_modules --invert-paths --force
```

**Giải pháp 2: Tạo fresh clone**
```bash
# Backup branch hiện tại
git branch backup-original

# Tạo fresh clone từ local
cd /d
git clone --no-hardlinks /d/UELDaily UELDaily-clean
cd UELDaily-clean

# Chạy filter-repo
git filter-repo --path node_modules --invert-paths
```

## 4. Phương pháp thay thế

### 4.1 Sử dụng BFG Repo-Cleaner

```bash
# Tải BFG từ https://rtyley.github.io/bfg-repo-cleaner/
# Hoặc: brew install bfg (macOS)

# Clone bare repository
git clone --mirror https://github.com/user/repo.git repo.git
cd repo.git

# Xóa folder node_modules khỏi toàn bộ history
java -jar bfg.jar --delete-folders node_modules

# Push changes
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### 4.2 Git filter-branch (phương pháp cũ)

```bash
git filter-branch --force --index-filter \
  'git rm -rf --cached --ignore-unmatch node_modules' \
  --prune-empty --tag-name-filter cat -- --all
```

## 5. Dọn dẹp sau khi filter

### 5.1 Cleanup commands

```bash
# Dọn dẹp reflog và garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (CẨN THẬN!)
git push origin --force --all
git push origin --force --tags
```

### 5.2 Kiểm tra kết quả

```bash
# Kiểm tra size repository
du -sh .git

# Kiểm tra các file lớn còn lại
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '/^blob/ {print substr($0,6)}' | sort -k3 -n | tail -10

# Verify node_modules đã bị xóa
git log --all --full-history -- node_modules
```

## 6. Thông tin được bảo toàn

### 6.1 Dữ liệu không thay đổi

Khi sử dụng git filter-repo, các thông tin sau được giữ nguyên:
- **Author name & email** - Người tạo commit
- **Author date** - Thời gian commit được tạo
- **Commit message** - Nội dung commit
- **Committer name & email** - Người apply commit
- **Committer date** - Thời gian commit được áp dụng

### 6.2 Chỉ hash bị thay đổi

```bash
# Kiểm tra trước và sau filter
# Trước khi filter
git log --format="%H|%ad|%an|%s" --date=iso > commits_before.txt

# Sau khi filter
git log --format="%H|%ad|%an|%s" --date=iso > commits_after.txt

# So sánh (chỉ hash khác, còn lại giống nhau)
paste commits_before.txt commits_after.txt | column -t -s'|'
```

**Ví dụ kết quả:**
```
Trước: abc123|2023-01-15 10:30:00|John Doe|Add feature X
Sau:   def456|2023-01-15 10:30:00|John Doe|Add feature X
```

## 7. Chính sách GitHub về commit bị ghi đè

### 7.1 Timeline xóa commit

- **Ngày 1**: Force push, commit cũ bị ghi đè
- **Ngày 1-30**: Commit cũ vẫn tồn tại, có thể truy cập
- **Ngày 30-90**: GitHub chạy garbage collection
- **Sau ngày 90**: Commit cũ bị xóa vĩnh viễn

### 7.2 Các điểm quan trọng

- Commits bị ghi đè lưu trữ tạm thời 30-90 ngày
- Pull Requests đã merge lưu vĩnh viễn ngay cả khi branch bị xóa
- Có thể khôi phục trong grace period nếu biết commit hash

```bash
# Truy cập commit cũ trong grace period
git show <old-commit-hash>
```

## 8. Lưu ý quan trọng

### 8.1 Tác động đến team

⚠️ **Cảnh báo**: Việc rewrite history có tác động lớn:
- Backup repository trước khi thực hiện
- Thông báo team vì họ cần re-clone repository
- Tất cả collaborators phải xóa local repo và clone lại
- Pull requests/forks sẽ bị conflict
- Commit hashes thay đổi hoàn toàn

### 8.2 Best practices

```bash
# 1. Backup trước khi thực hiện
git branch backup-before-filter

# 2. Test trên clone riêng
git clone --no-hardlinks original-repo test-repo

# 3. Thông báo team ngay lập tức
# 4. Yêu cầu mọi người re-clone repository
# 5. Đợi 90 ngày để GitHub garbage collect
```

## 9. Kết luận

Việc loại bỏ commit không mong muốn khỏi Git history là possible nhưng cần cẩn trọng. Phương pháp git filter-repo là khuyến nghị vì:

1. **Nhanh và hiệu quả** hơn filter-branch
2. **Bảo toàn thông tin** author và timestamp
3. **Flexible** với nhiều tùy chọn filter
4. **An toàn** hơn các phương pháp khác

**Lưu ý cuối**: Luôn backup và thông báo team trước khi thực hiện rewrite history!