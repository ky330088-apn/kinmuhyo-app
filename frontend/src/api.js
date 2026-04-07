const BASE = '/api';

export async function fetchStaff() {
  const res = await fetch(`${BASE}/staff`);
  return res.json();
}

export async function createStaff(name, color) {
  const res = await fetch(`${BASE}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  return res.json();
}

export async function updateStaff(id, name, color) {
  const res = await fetch(`${BASE}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color }),
  });
  return res.json();
}

export async function deleteStaff(id) {
  const res = await fetch(`${BASE}/staff/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchShifts(year, month) {
  const res = await fetch(`${BASE}/shifts?year=${year}&month=${month}`);
  return res.json();
}

export async function saveShift(data) {
  const res = await fetch(`${BASE}/shifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteShift(staffId, date) {
  const res = await fetch(`${BASE}/shifts/${staffId}/${date}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchSummary(year, month) {
  const res = await fetch(`${BASE}/summary?year=${year}&month=${month}`);
  return res.json();
}

export function exportUrl(year, month, format) {
  return `${BASE}/export?year=${year}&month=${month}&format=${format}`;
}
