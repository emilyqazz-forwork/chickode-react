import { useState } from 'react';

export function ChapterModal({ onClose, onSelect, progress, t }) {
  const chapters = [
    { ch: 1, key: 'ch1_1' },
    { ch: 2, key: 'ch1_2' },
    { ch: 3, key: 'ch2_1' },
    { ch: 4, key: 'ch2_2' },
  ];

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_chapter_title')}</h2>
        <div className="chapter-list">
          <h3 className="chapter-group-title">{t('ch1_group')}</h3>
          {chapters.slice(0, 2).map(({ ch, key }) => (
            <div key={ch} className="chapter-item" onClick={() => onSelect(ch)}>
              <span className="ch-title">{t(key)}</span>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress[ch] || 0}%` }} />
              </div>
            </div>
          ))}
          <h3 className="chapter-group-title">{t('ch2_group')}</h3>
          {chapters.slice(2).map(({ ch, key }) => (
            <div key={ch} className="chapter-item" onClick={() => onSelect(ch)}>
              <span className="ch-title">{t(key)}</span>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress[ch] || 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuizModal({ onClose, onStart, t }) {
  const [ratio, setRatio] = useState(50);
  const [count, setCount] = useState(10);
  const [diff, setDiff] = useState('중');

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2 className="modal-header">{t('modal_quiz_title')}</h2>
        <div className="setting-form">
          <div className="setting-group">
            <label>{t('quiz_ratio')}</label>
            <div className="range-slider-wrapper">
              <span>{t('quiz_obj')} {ratio}%</span>
              <input type="range" min="0" max="100" step="10" value={ratio} onChange={e => setRatio(Number(e.target.value))} />
              <span>{t('quiz_subj')} {100 - ratio}%</span>
            </div>
          </div>
          <div className="setting-group">
            <label>{t('quiz_count')}</label>
            <input type="number" min="1" max="20" value={count} onChange={e => setCount(Number(e.target.value))} className="setting-input" />
          </div>
          <div className="setting-group">
            <label>{t('quiz_diff')}</label>
            <select className="setting-select" value={diff} onChange={e => setDiff(e.target.value)}>
              <option value="하">{t('diff_easy')}</option>
              <option value="중">{t('diff_medium')}</option>
              <option value="상">{t('diff_hard')}</option>
            </select>
          </div>
          <button className="clay-submit" onClick={() => onStart({ ratio, count, difficulty: diff })} style={{ width: '100%', marginTop: '15px' }}>
            {t('btn_start_quiz')}
          </button>
        </div>
      </div>
    </div>
  );
}
