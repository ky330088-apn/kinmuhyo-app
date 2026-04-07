import React, { useState, useEffect } from 'react';
import { fetchConfig, saveConfig } from '../api.js';
import './Settings.css';

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [customPath, setCustomPath] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleSave = async (dir) => {
    const result = await saveConfig(dir);
    setMessage('保存しました！ データの保存先: ' + result.currentPath);
    setCustomPath(dir);
    await loadConfig();
    setTimeout(() => setMessage(''), 5000);
  };

  const handleReset = async () => {
    await handleSave('');
    setMessage('ローカル保存に戻しました');
  };

  if (loading) return <div className="settings__loading">読み込み中...</div>;

  return (
    <div className="settings">
      <div className="settings-card">
        <h2 className="settings-card__title">データ保存先の設定</h2>
        <p className="settings-card__desc">
          Google Drive にデータを保存すると、複数のPCでシフトデータを共有できます。
        </p>

        {/* 現在の保存先 */}
        <div className="settings-current">
          <span className="settings-current__label">現在の保存先:</span>
          <code className="settings-current__path">{config?.currentPath || '(ローカル)'}</code>
        </div>
      </div>

      {/* 自動検出されたGoogle Driveパス */}
      {config?.detectedPaths?.length > 0 && (
        <div className="settings-card">
          <h3 className="settings-card__subtitle">Google Drive が見つかりました</h3>
          <p className="settings-card__desc">
            以下のボタンをクリックすると、Google Drive にデータを保存します。
          </p>
          <div className="settings-detected">
            {config.detectedPaths.map((p) => (
              <button
                key={p}
                className={`settings-path-btn ${config.dataDir === p ? 'settings-path-btn--active' : ''}`}
                onClick={() => handleSave(p)}
              >
                <span className="settings-path-btn__icon">
                  {config.dataDir === p ? '\u2705' : '\ud83d\udcc1'}
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
          {config?.detectedPaths?.length > 0 ? 'または、パスを直接入力' : 'Google Drive フォルダのパスを入力'}
        </h3>
        <p className="settings-card__desc">
          Google Drive for Desktop をインストールした後、同期フォルダのパスを入力してください。
        </p>
        <div className="settings-manual">
          <input
            type="text"
            className="form-input"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            placeholder="例: /Users/名前/Library/CloudStorage/GoogleDrive-.../My Drive"
          />
          <button className="btn btn--primary" onClick={() => handleSave(customPath)}>
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
      {message && <div className="settings-message">{message}</div>}

      {/* ヘルプ */}
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
          <li>Googleアカウントでログイン</li>
          <li>この設定画面に戻り、検出されたパスをクリック</li>
        </ol>
      </div>
    </div>
  );
}
