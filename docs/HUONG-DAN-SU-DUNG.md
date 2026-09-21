# Hướng dẫn sử dụng

Tài liệu này mô tả cách dùng Hệ thống Quản lý Xây dựng theo từng bước.

## 1. Khởi động

```bash
node server.js
```

Máy chủ in ra dòng `Hệ thống Quản lý Xây dựng đang chạy tại http://127.0.0.1:4321/`. Mở địa chỉ đó trên trình duyệt.

Lần chạy đầu tiên, hệ thống tự tạo dữ liệu mẫu để bạn làm quen. Muốn làm lại từ đầu:

```bash
node src/seed.js --force
```

## 2. Bố cục giao diện

| Vùng | Vị trí | Chức năng |
|---|---|---|
| Thanh điều hướng | Bên trái | Chuyển giữa 11 phân hệ, hiện số cảnh báo |
| Thanh trên cùng | Trên | Lọc theo dự án, ô tìm kiếm, nút “+ Thêm mới” |
| Vùng nội dung | Giữa | Bảng dữ liệu, biểu đồ, biểu mẫu |

Bấm biểu tượng ☰ ở góc trái trên cùng khi màn hình nhỏ để mở menu.

## 3. Quy trình thao tác tiêu biểu

### Bước 1 — Tạo dự án

1. Vào mục **Dự án**.
2. Nhấn **+ Thêm mới**.
3. Điền **Mã dự án**, **Tên dự án**, **Ngân sách**, chọn **Trạng thái**.
4. Nhấn **Lưu**.

### Bước 2 — Giao việc

1. Vào mục **Công việc**.
2. Nhấn **+ Thêm mới**.
3. Chọn **Dự án**, nhập **Tên công việc**.
4. Chọn **Người phụ trách** hoặc **Nhà thầu**.
5. Đặt **Ngày bắt đầu**, **Deadline**, chọn **Mức độ ưu tiên** và **Trạng thái**.
6. Nhập **Phần trăm hoàn thành**.
7. Nhấn **Lưu**.

### Bước 3 — Cập nhật tiến độ

1. Trong mục **Công việc**, nhấn **Sửa** ở dòng cần cập nhật.
2. Đổi **Trạng thái** và **Phần trăm hoàn thành**.
3. Nhấn **Lưu**.

Tiến độ dự án được tính tự động bằng trung bình phần trăm hoàn thành của các công việc thuộc dự án.

### Bước 4 — Ghi chi phí

1. Vào mục **Chi phí**.
2. Nhấn **+ Thêm mới**.
3. Chọn **Dự án**, **Nhóm chi phí**, nhập **Số tiền** và **Ngày chi**.
4. Nhấn **Lưu**.

Ngân sách còn lại bằng ngân sách dự kiến trừ tổng chi phí thực tế, cập nhật ngay sau khi lưu.

### Bước 5 — Quản lý kho vật tư

1. Vào mục **Vật tư**.
2. Nhấn **Nhập/Xuất** ở dòng vật tư cần giao dịch.
3. Chọn **Loại giao dịch** (Nhập kho hoặc Xuất kho), nhập **Số lượng** và **Ghi chú**.
4. Nhấn **Lưu**.

Số lượng tồn được cập nhật tự động. Hệ thống chặn giao dịch xuất vượt quá số lượng tồn. Vật tư có tồn thấp hơn mức tối thiểu được đánh dấu đỏ và xuất hiện trong phần cảnh báo ở trang Tổng quan.

### Bước 6 — Ghi nhận vấn đề

1. Vào mục **Vấn đề**.
2. Nhấn **+ Thêm mới**.
3. Chọn **Dự án**, nhập **Tiêu đề** và **Mô tả**.
4. Chọn **Mức độ**, **Trạng thái**, **Người xử lý**.
5. Điền **Ngày xử lý xong** khi đã khép lại vấn đề.
6. Nhấn **Lưu**.

### Bước 7 — Đề xuất thay đổi

1. Vào mục **Yêu cầu thay đổi**.
2. Nhấn **+ Thêm mới**.
3. Nhập **Tiêu đề**, **Tác động chi phí**, **Tác động tiến độ (ngày)**.
4. Chọn **Trạng thái** (Chờ duyệt, Đang xem xét, Đã duyệt, Từ chối).
5. Nhấn **Lưu**.

## 4. Lọc và tìm kiếm

- **Lọc theo dự án**: chọn dự án ở ô chọn trên thanh trên cùng. Danh sách Công việc, Chi phí, Hồ sơ, Vấn đề và Yêu cầu thay đổi sẽ chỉ hiện bản ghi thuộc dự án đó.
- **Tìm kiếm**: gõ vào ô tìm kiếm để lọc nhanh theo tên, mã, người phụ trách hoặc nhà cung cấp. Kết quả cập nhật sau khi bạn ngừng gõ.

## 5. Cảnh báo trên trang Tổng quan

Trang **Tổng quan** hiển thị:

- Số dự án đang triển khai, tổng ngân sách, chi phí thực tế.
- Số công việc quá hạn và số việc bị chặn.
- Số vấn đề đang mở.
- Biểu đồ tiến độ theo dự án và cơ cấu chi phí theo nhóm.
- Bảng so sánh ngân sách và thực chi từng dự án.
- Danh sách vật tư dưới định mức và công việc quá hạn.

Một công việc bị coi là **quá hạn** khi đã qua deadline và trạng thái chưa phải Completed hoặc Cancelled.

## 6. Quản lý dữ liệu

Toàn bộ dữ liệu nằm trong `data/db.json`. Bạn có thể sao lưu bằng cách chép tệp này.

- **Sao lưu**: `cp data/db.json data/db.backup.json`
- **Nạp lại dữ liệu mẫu**: `node src/seed.js --force` (xoá dữ liệu hiện có)

## 7. Xử lý sự cố

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Trình duyệt không mở được | Máy chủ chưa chạy | Chạy `node server.js` |
| Báo cổng đang được dùng | Cổng 4321 đã bị chiếm | Chạy `PORT=5000 node server.js` |
| Trang hiện dữ liệu cũ | Trình duyệt lưu bộ nhớ đệm | Tải lại trang, hoặc nạp lại dữ liệu mẫu |
| Không lưu được bản ghi | Thiếu trường bắt buộc | Điền các trường có dấu `*` rồi lưu lại |
| Không xuất được vật tư | Số lượng xuất lớn hơn tồn kho | Kiểm tra số lượng tồn ở mục Vật tư |

## 8. Dừng máy chủ

Nhấn `Ctrl + C` tại cửa sổ đang chạy, hoặc:

```bash
pkill -f "node server.js"
```
