import React, { useMemo } from 'react';
import './ShiftCalendar.css';

const DOW = ['日', '月', '火', '水', '木', '金', '土'];
const SHIFT_TYPE_LABEL = { work: '出勤', off: '休み', holiday: '有休' };

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDow(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function formatDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function ShiftCalendar({ year, month, staffList, shifts, onCellClick }) {
  const daysInMonth = getDaysInMonth(year, month);
  const today = new Date();
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // シフトをマップに変換: { staffId -> { date -> shift } }
  const shiftMap = useMemo(() => {
    const map = {};
    shifts.forEach((s) => {
      if (!map[s.staff_id]) map[s.staff_id] = {};
      map[s.staff_id][s.date] = s;
    });
    return map;
  }, [shifts]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
      <div className="calendar">
        {/* ヘッダー行 */}
        <div className="calendar__header">
          <div className="calendar__staff-col">スタッフ</div>
          {days.map((d) => {
            const date = formatDate(year, month, d);
            const dow = new Date(year, month - 1, d).getDay();
            const isSun = dow === 0;
            const isSat = dow === 6;
            const isToday = date === todayStr;
            return (
              <div
                key={d}
                className={`calendar__day-header ${isSun ? 'calendar__day-header--sun' : ''} ${isSat ? 'calendar__day-header--sat' : ''} ${isToday ? 'calendar__day-header--today' : ''}`}
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
              <span
                className="calendar__staff-badge"
                style={{ background: staff.color }}
              />
              {staff.name}
            </div>
            {days.map((d) => {
              const date = formatDate(year, month, d);
              const dow = new Date(year, month - 1, d).getDay();
              const shift = shiftMap[staff.id]?.[date];
              const isSun = dow === 0;
              const isSat = dow === 6;
              const isToday = date === todayStr;

              return (
                <div
                  key={d}
                  className={`calendar__cell ${isSun ? 'calendar__cell--sun' : ''} ${isSat ? 'calendar__cell--sat' : ''} ${isToday ? 'calendar__cell--today' : ''} ${shift ? `calendar__cell--${shift.shift_type}` : ''}`}
                  onClick={() => onCellClick(staff.id, date)}
                  title={`${staff.name} ${date}`}
                >
                  {shift && <ShiftCell shift={shift} color={staff.color} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
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
