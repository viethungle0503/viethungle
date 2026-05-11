---
sidebar_position: 24
sidebar_label: Motion (React) Animation
title: "24. Hướng dẫn tổng quan về Motion (motion/react)"
description: Các khái niệm chính của Motion — thư viện animation cho React, bao gồm scroll-linked animation, stagger, transition và các hiệu ứng thường dùng.
date: 2026-03-04
tags: [react, animation, motion, frontend]
---

# 24. Hướng dẫn tổng quan về Motion (motion/react)

[Motion](https://motion.dev) (trước đây là Framer Motion) là thư viện animation cho React. Dưới đây là các khái niệm chính:

## 1. `motion.div` — Component cơ bản

Mọi HTML element đều có phiên bản `motion.*` để animate:

```tsx
<motion.div animate={{ opacity: 1 }} />
```

## 2. Animation props chính

| Prop | Mục đích |
|---|---|
| `initial` | Trạng thái ban đầu (mount) |
| `animate` | Trạng thái mục tiêu |
| `whileInView` | Animate khi element vào viewport (1 chiều, dùng cho đơn giản) |
| `whileHover` / `whileTap` | Gesture animation |
| `transition` | Cấu hình kiểu animation (`tween`, `spring`, `inertia`) |
| `viewport` | Tuỳ chọn cho `whileInView` (`once`, `amount`, `margin`) |

## 3. Scroll-linked animation (hai chiều — **nên dùng**)

Đây là **best practice cho bidirectional scroll** — animation chạy theo cả 2 chiều khi cuộn lên/xuống:

```tsx
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

function MySection() {
  const ref = useRef<HTMLElement>(null)

  // Theo dõi scroll progress của element trong viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
    // 'start end' = khi top element chạm bottom viewport
    // 'end start' = khi bottom element chạm top viewport
  })

  // Map scroll 0→1 thành giá trị animation
  // [vào viewport, hiển thị, bắt đầu ra, đã ra]
  const y = useTransform(scrollYProgress,
    [0,    0.3,  0.65, 1],     // scroll input
    [80,   0,    0,    -80]    // giá trị y output
  )
  const opacity = useTransform(scrollYProgress,
    [0,    0.25, 0.75, 1],
    [0,    1,    1,    0]
  )

  return (
    <section ref={ref}>
      <motion.div style={{ y, opacity }}>
        Nội dung
      </motion.div>
    </section>
  )
}
```

**Giải thích keyframes:** `[0, 0.3, 0.65, 1]` nghĩa là:
- `0` → element bắt đầu vào viewport (từ dưới)
- `0.3` → element đã di chuyển 30% qua viewport → animation hoàn tất
- `0.65` → element bắt đầu rời khỏi viewport (từ trên)
- `1` → element đã hoàn toàn ra khỏi viewport

## 4. Stagger (tạo hiệu ứng lệch thời gian giữa các item)

Thay vì dùng `stagger()` function, với scroll-linked approach, bạn tăng offset của input range:

```tsx
// Item 0: [0, 0.25, 0.65, 1]  — vào trước
// Item 1: [0, 0.28, 0.65, 1]  — vào sau 1 chút
// Item 2: [0, 0.31, 0.65, 1]  — vào sau nữa
const stagger = index * 0.03
const y = useTransform(scrollYProgress,
  [0, 0.25 + stagger, 0.65, 1],
  [60, 0, 0, -60]
)
```

## 5. `transition` — Cấu hình animation

```tsx
// Tween (mặc định) — dùng duration + easing
transition={{ duration: 0.6, ease: 'easeOut' }}

// Spring — tự nhiên, có bounce
transition={{ type: 'spring', bounce: 0.25, visualDuration: 0.5 }}

// Spring với physics
transition={{ type: 'spring', stiffness: 100, damping: 15 }}
```

## 6. Các hiệu ứng sinh động cho ảnh/card

| Hiệu ứng | Properties |
|---|---|
| Parallax | `useTransform(scrollYProgress, [0,1], [-40, 80])` cho img `style={{ y }}` |
| Fan spread | Mỗi card có `x` offset và `rotate` khác nhau theo `direction` |
| Scale zoom | `scale: [1.1, 1, 1.05]` — ảnh zoom nhẹ khi scroll |
| Directional slide | `x` hoặc `y` từ các hướng khác nhau cho mỗi item |
| Blur reveal | `filter: blur()` kết hợp với opacity (dùng CSS transition) |

## 7. Khi nào dùng gì?

| Nhu cầu | Dùng |
|---|---|
| Animate liên tục theo scroll (2 chiều) | `useScroll` + `useTransform` + `style` |
| Animate 1 lần khi vào view | `whileInView` + `viewport={{ once: true }}` |
| Animate khi vào/ra view (đơn giản) | `whileInView` (không có `once`) |
| Hover/click | `whileHover` / `whileTap` |
| Mount/unmount animation | `AnimatePresence` + `initial`/`animate`/`exit` |
