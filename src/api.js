import { COLLECTIONS, list, find, insert, update, remove } from './db.js';

const n = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const today = () => new Date().toISOString().slice(0, 10);
const isOverdue = (t) => t.dueDate && t.dueDate < today() && !['Completed', 'Cancelled'].includes(t.status);
const openTask = (t) => !['Completed', 'Cancelled'].includes(t.status);

export function decorateProject(p, db) {
  const tasks = db.tasks.filter((t) => t.projectId === p.id);
  const expenses = db.expenses.filter((e) => e.projectId === p.id);
  const spent = expenses.reduce((s, e) => s + n(e.amount), 0);
  const done = tasks.filter((t) => t.status === 'Completed').length;
  const progress = tasks.length
    ? Math.round(tasks.reduce((s, t) => s + n(t.progress), 0) / tasks.length)
    : 0;
  return {
    ...p,
    spent,
    remaining: n(p.budget) - spent,
    taskCount: tasks.length,
    doneCount: done,
    overdueCount: tasks.filter(isOverdue).length,
    progress,
    managerName: db.people.find((x) => x.id === p.managerId)?.name || '',
  };
}

export function decorateTask(t, db) {
  const due = t.dueDate ? Math.round((new Date(t.dueDate) - new Date(today())) / 86400000) : null;
  return {
    ...t,
    projectName: db.projects.find((p) => p.id === t.projectId)?.name || '',
    assigneeName: db.people.find((p) => p.id === t.assigneeId)?.name || '',
    contractorName: db.contractors.find((c) => c.id === t.contractorId)?.name || '',
    overdue: isOverdue(t),
    daysLeft: due,
  };
}

export function decorateMaterial(m, db) {
  const moves = db.stockMoves.filter((s) => s.materialId === m.id);
  const low = n(m.qty) < n(m.minQty);
  return { ...m, lowStock: low, moveCount: moves.length, stockValue: n(m.qty) * n(m.unitPrice) };
}

export function decorate(db) {
  return {
    projects: db.projects.map((p) => decorateProject(p, db)),
    tasks: db.tasks.map((t) => decorateTask(t, db)),
    contractors: db.contractors.map((c) => {
      const tasks = db.tasks.filter((t) => t.contractorId === c.id);
      const costs = db.expenses.filter((e) => e.contractorId === c.id).reduce((s, e) => s + n(e.amount), 0);
      return { ...c, taskCount: tasks.length, doneCount: tasks.filter((t) => t.status === 'Completed').length, cost: costs };
    }),
    people: db.people.map((p) => {
      const tasks = db.tasks.filter((t) => t.assigneeId === p.id);
      return { ...p, projectNames: (p.projectIds || []).map((id) => db.projects.find((x) => x.id === id)?.code).filter(Boolean).join(', '), taskCount: tasks.length, openTasks: tasks.filter(openTask).length };
    }),
    materials: db.materials.map((m) => decorateMaterial(m, db)),
    stockMoves: db.stockMoves.map((s) => ({
      ...s,
      materialName: db.materials.find((m) => m.id === s.materialId)?.name || '',
      unit: db.materials.find((m) => m.id === s.materialId)?.unit || '',
      projectName: db.projects.find((p) => p.id === s.projectId)?.code || '',
    })),
    expenses: db.expenses.map((e) => ({
      ...e,
      projectName: db.projects.find((p) => p.id === e.projectId)?.name || '',
      contractorName: db.contractors.find((c) => c.id === e.contractorId)?.name || '',
    })),
    documents: db.documents.map((d) => ({
      ...d,
      projectCode: db.projects.find((p) => p.id === d.projectId)?.code || '',
      uploaderName: db.people.find((p) => p.id === d.uploadedBy)?.name || '',
    })),
    issues: db.issues.map((i) => ({
      ...i,
      projectCode: db.projects.find((p) => p.id === i.projectId)?.code || '',
      assigneeName: db.people.find((p) => p.id === i.assigneeId)?.name || '',
    })),
    changeRequests: db.changeRequests.map((c) => ({
      ...c,
      projectCode: db.projects.find((p) => p.id === c.projectId)?.code || '',
    })),
    meta: { generatedAt: new Date().toISOString(), today: today() },
  };
}

export function dashboard(db) {
  const d = decorate(db);
  const active = d.projects.filter((p) => p.status === 'In Progress').length;
  const budget = d.projects.reduce((s, p) => s + n(p.budget), 0);
  const spent = d.projects.reduce((s, p) => s + p.spent, 0);
  const overdue = d.tasks.filter((t) => t.overdue).length;
  const blocked = d.tasks.filter((t) => t.status === 'Blocked').length;
  const openIssues = d.issues.filter((i) => i.status !== 'Đã xử lý').length;

  const byStatus = (key, rows, keys) => keys.map((k) => ({ label: k, value: rows.filter((r) => r[key] === k).length }));
  const sumBy = (rows, key, field) => {
    const map = new Map();
    for (const r of rows) map.set(r[key] || 'Khác', (map.get(r[key] || 'Khác') || 0) + n(r[field]));
    return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };

  return {
    kpi: {
      projects: d.projects.length,
      activeProjects: active,
      budget,
      spent,
      remaining: budget - spent,
      tasks: d.tasks.length,
      overdue,
      blocked,
      openIssues,
      lowStock: d.materials.filter((m) => m.lowStock).length,
      contractors: d.contractors.length,
      people: d.people.length,
    },
    projectStatus: byStatus('status', d.projects, ['Draft', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']),
    taskStatus: byStatus('status', d.tasks, ['To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled']),
    expenseByCategory: sumBy(d.expenses, 'category', 'amount'),
    materialsLow: d.materials.filter((m) => m.lowStock).map((m) => ({ name: m.name, qty: m.qty, minQty: m.minQty, unit: m.unit })),
    upcoming: d.tasks
      .filter((t) => openTask(t) && t.dueDate)
      .sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
      .slice(0, 8)
      .map((t) => ({ id: t.id, name: t.name, projectName: t.projectName, dueDate: t.dueDate, assigneeName: t.assigneeName, priority: t.priority, overdue: t.overdue, progress: t.progress })),
    budgetByProject: d.projects.map((p) => ({ code: p.code, name: p.name, budget: n(p.budget), spent: p.spent, remaining: p.remaining, progress: p.progress, status: p.status })),
  };
}

function validate(collection, body) {
  const errs = [];
  if (collection === 'projects') {
    if (!body.code) errs.push('Thiếu mã dự án');
    if (!body.name) errs.push('Thiếu tên dự án');
  }
  if (collection === 'tasks' && !body.name) errs.push('Thiếu tên công việc');
  if (collection === 'materials' && !body.name) errs.push('Thiếu tên vật tư');
  if (collection === 'contractors' && !body.name) errs.push('Thiếu tên nhà thầu');
  if (collection === 'people' && !body.name) errs.push('Thiếu tên nhân sự');
  if (collection === 'issues' && !body.title) errs.push('Thiếu tiêu đề vấn đề');
  if (collection === 'changeRequests' && !body.title) errs.push('Thiếu tiêu đề yêu cầu thay đổi');
  if (collection === 'documents' && !body.name) errs.push('Thiếu tên tài liệu');
  return errs;
}

export function handleApi(req, res, pathname, query, readBody) {
  const parts = pathname.split('/').filter(Boolean); // ['api', collection, id?]
  const collection = parts[1];
  const id = parts[2];

  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data));
  };

  if (collection === 'health') return send(200, { ok: true, ts: new Date().toISOString() });
  if (collection === 'bootstrap') return send(200, decorate({ ...loadAll() }));
  if (collection === 'dashboard') return send(200, dashboard(loadAll()));

  if (!COLLECTIONS.includes(collection)) return send(404, { error: 'Không tìm thấy tài nguyên' });

  // Stock transaction
  if (collection === 'materials' && id === 'move') return send(400, { error: 'Thiếu mã vật tư' });
  if (collection === 'materials' && parts[3] === 'move') {
    return readBody((body) => {
      const mat = find('materials', id);
      if (!mat) return send(404, { error: 'Không tìm thấy vật tư' });
      const qty = n(body.qty);
      if (qty <= 0) return send(400, { error: 'Số lượng không hợp lệ' });
      const delta = body.type === 'in' ? qty : -qty;
      const newQty = n(mat.qty) + delta;
      if (newQty < 0) return send(400, { error: 'Số lượng tồn không đủ để xuất' });
      update('materials', id, { qty: newQty });
      const move = insert('stockMoves', {
        materialId: Number(id), projectId: body.projectId ? Number(body.projectId) : null,
        type: body.type === 'in' ? 'in' : 'out', qty, date: body.date || today(), note: body.note || '',
      });
      return send(201, { move, material: find('materials', id) });
    });
  }

  if (!id && req.method === 'GET') return send(200, decorate(loadAll())[collection] || []);
  if (!id && req.method === 'POST') {
    return readBody((body) => {
      const errs = validate(collection, body);
      if (errs.length) return send(422, { error: errs.join('; ') });
      const row = insert(collection, sanitize(collection, body));
      return send(201, row);
    });
  }

  const row = find(collection, id);
  if (!row) return send(404, { error: 'Không tìm thấy bản ghi' });

  if (req.method === 'GET') return send(200, row);
  if (req.method === 'PUT' || req.method === 'PATCH') {
    return readBody((body) => {
      const errs = validate(collection, { ...row, ...body });
      if (errs.length) return send(422, { error: errs.join('; ') });
      return send(200, update(collection, id, sanitize(collection, body)));
    });
  }
  if (req.method === 'DELETE') {
    remove(collection, id);
    return send(200, { ok: true });
  }
  return send(405, { error: 'Phương thức không được hỗ trợ' });
}

function loadAll() {
  const out = {};
  for (const c of COLLECTIONS) out[c] = list(c);
  return out;
}

const NUMERIC = ['budget', 'progress', 'qty', 'minQty', 'unitPrice', 'amount', 'impactCost', 'impactDays', 'rating'];
const REL = ['projectId', 'assigneeId', 'contractorId', 'managerId', 'materialId', 'uploadedBy'];

function sanitize(collection, body) {
  const out = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === 'id' || k === 'createdAt' || k === 'spent' || k === 'remaining' || k === 'overdue' || k === 'lowStock') continue;
    if (NUMERIC.includes(k)) out[k] = v === '' || v === null ? 0 : Number(v);
    else if (REL.includes(k)) out[k] = v === '' || v === null || v === undefined ? null : Number(v);
    else if (k === 'projectIds') out[k] = Array.isArray(v) ? v.map(Number) : String(v || '').split(',').map((s) => Number(s.trim())).filter(Boolean);
    else out[k] = v;
  }
  return out;
}
