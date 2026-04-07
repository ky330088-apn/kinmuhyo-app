import React, { useState } from 'react';
import { createStaff, updateStaff, deleteStaff } from '../api.js';
import './StaffManager.css';

const PRESET_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#d97706',
  '#7c3aed', '#db2777', '#0891b2', '#65a30d',
];

export default function StaffManager({ staffList, onChange }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { setError('名前を入力してください'); return; }
    setError('');
    await createStaff(name.trim(), color);
    setName('');
    setColor(PRESET_COLORS[0]);
    onChange();
  };

  const startEdit = (staff) => {
    setEditingId(staff.id);
    setEditName(staff.name);
    setEditColor(staff.color);
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    await updateStaff(id, editName.trim(), editColor);
    setEditingId(null);
    onChange();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このスタッフのシフトデータも全て削除されます。よろしいですか？')) return;
    await deleteStaff(id);
    onChange();
  };

  return (
    <div className="staff-manager">
      <div className="staff-card">
        <h2 className="staff-card__title">スタッフ追加</h2>
        <div className="staff-form">
          <input
            type="text"
            className="form-input"
            placeholder="スタッフ名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="color-picker">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                className={`color-dot ${color === c ? 'color-dot--selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
          <button className="btn btn--primary" onClick={handleAdd}>追加</button>
        </div>
        {error && <p className="staff-error">{error}</p>}
      </div>

      <div className="staff-card">
        <h2 className="staff-card__title">スタッフ一覧 ({staffList.length}名)</h2>
        {staffList.length === 0 ? (
          <p className="staff-empty">スタッフが登録されていません</p>
        ) : (
          <ul className="staff-list">
            {staffList.map((staff) => (
              <li key={staff.id} className="staff-item">
                {editingId === staff.id ? (
                  <div className="staff-edit">
                    <input
                      type="text"
                      className="form-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(staff.id)}
                      autoFocus
                    />
                    <div className="color-picker">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`color-dot ${editColor === c ? 'color-dot--selected' : ''}`}
                          style={{ background: c }}
                          onClick={() => setEditColor(c)}
                        />
                      ))}
                    </div>
                    <button className="btn btn--primary" onClick={() => handleUpdate(staff.id)}>保存</button>
                    <button className="btn btn--outline" onClick={() => setEditingId(null)}>キャンセル</button>
                  </div>
                ) : (
                  <>
                    <span className="staff-item__badge" style={{ background: staff.color }} />
                    <span className="staff-item__name">{staff.name}</span>
                    <div className="staff-item__actions">
                      <button className="btn btn--outline btn--sm" onClick={() => startEdit(staff)}>編集</button>
                      <button className="btn btn--danger btn--sm" onClick={() => handleDelete(staff.id)}>削除</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
