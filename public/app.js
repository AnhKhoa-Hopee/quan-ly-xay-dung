// ===== Helpers =====
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (v) => new Intl.NumberFormat('vi-VN').format(Number(v) || 0) + ' đ';
const compact = (v) => {
  const x = Number(v) || 0;
  if (Math.abs(x) >= 1e9) return (x / 1e9).toFixed(2).replace('.', ',') + ' tỷ';
  if (Math.abs(x) >= 1e6) return (x / 1e6).toFixed(1).replace('.', ',') + ' tr';
  return new Intl.NumberFormat('vi-VN').format(x);
};
const dateVN = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

const STATUS_TONE = {
  'Draft': 'gray', 'Planning': 'blue', 'In Progress': 'amber', 'On Hold': 'purple', 'Completed': 'green', 'Cancelled': 'red',
  'To Do': 'gray', 'Blocked': 'red',
  'Cao': 'red', 'Trung bình': 'amber', 'Thấp': 'gray',
  'Mở': 'red', 'Đang xử lý': 'amber', 'Đã xử lý': 'green',
  'Chờ duyệt': 'amber', 'Đang xem xét': 'blue', 'Đã duyệt': 'green', 'Từ chối': 'red',
  'Đang hợp tác': 'green', 'Tạm dừng': 'gray',
};
const tag = (v) => v == null || v === '' ? '<span class="muted">—</span>' : `<span class="tag ${STATUS_TONE[v] || 'gray'}">${esc(v)}</span>`;

// ===== State =====
const state = { data: null, route: 'dashboard', filter: '', search: '', chip: '' };

const NAV = [
  { group: 'Điều hành' },
  { key: 'dashboard', icon: '▤', label: 'Tổng quan' },
  { key: 'projects', icon: '▦', label: 'Dự án' },
  { key: 'tasks', icon: '✓', label: 'Công việc' },
  { key: 'progress', icon: '◷', label: 'Tiến độ' },
  { group: 'Nguồn lực & Chi phí' },
  { key: 'expenses', icon: '₫', label: 'Chi phí' },
  { key: 'materials', icon: '📦', label: 'Vật tư' },
  { key: 'contractors', icon: '⚒', label: 'Nhà thầu' },
  { key: 'people', icon: '👤', label: 'Nhân sự' },
  { group: 'Hồ sơ & Kiểm soát' },
  { key: 'documents', icon: '🗎', label: 'Hồ sơ' },
  { key: 'issues', icon: '⚠', label: 'Vấn đề' },
  { key: 'changes', icon: '⇄', label: 'Yêu cầu thay đổi' },
];

const SUBTITLE = {
  dashboard: 'Tổng quan tiến độ, chi phí và cảnh báo',
  projects: 'Danh sách dự án và tình trạng thực hiện',
  tasks: 'Công việc, người phụ trách và hạn hoàn thành',
  progress: 'So sánh kế hoạch và thực tế theo dự án',
  expenses: 'Ngân sách, khoản chi và chi phí phát sinh',
  materials: 'Danh mục, tồn kho và giao dịch nhập xuất',
  contractors: 'Nhà thầu, khối lượng công việc và chi phí',
  people: 'Nhân sự dự án và khối lượng công việc',
  documents: 'Bản vẽ, hợp đồng, biên bản, báo cáo',
  issues: 'Vấn đề kỹ thuật và tiến độ xử lý',
  changes: 'Yêu cầu thay đổi, tác động chi phí và tiến độ',
};

// ===== Form schema =====
const SCHEMA = {
  projects: {
    title: 'dự án',
    fields: [
      { k: 'code', l: 'Mã dự án', req: true }, { k: 'name', l: 'Tên dự án', req: true },
      { k: 'location', l: 'Địa điểm' }, { k: 'owner', l: 'Chủ đầu tư' },
      { k: 'managerId', l: 'Quản lý dự án', type: 'ref', ref: 'people' },
      { k: 'status', l: 'Trạng thái', type: 'select', options: ['Draft', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'] },
      { k: 'startDate', l: 'Ngày bắt đầu', type: 'date' }, { k: 'endDate', l: 'Ngày dự kiến hoàn thành', type: 'date' },
      { k: 'budget', l: 'Ngân sách (đ)', type: 'number' },
      { k: 'description', l: 'Mô tả', type: 'textarea', full: true },
    ],
  },
  tasks: {
    title: 'công việc',
    fields: [
      { k: 'projectId', l: 'Dự án', type: 'ref', ref: 'projects', req: true }, { k: 'name', l: 'Tên công việc', req: true },
      { k: 'assigneeId', l: 'Người phụ trách', type: 'ref', ref: 'people' }, { k: 'contractorId', l: 'Nhà thầu', type: 'ref', ref: 'contractors' },
      { k: 'startDate', l: 'Ngày bắt đầu', type: 'date' }, { k: 'dueDate', l: 'Deadline', type: 'date' },
      { k: 'priority', l: 'Mức độ ưu tiên', type: 'select', options: ['Cao', 'Trung bình', 'Thấp'] },
      { k: 'status', l: 'Trạng thái', type: 'select', options: ['To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled'] },
      { k: 'progress', l: 'Phần trăm hoàn thành', type: 'number' }, { k: 'category', l: 'Hạng mục' },
      { k: 'description', l: 'Mô tả', type: 'textarea', full: true },
    ],
  },
  expenses: {
    title: 'khoản chi',
    fields: [
      { k: 'projectId', l: 'Dự án', type: 'ref', ref: 'projects', req: true },
      { k: 'category', l: 'Nhóm chi phí', type: 'select', options: ['Nhân công', 'Vật tư', 'Máy móc', 'Nhà thầu', 'Vận chuyển', 'Khác'] },
      { k: 'amount', l: 'Số tiền (đ)', type: 'number', req: true }, { k: 'date', l: 'Ngày chi', type: 'date' },
      { k: 'contractorId', l: 'Nhà thầu', type: 'ref', ref: 'contractors' },
      { k: 'description', l: 'Diễn giải', type: 'textarea', full: true },
    ],
  },
  materials: {
    title: 'vật tư',
    fields: [
      { k: 'code', l: 'Mã vật tư' }, { k: 'name', l: 'Tên vật tư', req: true },
      { k: 'unit', l: 'Đơn vị tính' }, { k: 'supplier', l: 'Nhà cung cấp' },
      { k: 'qty', l: 'Số lượng tồn', type: 'number' }, { k: 'minQty', l: 'Mức tồn tối thiểu', type: 'number' },
      { k: 'unitPrice', l: 'Đơn giá (đ)', type: 'number' },
    ],
  },
  contractors: {
    title: 'nhà thầu',
    fields: [
      { k: 'name', l: 'Tên nhà thầu', req: true }, { k: 'specialty', l: 'Lĩnh vực' },
      { k: 'contact', l: 'Người liên hệ' }, { k: 'phone', l: 'Điện thoại' },
      { k: 'email', l: 'Email' }, { k: 'rating', l: 'Đánh giá (0-5)', type: 'number' },
      { k: 'status', l: 'Trạng thái', type: 'select', options: ['Đang hợp tác', 'Tạm dừng', 'Ngừng hợp tác'] },
    ],
  },
  people: {
    title: 'nhân sự',
    fields: [
      { k: 'name', l: 'Họ tên', req: true }, { k: 'role', l: 'Vai trò', type: 'select', options: ['Admin', 'Chủ đầu tư', 'Project Manager', 'Site Manager', 'Kỹ sư', 'Nhà thầu', 'Nhân viên'] },
      { k: 'position', l: 'Chức danh' }, { k: 'phone', l: 'Điện thoại' },
      { k: 'email', l: 'Email' }, { k: 'projectIds', l: 'Dự án tham gia (ID, cách nhau dấu phẩy)' },
    ],
  },
  documents: {
    title: 'tài liệu',
    fields: [
      { k: 'projectId', l: 'Dự án', type: 'ref', ref: 'projects', req: true }, { k: 'name', l: 'Tên tài liệu', req: true },
      { k: 'type', l: 'Loại', type: 'select', options: ['Bản vẽ', 'Hợp đồng', 'Biên bản', 'Báo cáo', 'Nghiệm thu', 'Hình ảnh', 'Tài liệu kỹ thuật'] },
      { k: 'version', l: 'Phiên bản' }, { k: 'uploadedBy', l: 'Người tải lên', type: 'ref', ref: 'people' },
      { k: 'uploadedAt', l: 'Ngày tải lên', type: 'date' }, { k: 'url', l: 'Đường dẫn', full: true },
    ],
  },
  issues: {
    title: 'vấn đề',
    fields: [
      { k: 'projectId', l: 'Dự án', type: 'ref', ref: 'projects', req: true }, { k: 'title', l: 'Tiêu đề', req: true },
      { k: 'severity', l: 'Mức độ', type: 'select', options: ['Cao', 'Trung bình', 'Thấp'] },
      { k: 'status', l: 'Trạng thái', type: 'select', options: ['Mở', 'Đang xử lý', 'Đã xử lý'] },
      { k: 'assigneeId', l: 'Người xử lý', type: 'ref', ref: 'people' }, { k: 'createdAt', l: 'Ngày ghi nhận', type: 'date' },
      { k: 'resolvedAt', l: 'Ngày xử lý xong', type: 'date' },
      { k: 'description', l: 'Mô tả', type: 'textarea', full: true },
    ],
  },
  changeRequests: {
    title: 'yêu cầu thay đổi',
    fields: [
      { k: 'projectId', l: 'Dự án', type: 'ref', ref: 'projects', req: true }, { k: 'title', l: 'Tiêu đề', req: true },
      { k: 'impactCost', l: 'Tác động chi phí (đ)', type: 'number' }, { k: 'impactDays', l: 'Tác động tiến độ (ngày)', type: 'number' },
      { k: 'status', l: 'Trạng thái', type: 'select', options: ['Chờ duyệt', 'Đang xem xét', 'Đã duyệt', 'Từ chối'] },
      { k: 'createdAt', l: 'Ngày tạo', type: 'date' },
      { k: 'description', l: 'Mô tả', type: 'textarea', full: true },
    ],
  },
  stockMoves: {
    title: 'giao dịch kho',
    fields: [
      { k: 'materialId', l: 'Vật tư', type: 'ref', ref: 'materials', req: true },
      { k: 'projectId', l: 'Dự án', type: 'ref', ref: 'projects' },
      { k: 'type', l: 'Loại giao dịch', type: 'select', options: ['Nhập kho', 'Xuất kho'], raw: { 'Nhập kho': 'in', 'Xuất kho': 'out' } },
      { k: 'qty', l: 'Số lượng', type: 'number', req: true },
      { k: 'date', l: 'Ngày', type: 'date' },
      { k: 'note', l: 'Ghi chú', full: true },
    ],
  },
};

// ===== Data =====
async function api(path, opts) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Lỗi hệ thống');
  return data;
}
function refresh() { return api('/api/bootstrap').then((d) => { state.data = d; render(); }); }

// ===== Toast =====
function toast(msg, kind = '') {
  const t = el('div', 'toast ' + kind, esc(msg));
  $('#toastWrap').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 2600);
}

// ===== Boot =====
function renderNav() {
  const nav = $('#nav'); nav.innerHTML = '';
  NAV.forEach((item) => {
    if (item.group) { nav.appendChild(el('div', 'nav-group', esc(item.group))); return; }
    const a = el('a', state.route === item.key ? 'active' : '', `<span class="ic">${item.icon}</span><span>${item.label}</span>`);
    a.href = '#/' + item.key;
    const counts = { tasks: state.data?.tasks.filter((t) => t.overdue).length, issues: state.data?.issues.filter((i) => i.status !== 'Đã xử lý').length, materials: state.data?.materials.filter((m) => m.lowStock).length };
    if (counts[item.key]) a.appendChild(el('span', 'badge', counts[item.key]));
    nav.appendChild(a);
  });
}

function renderHeader() {
  $('#pageTitle').textContent = (NAV.find((n) => n.key === state.route) || {}).label || 'Tổng quan';
  $('#pageSub').textContent = SUBTITLE[state.route] || '';
  const pf = $('#projectFilter');
  const cur = state.filter;
  pf.innerHTML = '<option value="">Tất cả dự án</option>' + (state.data?.projects || []).map((p) => `<option value="${p.id}">${esc(p.code)} — ${esc(p.name)}</option>`).join('');
  pf.value = cur;
  $('#search').value = state.search;
}

// ===== Shared UI =====
function kpiCard(label, value, hint, tone = '') {
  return `<div class="kpi ${tone}"><div class="k-label">${esc(label)}</div><div class="k-value">${value}</div>${hint ? `<div class="k-hint">${hint}</div>` : ''}</div>`;
}
function barList(rows, tone = '', fmt = (v) => v) {
  if (!rows.length) return '<p class="muted">Chưa có dữ liệu.</p>';
  const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
  return rows.map((r) => `
    <div class="bar-row">
      <div class="bar-head"><b>${esc(r.label)}</b><span class="muted">${esc(fmt(r.value))}</span></div>
      <div class="bar ${tone}"><i style="width:${Math.round((Number(r.value) || 0) / max * 100)}%"></i></div>
    </div>`).join('');
}
function progressMini(pct, tone = '') {
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const cls = p >= 100 ? 'green' : tone;
  return `<div class="progress-mini"><div class="bar ${cls}"><i style="width:${p}%"></i></div><span>${p}%</span></div>`;
}
function table(cols, rows, opts = {}) {
  if (!rows.length) return `<div class="card"><div class="empty"><b>Chưa có dữ liệu</b>Nhấn “+ Thêm mới” để tạo bản ghi đầu tiên.</div></div>`;
  const head = cols.map((c) => `<th class="${c.num ? 'num' : ''}">${esc(c.label)}</th>`).join('');
  const body = rows.map((r) => {
    const tds = cols.map((c) => `<td class="${c.num ? 'num' : ''}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('');
    const act = opts.collection ? `<td class="actions">
        <button class="btn sm" data-edit="${opts.collection}:${r.id}">Sửa</button>
        <button class="btn sm danger" data-del="${opts.collection}:${r.id}">Xóa</button></td>` : '';
    return `<tr>${tds}${act}</tr>`;
  }).join('');
  return `<div class="table-wrap"><table><thead><tr>${head}${opts.collection ? '<th></th>' : ''}</tr></thead><tbody>${body}</tbody></table></div>`;
}
const refName = (coll, id, field = 'name') => (state.data?.[coll] || []).find((r) => r.id === id)?.[field] || '—';

// ===== Filters =====
function inFilter(row) {
  if (!state.filter) return true;
  return String(row.projectId) === String(state.filter);
}
function inSearch(row, fields) {
  if (!state.search) return true;
  const q = state.search.toLowerCase();
  return fields.some((f) => String(row[f] ?? '').toLowerCase().includes(q));
}

// ===== Pages =====
const PAGES = {};

PAGES.dashboard = () => {
  const d = state.data;
  const projects = d.projects.map((p) => ({
    label: p.code + ' · ' + p.name.split(' ').slice(0, 3).join(' '),
    value: p.progress, id: p.id,
  }));
  return `
    <div class="kpi-grid">
      ${kpiCard('Dự án đang triển khai', state.data.projects.filter((p) => p.status === 'In Progress').length, `${d.projects.length} dự án tổng cộng`, 'blue')}
      ${kpiCard('Tổng ngân sách', compact(d.projects.reduce((s, p) => s + Number(p.budget || 0), 0)), 'Toàn bộ dự án')}
      ${kpiCard('Chi phí thực tế', compact(d.projects.reduce((s, p) => s + p.spent, 0)), `Còn lại ${compact(d.projects.reduce((s, p) => s + p.remaining, 0))}`, 'green')}
      ${kpiCard('Công việc quá hạn', d.tasks.filter((t) => t.overdue).length, `${d.tasks.filter((t) => t.status === 'Blocked').length} việc bị chặn`, 'red')}
      ${kpiCard('Vấn đề đang mở', d.issues.filter((i) => i.status !== 'Đã xử lý').length, `${d.issues.length} vấn đề ghi nhận`, 'purple')}
    </div>

    <div class="grid cols-2">
      <div class="card">
        <h3>Tiến độ theo dự án</h3>
        <p class="card-sub">Phần trăm hoàn thành trung bình theo công việc</p>
        ${barList(projects.map((p) => ({ label: p.label, value: p.value })), '', (v) => v + '%')}
      </div>
      <div class="card">
        <h3>Chi phí theo nhóm</h3>
        <p class="card-sub">Tổng hợp toàn bộ khoản chi</p>
        ${barList(dashboardData().expenseByCategory, 'blue', (v) => compact(v))}
      </div>
    </div>

    <div class="grid cols-2">
      <div class="card">
        <h3>Ngân sách và thực chi</h3>
        <p class="card-sub">So sánh ngân sách dự kiến với chi phí thực tế</p>
        <div class="table-wrap"><table><thead><tr><th>Dự án</th><th class="num">Ngân sách</th><th class="num">Thực chi</th><th class="num">Còn lại</th></tr></thead><tbody>
        ${d.projects.map((p) => `<tr><td><span class="strong">${esc(p.code)}</span><div class="muted">${esc(p.name)}</div></td><td class="num">${compact(p.budget)}</td><td class="num">${compact(p.spent)}</td><td class="num">${p.remaining < 0 ? `<span class="tag red">${compact(p.remaining)}</span>` : compact(p.remaining)}</td></tr>`).join('')}
        </tbody></table></div>
      </div>
      <div class="card">
        <h3>Cảnh báo</h3>
        <p class="card-sub">Vật tư dưới định mức và công việc quá hạn</p>
        ${alertList()}
      </div>
    </div>

    <div class="section-title">Công việc đến hạn</div>
    ${table([
      { label: 'Công việc', render: (r) => `<span class="strong">${esc(r.name)}</span><div class="muted">${esc(r.projectName)}</div>` },
      { label: 'Phụ trách', render: (r) => esc(r.assigneeName || '—') },
      { label: 'Hạn', render: (r) => r.overdue ? `<span class="tag red">${dateVN(r.dueDate)} · trễ</span>` : dateVN(r.dueDate) },
      { label: 'Ưu tiên', render: (r) => tag(r.priority) },
      { label: 'Tiến độ', render: (r) => progressMini(r.progress) },
    ], dashboardData().upcoming)}
  `;
};

function dashboardData() {
  const d = state.data;
  const catAgg = {};
  d.expenses.forEach((e) => { catAgg[e.category || 'Khác'] = (catAgg[e.category || 'Khác'] || 0) + (Number(e.amount) || 0); });
  const expenseByCategory = Object.entries(catAgg).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const upcoming = d.tasks.filter((t) => !['Completed', 'Cancelled'].includes(t.status) && t.dueDate)
    .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate))).slice(0, 8);
  return { expenseByCategory, upcoming };
}

function alertList() {
  const low = state.data.materials.filter((m) => m.lowStock);
  const late = state.data.tasks.filter((t) => t.overdue);
  const parts = [];
  if (low.length) parts.push(`<div class="section-title" style="margin-top:0">📦 Tồn kho thấp (${low.length})</div>` + low.map((m) => `<div class="bar-row"><div class="bar-head"><b>${esc(m.name)}</b><span class="tag red">${m.qty}/${m.minQty} ${esc(m.unit)}</span></div></div>`).join(''));
  if (late.length) parts.push(`<div class="section-title">⚠ Công việc quá hạn (${late.length})</div>` + late.map((t) => `<div class="bar-row"><div class="bar-head"><b>${esc(t.name)}</b><span class="tag red">${dateVN(t.dueDate)}</span></div><div class="muted" style="font-size:12px">${esc(t.projectName)} · ${esc(t.assigneeName || 'Chưa giao')}</div></div>`).join(''));
  if (!parts.length) return '<p class="muted">Không có cảnh báo. Mọi thứ trong tầm kiểm soát.</p>';
  return parts.join('');
}

PAGES.projects = () => table([
  { label: 'Mã', render: (r) => `<span class="strong">${esc(r.code)}</span>` },
  { label: 'Dự án', render: (r) => `${esc(r.name)}<div class="muted">${esc(r.location || '')}</div>` },
  { label: 'Chủ đầu tư', render: (r) => esc(r.owner || '—') },
  { label: 'Quản lý', render: (r) => esc(r.managerName || '—') },
  { label: 'Tiến độ', render: (r) => progressMini(r.progress) },
  { label: 'Ngân sách', num: true, render: (r) => compact(r.budget) },
  { label: 'Thực chi', num: true, render: (r) => compact(r.spent) },
  { label: 'Trạng thái', render: (r) => tag(r.status) },
], state.data.projects.filter((p) => !state.filter || String(p.id) === state.filter).filter((p) => inSearch(p, ['code', 'name', 'owner', 'location'])), { collection: 'projects' });

PAGES.tasks = () => table([
  { label: 'Công việc', render: (r) => `<span class="strong">${esc(r.name)}</span><div class="muted">${esc(r.projectName)} · ${esc(r.category || '')}</div>` },
  { label: 'Phụ trách', render: (r) => esc(r.assigneeName || '—') },
  { label: 'Nhà thầu', render: (r) => esc(r.contractorName || '—') },
  { label: 'Hạn', render: (r) => r.overdue ? `<span class="tag red">${dateVN(r.dueDate)}</span>` : dateVN(r.dueDate) },
  { label: 'Ưu tiên', render: (r) => tag(r.priority) },
  { label: 'Trạng thái', render: (r) => tag(r.status) },
  { label: 'Tiến độ', render: (r) => progressMini(r.progress) },
], state.data.tasks.filter(inFilter).filter((t) => inSearch(t, ['name', 'category', 'assigneeName'])), { collection: 'tasks' });

PAGES.progress = () => {
  const list = state.data.projects.filter((p) => !state.filter || String(p.id) === state.filter);
  const rows = list.map((p) => {
    const planned = plannedProgress(p);
    return { ...p, planned };
  });
  return `
  <div class="kpi-grid">
    ${kpiCard('Dự án theo dõi', rows.length, 'Có công việc và hạn hoàn thành', 'blue')}
    ${kpiCard('Đúng/trước kế hoạch', rows.filter((r) => r.progress >= r.planned).length, 'Tiến độ thực tế ≥ kế hoạch', 'green')}
    ${kpiCard('Có nguy cơ chậm', rows.filter((r) => r.progress < r.planned).length, 'Tiến độ thực tế < kế hoạch', 'red')}
  </div>
  ${rows.map((r) => `
    <div class="card">
      <h3>${esc(r.code)} — ${esc(r.name)}</h3>
      <p class="card-sub">Kế hoạch ${r.planned}% · Thực tế ${r.progress}% · ${r.taskCount} công việc (${r.doneCount} hoàn thành, ${r.overdueCount} quá hạn)</p>
      <div class="bar-row"><div class="bar-head"><b>Kế hoạch</b><span class="muted">${r.planned}%</span></div><div class="bar blue"><i style="width:${r.planned}%"></i></div></div>
      <div class="bar-row"><div class="bar-head"><b>Thực tế</b><span class="muted">${r.progress}%</span></div><div class="bar ${r.progress < r.planned ? 'red' : 'green'}"><i style="width:${r.progress}%"></i></div></div>
      ${timeline(r)}
    </div>`).join('')}
  `;
};

function plannedProgress(p) {
  const now = new Date();
  const s = new Date(p.startDate), e = new Date(p.endDate);
  if (isNaN(s) || isNaN(e) || e <= s) return 0;
  return Math.max(0, Math.min(100, Math.round((now - s) / (e - s) * 100)));
}
function timeline(p) {
  const tasks = state.data.tasks.filter((t) => t.projectId === p.id && t.startDate && t.dueDate);
  if (!tasks.length) return '';
  const min = Math.min(...tasks.map((t) => new Date(t.startDate).getTime()));
  const max = Math.max(...tasks.map((t) => new Date(t.dueDate).getTime()));
  const span = Math.max(max - min, 1);
  const rows = tasks.map((t) => {
    const left = (new Date(t.startDate).getTime() - min) / span * 100;
    const width = Math.max((new Date(t.dueDate).getTime() - new Date(t.startDate).getTime()) / span * 100, 2);
    const cls = t.status === 'Completed' ? 'green' : t.overdue ? 'red' : '';
    return `<div class="bar-row"><div class="bar-head"><b>${esc(t.name)}</b><span class="muted">${dateVN(t.startDate)} → ${dateVN(t.dueDate)}</span></div>
      <div style="position:relative;height:9px;background:#eef2f7;border-radius:999px"><i style="position:absolute;left:${left}%;width:${width}%;height:100%;background:${cls === 'green' ? '#059669' : cls === 'red' ? '#dc2626' : '#f59e0b'};border-radius:999px;display:block"></i></div></div>`;
  }).join('');
  return `<div class="section-title">Timeline công việc</div>${rows}`;
}

PAGES.expenses = () => {
  const rows = state.data.expenses.filter(inFilter);
  const total = rows.reduce((s, e) => s + Number(e.amount || 0), 0);
  return `
  <div class="kpi-grid">
    ${kpiCard('Tổng chi phí', compact(total), `${rows.length} khoản chi`)}
    ${kpiCard('Ngân sách nhóm', compact(state.data.projects.filter((p) => !state.filter || String(p.id) === state.filter).reduce((s, p) => s + Number(p.budget || 0), 0)), 'Theo dự án đang lọc', 'blue')}
    ${kpiCard('Chi phí phát sinh', compact(rows.filter((e) => e.category === 'Khác').reduce((s, e) => s + Number(e.amount || 0), 0)), 'Nhóm “Khác”', 'red')}
  </div>
  ${table([
    { label: 'Ngày', render: (r) => dateVN(r.date) },
    { label: 'Dự án', render: (r) => esc(r.projectName) },
    { label: 'Nhóm', render: (r) => tag(r.category) },
    { label: 'Diễn giải', render: (r) => esc(r.description || '—') },
    { label: 'Nhà thầu', render: (r) => esc(r.contractorName || '—') },
    { label: 'Số tiền', num: true, render: (r) => `<span class="strong">${money(r.amount)}</span>` },
  ], rows, { collection: 'expenses' })}`;
};

PAGES.materials = () => `
  <div class="kpi-grid">
    ${kpiCard('Mặt hàng', state.data.materials.length, 'Trong danh mục')}
    ${kpiCard('Giá trị tồn', compact(state.data.materials.reduce((s, m) => s + m.stockValue, 0)), 'Theo đơn giá', 'green')}
    ${kpiCard('Dưới định mức', state.data.materials.filter((m) => m.lowStock).length, 'Cần nhập bổ sung', 'red')}
  </div>
  ${table([
    { label: 'Mã', render: (r) => `<span class="strong">${esc(r.code)}</span>` },
    { label: 'Vật tư', render: (r) => `${esc(r.name)}<div class="muted">${esc(r.supplier || '')}</div>` },
    { label: 'ĐVT', render: (r) => esc(r.unit) },
    { label: 'Tồn', num: true, render: (r) => r.lowStock ? `<span class="tag red">${r.qty} / ${r.minQty}</span>` : `<span class="strong">${r.qty}</span> <span class="muted">/ ${r.minQty}</span>` },
    { label: 'Đơn giá', num: true, render: (r) => money(r.unitPrice) },
    { label: 'Giá trị tồn', num: true, render: (r) => compact(r.stockValue) },
    { label: 'Kho', render: (r) => `<button class="btn sm" data-move="${r.id}">Nhập/Xuất</button>` },
  ], state.data.materials.filter((m) => inSearch(m, ['code', 'name', 'supplier'])), { collection: 'materials' })}
  <div class="section-title">Giao dịch kho gần đây</div>
  ${table([
    { label: 'Ngày', render: (r) => dateVN(r.date) },
    { label: 'Vật tư', render: (r) => esc(r.materialName) },
    { label: 'Dự án', render: (r) => esc(r.projectName || '—') },
    { label: 'Loại', render: (r) => r.type === 'in' ? '<span class="tag green">Nhập</span>' : '<span class="tag amber">Xuất</span>' },
    { label: 'Số lượng', num: true, render: (r) => `${r.type === 'in' ? '+' : '−'}${r.qty} ${esc(r.unit)}` },
    { label: 'Ghi chú', render: (r) => esc(r.note || '—') },
  ], state.data.stockMoves.filter(inFilter || (() => true)).filter((r) => !state.filter || String(r.projectId) === state.filter).slice().reverse(), { collection: 'stockMoves' })}
`;

PAGES.contractors = () => table([
  { label: 'Nhà thầu', render: (r) => `<span class="strong">${esc(r.name)}</span><div class="muted">${esc(r.specialty || '')}</div>` },
  { label: 'Liên hệ', render: (r) => `${esc(r.contact || '—')}<div class="muted">${esc(r.phone || '')}</div>` },
  { label: 'Công việc', num: true, render: (r) => `${r.doneCount}/${r.taskCount}` },
  { label: 'Chi phí', num: true, render: (r) => compact(r.cost) },
  { label: 'Đánh giá', render: (r) => `${'★'.repeat(Math.round(r.rating || 0))}<span class="muted">${(r.rating || 0).toFixed(1)}</span>` },
  { label: 'Trạng thái', render: (r) => tag(r.status) },
], state.data.contractors.filter((c) => inSearch(c, ['name', 'specialty', 'contact'])), { collection: 'contractors' });

PAGES.people = () => table([
  { label: 'Họ tên', render: (r) => `<span class="strong">${esc(r.name)}</span><div class="muted">${esc(r.position || '')}</div>` },
  { label: 'Vai trò', render: (r) => tag(r.role) },
  { label: 'Liên hệ', render: (r) => `${esc(r.phone || '—')}<div class="muted">${esc(r.email || '')}</div>` },
  { label: 'Dự án', render: (r) => esc(r.projectNames || '—') },
  { label: 'Việc đang mở', num: true, render: (r) => `<span class="strong">${r.openTasks}</span> <span class="muted">/ ${r.taskCount}</span>` },
], state.data.people.filter((p) => inSearch(p, ['name', 'position', 'email', 'role'])), { collection: 'people' });

PAGES.documents = () => table([
  { label: 'Tài liệu', render: (r) => `<span class="strong">${esc(r.name)}</span><div class="muted">${esc(r.projectCode)}</div>` },
  { label: 'Loại', render: (r) => tag(r.type) },
  { label: 'Phiên bản', render: (r) => esc(r.version || '—') },
  { label: 'Người tải', render: (r) => esc(r.uploaderName || '—') },
  { label: 'Ngày', render: (r) => dateVN(r.uploadedAt) },
  { label: 'Tệp', render: (r) => r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">Mở</a>` : '—' },
], state.data.documents.filter(inFilter).filter((d) => inSearch(d, ['name', 'type'])), { collection: 'documents' });

PAGES.issues = () => table([
  { label: 'Vấn đề', render: (r) => `<span class="strong">${esc(r.title)}</span><div class="muted">${esc(r.projectCode)}</div>` },
  { label: 'Mức độ', render: (r) => tag(r.severity) },
  { label: 'Trạng thái', render: (r) => tag(r.status) },
  { label: 'Phụ trách', render: (r) => esc(r.assigneeName || '—') },
  { label: 'Ghi nhận', render: (r) => dateVN(r.createdAt) },
  { label: 'Xử lý xong', render: (r) => dateVN(r.resolvedAt) },
], state.data.issues.filter(inFilter).filter((i) => inSearch(i, ['title', 'description'])), { collection: 'issues' });

PAGES.changes = () => table([
  { label: 'Yêu cầu', render: (r) => `<span class="strong">${esc(r.title)}</span><div class="muted">${esc(r.projectCode)}</div>` },
  { label: 'Tác động chi phí', num: true, render: (r) => compact(r.impactCost) },
  { label: 'Tác động tiến độ', num: true, render: (r) => `${r.impactDays} ngày` },
  { label: 'Trạng thái', render: (r) => tag(r.status) },
  { label: 'Ngày tạo', render: (r) => dateVN(r.createdAt) },
], state.data.changeRequests.filter(inFilter).filter((c) => inSearch(c, ['title', 'description'])), { collection: 'changeRequests' });

// ===== Render =====
function render() {
  if (!state.data) return;
  renderNav();
  renderHeader();
  const page = PAGES[state.route] || PAGES.dashboard;
  const content = $('#content');
  try {
    content.innerHTML = page();
  } catch (e) {
    content.innerHTML = `<div class="card"><div class="empty"><b>Lỗi hiển thị</b>${esc(e.message)}</div></div>`;
  }
}

// ===== Modal & forms =====
function openForm(collection, row) {
  const schema = SCHEMA[collection];
  if (!schema) return;
  const isEdit = !!row;
  $('#modalTitle').textContent = (isEdit ? 'Sửa ' : 'Thêm ') + schema.title;
  const form = $('#modalForm');
  form.innerHTML = schema.fields.map((f) => {
    const val = row ? (row[f.k] ?? '') : defaultFor(f, collection);
    const cls = 'field' + (f.full || f.type === 'textarea' ? ' full' : '');
    let input;
    if (f.type === 'select') {
      input = `<select name="${f.k}">${f.options.map((o) => `<option ${String(o) === String(val) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
      if (!f.req) input = `<select name="${f.k}"><option value="">—</option>${f.options.map((o) => `<option ${String(o) === String(val) ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    } else if (f.type === 'ref') {
      const opts = (state.data[f.ref] || []).map((o) => `<option value="${o.id}" ${String(o.id) === String(val) ? 'selected' : ''}>${esc(o.code ? o.code + ' — ' + o.name : o.name)}</option>`).join('');
      input = `<select name="${f.k}"><option value="">—</option>${opts}</select>`;
    } else if (f.type === 'textarea') {
      input = `<textarea name="${f.k}">${esc(val)}</textarea>`;
    } else {
      input = `<input name="${f.k}" type="${f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}" value="${esc(val)}" ${f.type === 'number' ? 'step="any"' : ''} />`;
    }
    return `<div class="${cls}"><label>${esc(f.l)}${f.req ? ' <span class="req">*</span>' : ''}</label>${input}</div>`;
  }).join('');
  form.dataset.collection = collection;
  form.dataset.id = isEdit ? row.id : '';
  $('#modalBackdrop').hidden = false;
  const first = form.querySelector('input,select,textarea'); if (first) first.focus();
}
function defaultFor(f, collection) {
  if (f.type === 'select') return f.options[0];
  if (f.k === 'projectId' && state.filter) return state.filter;
  if (f.type === 'date') return new Date().toISOString().slice(0, 10);
  return '';
}
function closeModal() { $('#modalBackdrop').hidden = true; }

async function saveForm() {
  const form = $('#modalForm');
  const collection = form.dataset.collection;
  const id = form.dataset.id;
  const schema = SCHEMA[collection];
  const body = {};
  schema.fields.forEach((f) => {
    let v = form.querySelector(`[name="${f.k}"]`).value;
    if (f.type === 'select' && f.raw && f.raw[v]) v = f.raw[v];
    if (collection === 'stockMoves' && f.k === 'type') v = v === 'Nhập kho' ? 'in' : 'out';
    body[f.k] = v;
  });
  const btn = $('#modalSave'); btn.disabled = true; btn.textContent = 'Đang lưu…';
  try {
    if (collection === 'stockMoves') {
      await api(`/api/materials/${body.materialId}/move`, { method: 'POST', body: JSON.stringify(body) });
    } else if (id) {
      await api(`/api/${collection}/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await api(`/api/${collection}`, { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal();
    await refresh();
    toast('Đã lưu thành công.', 'ok');
  } catch (e) {
    toast(e.message, 'err');
  } finally {
    btn.disabled = false; btn.textContent = 'Lưu';
  }
}

async function del(collection, id) {
  if (!confirm('Bạn chắc chắn muốn xóa bản ghi này?')) return;
  try { await api(`/api/${collection}/${id}`, { method: 'DELETE' }); await refresh(); toast('Đã xóa.', 'ok'); }
  catch (e) { toast(e.message, 'err'); }
}

// ===== Events =====
function onRoute() {
  state.route = location.hash.replace('#/', '') || 'dashboard';
  if (!PAGES[state.route]) state.route = 'dashboard';
  render();
}
document.addEventListener('click', (e) => {
  const editBtn = e.target.closest('[data-edit]');
  if (editBtn) { const [c, id] = editBtn.dataset.edit.split(':'); const row = state.data[c].find((r) => String(r.id) === id); openForm(c, row); return; }
  const delBtn = e.target.closest('[data-del]');
  if (delBtn) { const [c, id] = delBtn.dataset.del.split(':'); del(c, id); return; }
  const moveBtn = e.target.closest('[data-move]');
  if (moveBtn) { const mat = state.data.materials.find((m) => String(m.id) === moveBtn.dataset.move); openForm('stockMoves', { materialId: mat.id, type: 'in', date: new Date().toISOString().slice(0, 10) }); return; }
  if (e.target.closest('#menuBtn')) $('#sidebar').classList.toggle('open');
  if (e.target.closest('a[href^="#/"]')) $('#sidebar').classList.remove('open');
});
$('#modalClose').addEventListener('click', closeModal);
$('#modalCancel').addEventListener('click', closeModal);
$('#modalSave').addEventListener('click', (e) => { e.preventDefault(); saveForm(); });
$('#modalBackdrop').addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') closeModal(); });
$('#modalForm').addEventListener('submit', (e) => { e.preventDefault(); saveForm(); });
$('#addBtn').addEventListener('click', () => {
  const c = PAGES[state.route] && SCHEMA[state.route] ? state.route : (state.route === 'progress' ? 'tasks' : null);
  openForm(c || 'projects');
});
$('#projectFilter').addEventListener('change', (e) => { state.filter = e.target.value; render(); });
let searchTimer;
$('#search').addEventListener('input', (e) => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.search = e.target.value.trim(); render(); }, 180); });
window.addEventListener('hashchange', onRoute);
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ===== Start =====
$('#who').textContent = 'Vũ Đình Khoa · Admin';
api('/api/bootstrap').then((d) => {
  state.data = d;
  $('#meta').textContent = 'Cập nhật ' + new Date(d.meta.generatedAt).toLocaleTimeString('vi-VN');
  onRoute();
}).catch((e) => { $('#content').innerHTML = `<div class="card"><div class="empty"><b>Không tải được dữ liệu</b>${esc(e.message)}</div></div>`; });
