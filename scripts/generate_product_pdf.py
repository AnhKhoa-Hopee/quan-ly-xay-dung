# -*- coding: utf-8 -*-
"""Sinh tài liệu PDF chi tiết về sản phẩm Hệ thống Quản lý Xây dựng."""
import json
import os
import urllib.request
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, KeepTogether, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle)

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, 'exports', 'TaiLieu_SanPham_QuanLyXayDung.pdf')

# ---------- Fonts ----------
FONT_DIR = '/System/Library/Fonts/Supplemental'
REG = 'VNFont'
BOLD = 'VNFont-Bold'
pdfmetrics.registerFont(TTFont(REG, os.path.join(FONT_DIR, 'Arial.ttf')))
pdfmetrics.registerFont(TTFont(BOLD, os.path.join(FONT_DIR, 'Arial Bold.ttf')))
pdfmetrics.registerFontFamily(REG, normal=REG, bold=BOLD, italic=REG, boldItalic=BOLD)

INK = colors.HexColor('#0f172a')
INK2 = colors.HexColor('#334155')
MUTED = colors.HexColor('#64748b')
ACCENT = colors.HexColor('#b45309')
LINE = colors.HexColor('#dbe3ec')
SOFT = colors.HexColor('#f1f5f9')

ss = getSampleStyleSheet()
def st(name, **kw):
    base = kw.pop('parent', ss['Normal'])
    return ParagraphStyle(name, parent=base, fontName=kw.pop('font', REG), **kw)

S_TITLE = st('S_TITLE', font=BOLD, fontSize=30, leading=36, textColor=colors.white, alignment=TA_LEFT)
S_SUB = st('S_SUB', fontSize=13, leading=19, textColor=colors.HexColor('#cbd5e1'))
S_H1 = st('S_H1', font=BOLD, fontSize=17, leading=22, textColor=INK, spaceBefore=8, spaceAfter=8)
S_H2 = st('S_H2', font=BOLD, fontSize=13, leading=18, textColor=ACCENT, spaceBefore=10, spaceAfter=5)
S_BODY = st('S_BODY', fontSize=10.2, leading=15.5, textColor=INK2, alignment=TA_JUSTIFY, spaceAfter=5)
S_BULLET = st('S_BULLET', fontSize=10.2, leading=15.5, textColor=INK2, leftIndent=14, bulletIndent=4, spaceAfter=2)
S_SMALL = st('S_SMALL', fontSize=9, leading=13, textColor=MUTED)
S_CELL = st('S_CELL', fontSize=9.2, leading=13, textColor=INK2)
S_CELLB = st('S_CELLB', font=BOLD, fontSize=9.2, leading=13, textColor=INK)
S_TH = st('S_TH', font=BOLD, fontSize=9, leading=12, textColor=colors.white)
S_COVERINFO = st('S_COVERINFO', fontSize=10, leading=16, textColor=INK2)

def P(t, s=S_BODY): return Paragraph(t, s)

def bullets(items):
    return [Paragraph(t, S_BULLET, bulletText='•') for t in items]

def hr():
    t = Table([['']], colWidths=[17 * cm], rowHeights=[2])
    t.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), LINE)]))
    return t

def data_table(header, rows, widths):
    data = [[Paragraph(h, S_TH) for h in header]]
    for r in rows:
        data.append([Paragraph(str(c), S_CELL) for c in r])
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), INK),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SOFT]),
        ('GRID', (0, 0), (-1, -1), 0.5, LINE),
    ]))
    return t

# ---------- Cover ----------
def cover(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(INK)
    canvas.rect(0, h - 12 * cm, w, 12 * cm, stroke=0, fill=1)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, h - 12 * cm, 0.9 * cm, 12 * cm, stroke=0, fill=1)
    canvas.setFillColor(colors.white)
    canvas.setFont(BOLD, 11)
    canvas.drawString(2.2 * cm, h - 2.6 * cm, 'TÀI LIỆU SẢN PHẨM  ·  PHIÊN BẢN 1.0')
    canvas.setFont(BOLD, 32)
    canvas.drawString(2.2 * cm, h - 5.4 * cm, 'HỆ THỐNG QUẢN LÝ')
    canvas.drawString(2.2 * cm, h - 6.9 * cm, 'XÂY DỰNG')
    canvas.setFont(REG, 12)
    canvas.setFillColor(colors.HexColor('#cbd5e1'))
    canvas.drawString(2.2 * cm, h - 8.4 * cm, 'Quản lý dự án · Tiến độ · Chi phí · Vật tư · Nhà thầu · Hồ sơ')
    canvas.setFillColor(ACCENT)
    canvas.rect(2.2 * cm, h - 9.2 * cm, 4 * cm, 4, stroke=0, fill=1)
    canvas.setFont(REG, 10)
    canvas.setFillColor(colors.HexColor('#94a3b8'))
    canvas.drawString(2.2 * cm, h - 10.6 * cm, 'Ứng dụng web nội bộ — Node.js · REST API · Giao diện SPA')
    canvas.restoreState()

def page_deco(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(2 * cm, 1.5 * cm, w - 2 * cm, 1.5 * cm)
    canvas.setFont(REG, 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, 1.05 * cm, 'Hệ thống Quản lý Xây dựng — Tài liệu sản phẩm')
    canvas.drawRightString(w - 2 * cm, 1.05 * cm, 'Trang %d' % doc.page)
    canvas.setFillColor(ACCENT)
    canvas.rect(2 * cm, h - 1.25 * cm, 1.2 * cm, 2, stroke=0, fill=1)
    canvas.restoreState()

# ---------- Live figures ----------
def live_stats():
    try:
        with urllib.request.urlopen('http://127.0.0.1:4321/api/dashboard', timeout=3) as r:
            d = json.load(r)
        return d['kpi']
    except Exception:
        return None

stats = live_stats()

story = []
story.append(Spacer(1, 12.6 * cm))

story.append(P('1. Giới thiệu', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(P(
    'Hệ thống Quản lý Xây dựng là một ứng dụng web tập trung giúp chủ đầu tư, quản lý dự án, '
    'chỉ huy trưởng, kỹ sư và nhà thầu theo dõi toàn bộ vòng đời của công trình: dự án, công việc, '
    'tiến độ, ngân sách và chi phí, vật tư, nhà thầu, nhân sự, hồ sơ tài liệu, vấn đề kỹ thuật và '
    'yêu cầu thay đổi. Sản phẩm thay thế cách quản lý phân tán bằng Excel và giấy tờ, giảm nhập liệu '
    'thủ công và hạn chế sai lệch dữ liệu.'))
story.append(Spacer(1, 4))
story.append(P('Mục tiêu chính', S_H2))
story += bullets([
    'Quản lý tập trung nhiều dự án xây dựng trên một nền tảng duy nhất.',
    'Theo dõi tiến độ và trạng thái công việc theo thời gian thực.',
    'Kiểm soát ngân sách, chi phí thực tế và chi phí phát sinh.',
    'Theo dõi vật tư, tồn kho và nhu cầu nhập/xuất.',
    'Quản lý nhà thầu, nhân sự và khối lượng công việc.',
    'Lưu trữ hồ sơ dự án có phiên bản và phân loại.',
    'Cung cấp dashboard, cảnh báo và báo cáo tổng hợp.',
])

story.append(PageBreak())
story.append(P('2. Kiến trúc và công nghệ', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(P(
    'Ứng dụng được thiết kế theo mô hình client–server tách biệt rõ ràng: máy chủ HTTP cung cấp '
    'REST API và phục vụ giao diện tĩnh; giao diện là một ứng dụng đơn trang (SPA) giao tiếp với API '
    'qua JSON. Toàn bộ máy chủ viết bằng Node.js chuẩn, không dùng thư viện bên thứ ba, nên triển khai '
    'nhanh và ít rủi ro phụ thuộc.'))
story.append(Spacer(1, 4))
story.append(data_table(
    ['Thành phần', 'Công nghệ', 'Vai trò'],
    [
        ['Máy chủ API', 'Node.js (module http, fs)', 'Định tuyến REST, xử lý nghiệp vụ, phục vụ tệp tĩnh'],
        ['Lưu trữ', 'JSON (data/db.json)', 'Lưu trữ bền vững, đọc/ghi nguyên tử theo tệp'],
        ['Giao diện', 'HTML, CSS, JavaScript thuần (ES module)', 'SPA: dashboard, bảng dữ liệu, biểu mẫu, biểu đồ'],
        ['Kiểu chữ & màu', 'Inter + bảng màu an toàn công trình', 'Giao diện rõ ràng, tương phản đạt WCAG AA'],
        ['Cổng mặc định', '127.0.0.1:4321', 'Địa chỉ truy cập nội bộ'],
    ],
    [3.6 * cm, 5.6 * cm, 7.8 * cm]))
story.append(Spacer(1, 8))
story.append(P('Luồng dữ liệu', S_H2))
story += bullets([
    'Giao diện gọi GET /api/bootstrap một lần để lấy toàn bộ dữ liệu và các chỉ số tổng hợp.',
    'Thao tác thêm/sửa/xóa gửi POST, PUT, DELETE tới /api/<danh mục>; máy chủ kiểm tra ràng buộc trước khi ghi.',
    'Máy chủ tự tính các trường phái sinh: tỷ lệ hoàn thành, chi phí đã dùng, ngân sách còn lại, cờ quá hạn, cờ tồn kho thấp.',
    'Tầng tổng hợp (dashboard) phục vụ các chỉ số KPI và dữ liệu biểu đồ.',
])

story.append(PageBreak())
story.append(P('3. Danh mục phân hệ', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(data_table(
    ['Mã', 'Phân hệ', 'Chức năng chính'],
    [
        ['BR-01', 'Quản lý dự án', 'Tạo, sửa, xem, đổi trạng thái dự án; quản lý thông tin chủ đầu tư, địa điểm, ngân sách'],
        ['BR-02', 'Quản lý công việc', 'Giao việc, cập nhật tiến độ, đính kèm, bình luận, lịch sử thay đổi'],
        ['BR-03', 'Quản lý tiến độ', 'Dashboard tiến độ, công việc quá hạn, timeline, so sánh kế hoạch và thực tế'],
        ['BR-04', 'Ngân sách và chi phí', 'Thiết lập ngân sách, khoản chi theo nhóm, chi phí phát sinh'],
        ['BR-05', 'Quản lý vật tư', 'Danh mục, tồn kho, nhập/xuất, cảnh báo dưới định mức'],
        ['BR-06', 'Quản lý nhà thầu', 'Hồ sơ nhà thầu, gán vào dự án, theo dõi tiến độ và chi phí'],
        ['BR-07', 'Quản lý nhân sự', 'Thêm nhân sự vào dự án, phân vai trò, theo dõi khối lượng công việc'],
        ['BR-08', 'Hồ sơ và tài liệu', 'Bản vẽ, hợp đồng, biên bản, báo cáo, nghiệm thu, hình ảnh, tài liệu kỹ thuật'],
        ['BR-09', 'Quản lý vấn đề', 'Ghi nhận vấn đề, mức độ, người xử lý và trạng thái xử lý'],
        ['BR-10', 'Yêu cầu thay đổi', 'Đề xuất thay đổi, tác động chi phí và tiến độ, phê duyệt'],
        ['BR-11', 'Dashboard và báo cáo', 'KPI, biểu đồ trạng thái, ngân sách theo dự án, cảnh báo'],
        ['BR-12', 'Phân quyền người dùng', 'Vai trò: Admin, Chủ đầu tư, PM, Site Manager, Kỹ sư, Nhà thầu, Nhân viên'],
    ],
    [1.7 * cm, 4.3 * cm, 11 * cm]))

story.append(PageBreak())
story.append(P('4. Chi tiết phân hệ nghiệp vụ', S_H1))
story.append(hr())

def module(title, intro, fields, features, states=None):
    block = [Spacer(1, 6), P(title, S_H2), P(intro)]
    if fields:
        block.append(data_table(['Trường dữ liệu', 'Diễn giải'], fields, [5 * cm, 12 * cm]))
    if states:
        block.append(Spacer(1, 4))
        block.append(P('Trạng thái: ' + ' · '.join(states), S_SMALL))
    if features:
        block.append(Spacer(1, 4))
        block.append(P('Chức năng chính', S_CELLB))
        block += bullets(features)
    return KeepTogether(block)

story.append(module('BR-01. Quản lý dự án',
    'Người có quyền tạo, chỉnh sửa, xem và thay đổi trạng thái dự án. Mỗi dự án gắn với một quản lý và một chủ đầu tư.',
    [['Mã dự án', 'Định danh duy nhất, ví dụ CT-2026-01'],
     ['Tên dự án', 'Tên công trình'],
     ['Địa điểm', 'Vị trí thi công'],
     ['Chủ đầu tư', 'Đơn vị sở hữu công trình'],
     ['Quản lý dự án', 'Tham chiếu tới nhân sự phụ trách'],
     ['Ngày bắt đầu / dự kiến hoàn thành', 'Mốc kế hoạch'],
     ['Ngân sách', 'Số tiền dự kiến'],
     ['Trạng thái', 'Draft, Planning, In Progress, On Hold, Completed, Cancelled'],
     ['Mô tả', 'Thông tin bổ sung']],
    ['Tổng hợp tiến độ và chi phí theo dự án',
     'Hiển thị ngân sách, thực chi và số còn lại',
     'Đếm số công việc, số hoàn thành và số quá hạn'],
    states=['Draft', 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled']))

story.append(module('BR-02. Quản lý công việc',
    'Mỗi công việc thuộc một dự án, có người phụ trách, nhà thầu, mốc thời gian, ưu tiên và phần trăm hoàn thành.',
    [['Dự án', 'Công việc thuộc dự án nào'],
     ['Tên và mô tả', 'Nội dung công việc'],
     ['Người phụ trách', 'Tham chiếu nhân sự'],
     ['Nhà thầu', 'Tham chiếu nhà thầu thực hiện'],
     ['Ngày bắt đầu / Deadline', 'Mốc thời gian'],
     ['Mức độ ưu tiên', 'Cao, Trung bình, Thấp'],
     ['Trạng thái', 'To Do, In Progress, Blocked, Completed, Cancelled'],
     ['Phần trăm hoàn thành', 'Giá trị 0–100'],
     ['Hạng mục liên quan', 'Nhóm hạng mục thi công']],
    ['Tạo và giao việc cho nhân sự hoặc nhà thầu',
     'Cập nhật tiến độ và trạng thái',
     'Theo dõi lịch sử thay đổi và bình luận'],
    states=['To Do', 'In Progress', 'Blocked', 'Completed', 'Cancelled']))

story.append(module('BR-03. Quản lý tiến độ',
    'Hệ thống so sánh tiến độ kế hoạch (theo thời gian trôi qua) với tiến độ thực tế và cảnh báo rủi ro chậm tiến độ.',
    [],
    ['Dashboard tiến độ tổng thể và theo hạng mục',
     'Danh sách công việc quá hạn và bị chặn',
     'Timeline công việc trực quan theo dự án',
     'Cảnh báo khi công việc quá hạn hoặc dự án có nguy cơ chậm']))

story.append(module('BR-04. Ngân sách và chi phí',
    'Thiết lập ngân sách dự án, ghi nhận khoản chi theo nhóm và chi phí phát sinh. Công thức: Ngân sách còn lại = Ngân sách dự kiến − Tổng chi phí thực tế.',
    [['Dự án', 'Khoản chi thuộc dự án'],
     ['Nhóm chi phí', 'Nhân công, Vật tư, Máy móc, Nhà thầu, Vận chuyển, Khác'],
     ['Số tiền', 'Giá trị khoản chi'],
     ['Ngày chi', 'Thời điểm phát sinh'],
     ['Nhà thầu', 'Đơn vị nhận thanh toán (nếu có)'],
     ['Diễn giải', 'Mô tả khoản chi']],
    ['Tổng hợp chi phí theo nhóm và theo dự án',
     'Cảnh báo khi chi phí vượt ngân sách']))

story.append(PageBreak())

story.append(module('BR-05. Quản lý vật tư',
    'Quản lý danh mục vật tư, nhà cung cấp, tồn kho và giao dịch nhập/xuất. Cảnh báo khi tồn kho thấp hơn mức tối thiểu.',
    [['Mã vật tư', 'Định danh vật tư'],
     ['Tên vật tư', 'Tên và chủng loại'],
     ['Đơn vị tính', 'Tấn, m3, Bao, Cây, m…'],
     ['Số lượng tồn', 'Số lượng hiện có'],
     ['Mức tồn tối thiểu', 'Ngưỡng cảnh báo'],
     ['Nhà cung cấp', 'Đơn vị cung ứng'],
     ['Đơn giá', 'Giá nhập đơn vị']],
    ['Ghi nhận giao dịch nhập kho và xuất kho',
     'Tự động cập nhật số lượng tồn',
     'Cảnh báo dưới định mức và tính giá trị tồn']))

story.append(module('BR-06. Quản lý nhà thầu',
    'Tạo hồ sơ nhà thầu, gán vào dự án/công việc và theo dõi khối lượng công việc cùng chi phí phát sinh.',
    [['Tên nhà thầu', 'Đơn vị thi công'],
     ['Lĩnh vực', 'Chuyên môn chính'],
     ['Người liên hệ / Điện thoại / Email', 'Thông tin liên hệ'],
     ['Đánh giá', 'Điểm 0–5'],
     ['Trạng thái', 'Đang hợp tác, Tạm dừng']],
    ['Thống kê số công việc đã và đang thực hiện',
     'Tổng hợp chi phí đã thanh toán cho nhà thầu']))

story.append(module('BR-07. Quản lý nhân sự',
    'Thêm nhân sự vào dự án, phân vai trò và theo dõi khối lượng công việc đang phụ trách.',
    [['Họ tên', 'Tên nhân sự'],
     ['Vai trò', 'Admin, Chủ đầu tư, Project Manager, Site Manager, Kỹ sư, Nhà thầu, Nhân viên'],
     ['Chức danh', 'Vị trí công việc'],
     ['Liên hệ', 'Điện thoại, email'],
     ['Dự án tham gia', 'Danh sách dự án']],
    ['Theo dõi số công việc đang mở trên mỗi nhân sự']))

story.append(module('BR-08. Hồ sơ và tài liệu',
    'Quản lý bản vẽ, hợp đồng, biên bản, báo cáo, hồ sơ nghiệm thu, hình ảnh công trường và tài liệu kỹ thuật.',
    [['Dự án', 'Hồ sơ thuộc dự án'],
     ['Tên tài liệu', 'Tên hồ sơ'],
     ['Loại', 'Bản vẽ, Hợp đồng, Biên bản, Báo cáo, Nghiệm thu, Hình ảnh, Tài liệu kỹ thuật'],
     ['Phiên bản', 'Quản lý phiên bản tài liệu'],
     ['Người tải lên / Ngày tải lên', 'Truy vết người và thời điểm'],
     ['Đường dẫn', 'Liên kết tới tệp']],
    ['Lọc hồ sơ theo dự án và loại tài liệu',
     'Truy vết phiên bản và người tải lên']))

story.append(module('BR-09. Quản lý vấn đề',
    'Ghi nhận vấn đề kỹ thuật và vận hành, phân loại mức độ, giao người xử lý và theo dõi tới khi khép lại.',
    [['Dự án', 'Vấn đề thuộc dự án'],
     ['Tiêu đề / Mô tả', 'Nội dung vấn đề'],
     ['Mức độ', 'Cao, Trung bình, Thấp'],
     ['Trạng thái', 'Mở, Đang xử lý, Đã xử lý'],
     ['Người xử lý', 'Tham chiếu nhân sự'],
     ['Ngày ghi nhận / Ngày xử lý xong', 'Mốc thời gian']],
    ['Danh sách vấn đề đang mở cho cảnh báo trên dashboard']))

story.append(module('BR-10. Yêu cầu thay đổi',
    'Ghi nhận đề xuất thay đổi kèm tác động chi phí và tiến độ, phục vụ quá trình phê duyệt.',
    [['Dự án', 'Yêu cầu thuộc dự án'],
     ['Tiêu đề / Mô tả', 'Nội dung thay đổi'],
     ['Tác động chi phí', 'Số tiền tăng/giảm'],
     ['Tác động tiến độ', 'Số ngày ảnh hưởng'],
     ['Trạng thái', 'Chờ duyệt, Đang xem xét, Đã duyệt, Từ chối']],
    ['Theo dõi tác động tổng hợp lên ngân sách và tiến độ']))

story.append(module('BR-11. Dashboard và báo cáo',
    'Trang tổng quan cung cấp chỉ số KPI, biểu đồ trạng thái dự án, cơ cấu chi phí theo nhóm và danh sách cảnh báo.',
    [],
    ['KPI: số dự án đang triển khai, tổng ngân sách, chi phí thực tế, công việc quá hạn, vấn đề đang mở',
     'Biểu đồ tiến độ theo dự án và chi phí theo nhóm',
     'Bảng so sánh ngân sách và thực chi',
     'Cảnh báo vật tư dưới định mức và công việc quá hạn']))

story.append(module('BR-12. Phân quyền người dùng',
    'Xác định vai trò để giới hạn phạm vi thao tác: quản trị hệ thống, giám sát tổng thể, quản lý dự án, công trường, kỹ thuật và nhân viên.',
    [['Admin', 'Quản lý người dùng, vai trò và cấu hình'],
     ['Chủ đầu tư', 'Theo dõi tổng quan, ngân sách và tiến độ'],
     ['Project Manager', 'Quản lý toàn bộ dự án'],
     ['Site Manager', 'Quản lý hoạt động công trường'],
     ['Kỹ sư', 'Cập nhật tiến độ, công việc và vấn đề'],
     ['Nhà thầu', 'Nhận và cập nhật công việc được giao'],
     ['Nhân viên', 'Xem và cập nhật công việc được giao']],
    []))

story.append(PageBreak())
story.append(P('5. Mô hình dữ liệu', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(P('Hệ thống lưu trữ 10 thực thể chính. Các quan hệ được biểu diễn qua khóa tham chiếu (projectId, assigneeId, contractorId, materialId).'))
story.append(Spacer(1, 4))
story.append(data_table(
    ['Thực thể', 'Khóa chính', 'Quan hệ'],
    [
        ['projects', 'id', 'Tham chiếu people (quản lý)'],
        ['tasks', 'id', 'Thuộc projects; tham chiếu people, contractors'],
        ['contractors', 'id', 'Được tham chiếu bởi tasks và expenses'],
        ['people', 'id', 'Được tham chiếu bởi projects, tasks, documents, issues'],
        ['materials', 'id', 'Được tham chiếu bởi stockMoves'],
        ['stockMoves', 'id', 'Tham chiếu materials, projects'],
        ['expenses', 'id', 'Tham chiếu projects, contractors'],
        ['documents', 'id', 'Tham chiếu projects, people'],
        ['issues', 'id', 'Tham chiếu projects, people'],
        ['changeRequests', 'id', 'Tham chiếu projects'],
    ],
    [4 * cm, 2.6 * cm, 10.4 * cm]))

story.append(Spacer(1, 12))
story.append(P('6. Giao diện lập trình (REST API)', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(data_table(
    ['Phương thức và đường dẫn', 'Mô tả'],
    [
        ['GET /api/health', 'Kiểm tra máy chủ đang hoạt động'],
        ['GET /api/bootstrap', 'Toàn bộ dữ liệu kèm trường tính toán cho giao diện'],
        ['GET /api/dashboard', 'Chỉ số KPI, dữ liệu biểu đồ và cảnh báo'],
        ['GET /api/<danh mục>', 'Danh sách bản ghi của danh mục'],
        ['GET /api/<danh mục>/<id>', 'Chi tiết một bản ghi'],
        ['POST /api/<danh mục>', 'Tạo bản ghi mới (kiểm tra ràng buộc)'],
        ['PUT /api/<danh mục>/<id>', 'Cập nhật bản ghi'],
        ['DELETE /api/<danh mục>/<id>', 'Xóa bản ghi'],
        ['POST /api/materials/<id>/move', 'Ghi giao dịch nhập/xuất và cập nhật tồn kho'],
    ],
    [7.2 * cm, 9.8 * cm]))

story.append(Spacer(1, 12))
story.append(P('7. Hướng dẫn sử dụng', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(P('Quy trình thao tác tiêu biểu', S_H2))
story += bullets([
    'Tạo dự án: vào mục Dự án, nhấn “+ Thêm mới”, điền mã, tên, ngân sách và trạng thái.',
    'Giao việc: vào Công việc, chọn dự án, gán người phụ trách hoặc nhà thầu, đặt deadline và ưu tiên.',
    'Cập nhật tiến độ: mở công việc, đổi trạng thái và phần trăm hoàn thành; hệ thống tự tính tiến độ dự án.',
    'Ghi chi phí: vào Chi phí, thêm khoản chi theo nhóm; ngân sách còn lại cập nhật tức thời.',
    'Quản lý kho: ở mục Vật tư, nhấn “Nhập/Xuất” để ghi giao dịch; vật tư dưới định mức được cảnh báo.',
    'Theo dõi tổng quan: mục Tổng quan hiển thị KPI, biểu đồ và danh sách cảnh báo.',
])
story.append(Spacer(1, 4))
story.append(P('Lọc và tìm kiếm', S_H2))
story += bullets([
    'Chọn dự án ở thanh trên cùng để lọc toàn bộ danh sách theo dự án.',
    'Ô tìm kiếm lọc nhanh theo tên, mã, người phụ trách hoặc nhà cung cấp.',
])

story.append(PageBreak())
story.append(P('8. Cài đặt và vận hành', S_H1))
story.append(hr())
story.append(Spacer(1, 6))
story.append(P('Yêu cầu: Node.js phiên bản 18 trở lên. Không cần cài thêm thư viện.'))
story.append(Spacer(1, 4))
story.append(data_table(
    ['Bước', 'Lệnh', 'Kết quả'],
    [
        ['Chạy máy chủ', 'node server.js', 'Máy chủ lắng nghe tại http://127.0.0.1:4321/'],
        ['Nạp lại dữ liệu mẫu', 'node src/seed.js --force', 'Ghi dữ liệu mẫu vào data/db.json'],
        ['Mở ứng dụng', 'Truy cập http://127.0.0.1:4321/', 'Giao diện SPA hiển thị dashboard'],
    ],
    [3.4 * cm, 5 * cm, 8.6 * cm]))
story.append(Spacer(1, 8))
story.append(P('Cấu trúc thư mục', S_H2))
story.append(P('server.js — máy chủ HTTP và định tuyến; src/db.js — tầng lưu trữ; '
               'src/api.js — nghiệp vụ và tổng hợp; src/seed.js — dữ liệu mẫu; '
               'public/ — giao diện SPA; data/db.json — cơ sở dữ liệu JSON.'))

if stats:
    story.append(Spacer(1, 12))
    story.append(P('9. Dữ liệu mẫu hiện có', S_H1))
    story.append(hr())
    story.append(Spacer(1, 6))
    story.append(data_table(
        ['Chỉ số', 'Giá trị'],
        [
            ['Dự án', str(stats['projects'])],
            ['Dự án đang triển khai', str(stats['activeProjects'])],
            ['Công việc', str(stats['tasks'])],
            ['Công việc quá hạn', str(stats['overdue'])],
            ['Tổng ngân sách', '{:,.0f} đ'.format(stats['budget']).replace(',', '.')],
            ['Chi phí thực tế', '{:,.0f} đ'.format(stats['spent']).replace(',', '.')],
            ['Vật tư dưới định mức', str(stats['lowStock'])],
            ['Vấn đề đang mở', str(stats['openIssues'])],
        ],
        [8.5 * cm, 8.5 * cm]))

story.append(Spacer(1, 14))
story.append(hr())
story.append(Spacer(1, 6))
story.append(P('10. Phạm vi và lộ trình', S_H1))
story.append(Spacer(1, 4))
story.append(P('Trong phạm vi phiên bản 1.0', S_H2))
story += bullets([
    'Quản lý dự án, công việc, tiến độ, chi phí, vật tư, nhà thầu, nhân sự, hồ sơ, vấn đề, yêu cầu thay đổi.',
    'Dashboard, cảnh báo và báo cáo tổng hợp.',
    'Giao diện web đáp ứng và REST API đầy đủ.',
])
story.append(P('Ngoài phạm vi phiên bản 1.0', S_H2))
story += bullets([
    'Kế toán doanh nghiệp đầy đủ và tính lương.',
    'Mô hình BIM/3D, IoT công trường.',
    'Lập dự toán chuyên sâu và tích hợp ERP phức tạp.',
])
story.append(Spacer(1, 4))
story.append(P('Hướng phát triển tiếp theo: xác thực và phân quyền chi tiết, lịch sử thay đổi đầy đủ, '
               'đính kèm tệp thực tế, xuất báo cáo Excel/PDF, thông báo theo thời gian thực và cơ sở dữ liệu quan hệ.'))

story.append(Spacer(1, 16))
story.append(P('Tài liệu được tạo tự động ngày %s.' % datetime.now().strftime('%d/%m/%Y'), S_SMALL))

# ---------- Build ----------
os.makedirs(os.path.dirname(OUT), exist_ok=True)
doc = BaseDocTemplate(OUT, pagesize=A4,
                      leftMargin=2 * cm, rightMargin=2 * cm,
                      topMargin=1.9 * cm, bottomMargin=1.9 * cm,
                      title='Tài liệu sản phẩm - Hệ thống Quản lý Xây dựng',
                      author='Nhóm sản phẩm', subject='Tài liệu sản phẩm')
frame_cover = Frame(2 * cm, 2 * cm, 17 * cm, 27.7 * cm, id='cover')
frame_body = Frame(2 * cm, 1.9 * cm, 17 * cm, 25.3 * cm, id='body')
doc.addPageTemplates([
    PageTemplate(id='cover', frames=[frame_cover], onPage=cover),
    PageTemplate(id='body', frames=[frame_body], onPage=page_deco),
])

story.insert(0, NextPageTemplate('body'))
# Trang đầu dùng mẫu bìa, các trang sau dùng khung nội dung
doc.build(story)
print('PDF:', OUT)
