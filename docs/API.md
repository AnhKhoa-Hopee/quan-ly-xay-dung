# Tài liệu REST API

Máy chủ chạy tại `http://127.0.0.1:4321`. Mọi phản hồi có định dạng `application/json; charset=utf-8`.

## Tổng quan

| Phương thức và đường dẫn | Mô tả |
|---|---|
| `GET /api/health` | Trạng thái máy chủ |
| `GET /api/bootstrap` | Toàn bộ dữ liệu kèm trường tính toán |
| `GET /api/dashboard` | Chỉ số KPI, dữ liệu biểu đồ, cảnh báo |
| `GET /api/<danh mục>` | Danh sách bản ghi |
| `GET /api/<danh mục>/<id>` | Chi tiết một bản ghi |
| `POST /api/<danh mục>` | Tạo bản ghi mới |
| `PUT /api/<danh mục>/<id>` | Cập nhật toàn bộ bản ghi |
| `PATCH /api/<danh mục>/<id>` | Cập nhật một phần bản ghi |
| `DELETE /api/<danh mục>/<id>` | Xoá bản ghi |
| `POST /api/materials/<id>/move` | Ghi giao dịch nhập/xuất kho |

`<danh mục>` là một trong:

`projects`, `tasks`, `contractors`, `people`, `materials`, `stockMoves`, `expenses`, `documents`, `issues`, `changeRequests`.

## Mã trạng thái

| Mã | Ý nghĩa |
|---|---|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `404` | Không tìm thấy danh mục hoặc bản ghi |
| `405` | Phương thức không được hỗ trợ |
| `422` | Dữ liệu không hợp lệ (thiếu trường bắt buộc) |
| `500` | Lỗi máy chủ |

## Ví dụ

### Kiểm tra máy chủ

```bash
curl http://127.0.0.1:4321/api/health
```

```json
{ "ok": true, "ts": "2026-09-21T04:10:51.956Z" }
```

### Lấy toàn bộ dữ liệu cho giao diện

```bash
curl http://127.0.0.1:4321/api/bootstrap
```

Kết quả gồm 10 danh mục, mỗi bản ghi đã được bổ sung trường tính toán (`progress`, `spent`, `remaining`, `overdue`, `lowStock`…).

### Lấy chỉ số dashboard

```bash
curl http://127.0.0.1:4321/api/dashboard
```

```json
{
  "kpi": {
    "projects": 4, "activeProjects": 2, "budget": 103500000000,
    "spent": 24010000000, "remaining": 79490000000,
    "tasks": 13, "overdue": 2, "blocked": 1, "openIssues": 4,
    "lowStock": 3, "contractors": 4, "people": 7
  },
  "projectStatus": [{ "label": "In Progress", "value": 2 }],
  "taskStatus": [{ "label": "Completed", "value": 3 }],
  "expenseByCategory": [{ "label": "Nhà thầu", "value": 17830000000 }],
  "materialsLow": [{ "name": "Xi măng PCB40", "qty": 320, "minQty": 500, "unit": "Bao" }],
  "upcoming": [],
  "budgetByProject": []
}
```

### Tạo dự án

```bash
curl -X POST http://127.0.0.1:4321/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"code":"CT-2026-05","name":"Nhà xưởng Bình Dương","budget":12000000000,"status":"Planning"}'
```

### Cập nhật công việc

```bash
curl -X PATCH http://127.0.0.1:4321/api/tasks/3 \
  -H 'Content-Type: application/json' \
  -d '{"status":"In Progress","progress":70}'
```

### Ghi giao dịch kho

```bash
curl -X POST http://127.0.0.1:4321/api/materials/3/move \
  -H 'Content-Type: application/json' \
  -d '{"type":"out","qty":20,"projectId":1,"note":"Xây tường tầng 6"}'
```

`type` nhận giá trị `in` (nhập kho) hoặc `out` (xuất kho). Máy chủ từ chối giao dịch xuất vượt quá số lượng tồn hiện có.

## Trường dữ liệu chính

### projects

`id`, `code`, `name`, `location`, `owner`, `managerId`, `startDate`, `endDate`, `budget`, `status`, `description`

Trường tính toán: `spent`, `remaining`, `taskCount`, `doneCount`, `overdueCount`, `progress`, `managerName`.

### tasks

`id`, `projectId`, `name`, `description`, `assigneeId`, `contractorId`, `startDate`, `dueDate`, `priority`, `status`, `progress`, `category`

Trường tính toán: `projectName`, `assigneeName`, `contractorName`, `overdue`, `daysLeft`.

### materials

`id`, `code`, `name`, `unit`, `qty`, `minQty`, `supplier`, `unitPrice`

Trường tính toán: `lowStock`, `moveCount`, `stockValue`.

## Ghi chú

- Trường `id` do máy chủ sinh tự động, bỏ qua nếu gửi lên khi tạo mới.
- Trường `createdAt` tự sinh nếu không truyền.
- Các trường số được ép kiểu; giá trị rỗng chuyển thành `0`.
- Các trường tham chiếu (`projectId`, `assigneeId`…) nhận `null` khi để trống.
