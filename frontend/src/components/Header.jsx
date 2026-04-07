import React from 'react';
import { exportUrl } from '../api.js';
import './Header.css';

const TABS = [
  { id: 'calendar', label: 'シフト表' },
  { id: 'staff', label: 'スタッフ管理' },
  { id: 'summary', label: '勤務集計' },
];

export default function Header({ year, month, onPrev, onNext, tab, setTab }) {
  const handleExport = (format) => {
    window.location.href = exportUrl(year, month, format);
  };

  return (
    <header className="header">
      <div className="header__top">
        <div className="header__title">
          <span className="header__icon">📋</span>
          <h1>勤務表アプリ</h1>
        </div>

        <div className="header__nav">
          <button className="btn btn--icon" onClick={onPrev} title="前月">‹</button>
          <span className="header__month">{year}年 {month}月</span>
          <button className="btn btn--icon" onClick={onNext} title="次月">›</button>
        </div>

        <div className="header__actions">
          <button className="btn btn--outline" onClick={() => handleExport('csv')}>
            CSV出力
          </button>
          <button className="btn btn--outline" onClick={() => handleExport('xlsx')}>
            Excel出力
          </button>
        </div>
      </div>

      <nav className="header__tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'tab--active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
