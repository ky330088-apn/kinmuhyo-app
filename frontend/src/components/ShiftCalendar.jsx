import React, { useMemo, useState, useRef, useEffect } from 'react';
import './ShiftCalendar.css';

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function ShiftCalendar({ year, month, staffList, shifts, onCellClick, onBulkSelect }) {
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const shiftMap = useMemo(() => {
    const map = {};
    shifts.forEach((s) => {
      if (!map[s.staff_id]) map[s.staff_id] = {};
      map[s.staff_id][s.date] = s;
    });
    return map;
  }, [shifts]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  // ── ドラッグ選択 ──────────────────────────────────
  const dragRef = useRef({ active: false, staffId: null, startDate: null, endDate: null });
  const [selection, setSelection] = useState({ staffId: null, startDate: null, endDate: null });

  // 最新の props/state を ref に保持（useEffect のクロージャ問題を回避）
  const cbRef = useRef({});
  cbRef.current = { onCellClick, onBulkSelect, days, year, month };

  useEffect(() => {
    const handleMouseUp = () => {
      if (!dragRef.current.active) return;
      const { staffId, startDate, endDate } = dragRef.current;
      dragRef.current.active = false;
      document.body.style.userSelect = '';

      const s = startDate <= endDate ? startDate : endDate;
      const e = startDate <= endDate ? endDate : startDate;
      const { days: d, year: y, month: m } = cbRef.current;
      const dates = d
        .map((n) => formatDate(y, m, n))
        .filter((date) => date >= s && date <= e);

      setSelection({ staffId: null, startDate: null, endDate: null });

      if (dates.length === 1) {
        cbRef.current.onCellClick(staffId, dates[0]);
      } else if (dates.length > 1) {
        cbRef.current.onBulkSelect(staffId, dates);
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleCellMouseDown = (staffId, date, e) => {
    e.preventDefault();
    dragRef.current = { active: true, staffId, startDate: date, endDate: date };
    setSelection({ staffId, startDate: date, endDate: date });
    document.body.style.userSelect = 'none';
  };

  const handleCellMouseEnter = (staffId, date) => {
    if (!dragRef.current.active || dragRef.current.staffId !== staffId) return;
    dragRef.current.endDate = date;
    setSelection({ staffId, startDate: dragRef.current.startDate, endDate: date });
  };

  const isCellSelected = (staffId, date) => {
    const { staffId: sid, startDate, endDate } = selection;
    if (!sid || sid !== staffId || !startDate || !endDate) return false;
    const s = startDate <= endDate ? startDate : endDate;
    const e = startDate <= endDate ? endDate : startDate;
    return date >= s && date <= e;
  };

  // ドラッグ中に選択されている日数
  const selectionCount = useMemo(() => {
    const { staffId: sid, startDate, endDate } = selection;
    if (!sid || !startDate || !endDate) return 0;
    const s = startDate <= endDate ? startDate : endDate;
    const e = startDate <= endDate ? endDate : startDate;
    return days.filter((n) => {
      const d = formatDate(year, month, n);
      return d >= s && d <= e;
    }).length;
  }, [selection, days, year, month]);

  if (staffList.length === 0) {
    return (
      <div className="calendar__empty">
        <p>スタッフが登録されていません。</p>
        <p>「スタッフ管理」タブからスタッフを追加してください。</p>
      </div>
    );
  }

  return (
    <div className="calendar-wrapper">
      {/* ドラッグ中のヒント */}
      {selectionCount > 1 && (
        <div className="calendar__drag-hint">
          {selectionCount}日選択中 — マウスを離すとまとめて編集できます
        </div>
      )}

      <div className="calendar" style={{ cursor: dragRef.current.active ? 'crosshair' : 'default' }}>
        {/* ヘッダー行 */}
        <div className="calendar__header">
          <div className="calendar__staff-col">スタッフ</div>
          {days.map((d) => {
            const date = formatDate(year, month, d);
            const dow = new Date(year, month - 1, d).getDay();
            return (
              <div
                key={d}
                className={[
                  'calendar__day-header',
                  dow === 0 ? 'calendar__day-header--sun' : '',
                  dow === 6 ? 'calendar__day-header--sat' : '',
                  date === todayStr ? 'calendar__day-header--today' : '',
                ].join(' ')}
              >
                <span className="calendar__day-num">{d}</span>
                <span className="calendar__day-dow">{DOW[dow]}</span>
              </div>
            );
          })}
        </div>

        {/* スタッフ行 */}
        {staffList.map((staff) => (
          <div key={staff.id} className="calendar__row">
            <div className="calendar__staff-name">
              <span className="calendar__staff-badge" style={{ background: staff.color }} />
              {staff.name}
            </div>
            {days.map((d) => {
              const date = formatDate(year, month, d);
              const dow = new Date(year, month - 1, d).getDay();
              const shift = shiftMap[staff.id]?.[date];
              const selected = isCellSelected(staff.id, date);

              return (
                <div
                  key={d}
                  className={[
                    'calendar__cell',
                    dow === 0 ? 'calendar__cell--sun' : '',
                    dow === 6 ? 'calendar__cell--sat' : '',
                    date === todayStr ? 'calendar__cell--today' : '',
                    shift ? `calendar__cell--${shift.shift_type}` : '',
                    selected ? 'calendar__cell--selected' : '',
                  ].join(' ')}
                  onMouseDown={(e) => handleCellMouseDown(staff.id, date, e)}
                  onMouseEnter={() => handleCellMouseEnter(staff.id, date)}
                  title={`${staff.name} ${date}`}
                >
                  {shift && <ShiftCell shift={shift} color={staff.color} />}
                  {selected && <span className="calendar__cell-select-mark" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <p className="calendar__tip">
        💡 クリックで1日編集 ／ ドラッグで複数日をまとめて編集
      </p>
    </div>
  );
}

function ShiftCell({ shift, color }) {
  if (shift.shift_type === 'work') {
    return (
      <div className="shift-cell shift-cell--work" style={{ borderColor: color, background: color + '18' }}>
        {shift.start_time && shift.end_time ? (
          <>
            <span className="shift-cell__time">{shift.start_time}</span>
            <span className="shift-cell__sep">〜</span>
            <span className="shift-cell__time">{shift.end_time}</span>
          </>
        ) : (
          <span className="shift-cell__label">出勤</span>
        )}
      </div>
    );
  }
  const COLORS = { off: '#94a3b8', holiday: '#f59e0b' };
  const LABELS = { off: '休み', holiday: '有休' };
  return (
    <div
      className="shift-cell shift-cell--other"
      style={{ background: COLORS[shift.shift_type] + '25', borderColor: COLORS[shift.shift_type] }}
    >
      <span className="shift-cell__label">{LABELS[shift.shift_type] || shift.shift_type}</span>
    </div>
  );
}
