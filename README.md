# Hệ thống Quản lý Xây dựng

Ứng dụng web quản lý toàn diện vòng đời công trình xây dựng: dự án, tiến độ, chi phí, vật tư, nhà thầu, nhân sự, hồ sơ, vấn đề và yêu cầu thay đổi.

![Node](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)
![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)
![License](https://img.shields.io/badge/license-ch%C6%B0a%20x%C3%A1c%20%C4%91%E1%BB%8Bnh-lightgrey)

---

## Giới thiệu

Các dự án xây dựng có nhiều bên tham gia, nhiều hạng mục, hồ sơ, vật tư, chi phí và tiến độ cần theo dõi. Quản lý bằng Excel và giấy tờ gây khó khăn khi cập nhật và kiểm soát.

Hệ thống này tập trung hoá dữ liệu dự án vào một nền tảng duy nhất, cung cấp dashboard, cảnh báo và báo cáo tổng hợp.

## Tính năng

### Điều hành
- **Tổng quan** — KPI, biểu đồ tiến độ theo dự án, cơ cấu chi phí, danh sách cảnh báo.
- **Dự án** — mã, địa điểm, chủ đầu tư, quản lý, ngân sách, thực chi, số còn lại, trạng thái.
- **Công việc** — người phụ trách, nhà thầu, hạng mục, deadline, ưu tiên, % hoàn thành.
- **Tiến độ** — so sánh kế hoạch và thực tế theo dự án, timeline công việc, cảnh báo chậm tiến độ.

### Nguồn lực và chi phí
- **Chi phí** — khoản chi theo nhóm (nhân công, vật tư, máy móc, nhà thầu, vận chuyển, khác), ngân sách còn lại tự tính.
- **Vật tư** — danh mục, nhà cung cấp, tồn kho, giao dịch nhập/xuất, cảnh báo dưới định mức.
- **Nhà thầu** — hồ sơ, lĩnh vực, khối lượng công việc, chi phí, đánh giá.
- **Nhân sự** — vai trò, chức danh, dự án tham gia, khối lượng việc đang mở.

### Hồ sơ và kiểm soát
- **Hồ sơ** — bản vẽ, hợp đồng, biên bản, báo cáo, nghiệm thu, hình ảnh, tài liệu kỹ thuật; có phiên bản và người tải lên.
- **Vấn đề** — mức độ, người xử lý, trạng thái và mốc thời gian xử lý.
- **Yêu cầu thay đổi** — tác động chi phí, tác động tiến độ, trạng thái phê duyệt.

## Kiến trúc và công nghệ

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Máy chủ API | Node.js (module `http`, `fs`) | Định tuyến REST, nghiệp vụ, phục vụ tệp tĩnh |
| Lưu trữ | JSON (`data/db.json`) | Lưu trữ bền vững theo tệp |
| Giao diện | HTML, CSS, JavaScript thuần (ES module) | SPA: dashboard, bảng dữ liệu, biểu mẫu |
| Kiểu chữ | Inter | Giao diện rõ ràng, tương phản đạt WCAG AA |
| Cổng mặc định | `127.0.0.1:4321` | Địa chỉ truy cập nội bộ |

Ứng dụng **không dùng thư viện bên thứ ba**, chạy trực tiếp bằng Node.js.

## Cài đặt nhanh

Yêu cầu duy nhất: **Node.js 18 trở lên**.

```bash
git clone https://github.com/AnhKhoa-Hopee/quan-ly-xay-dung.git
cd quan-ly-xay-dung
node server.js
```

Mở trình duyệt tại **http://127.0.0.1:4321/**. Lần chạy đầu tiên hệ thống tự khởi tạo dữ liệu mẫu.

Không cần `npm install` vì dự án không có thư viện phụ thuộc.

## Lệnh thường dùng

```bash
node server.js                      # chạy máy chủ (mặc định cổng 4321)
PORT=5000 node server.js            # chạy ở cổng khác
node src/seed.js --force            # nạp lại dữ liệu mẫu (xoá dữ liệu hiện có)
```

Hoặc dùng npm script:

```bash
npm start        # tương đương node server.js
npm run seed     # tương đương node src/seed.js --force
```

## Cấu trúc thư mục

```text
.
├── server.js                 # máy chủ HTTP, định tuyến API và tệp tĩnh
├── src/
│   ├── db.js                 # tầng lưu trữ JSON (đọc/ghi/cập nhật/xoá)
│   ├── api.js                # nghiệp vụ, tổng hợp số liệu, REST handler
│   └── seed.js               # dữ liệu mẫu
├── public/
│   ├── index.html            # khung ứng dụng SPA
│   ├── styles.css            # hệ thống thiết kế
│   └── app.js                # logic giao diện, biểu mẫu, dashboard
├── scripts/
│   └── generate_product_pdf.py   # sinh tài liệu PDF sản phẩm
├── docs/
│   ├── HUONG-DAN-SU-DUNG.md  # hướng dẫn sử dụng chi tiết
│   └── API.md                # tài liệu REST API
├── data/db.json              # cơ sở dữ liệu (tự tạo khi chạy lần đầu)
└── exports/                  # tài liệu PDF sinh ra (không theo dõi trong Git)
```

## API

Máy chủ cung cấp REST API đầy đủ cho 10 danh mục dữ liệu.

| Phương thức và đường dẫn | Mô tả |
|---|---|
| `GET /api/health` | Kiểm tra máy chủ hoạt động |
| `GET /api/bootstrap` | Toàn bộ dữ liệu kèm trường tính toán cho giao diện |
| `GET /api/dashboard` | Chỉ số KPI, dữ liệu biểu đồ và cảnh báo |
| `GET /api/<danh mục>` | Danh sách bản ghi |
| `GET /api/<danh mục>/<id>` | Chi tiết một bản ghi |
| `POST /api/<danh mục>` | Tạo bản ghi (thiếu trường bắt buộc trả `422`) |
| `PUT /api/<danh mục>/<id>` | Cập nhật bản ghi |
| `DELETE /api/<danh mục>/<id>` | Xoá bản ghi |
| `POST /api/materials/<id>/move` | Ghi giao dịch nhập/xuất và cập nhật tồn kho |

Danh mục hợp lệ: `projects`, `tasks`, `contractors`, `people`, `materials`, `stockMoves`, `expenses`, `documents`, `issues`, `changeRequests`.

Chi tiết xem tại [docs/API.md](docs/API.md).

## Dữ liệu mẫu

Lần chạy đầu tiên tự động tạo: 4 dự án, 13 công việc, 4 nhà thầu, 7 nhân sự, 8 vật tư, 11 khoản chi, 8 hồ sơ, 5 vấn đề, 4 yêu cầu thay đổi.

Dữ liệu lưu tại `data/db.json`. Mọi thao tác trên giao diện được ghi ngay xuống tệp này.

## Tài liệu PDF sản phẩm

Tài liệu mô tả chi tiết sản phẩm (14 trang) được sinh tự động bằng script trong repo, kết quả nằm tại `exports/TaiLieu_SanPham_QuanLyXayDung.pdf` và không được đưa vào Git vì là sản phẩm sinh ra.

Tạo tài liệu:

```bash
python3 -m pip install --target ./vendor reportlab
PYTHONPATH=./vendor python3 scripts/generate_product_pdf.py
```

Nội dung tài liệu: giới thiệu, kiến trúc và công nghệ, danh mục 12 phân hệ, chi tiết nghiệp vụ từng phân hệ, mô hình dữ liệu, REST API, hướng dẫn sử dụng, cài đặt và vận hành, phạm vi và lộ trình.

## Kiểm chứng nhanh

```bash
curl http://127.0.0.1:4321/api/health
curl http://127.0.0.1:4321/api/dashboard
```

## Phạm vi phiên bản 1.0

Trong phạm vi: quản lý dự án, công việc, tiến độ, chi phí, vật tư, nhà thầu, nhân sự, hồ sơ, vấn đề, yêu cầu thay đổi; dashboard, cảnh báo, báo cáo; REST API đầy đủ.

Ngoài phạm vi: kế toán doanh nghiệp đầy đủ, tính lương, BIM/3D, IoT công trường, lập dự toán chuyên sâu, tích hợp ERP phức tạp.

## Hướng phát triển

- Xác thực và phân quyền chi tiết.
- Lịch sử thay đổi đầy đủ và bình luận trên công việc.
- Đính kèm tệp thực tế thay vì chỉ lưu đường dẫn.
- Xuất báo cáo Excel/PDF.
- Thông báo thời gian thực.
- Chuyển sang cơ sở dữ liệu quan hệ.

## Đóng góp

1. Tạo nhánh mới từ `main`.
2. Commit theo cấu trúc rõ ràng, mô tả ngắn gọn thay đổi.
3. Mở pull request kèm mô tả và các bước kiểm chứng.

## Giấy phép

Chưa chọn giấy phép. Liên hệ chủ sở hữu repository trước khi sử dụng ngoài phạm vi nội bộ.
