import React, { useState } from 'react';
import './ShiftModal.css';
import './BulkShiftModal.css';

const SHIFT_TYPES = [
  { value: 'work',    label: '出勤' },
  { value: 'off',     label: '休み' },
  { value: 'holiday', label: '有給休暇' },
];

const DOW = ['日', '月', '火', '水', '木', '金', '土'];

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${dateStr.slice(5).replace('-', '/')}(${DOW[d.getDay()]})`;
}

export default function BulkShiftModal({ staffList, staffId, dates, onSave, onDelete, onClose }) {
  const [shiftType,    setShiftType]    = useState('work');
  const [startTime,    setStartTime]    = useState('09:00');
  const [endTime,      setEndTime]      = useState('18:00');
  const [breakMinutes, setBreakMinutes] = useState(60);
  const [note,         setNote]         = useState('');

  const staff = staffList.find((s) => s.id === staffId);

  const workMinutes = (() => {
    if (shiftType !== 'work' || !startTime || !endTime) return null;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const t = (eh * 60 + em) - (sh * 60 + sm) - Number(breakMinutes);
    return t > 0 ? t : null;
  })();

  const handleSave = () => {
    onSave({
      staffId,
      dates,
      shiftType,
      startTime:    shiftType === 'work' ? startTime    : null,
      endTime:      shiftType === 'work' ? endTime      : null,
      breakMinutes: shiftType === 'work' ? Number(breakMinutes) : 0,
      note,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>まとめてシフト編集</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {/* スタッフ・期間 */}
          <div className="modal__info">
            {staff && (
              <span className="modal__staff">
                <span className="modal__staff-dot" style={{ background: staff.color }} />
                {staff.name}
              </span>
            )}
            <span className="modal__date">
              {fmtDate(dates[0])} 〜 {fmtDate(dates[dates.length - 1])}
            </span>
          </div>

          {/* 選択日一覧 */}
          <div className="bulk__dates">
            {dates.map((d) => (
              <span key={d} className="bulk__date-chip">{fmtDate(d)}</span>
            ))}
          </div>

          {/* シフト種別 */}
          <div className="form-group">
            <label className="form-label">シフト種別</label>
            <div className="shift-type-buttons">
              {SHIFT_TYPES.map((t) => (
                <button
                  key={t.value}
                  className={`shift-type-btn ${shiftType === t.value ? 'shift-type-btn--active' : ''}`}
                  onClick={() => setShiftType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 時刻入力（出勤のみ） */}
          {shiftType === 'work' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">開始時刻</label>
                  <input type="time" className="form-input" value={startTime}
                    onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">終了時刻</label>
                  <input type="time" className="form-input" value={endTime}
                    onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">休憩 (分)</label>
                  <input type="number" className="form-input" value={breakMinutes}
                    min="0" max="480" step="15"
                    onChange={(e) => setBreakMinutes(e.target.value)} />
                </div>
              </div>
              {workMinutes !== null && (
                <div className="modal__work-time">
                  実働時間: <strong>
                    {Math.floor(workMinutes / 60)}時間
                    {workMinutes % 60 > 0 ? `${workMinutes % 60}分` : ''}
                  </strong> × {dates.length}日
                  ＝ <strong>
                    {Math.floor(workMinutes * dates.length / 60)}時間
                    {(workMinutes * dates.length) % 60 > 0 ? `${(workMinutes * dates.length) % 60}分` : ''}
                  </strong>
                </div>
              )}
            </>
          )}

          {/* メモ */}
          <div className="form-group">
            <label className="form-label">メモ</label>
            <input type="text" className="form-input" value={note}
              placeholder="メモ（任意）"
              onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <div className="modal__footer">
          <button className="btn btn--danger" onClick={() => onDelete(staffId, dates)}>
            {dates.length}日分を削除
          </button>
          <div className="modal__footer-right">
            <button className="btn btn--outline" onClick={onClose}>キャンセル</button>
            <button className="btn btn--primary" onClick={handleSave}>
              {dates.length}日分を保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
