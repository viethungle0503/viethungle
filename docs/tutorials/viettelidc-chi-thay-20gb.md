---
sidebar_position: 18
title: Khắc phục máy ViettelIDC chỉ hiển thị 20 GB thay vì 100 GB (Ubuntu)
slug: viettelidc-chi-thay-20gb
sidebar_label: Ubuntu chỉ thấy 20 GB (fix)
description: Chẩn đoán và mở rộng phân vùng/Filesystem khi gói 100 GB nhưng hệ thống chỉ hiển thị ~20 GB. Kèm gợi ý công cụ quản lý/giám sát server.
---

## Tóm tắt tình huống

- **Môi trường**: VM tại ViettelIDC (gói T2.Gen04, SSD 100 GB), Ubuntu 24.04.
- **Triệu chứng**: Hệ điều hành chỉ thấy ~20 GB cho `/` (root).
- **Quan sát**:
  - `lsblk` cho thấy đĩa **/dev/vda = 100 G** nhưng **/dev/vda2 = 20 G** (root).
  - `fdisk -l` báo:
    - `GPT PMBR size mismatch …`
    - `The backup GPT table is not on the end of the device.`
  - `duf` cài bằng `sudo apt install duf` (duf utility is an enhanced version of the du and df commands combined) command cho kết quả như sau:

```
╭────────────────────────────────────────────────────────────────────────────────────────╮
│ 1 local device                                                                         │
├────────────┬───────┬───────┬───────┬───────────────────────────────┬──────┬────────────┤
│ MOUNTED ON │  SIZE │  USED │ AVAIL │              USE%             │ TYPE │ FILESYSTEM │
├────────────┼───────┼───────┼───────┼───────────────────────────────┼──────┼────────────┤
│ /          │ 19.5G │ 14.7G │  3.8G │ [###############.....]  75.3% │ ext4 │ /dev/vda2  │
╰────────────┴───────┴───────┴───────┴───────────────────────────────┴──────┴────────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────╮
│ 6 special devices                                                                             │
├────────────────┬──────┬───────┬───────┬───────────────────────────────┬──────────┬────────────┤
│ MOUNTED ON     │ SIZE │  USED │ AVAIL │              USE%             │ TYPE     │ FILESYSTEM │
├────────────────┼──────┼───────┼───────┼───────────────────────────────┼──────────┼────────────┤
│ /dev           │ 7.8G │    0B │  7.8G │                               │ devtmpfs │ udev       │
│ /dev/shm       │ 7.8G │    0B │  7.8G │                               │ tmpfs    │ tmpfs      │
│ /run           │ 1.6G │  2.3M │  1.6G │ [....................]   0.1% │ tmpfs    │ tmpfs      │
│ /run/lock      │ 5.0M │    0B │  5.0M │                               │ tmpfs    │ tmpfs      │
│ /run/qemu      │ 7.8G │    0B │  7.8G │                               │ tmpfs    │ tmpfs      │
│ /run/user/1000 │ 1.6G │ 20.0K │  1.6G │ [....................]   0.0% │ tmpfs    │ tmpfs      │
╰────────────────┴──────┴───────┴───────┴───────────────────────────────┴──────────┴────────────╯
```

- **Nguyên nhân**: Nhà cung cấp đã tăng kích thước đĩa lên 100 GB nhưng **phân vùng** và **backup GPT** chưa được “nới” tới cuối đĩa → phần trống còn **unallocated**.

---

## Cách kiểm tra ban đầu

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT
sudo fdisk -l /dev/vda
df -hT /
```

Kỳ vọng kết quả trước khi sửa:
```
NAME    SIZE TYPE FSTYPE M
vda     100G disk
├─vda1    1M part
└─vda2   20G part ext4   /
GPT PMBR size mismatch (41943039 != 209715199) will be corrected by write.
The backup GPT table is not on the end of the device.
Disk /dev/vda: 100 GiB, 107374182400 bytes, 209715200 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: D1A0D6DD-30BB-4FCA-A78B-48E720C3D1D9

Device     Start      End  Sectors Size Type
/dev/vda1   2048     4095     2048   1M BIOS boot
/dev/vda2   4096 41940991 41936896  20G Linux filesystem
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/vda2      ext4   20G   15G  4.1G  79% /

```

---

## Khắc phục (khuyến nghị, **không cần reboot**)

> **Khuyến cáo**: Snapshot/backup trước khi thao tác phân vùng.

### Bước 1 — Cài công cụ
```bash
sudo apt-get update
sudo apt-get install -y gdisk cloud-guest-utils
```

### Bước 2 — Sửa vị trí backup GPT về cuối đĩa
```bash
sudo sgdisk -e /dev/vda
```

Kết quả mong đợi:
```
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot or after you
run partprobe(8) or kpartx(8)
The operation has completed successfully.
```

> Lệnh này "kéo" backup GPT ra cuối thiết bị, loại bỏ cảnh báo `PMBR size mismatch`/`backup GPT…`.

### Bước 3 — Nới phân vùng root chiếm hết phần trống
```bash
sudo growpart /dev/vda 2
```

Kết quả mong đợi:
```
CHANGED: partition=2 start=4096 old: size=41936896 end=41940991 new: size=209711071 end=209715166
```

### Bước 4 — Mở rộng filesystem ext4 đang mount tại `/`
```bash
sudo resize2fs /dev/vda2
```

Kết quả mong đợi:
```
resize2fs 1.47.0 (5-Feb-2023)
Filesystem at /dev/vda2 is mounted on /; on-line resizing required
old_desc_blocks = 3, new_desc_blocks = 13
The filesystem on /dev/vda2 is now 26213883 (4k) blocks long.
```

> `resize2fs` hỗ trợ **online grow** cho ext4, không cần umount hay downtime.

### Kiểm tra sau khi mở rộng
```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT
df -hT /
sudo sgdisk -v /dev/vda
```

Kỳ vọng kết quả:
```
NAME    SIZE TYPE FSTYPE MOUNTPOINT
vda     100G disk
├─vda1    1M part
└─vda2  100G part ext4   /
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/vda2      ext4   99G   15G   80G  16% /

Caution: Partition 2 doesn't end on a 2048-sector boundary. This may
result in problems with some disk encryption tools.

No problems found. 2014 free sectors (1007.0 KiB) available in 1
segments, the largest of which is 2014 (1007.0 KiB) in size.
```

> Lưu ý: 100 GB (thập phân) hiển thị khoảng ~93 GiB (nhị phân) trên `df`, trừ thêm chút overhead là bình thường.

---

## Phương án thay thế (nếu không dùng `growpart`)

```bash
sudo apt-get install -y gdisk parted
sudo sgdisk -e /dev/vda            # Sửa backup GPT
sudo parted /dev/vda
(parted) print
(parted) resizepart 2 100%
(parted) quit

sudo resize2fs /dev/vda2           # Mở rộng ext4
```

---

## FAQ / Lưu ý

- **`partprobe: command not found`**  
  Không sao; nếu cần có thể `sudo apt-get install -y parted` (cung cấp `partprobe`). Thực tế, sau `growpart`, kernel thường đã thấy kích thước mới. Trong trường hợp này, lệnh `partprobe` không cần thiết vì các thay đổi đã được áp dụng thành công.
- **Filesystem XFS?**  
  Thay `resize2fs` bằng:  
  ```bash
  sudo xfs_growfs -d /
  ```
- **Có cần reboot?**  
  Không, các bước trên đều hỗ trợ mở rộng “online”.
- **Có `swap.img` trong `/`**  
  Không cần chỉnh; nó tự “được lợi” dung lượng sau khi mở rộng.
- **Dùng LVM?**  
  Bài này áp dụng trực tiếp cho phân vùng thường. Nếu là LVM: `pvresize` → `lvextend` → `resize2fs/xfs_growfs`.

---

## Checklist nhanh (để dán vào Runbook)

- [x] `lsblk`, `fdisk -l` xác nhận còn unallocated sau `/dev/vda2`.  
- [x] `sgdisk -e /dev/vda` sửa backup GPT.  
- [x] `growpart /dev/vda 2` nới phân vùng.  
- [x] `resize2fs /dev/vda2` (hoặc `xfs_growfs -d /`).  
- [x] `df -hT /` kiểm tra dung lượng mới.  
- [x] `sudo sgdisk -v /dev/vda` kiểm tra tính toàn vẹn GPT.  
- [x] Cân nhắc cài **Cockpit/Netdata** để quản lý/giám sát về sau.

> **Kết quả**: VM 100 GB đã sử dụng đủ dung lượng, không còn giới hạn 20 GB.
