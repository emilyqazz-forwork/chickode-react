import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../state/app-state';
import { ChapterModal, QuizModal } from '../components/QuizModal';

export function Home({ t }) {
  const [showChapter, setShowChapter] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [chapter, setChapter] = useState(1);
  const [progress, setProgress] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const attempts = getAttempts();
    const total = { 1: 13, 2: 13, 3: 13, 4: 13 };
    const correct = {};
    const seen = {};
    for (const a of attempts) {
      if (!a.isCorrect) continue;
      const pid = a.problemId || a.title;
      if (!seen[pid]) { seen[pid] = true; correct[a.chapter] = (correct[a.chapter] || 0) + 1; }
    }
    const p = {};
    [1, 2, 3, 4].forEach(ch => {
      p[ch] = Math.min(Math.round(((correct[ch] || 0) / total[ch]) * 100), 100);
    });
    setProgress(p);
  }, []);

  const onChapter = (ch) => { setChapter(ch); setShowChapter(false); setShowQuiz(true); };

  return (
    <div className="main-container" style={{ display: 'flex' }}>
      <header className="header">
        <h1 className="glow-title">{t('main_title')}</h1>
        <p className="subtitle">{t('main_subtitle')}</p>
      </header>
      <div className="button-wrapper">
        {[
          { img: '버튼_1.png', alt: '문제풀기', onClick: () => setShowChapter(true) },
          { img: '버튼_2.png', alt: '오답노트', onClick: () => navigate('/note') },
          { img: '버튼_3.png', alt: '패턴분석', onClick: () => navigate('/pattern') },
          { img: '버튼_4.png', alt: '커스터마이징', onClick: () => navigate('/customize') },
        ].map(({ img, alt, onClick }) => (
          <button key={alt} className="btn-link" onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <img src={`/images/${img}`} alt={alt} />
          </button>
        ))}
      </div>
      {showChapter && <ChapterModal onClose={() => setShowChapter(false)} onSelect={onChapter} progress={progress} t={t} />}
      {showQuiz && (
        <QuizModal
          onClose={() => setShowQuiz(false)}
          t={t}
          onStart={(s) => { setShowQuiz(false); navigate('/play', { state: { ...s, chapter } }); }}
        />
      )}
    </div>
  );
}
