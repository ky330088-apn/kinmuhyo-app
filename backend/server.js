const express = require('express');
const cors = require('cors');
const db = require('./database');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================================
// 設定 API
// ============================================================

app.get('/api/config', (req, res) => {
  res.json(db.getConfig());
});

app.post('/api/config', (req, res) => {
  const { dataDir } = req.body;
  res.json(db.setConfig(dataDir || ''));
});

// ============================================================
// スタッフ API
// ============================================================

app.get('/api/staff', (req, res) => {
  res.json(db.getAllStaff());
});

app.post('/api/staff', (req, res) => {
  const { name, color } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: '名前は必須です' });
  res.json(db.addStaff(name.trim(), color || '#2563eb'));
});

app.put('/api/staff/:id', (req, res) => {
  const { name, color } = req.body;
  const id = parseInt(req.params.id);
  if (!name || !name.trim()) return res.status(400).json({ error: '名前は必須です' });
  db.updateStaff(id, name.trim(), color);
  res.json({ id, name: name.trim(), color });
});

app.delete('/api/staff/:id', (req, res) => {
  db.deleteStaff(parseInt(req.params.id));
  res.json({ success: true });
});

// ============================================================
// シフト API
// ============================================================

app.get('/api/shifts', (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'year と month は必須です' });
  res.json(db.getShiftsForMonth(parseInt(year), parseInt(month)));
});

app.post('/api/shifts', (req, res) => {
  const { staff_id, date, start_time, end_time, break_minutes, shift_type, note } = req.body;
  if (!staff_id || !date) return res.status(400).json({ error: 'staff_id と date は必須です' });
  res.json(db.upsertShift({ staff_id: parseInt(staff_id), date, start_time, end_time, break_minutes, shift_type, note }));
});

app.delete('/api/shifts/:staffId/:date', (req, res) => {
  db.deleteShift(parseInt(req.params.staffId), req.params.date);
  res.json({ success: true });
});

// ============================================================
// 集計 API
// ============================================================

app.get('/api/summary', (req, res) => {
  const { year, month } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'year と month は必須です' });
  res.json(db.getSummary(parseInt(year), parseInt(month)));
});

// ============================================================
// エクスポート API
// ============================================================

app.get('/api/export', (req, res) => {
  const { year, month, format } = req.query;
  if (!year || !month) return res.status(400).json({ error: 'year と month は必須です' });

  const staffList = db.getAllStaff();
  const shifts = db.getAllShiftsForMonth(parseInt(year), parseInt(month));

  const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  const shiftMap = {};
  shifts.forEach((s) => {
    if (!shiftMap[s.staff_id]) shiftMap[s.staff_id] = {};
    shiftMap[s.staff_id][s.date] = s;
  });

  const SHIFT_LABELS = { work: '出勤', off: '休み', holiday: '有休' };

  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  const header = [
    'スタッフ名',
    ...dates.map((d) => {
      const day = parseInt(d.slice(8));
      const dow = new Date(d + 'T00:00:00').getDay();
      return `${day}(${DOW[dow]})`;
    }),
  ];
  const rows = [header];

  staffList.forEach((staff) => {
    const row = [staff.name];
    dates.forEach((date) => {
      const shift = shiftMap[staff.id]?.[date];
      if (!shift) {
        row.push('');
      } else if (shift.shift_type !== 'work') {
        row.push(SHIFT_LABELS[shift.shift_type] || shift.shift_type);
      } else {
        row.push(
          shift.start_time && shift.end_time
            ? `${shift.start_time}〜${shift.end_time}`
            : SHIFT_LABELS.work
        );
      }
    });
    rows.push(row);
  });

  if (format === 'csv') {
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''kinmuhyo_${year}${String(month).padStart(2, '0')}.csv`);
    res.send('\uFEFF' + csv);
  } else {
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // 列幅設定
    ws['!cols'] = [{ wch: 12 }, ...dates.map(() => ({ wch: 14 }))];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${year}年${month}月`);
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''kinmuhyo_${year}${String(month).padStart(2, '0')}.xlsx`);
    res.send(buf);
  }
});

// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
