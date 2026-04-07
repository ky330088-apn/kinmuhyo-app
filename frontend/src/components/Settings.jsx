import React, { useState, useEffect, useRef } from 'react';
import { fetchConfig, saveConfig, dataExportUrl, importData } from '../api.js';
import './Settings.css';

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [customPath, setCustomPath] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const data = await fetchConfig();
    setConfig(data);
    setCustomPath(data.dataDir || '');
    setLoading(false);
  };

  const showMessage = (text, type = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'info' }), 5000);
  };

  const handleSavePath = async (dir) => {
    const result = await saveConfig(dir);
    showMessage('✅ 保存しました！ 保存先: ' + result.currentPath, 'success');
    setCustomPath(dir);
    await loadConfig();
  };

  const handleReset = async () => {
    await saveConfig('');
    showMessage('ローカル保存に戻しました', 'info');
    await loadConfig();
  };

  // データを書き出す（ダウンロード）
  const handleExport = () => {
    window.location.href = dataExportUrl();
  };

  // データを読み込む（ファイル選択）
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = await importData(json);
      if (result.error) {
        showMessage('❌ ' + result.error, 'error');
      } else {
        showMessage(`✅ 読み込み完了！ スタッフ ${result.staff}名・シフト ${result.shifts}件を読み込みました。ページを更新してください。`, 'success');
      }
    } catch {
      showMessage('❌ ファイルの読み込みに失敗しました。正しいバックアップファイルか確認してください。', 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  if (loading) return <div className="settings__loading">読み込み中...</div>;

  return (
    <div className="settings">

      {/* ======== データ手動バックアップ ======== */}
      <div className="settings-card">
        <h2 className="settings-card__title">📦 データの書き出し・読み込み</h2>
        <p className="settings-card__desc">
          シフトデータをファイルに保存したり、別のPCから持ってきたファイルを読み込めます。<br />
          Google Drive がなくても、このファイルをコピーするだけでデータを移せます。
        </p>

        <div className="backup-buttons">
          <div className="backup-item">
            <button className="btn btn--primary backup-btn" onClick={handleExport}>
              ⬇️ データを書き出す
            </button>
            <p className="backup-item__desc">
              今のデータをファイルに保存します。<br />
              このファイルを他のPCにコピーしてください。
            </p>
          </div>

          <div className="backup-divider">↔️</div>

          <div className="backup-item">
            <button
              className="btn btn--outline backup-btn"
              onClick={handleImportClick}
              disabled={importing}
            >
              {importing ? '読み込み中...' : '⬆️ データを読み込む'}
            </button>
            <p className="backup-item__desc">
              他のPCから書き出したファイルを選んでください。<br />
              <strong>現在のデータは上書きされます。</strong>
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div className="backup-howto">
          <strong>使い方（PCが2台ある場合）</strong>
          <ol>
            <li>PC①で「データを書き出す」→ ファイルがダウンロードされる</li>
            <li>そのファイルをPC②にメール・USBなどで送る</li>
            <li>PC②で「データを読み込む」→ ファイルを選ぶ</li>
            <li>PC②のページを更新（F5キー）すると反映される</li>
          </ol>
        </div>
      </div>

      {/* ======== Google Drive 設定 ======== */}
      <div className="settings-card">
        <h2 className="settings-card__title">☁️ Google Drive 自動同期の設定</h2>
        <p className="settings-card__desc">
          Google Drive for Desktop をインストールすると、自動でデータが同期されます。
        </p>

        <div className="settings-current">
          <span className="settings-current__label">現在の保存先:</span>
          <code className="settings-current__path">{config?.currentPath || '(ローカル)'}</code>
        </div>
      </div>

      {/* 自動検出パス */}
      {config?.detectedPaths?.length > 0 && (
        <div className="settings-card">
          <h3 className="settings-card__subtitle">Google Drive が見つかりました</h3>
          <p className="settings-card__desc">クリックするだけで設定完了です。</p>
          <div className="settings-detected">
            {config.detectedPaths.map((p) => (
              <button
                key={p}
                className={`settings-path-btn ${config.dataDir === p ? 'settings-path-btn--active' : ''}`}
                onClick={() => handleSavePath(p)}
              >
                <span className="settings-path-btn__icon">
                  {config.dataDir === p ? '✅' : '📁'}
                </span>
                <span className="settings-path-btn__path">{p}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 手動入力 */}
      <div className="settings-card">
        <h3 className="settings-card__subtitle">
          {config?.detectedPaths?.length > 0 ? 'または、パスを直接入力' : 'Google Drive フォルダのパスを手動で入力'}
        </h3>
        <div className="settings-manual">
          <input
            type="text"
            className="form-input"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="例: /Users/名前/Library/CloudStorage/GoogleDrive-.../My Drive"
          />
          <button className="btn btn--primary" onClick={() => handleSavePath(customPath)}>
            設定する
          </button>
        </div>
        {config?.dataDir && (
          <button className="btn btn--outline settings-reset" onClick={handleReset}>
            ローカル保存に戻す
          </button>
        )}
      </div>

      {/* メッセージ */}
      {message.text && (
        <div className={`settings-message settings-message--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Google Driveインストール案内 */}
      <div className="settings-card settings-help">
        <h3 className="settings-card__subtitle">Google Drive for Desktop のインストール方法</h3>
        <ol className="settings-steps">
          <li>
            ブラウザで{' '}
            <a href="https://www.google.com/intl/ja/drive/download/" target="_blank" rel="noreferrer">
              Google Drive ダウンロードページ
            </a>
            {' '}を開く
          </li>
          <li>「パソコン版ドライブをダウンロード」をクリック</li>
          <li>ダウンロードしたファイルを開いてインストール</li>
          <li>Googleアカウントでログイン（両方のPCで同じアカウントを使う）</li>
          <li>この設定画面に戻り、検出されたパスをクリック</li>
        </ol>
      </div>
    </div>
  );
}
