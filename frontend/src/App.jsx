import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import StaffManager from './components/StaffManager.jsx';
import ShiftCalendar from './components/ShiftCalendar.jsx';
import Summary from './components/Summary.jsx';
import Settings from './components/Settings.jsx';
import ShiftModal from './components/ShiftModal.jsx';
import BulkShiftModal from './components/BulkShiftModal.jsx';
import { fetchStaff, fetchShifts, fetchSummary, saveShift, deleteShift } from './api.js';
import './App.css';

export default function App() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [tab,   setTab]   = useState('calendar');

  const [staffList, setStaffList] = useState([]);
  const [shifts,    setShifts]    = useState([]);
  const [summary,   setSummary]   = useState([]);

  const [modal,     setModal]     = useState(null); // 単日編集
  const [bulkModal, setBulkModal] = useState(null); // 複数日編集

  const loadShifts  = useCallback(async () => { setShifts(await fetchShifts(year, month)); }, [year, month]);
  const loadSummary = useCallback(async () => { setSummary(await fetchSummary(year, month)); }, [year, month]);
  const loadStaff   = useCallback(async () => { setStaffList(await fetchStaff()); }, []);

  useEffect(() => { loadStaff(); }, [loadStaff]);
  useEffect(() => { loadShifts(); loadSummary(); }, [loadShifts, loadSummary]);

  const handleMonthChange = (dir) => {
    let m = month + dir, y = year;
    if (m > 12) { m = 1;  y++; }
    if (m < 1)  { m = 12; y--; }
    setMonth(m); setYear(y);
  };

  // ── 単日モーダル ──────────────────────────────────
  const openModal = (staffId, date) => {
    const shift = shifts.find((s) => s.staff_id === staffId && s.date === date) || null;
    setModal({ staffId, date, shift });
  };

  const handleSaveShift = async (data) => {
    await saveShift(data);
    await loadShifts(); await loadSummary();
    setModal(null);
  };

  const handleDeleteShift = async (staffId, date) => {
    await deleteShift(staffId, date);
    await loadShifts(); await loadSummary();
    setModal(null);
  };

  // ── 複数日モーダル ────────────────────────────────
  const openBulkModal = (staffId, dates) => {
    setBulkModal({ staffId, dates });
  };

  const handleBulkSave = async ({ staffId, dates, shiftType, startTime, endTime, breakMinutes, note }) => {
    await Promise.all(
      dates.map((date) =>
        saveShift({ staff_id: staffId, date, shift_type: shiftType, start_time: startTime, end_time: endTime, break_minutes: breakMinutes, note })
      )
    );
    await loadShifts(); await loadSummary();
    setBulkModal(null);
  };

  const handleBulkDelete = async (staffId, dates) => {
    await Promise.all(dates.map((date) => deleteShift(staffId, date)));
    await loadShifts(); await loadSummary();
    setBulkModal(null);
  };

  const handleStaffChange = async () => {
    await loadStaff(); await loadShifts(); await loadSummary();
  };

  return (
    <div className="app">
      <Header
        year={year} month={month}
        onPrev={() => handleMonthChange(-1)}
        onNext={() => handleMonthChange(+1)}
        tab={tab} setTab={setTab}
      />

      <main className="app__main">
        {tab === 'calendar' && (
          <ShiftCalendar
            year={year} month={month}
            staffList={staffList} shifts={shifts}
            onCellClick={openModal}
            onBulkSelect={openBulkModal}
          />
        )}
        {tab === 'staff'    && <StaffManager staffList={staffList} onChange={handleStaffChange} />}
        {tab === 'summary'  && <Summary year={year} month={month} summary={summary} />}
        {tab === 'settings' && <Settings />}
      </main>

      {/* 単日編集モーダル */}
      {modal && (
        <ShiftModal
          staffList={staffList}
          staffId={modal.staffId} date={modal.date} shift={modal.shift}
          onSave={handleSaveShift} onDelete={handleDeleteShift}
          onClose={() => setModal(null)}
        />
      )}

      {/* 複数日編集モーダル */}
      {bulkModal && (
        <BulkShiftModal
          staffList={staffList}
          staffId={bulkModal.staffId} dates={bulkModal.dates}
          onSave={handleBulkSave} onDelete={handleBulkDelete}
          onClose={() => setBulkModal(null)}
        />
      )}
    </div>
  );
}
