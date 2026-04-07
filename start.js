/**
 * 勤務表アプリ ワンクリック起動スクリプト
 * Windows / Mac 両対応
 */
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const root    = __dirname;
const isWin   = os.platform() === 'win32';
const backend  = path.join(root, 'backend');
const frontend = path.join(root, 'frontend');

console.log('');
console.log('==========================================');
console.log('  勤務表アプリ を起動しています...');
console.log('==========================================');

function run(cmd, args, opts) {
  const p = spawn(cmd, args, { ...opts, detached: true, stdio: 'ignore' });
  p.unref();
  return p;
}

if (isWin) {
  // ── Windows ──────────────────────────────
  console.log('[1/3] バックエンドを起動中...');
  run('cmd', ['/c', 'start', '勤務表-バックエンド', 'cmd', '/k',
    `cd /d "${backend}" && node server.js`], {});

  setTimeout(() => {
    console.log('[2/3] フロントエンドを起動中...');
    run('cmd', ['/c', 'start', '勤務表-フロントエンド', 'cmd', '/k',
      `cd /d "${frontend}" && npm run dev`], {});

    setTimeout(() => {
      console.log('[3/3] ブラウザを開いています...');
      run('cmd', ['/c', 'start', '', 'http://localhost:5173'], {});
      console.log('');
      console.log('✅ 起動完了！ブラウザが開きます。');
      console.log('   終了するときは「勤務表-バックエンド」と');
      console.log('   「勤務表-フロントエンド」の黒い画面を閉じてください。');
      setTimeout(() => process.exit(0), 1000);
    }, 6000);

  }, 2500);

} else {
  // ── Mac ──────────────────────────────────
  console.log('[1/3] バックエンドを起動中...');
  run('osascript', ['-e',
    `tell application "Terminal" to do script "echo '=== バックエンド ===' && cd '${backend}' && node server.js"`], {});

  setTimeout(() => {
    console.log('[2/3] フロントエンドを起動中...');
    run('osascript', ['-e',
      `tell application "Terminal" to do script "echo '=== フロントエンド ===' && cd '${frontend}' && npm run dev"`], {});

    setTimeout(() => {
      console.log('[3/3] ブラウザを開いています...');
      run('open', ['http://localhost:5173'], {});
      console.log('');
      console.log('✅ 起動完了！ブラウザが開きます。');
      console.log('   終了するときは2つのターミナル画面で Ctrl+C を押してください。');
      setTimeout(() => process.exit(0), 1000);
    }, 6000);

  }, 2500);
}
