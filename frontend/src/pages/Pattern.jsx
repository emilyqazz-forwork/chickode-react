import { useNavigate } from 'react-router-dom';

export function Pattern({ t }) {
  const navigate = useNavigate();
  return (
    <div className="main-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255, 255, 255, 0.2)', border: 'none', borderRadius: '5px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '5px 12px' }}
      >
        ❮ 뒤로가기
      </button>
      <h1 className="glow-title" style={{ fontSize: '3rem' }}>{t('nav_pattern')}</h1>
      <p style={{ color: 'white', marginTop: '20px' }}>패턴 분석 기능은 아직 준비 중입니다!</p>
    </div>
  );
}
