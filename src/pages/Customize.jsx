import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadPreferences, savePreferences } from '../state/i18n';

const THEMES = [
  { id: 'default', label: '🐥 기본 (노란 병아리)', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)' },
  { id: 'pink', label: '🌸 핑크 모드', bg: 'linear-gradient(135deg, #2d1b2e, #1a0a1a)' },
  { id: 'green', label: '🌿 그린 모드', bg: 'linear-gradient(135deg, #0d2b1a, #0a1f12)' },
  { id: 'ocean', label: '🌊 오션 모드', bg: 'linear-gradient(135deg, #0a1628, #0d2137)' },
];

const FONT_SIZES = [
  { id: 'small', label: '작게', size: '13px' },
  { id: 'medium', label: '보통', size: '15px' },
  { id: 'large', label: '크게', size: '17px' },
];

export function Customize({ t }) {
  const navigate = useNavigate();
  const prefs = loadPreferences();
  const [selectedTheme, setSelectedTheme] = useState(prefs.theme || 'default');
  const [selectedFont, setSelectedFont] = useState(prefs.fontSize || 'medium');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePreferences({ ...prefs, theme: selectedTheme, fontSize: selectedFont });
    const fontObj = FONT_SIZES.find(f => f.id === selectedFont);
    if (fontObj) document.documentElement.style.setProperty('--base-font-size', fontObj.size);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="main-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflowY: 'auto', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '5px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '5px 12px' }}>
        ❮ 뒤로가기
      </button>

      <h1 className="glow-title" style={{ fontSize: '2.5rem', marginBottom: '30px' }}>{t('nav_customize')}</h1>

      <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* 테마 선택 */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', color: 'white' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>🎨 테마 선택</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {THEMES.map(theme => (
              <button key={theme.id} onClick={() => setSelectedTheme(theme.id)} style={{
                padding: '14px 18px', borderRadius: '10px', border: selectedTheme === theme.id ? '2px solid #f9a825' : '2px solid transparent',
                background: theme.bg, color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                {selectedTheme === theme.id && <span>✅</span>}
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* 폰트 크기 */}
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', color: 'white' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>🔤 글자 크기</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {FONT_SIZES.map(font => (
              <button key={font.id} onClick={() => setSelectedFont(font.id)} style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: selectedFont === font.id ? '2px solid #f9a825' : '2px solid rgba(255,255,255,0.2)',
                background: selectedFont === font.id ? 'rgba(249,168,37,0.2)' : 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer',
                fontSize: font.size
              }}>
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button className="clay-submit" onClick={handleSave} style={{ width: '100%', fontSize: '1.1rem', padding: '14px' }}>
          {saved ? '✅ 저장됐어 삐약!' : '💾 저장하기'}
        </button>
      </div>
    </div>
  );
}
