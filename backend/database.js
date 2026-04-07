const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');

// ============================================================
// 設定管理
// ============================================================
function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { dataDir: '' };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

function getDataFilePath() {
  const config = loadConfig();
  if (config.dataDir && fs.existsSync(config.dataDir)) {
    return path.join(config.dataDir, 'kinmuhyo.json');
  }
  // 未設定またはフォルダが見つからない場合はローカル保存
  return path.join(__dirname, 'kinmuhyo.json');
}

// Google Drive のよくあるパスを自動検出
function detectGoogleDrivePaths() {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  const candidates = [];

  if (process.platform === 'win32') {
    // Windows
    candidates.push(
      path.join(home, 'Google Drive', 'My Drive'),
      path.join(home, 'Google Drive', 'マイドライブ'),
      path.join(home, 'GoogleDrive', 'My Drive'),
      'G:\\My Drive',
      'G:\\マイドライブ',
    );
  } else {
    // Mac / Linux
    const cloudStorage = path.join(home, 'Library', 'CloudStorage');
    if (fs.existsSync(cloudStorage)) {
      try {
        const dirs = fs.readdirSync(cloudStorage).filter(d => d.startsWith('GoogleDrive'));
        dirs.forEach(d => {
          candidates.push(path.join(cloudStorage, d, 'My Drive'));
          candidates.push(path.join(cloudStorage, d, 'マイドライブ'));
        });
      } catch {}
    }
    candidates.push(
      path.join(home, 'Google Drive', 'My Drive'),
      path.join(home, 'Google Drive', 'マイドライブ'),
    );
  }

  return candidates.filter(p => {
    try { return fs.existsSync(p); } catch { return false; }
  });
}

// ============================================================
// データファイル読み書き
// ============================================================
const INITIAL_DATA = {
  staff: [],
  shifts: [],
  next_staff_id: 1,
  next_shift_id: 1,
};

function load() {
  const dbPath = getDataFilePath();
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(INITIAL_DATA, null, 2), 'utf8');
    return INITIAL_DATA;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function save(data) {
  const dbPath = getDataFilePath();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// ============================================================
// DB ラッパー
// ============================================================
const db = {
  // 設定
  getConfig() {
    const config = loadConfig();
    const detectedPaths = detectGoogleDrivePaths();
    const currentPath = getDataFilePath();
    return { ...config, detectedPaths, currentPath };
  },
  setConfig(dataDir) {
    saveConfig({ dataDir });
    return { dataDir, currentPath: getDataFilePath() };
  },

  // スタッフ
  getAllStaff() {
    return load().staff;
  },
  addStaff(name, color) {
    const data = load();
    const id = data.next_staff_id++;
    data.staff.push({ id, name, color, created_at: new Date().toISOString() });
    save(data);
    return { id, name, color };
  },
  updateStaff(id, name, color) {
    const data = load();
    const idx = data.staff.findIndex((s) => s.id === id);
    if (idx !== -1) {
      data.staff[idx] = { ...data.staff[idx], name, color };
    }
    save(data);
  },
  deleteStaff(id) {
    const data = load();
    data.staff = data.staff.filter((s) => s.id !== id);
    data.shifts = data.shifts.filter((s) => s.staff_id !== id);
    save(data);
  },

  // シフト
  getShiftsForMonth(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const data = load();
    const staffMap = Object.fromEntries(data.staff.map((s) => [s.id, s]));
    return data.shifts
      .filter((s) => s.date.startsWith(prefix))
      .map((s) => ({
        ...s,
        staff_name: staffMap[s.staff_id]?.name || '',
        staff_color: staffMap[s.staff_id]?.color || '',
      }))
      .sort((a, b) => a.date.localeCompare(b.date) || String(a.staff_id).localeCompare(String(b.staff_id)));
  },
  upsertShift({ staff_id, date, start_time, end_time, break_minutes, shift_type, note }) {
    const data = load();
    const idx = data.shifts.findIndex((s) => s.staff_id === staff_id && s.date === date);
    if (idx !== -1) {
      data.shifts[idx] = { ...data.shifts[idx], start_time, end_time, break_minutes: break_minutes || 0, shift_type: shift_type || 'work', note: note || '' };
      save(data);
      return { id: data.shifts[idx].id, updated: true };
    } else {
      const id = data.next_shift_id++;
      data.shifts.push({ id, staff_id, date, start_time, end_time, break_minutes: break_minutes || 0, shift_type: shift_type || 'work', note: note || '', created_at: new Date().toISOString() });
      save(data);
      return { id, updated: false };
    }
  },
  deleteShift(staff_id, date) {
    const data = load();
    data.shifts = data.shifts.filter((s) => !(s.staff_id === staff_id && s.date === date));
    save(data);
  },

  // 集計
  getSummary(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const data = load();
    return data.staff.map((staff) => {
      const myShifts = data.shifts.filter((s) => s.staff_id === staff.id && s.date.startsWith(prefix));
      const work_days = myShifts.filter((s) => s.shift_type === 'work').length;
      const off_days = myShifts.filter((s) => s.shift_type === 'off').length;
      const holiday_days = myShifts.filter((s) => s.shift_type === 'holiday').length;
      const total_work_minutes = myShifts
        .filter((s) => s.shift_type === 'work' && s.start_time && s.end_time)
        .reduce((sum, s) => {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          return sum + (eh * 60 + em) - (sh * 60 + sm) - (s.break_minutes || 0);
        }, 0);
      return { staff_id: staff.id, staff_name: staff.name, color: staff.color, work_days, off_days, holiday_days, total_work_minutes };
    });
  },

  // エクスポート用
  getAllShiftsForMonth(year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return load().shifts.filter((s) => s.date.startsWith(prefix));
  },
};

module.exports = db;
