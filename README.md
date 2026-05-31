# SparkMarvel — Website công ty

Website giới thiệu công ty và bán dịch vụ thiết kế website / phát triển phần mềm. Static multi-page, không cần build step.

## Stack

- HTML5 ngữ nghĩa + **Tailwind CSS** (Play CDN)
- Vanilla JavaScript (ES2022, không phụ thuộc framework)
- Phong cách: **Editorial sáng** — font **Playfair Display + Inter**, nền kem `#FAF6EF`, ink `#1C1A17`, accent clay `#C2410C`
- Ảnh thật từ **Unsplash CDN** (responsive `srcset`, lazy-load, alt mô tả)

## Cấu trúc

```
SparkMarvel/
├── index.html          # Trang chủ (hero ảnh lớn, dịch vụ, dự án, timeline teaser, testimonials)
├── about.html          # Giới thiệu công ty + timeline quá trình hình thành + giá trị + đội ngũ
├── services.html       # Chi tiết dịch vụ (ảnh xen kẽ) + quy trình 6 bước
├── products.html       # Catalog sản phẩm AI + phần mềm + web (chia nhóm, có ảnh)
├── industries.html     # Giải pháp theo 8 nhóm ngành nghề (bán lẻ, F&B, y tế, giáo dục, BĐS, spa, logistics, sản xuất)
├── education.html      # Ngành Giáo dục: Giáo viên / Học sinh / Nhà trường
├── retail.html         # Ngành Bán lẻ & TMĐT: Chủ shop / Khách hàng
├── fnb.html            # Ngành Nhà hàng & F&B: Chủ quán / Thực khách
├── healthcare.html     # Ngành Y tế & Phòng khám: Phòng khám / Bệnh nhân
├── realestate.html     # Ngành Bất động sản: Sàn-môi giới / Người mua
├── beauty.html         # Ngành Làm đẹp & Spa: Chủ spa / Khách hàng
├── logistics.html      # Ngành Logistics: Doanh nghiệp / Khách-tài xế
├── manufacturing.html  # Ngành Sản xuất: Nhà máy / Đại lý B2B
├── blog.html           # Blog/Tin tức (danh sách bài viết)
├── blog-*.html         # 3 bài viết: tốc độ website, chatbot AI, chọn nền tảng
├── api/chat.js         # Serverless function trợ lý AI (Vercel AI Gateway)
├── pricing.html        # Bảng giá 3 tier + so sánh + FAQ
├── portfolio.html      # Gallery dự án (ảnh) có bộ lọc
├── contact.html        # Form liên hệ Web3Forms (validate client-side) + thông tin
├── assets/
│   ├── css/styles.css           # Font, animation, reduced-motion, focus, img-zoom
│   ├── js/tailwind-config.js    # Design tokens (màu editorial, font, shadow)
│   ├── js/config.js             # Web3Forms access key (chỉnh 1 chỗ)
│   ├── js/main.js               # Menu, scroll-reveal, counter, slider, filter, form, back-to-top
│   ├── js/widgets.js            # Trợ lý AI chat nổi + pop-up ưu đãi exit-intent (tự inject mọi trang)
│   └── js/estimator.js          # Công cụ "Báo giá tức thì" trên trang Bảng giá
├── 404.html            # Trang lỗi 404 (Vercel tự dùng)
├── vercel.json         # cleanUrls + cache + security headers
├── robots.txt · sitemap.xml
└── setup.ps1           # Chạy server local 1 lệnh
```

## Chạy local

```powershell
./setup.ps1            # http://localhost:8080, tự mở trình duyệt
./setup.ps1 -Port 3000
```

Hoặc thủ công:

```powershell
python -m http.server 8080
```

## Deploy

**Vercel** (khuyến nghị — static, không cấu hình):

```powershell
npm i -g vercel
vercel            # preview
vercel --prod     # production
```

Hoặc kéo-thả thư mục vào Netlify / Cloudflare Pages / GitHub Pages.

## Tùy chỉnh nhanh

| Mục | File | Vị trí |
|---|---|---|
| Màu sắc / font | `assets/js/tailwind-config.js` | `theme.extend.colors`, `fontFamily` |
| Tên thương hiệu | tất cả `*.html` | text `SparkMarvel` + thẻ `<title>` |
| Thông tin liên hệ | tất cả `*.html` | footer + `contact.html` |
| Ảnh sản phẩm thật | tất cả `*.html` | thay URL `images.unsplash.com/...` bằng ảnh của bạn (giữ `srcset`, `alt`, `width/height`) |
| Domain SEO | `robots.txt`, `sitemap.xml`, meta `og:` | thay `sparkmarvel.example.com` |

## Nâng cấp production (tùy chọn)

Tailwind Play CDN tiện cho dev nhưng có JS runtime ~30KB. Khi cần tối ưu tối đa, compile CSS tĩnh:

```powershell
npx tailwindcss -i ./assets/css/styles.css -o ./assets/css/build.css --minify
```

Rồi thay `<script src="https://cdn.tailwindcss.com">` bằng `<link rel="stylesheet" href="assets/css/build.css">`.

## Form liên hệ (Web3Forms)

Form gửi mail thật qua [Web3Forms](https://web3forms.com) — không cần backend, chạy trên mọi host.

**Kích hoạt (1 phút):**

1. Vào https://web3forms.com → nhập email nhận lead → **Create Access Key**.
2. Copy key (dạng UUID) dán vào `assets/js/config.js`:
   ```js
   window.SPARK_CONFIG = Object.freeze({
     web3formsAccessKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
     formSubject: "Yêu cầu báo giá mới từ website SparkMarvel",
   });
   ```
3. Xong. Mọi lead sẽ về thẳng email đã đăng ký.

**Đặc điểm kỹ thuật:**

- `access_key` là **public submission key** (thiết kế để đặt client) — an toàn commit/deploy public.
- Chống spam bằng **honeypot** (`botcheck`) + validate client-side (email, SĐT, trường bắt buộc).
- Xử lý lỗi đầy đủ: timeout 12s (AbortController), lỗi mạng, phản hồi thất bại — đều có thông báo + nút fallback gọi điện.
- Khi chưa cấu hình key, form báo rõ và gợi ý liên hệ qua điện thoại.

> Free tier Web3Forms ~250 mail/tháng. Cần domain riêng / không giới hạn → cân nhắc Vercel Function + Resend.

## Tính năng tương tác ([widgets.js](assets/js/widgets.js))

Tự inject trên mọi trang qua 1 thẻ script, không lặp markup.

- **Trợ lý AI chat nổi (Spark AI):** nút nổi góc phải + khung chat, bot trả lời theo từ khóa (giá, dịch vụ, sản phẩm AI, liên hệ, thời gian, bảo hành) kèm nút dẫn trang. Có quick-reply, hiệu ứng đang gõ, teaser sau 6s. Input người dùng render bằng `textContent` (chống XSS). Bộ tri thức nằm trong mảng `KNOWLEDGE` — dễ sửa; có thể thay bằng API AI thật sau.
- **Pop-up ưu đãi exit-intent:** desktop hiện khi chuột rời mép trên; mobile fallback sau 35s. Lưu `localStorage` để không lặp lại trong 7 ngày; tự bỏ qua trên trang Liên hệ.

## Song ngữ VI/EN ([assets/js/i18n.js](assets/js/i18n.js))

Nút **VI/EN** trên nav mọi trang (lưu `localStorage`, mặc định VI). Engine dịch bằng cách swap text-node + thuộc tính (`alt`, `placeholder`, `aria-label`, `title`) theo từ điển `DICT`, **giữ nguyên markup/style**; có MutationObserver nên dịch cả nội dung JS chèn động (chat, estimator, pop-up). Nạp 1 lần qua `main.js` — không phải sửa từng trang. Đổi ngôn ngữ = lưu + reload (VI = HTML gốc).

**Mở rộng bản dịch:** thêm cặp `"chuỗi VI": "EN"` vào `DICT` trong `i18n.js`. Chạy script trích xuất để lấy toàn bộ chuỗi còn thiếu:
```powershell
python _i18n_extract.py   # tạo _i18n_strings.json (danh sách chuỗi unique)
```
Hiện đã dịch: toàn bộ nav/footer/CTA/nút + trang chủ + widget + công cụ ước tính (xuất hiện trên mọi trang). Phần thân các trang con dịch bổ sung theo lô.

## Trợ lý AI thật ([api/chat.js](api/chat.js))

Chatbot dùng **progressive enhancement**: chạy tĩnh/local → bot trả lời theo từ khóa; deploy Vercel + có API key → tự nâng lên **AI thật** (Gemini qua Vercel AI Gateway), không đổi gì ở client.

**Bật AI thật:**

1. Deploy lên Vercel (xem mục Deploy).
2. Vào **vercel.com → Project → Settings → Environment Variables**, thêm:
   ```
   AI_GATEWAY_API_KEY = <key lấy ở Vercel Dashboard → AI Gateway>
   ```
3. Redeploy. Trợ lý "Spark AI" sẽ tự gọi `/api/chat` và trả lời bằng AI.

**Kỹ thuật:** key chỉ nằm server-side (`process.env`), không lộ ra client · timeout 18–20s · nếu `/api/chat` trả 404/503 (chưa cấu hình / host tĩnh) → client tự fallback bot từ khóa, không lỗi · system prompt gắn ngữ cảnh SparkMarvel, trả lời tiếng Việt ≤4 câu. Đổi model tại hằng `MODEL` trong `api/chat.js` (vd `anthropic/claude-...`).
