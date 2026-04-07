import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import StaffManager from './components/StaffManager.jsx';
import ShiftCalendar from './components/ShiftCalendar.jsx';
import Summary from './components/Summary.jsx';
import ShiftModal from './components/ShiftModal.jsx';
import { fetchStaff, fetchShifts, fetchSummary, saveShift, deleteShift } from './api.js';
import './App.css';

export default function App() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [tab, setTab] = useState('calendar'); // 'calendar' | 'staff' | 'summary'

  const [staffList, setStaffList] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [summary, setSummary] = useState([]);

  const [modal, setModal] = useState(null); // { staffId, date, shift }

  const loadShifts = useCallback(async () => {
    const data = await fetchShifts(year, month);
    setShifts(data);
  }, [year, month]);

  const loadSummary = useCallback(async () => {
    const data = await fetchSummary(year, month);
    setSummary(data);
  }, [year, month]);

  const loadStaff = useCallback(async () => {
    const data = await fetchStaff();
    setStaffList(data);
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    loadShifts();
    loadSummary();
  }, [loadShifts, loadSummary]);

  const handleMonthChange = (dir) => {
    let m = month + dir;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m);
    setYear(y);
  };

  const openModal = (staffId, date) => {
    const shift = shifts.find((s) => s.staff_id === staffId && s.date === date) || null;
    setModal({ staffId, date, shift });
  };

  const handleSaveShift = async (data) => {
    await saveShift(data);
    await loadShifts();
    await loadSummary();
    setModal(null);
  };

  const handleDeleteShift = async (staffId, date) => {
    await deleteShift(staffId, date);
    await loadShifts();
    await loadSummary();
    setModal(null);
  };

  const handleStaffChange = async () => {
    await loadStaff();
    await loadShifts();
    await loadSummary();
  };

  return (
    <div className="app">
      <Header
        year={year}
        month={month}
        onPrev={() => handleMonthChange(-1)}
        onNext={() => handleMonthChange(+1)}
        tab={tab}
        setTab={setTab}
      />

      <main className="app__main">
        {tab === 'calendar' && (
          <ShiftCalendar
            year={year}
            month={month}
            staffList={staffList}
            shifts={shifts}
            onCellClick={openModal}
          />
        )}
        {tab === 'staff' && (
          <StaffManager staffList={staffList} onChange={handleStaffChange} />
        )}
        {tab === 'summary' && (
          <Summary year={year} month={month} summary={summary} />
        )}
      </main>

      {modal && (
        <ShiftModal
          staffList={staffList}
          staffId={modal.staffId}
          date={modal.date}
          shift={modal.shift}
          onSave={handleSaveShift}
          onDelete={handleDeleteShift}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
