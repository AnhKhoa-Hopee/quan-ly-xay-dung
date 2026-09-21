import { replaceAll, load } from './db.js';

const iso = (d) => new Date(d).toISOString();
const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export function buildSeed() {
  const contractors = [
    { id: 1, name: 'Công ty CP Xây dựng Hòa Bình', contact: 'Nguyễn Văn Hùng', phone: '0901 234 567', email: 'hung@hoabinh.vn', specialty: 'Kết cấu - bê tông', rating: 4.5, status: 'Đang hợp tác' },
    { id: 2, name: 'Công ty TNHH Cơ điện Minh Phát', contact: 'Trần Thị Lan', phone: '0912 345 678', email: 'lan@minhphat.vn', specialty: 'Cơ điện M&E', rating: 4.2, status: 'Đang hợp tác' },
    { id: 3, name: 'Công ty CP Nội thất An Gia', contact: 'Lê Hoàng Nam', phone: '0938 112 233', email: 'nam@angia.vn', specialty: 'Hoàn thiện - nội thất', rating: 4.0, status: 'Đang hợp tác' },
    { id: 4, name: 'Công ty TNHH Cầu đường Đông Dương', contact: 'Phạm Quốc Bảo', phone: '0977 445 566', email: 'bao@dongduong.vn', specialty: 'Hạ tầng - san lấp', rating: 3.8, status: 'Tạm dừng' },
  ];

  const people = [
    { id: 1, name: 'Nguyễn Minh Tuấn', role: 'Project Manager', position: 'Giám đốc dự án', phone: '0905 111 222', email: 'tuan@congty.vn', projectIds: [1, 2] },
    { id: 2, name: 'Trần Quang Huy', role: 'Site Manager', position: 'Chỉ huy trưởng', phone: '0906 222 333', email: 'huy@congty.vn', projectIds: [1] },
    { id: 3, name: 'Lê Thị Mai', role: 'Kỹ sư', position: 'Kỹ sư kết cấu', phone: '0907 333 444', email: 'mai@congty.vn', projectIds: [1, 2] },
    { id: 4, name: 'Phạm Văn Đức', role: 'Kỹ sư', position: 'Kỹ sư M&E', phone: '0908 444 555', email: 'duc@congty.vn', projectIds: [2] },
    { id: 5, name: 'Hoàng Thu Hà', role: 'Kỹ sư', position: 'Kỹ sư QS - chi phí', phone: '0909 555 666', email: 'ha@congty.vn', projectIds: [1, 2] },
    { id: 6, name: 'Vũ Đình Khoa', role: 'Admin', position: 'Quản trị hệ thống', phone: '0910 666 777', email: 'khoa@congty.vn', projectIds: [] },
    { id: 7, name: 'Đặng Thùy Linh', role: 'Nhân viên', position: 'Thư ký dự án', phone: '0911 777 888', email: 'linh@congty.vn', projectIds: [1] },
  ];

  const projects = [
    {
      id: 1, code: 'CT-2026-01', name: 'Tòa nhà văn phòng Riverside Tower',
      location: '12 Trần Quý Khoách, Quận 1, TP.HCM', owner: 'Công ty CP Đầu tư Riverside',
      managerId: 1, startDate: day(-120), endDate: day(120), budget: 48000000000,
      status: 'In Progress', description: 'Tòa nhà 18 tầng, 2 tầng hầm, diện tích sàn 24.000 m2.',
    },
    {
      id: 2, code: 'CT-2026-02', name: 'Khu dân cư An Phú - Giai đoạn 2',
      location: 'An Phú, TP. Thủ Đức, TP.HCM', owner: 'Công ty CP Bất động sản An Phú',
      managerId: 1, startDate: day(-60), endDate: day(240), budget: 32000000000,
      status: 'In Progress', description: '42 căn liền kề, hạ tầng kỹ thuật và cảnh quan.',
    },
    {
      id: 3, code: 'CT-2026-03', name: 'Cải tạo Nhà máy Thép Long An',
      location: 'KCN Long Hậu, Long An', owner: 'Công ty TNHH Thép Long An',
      managerId: 3, startDate: day(-10), endDate: day(180), budget: 15500000000,
      status: 'Planning', description: 'Cải tạo dây chuyền và nhà xưởng, bổ sung hệ thống PCCC.',
    },
    {
      id: 4, code: 'CT-2025-14', name: 'Trạm bơm nước Nhà Bè',
      location: 'Nhà Bè, TP.HCM', owner: 'Trung tâm Hạ tầng đô thị', managerId: 2,
      startDate: day(-300), endDate: day(-30), budget: 8000000000,
      status: 'Completed', description: 'Trạm bơm công suất 40.000 m3/ngày đêm.',
    },
  ];

  const tasks = [
    { id: 1, projectId: 1, name: 'Thi công cọc khoan nhồi', description: '64 cọc D1200, dài 45m', assigneeId: 3, contractorId: 1, startDate: day(-120), dueDate: day(-80), priority: 'Cao', status: 'Completed', progress: 100, category: 'Kết cấu', createdAt: iso(day(-120)) },
    { id: 2, projectId: 1, name: 'Đào và thi công tầng hầm B1-B2', description: 'Tường vây và sàn hầm', assigneeId: 2, contractorId: 1, startDate: day(-80), dueDate: day(-20), priority: 'Cao', status: 'Completed', progress: 100, category: 'Kết cấu', createdAt: iso(day(-80)) },
    { id: 3, projectId: 1, name: 'Thi công kết cấu thân tầng 1-6', description: 'Cột, dầm, sàn bê tông cốt thép', assigneeId: 3, contractorId: 1, startDate: day(-20), dueDate: day(25), priority: 'Cao', status: 'In Progress', progress: 55, category: 'Kết cấu', createdAt: iso(day(-20)) },
    { id: 4, projectId: 1, name: 'Đi ống điện âm tường tầng 1-6', description: 'Ống luồn và hộp đấu', assigneeId: 4, contractorId: 2, startDate: day(-15), dueDate: day(10), priority: 'Trung bình', status: 'In Progress', progress: 40, category: 'M&E', createdAt: iso(day(-15)) },
    { id: 5, projectId: 1, name: 'Điều chỉnh thiết kế cầu thang thoát hiểm', description: 'Bổ sung thông gió buồng thang', assigneeId: 2, contractorId: 2, startDate: day(-8), dueDate: day(-1), priority: 'Cao', status: 'Blocked', progress: 15, category: 'M&E', createdAt: iso(day(-8)) },
    { id: 6, projectId: 1, name: 'Nghiệm thu thép tầng 7', description: 'Kiểm tra chủng loại và mối nối', assigneeId: 5, contractorId: null, startDate: day(2), dueDate: day(6), priority: 'Trung bình', status: 'To Do', progress: 0, category: 'QA/QC', createdAt: iso(day(-2)) },
    { id: 7, projectId: 1, name: 'Hoàn thiện tầng hầm - chống thấm', description: 'Chống thấm sàn hầm B1', assigneeId: 2, contractorId: 3, startDate: day(-30), dueDate: day(-5), priority: 'Cao', status: 'In Progress', progress: 70, category: 'Hoàn thiện', createdAt: iso(day(-30)) },
    { id: 8, projectId: 2, name: 'San lấp và đầm nén nền', description: 'K=0.95 toàn khu', assigneeId: 2, contractorId: 4, startDate: day(-60), dueDate: day(-10), priority: 'Cao', status: 'Completed', progress: 100, category: 'Hạ tầng', createdAt: iso(day(-60)) },
    { id: 9, projectId: 2, name: 'Thi công móng 42 căn liền kề', description: 'Móng đơn bê tông cốt thép', assigneeId: 3, contractorId: 1, startDate: day(-10), dueDate: day(60), priority: 'Cao', status: 'In Progress', progress: 25, category: 'Kết cấu', createdAt: iso(day(-10)) },
    { id: 10, projectId: 2, name: 'Đường nội bộ và cống thoát nước', description: 'Bê tông nhựa và cống D600', assigneeId: 4, contractorId: 4, startDate: day(30), dueDate: day(90), priority: 'Trung bình', status: 'To Do', progress: 0, category: 'Hạ tầng', createdAt: iso(day(-5)) },
    { id: 11, projectId: 3, name: 'Khảo sát hiện trạng nhà xưởng', description: 'Đo vẽ và đánh giá kết cấu', assigneeId: 3, contractorId: null, startDate: day(-10), dueDate: day(5), priority: 'Trung bình', status: 'In Progress', progress: 60, category: 'Khảo sát', createdAt: iso(day(-10)) },
    { id: 12, projectId: 4, name: 'Lắp đặt tổ máy bơm', description: 'Bơm trục đứng 3x160kW', assigneeId: 2, contractorId: 2, startDate: day(-120), dueDate: day(-60), priority: 'Cao', status: 'Completed', progress: 100, category: 'Thiết bị', createdAt: iso(day(-120)) },
    { id: 13, projectId: 1, name: 'Lập hồ sơ nghiệm thu giai đoạn', description: 'Tập hợp biên bản và bản vẽ hoàn công', assigneeId: 7, contractorId: null, startDate: day(5), dueDate: day(20), priority: 'Thấp', status: 'To Do', progress: 0, category: 'Hồ sơ', createdAt: iso(day(-1)) },
  ];

  const materials = [
    { id: 1, code: 'VT-001', name: 'Thép thanh CB400-V D20', unit: 'Tấn', qty: 42, minQty: 20, supplier: 'Thép Hòa Phát', unitPrice: 16500000 },
    { id: 2, code: 'VT-002', name: 'Bê tông thương phẩm B30', unit: 'm3', qty: 180, minQty: 100, supplier: 'Bê tông Hà Thanh', unitPrice: 1450000 },
    { id: 3, code: 'VT-003', name: 'Xi măng PCB40', unit: 'Bao', qty: 320, minQty: 500, supplier: 'Xi măng Hà Tiên', unitPrice: 92000 },
    { id: 4, code: 'VT-004', name: 'Cát vàng xây dựng', unit: 'm3', qty: 65, minQty: 40, supplier: 'Cát Đồng Nai', unitPrice: 480000 },
    { id: 5, code: 'VT-005', name: 'Đá 1x2', unit: 'm3', qty: 30, minQty: 35, supplier: 'Đá Bình Dương', unitPrice: 420000 },
    { id: 6, code: 'VT-006', name: 'Ống nhựa uPVC D114', unit: 'Cây', qty: 240, minQty: 100, supplier: 'Nhựa Bình Minh', unitPrice: 185000 },
    { id: 7, code: 'VT-007', name: 'Gạch bê tông nhẹ AAC 100mm', unit: 'm3', qty: 85, minQty: 50, supplier: 'Gạch Nhẹ Miền Nam', unitPrice: 1150000 },
    { id: 8, code: 'VT-008', name: 'Dây điện Cu/PVC 2.5mm2', unit: 'm', qty: 1800, minQty: 2000, supplier: 'Dây cáp Điện Việt Nam', unitPrice: 22000 },
  ];

  const stockMoves = [
    { id: 1, materialId: 1, projectId: 1, type: 'in', qty: 30, date: day(-40), note: 'Nhập theo HĐ Hòa Phát' },
    { id: 2, materialId: 1, projectId: 1, type: 'out', qty: 12, date: day(-20), note: 'Thi công thân tầng 3-5' },
    { id: 3, materialId: 2, projectId: 1, type: 'out', qty: 90, date: day(-12), note: 'Đổ sàn tầng 4' },
    { id: 4, materialId: 3, projectId: 1, type: 'out', qty: 180, date: day(-10), note: 'Xây tường tầng hầm' },
    { id: 5, materialId: 3, projectId: 1, type: 'in', qty: 100, date: day(-6), note: 'Nhập bổ sung' },
    { id: 6, materialId: 8, projectId: 1, type: 'out', qty: 400, date: day(-5), note: 'Đi ống điện tầng 1-2' },
    { id: 7, materialId: 5, projectId: 2, type: 'out', qty: 25, date: day(-8), note: 'Bê tông móng khu A' },
  ];

  const expenses = [
    { id: 1, projectId: 1, category: 'Nhà thầu', amount: 5200000000, date: day(-90), description: 'Tạm ứng Hòa Bình - đợt 1', contractorId: 1 },
    { id: 2, projectId: 1, category: 'Vật tư', amount: 2100000000, date: day(-70), description: 'Thép móng và tầng hầm', contractorId: null },
    { id: 3, projectId: 1, category: 'Nhân công', amount: 1650000000, date: day(-45), description: 'Lương công nhân tháng 1', contractorId: null },
    { id: 4, projectId: 1, category: 'Máy móc', amount: 980000000, date: day(-35), description: 'Thuê cẩu và máy ép cọc', contractorId: 1 },
    { id: 5, projectId: 1, category: 'Nhà thầu', amount: 2300000000, date: day(-20), description: 'Cơ điện M&E - đợt 1', contractorId: 2 },
    { id: 6, projectId: 1, category: 'Vận chuyển', amount: 320000000, date: day(-8), description: 'Vận chuyển bê tông', contractorId: null },
    { id: 7, projectId: 2, category: 'Nhà thầu', amount: 3400000000, date: day(-50), description: 'San lấp Đông Dương', contractorId: 4 },
    { id: 8, projectId: 2, category: 'Vật tư', amount: 1250000000, date: day(-15), description: 'Bê tông và thép móng', contractorId: null },
    { id: 9, projectId: 2, category: 'Khác', amount: 260000000, date: day(-3), description: 'Chi phí phát sinh hiện trường', contractorId: null },
    { id: 10, projectId: 3, category: 'Khác', amount: 150000000, date: day(-5), description: 'Khảo sát hiện trạng', contractorId: null },
    { id: 11, projectId: 4, category: 'Nhà thầu', amount: 6400000000, date: day(-90), description: 'Thanh toán trạm bơm', contractorId: 2 },
  ];

  const documents = [
    { id: 1, projectId: 1, name: 'Bản vẽ kết cấu tầng 1-6', type: 'Bản vẽ', version: 'v3.1', uploadedBy: 3, uploadedAt: iso(day(-25)), url: 'https://drive.example/riverside/ketcau-v31.pdf' },
    { id: 2, projectId: 1, name: 'Hợp đồng thi công Hòa Bình', type: 'Hợp đồng', version: 'v1.0', uploadedBy: 1, uploadedAt: iso(day(-110)), url: 'https://drive.example/riverside/hd-hoabinh.pdf' },
    { id: 3, projectId: 1, name: 'Biên bản nghiệm thu cọc', type: 'Biên bản', version: 'v1.0', uploadedBy: 5, uploadedAt: iso(day(-78)), url: 'https://drive.example/riverside/bb-coc.pdf' },
    { id: 4, projectId: 1, name: 'Báo cáo tiến độ tháng 2', type: 'Báo cáo', version: 'v2.0', uploadedBy: 7, uploadedAt: iso(day(-12)), url: 'https://drive.example/riverside/bc-t2.pdf' },
    { id: 5, projectId: 1, name: 'Hình ảnh hiện trường tầng 5', type: 'Hình ảnh', version: 'v1.0', uploadedBy: 2, uploadedAt: iso(day(-6)), url: 'https://drive.example/riverside/anh-t5.zip' },
    { id: 6, projectId: 2, name: 'Bản vẽ hạ tầng kỹ thuật', type: 'Bản vẽ', version: 'v2.0', uploadedBy: 4, uploadedAt: iso(day(-40)), url: 'https://drive.example/anphu/hatang-v2.pdf' },
    { id: 7, projectId: 2, name: 'Hồ sơ nghiệm thu san lấp', type: 'Nghiệm thu', version: 'v1.0', uploadedBy: 5, uploadedAt: iso(day(-9)), url: 'https://drive.example/anphu/nt-sanlap.pdf' },
    { id: 8, projectId: 3, name: 'Tài liệu kỹ thuật dây chuyền', type: 'Tài liệu kỹ thuật', version: 'v1.0', uploadedBy: 3, uploadedAt: iso(day(-4)), url: 'https://drive.example/longan/tailieu-v1.pdf' },
  ];

  const issues = [
    { id: 1, projectId: 1, title: 'Nứt chân tường tầng hầm B1', description: 'Vết nứt 1.2m tại trục C-D, nghi do lún cục bộ.', severity: 'Cao', status: 'Đang xử lý', assigneeId: 2, createdAt: iso(day(-9)), resolvedAt: null },
    { id: 2, projectId: 1, title: 'Chậm cấp thép tầng 7', description: 'Nhà cung cấp giao chậm 3 ngày so với kế hoạch.', severity: 'Trung bình', status: 'Mở', assigneeId: 7, createdAt: iso(day(-3)), resolvedAt: null },
    { id: 3, projectId: 1, title: 'Rò rỉ nước mưa khu vực thang máy', description: 'Nước thấm qua khe co giãn sàn mái.', severity: 'Trung bình', status: 'Đã xử lý', assigneeId: 2, createdAt: iso(day(-30)), resolvedAt: iso(day(-22)) },
    { id: 4, projectId: 2, title: 'Đường tạm xuống cấp', description: 'Xe tải làm hư đường tạm khu B.', severity: 'Thấp', status: 'Mở', assigneeId: 2, createdAt: iso(day(-5)), resolvedAt: null },
    { id: 5, projectId: 3, title: 'Thiếu hồ sơ PCCC hiện hữu', description: 'Chưa có bản vẽ hoàn công PCCC của nhà máy.', severity: 'Cao', status: 'Mở', assigneeId: 3, createdAt: iso(day(-6)), resolvedAt: null },
  ];

  const changeRequests = [
    { id: 1, projectId: 1, title: 'Bổ sung hệ thống thông gió buồng thang', description: 'Theo yêu cầu PCCC mới.', impactCost: 850000000, impactDays: 12, status: 'Chờ duyệt', createdAt: iso(day(-7)) },
    { id: 2, projectId: 1, title: 'Nâng cấp kính mặt dựng Low-E', description: 'Thay kính thường bằng kính Low-E.', impactCost: 2400000000, impactDays: 20, status: 'Đang xem xét', createdAt: iso(day(-4)) },
    { id: 3, projectId: 2, title: 'Dời trạm biến áp 50m', description: 'Theo quy hoạch điều chỉnh của thành phố.', impactCost: 420000000, impactDays: 8, status: 'Đã duyệt', createdAt: iso(day(-20)) },
    { id: 4, projectId: 3, title: 'Thay mái tôn bằng mái panel cách nhiệt', description: 'Giảm nhiệt cho xưởng.', impactCost: 1150000000, impactDays: 25, status: 'Chờ duyệt', createdAt: iso(day(-2)) },
  ];

  return { projects, tasks, contractors, people, materials, stockMoves, expenses, documents, issues, changeRequests };
}

export function seedIfEmpty() {
  const db = load();
  if (db.projects.length === 0) {
    replaceAll(buildSeed());
    return true;
  }
  return false;
}

if (process.argv.includes('--force')) {
  replaceAll(buildSeed());
  console.log('Đã tạo dữ liệu mẫu vào data/db.json');
}
