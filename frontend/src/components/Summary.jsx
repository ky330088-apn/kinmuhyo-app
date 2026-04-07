import React from 'react';
import './Summary.css';

function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '0時間';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export default function Summary({ year, month, summary }) {
  if (summary.length === 0) {
    return (
      <div className="summary__empty">
        <p>スタッフが登録されていません。</p>
      </div>
    );
  }

  return (
    <div className="summary">
      <h2 className="summary__title">{year}年{month}月 勤務集計</h2>

      <div className="summary-table-wrapper">
        <table className="summary-table">
          <thead>
            <tr>
              <th>スタッフ</th>
              <th>出勤日数</th>
              <th>休み</th>
              <th>有給休暇</th>
              <th>総実働時間</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((row) => (
              <tr key={row.staff_id}>
                <td>
                  <div className="summary__staff">
                    <span className="summary__dot" style={{ background: row.color }} />
                    {row.staff_name}
                  </div>
                </td>
                <td className="summary__num">{row.work_days || 0}<span className="summary__unit">日</span></td>
                <td className="summary__num">{row.off_days || 0}<span className="summary__unit">日</span></td>
                <td className="summary__num">{row.holiday_days || 0}<span className="summary__unit">日</span></td>
                <td className="summary__time">{formatMinutes(row.total_work_minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* カード表示 */}
      <div className="summary-cards">
        {summary.map((row) => (
          <div key={row.staff_id} className="summary-card">
            <div className="summary-card__header">
              <span className="summary-card__dot" style={{ background: row.color }} />
              <span className="summary-card__name">{row.staff_name}</span>
            </div>
            <div className="summary-card__stats">
              <div className="summary-stat">
                <span className="summary-stat__value">{row.work_days || 0}</span>
                <span className="summary-stat__label">出勤日</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat__value">{row.off_days || 0}</span>
                <span className="summary-stat__label">休み</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat__value">{row.holiday_days || 0}</span>
                <span className="summary-stat__label">有休</span>
              </div>
              <div className="summary-stat summary-stat--wide">
                <span className="summary-stat__value summary-stat__value--time">
                  {formatMinutes(row.total_work_minutes)}
                </span>
                <span className="summary-stat__label">実働時間</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
