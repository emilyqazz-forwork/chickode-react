import { useState } from 'react';
import { apiPost } from '../hooks/useApi';

export function AuthModal({ onClose, t }) {
  const [tab, setTab] = useState('login');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [nick, setNick] = useState('');
  const [msg, setMsg] = useState({ text: '', ok: false });

  const setOk = (text) => setMsg({ text, ok: true });
  const setErr = (text) => setMsg({ text, ok: false });

  const onLogin = async () => {
    try {
      const data = await apiPost('/login', { username: id, password: pw });
      if (data.success) {
        setOk(data.message);
        localStorage.setItem('chickode_user', JSON.stringify({ username: id, nickname: data.nickname }));
        setTimeout(() => { onClose(); window.location.reload(); }, 800);
      } else setErr(data.message);
    } catch { setErr('서버 오류!'); }
  };

  const onRegister = async () => {
    try {
      const data = await apiPost('/register', { username: id, password: pw, nickname: nick });
      if (data.success) { setOk(data.message); setTimeout(() => setTab('login'), 1000); }
      else setErr(data.message);
    } catch { setErr('서버 오류!'); }
  };

  const reset = (t) => { setId(''); setPw(''); setNick(''); setMsg({ text: '', ok: false }); setTab(t); };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ width: '420px', textAlign: 'center' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => reset('login')}>로그인</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => reset('register')}>회원가입</button>
        </div>

        <div className="auth-form">
          <h2 className="modal-header">{tab === 'login' ? '🐥 로그인' : '🐣 회원가입'}</h2>
          <input type="text" className="setting-input" placeholder="아이디" value={id} onChange={e => setId(e.target.value)} style={{ width: '100%', marginBottom: '12px' }} />
          <input type="password" className="setting-input" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? onLogin() : onRegister())} style={{ width: '100%', marginBottom: '12px' }} />
          {tab === 'register' && (
            <input type="text" className="setting-input" placeholder="닉네임" value={nick} onChange={e => setNick(e.target.value)} style={{ width: '100%', marginBottom: '12px' }} />
          )}
          <button className="clay-submit" onClick={tab === 'login' ? onLogin : onRegister} style={{ width: '100%' }}>
            {tab === 'login' ? '로그인' : '가입하기'}
          </button>
          {msg.text && <p className="auth-msg" style={{ color: msg.ok ? '#55ff55' : '#ff5555' }}>{msg.text}</p>}
        </div>
      </div>
    </div>
  );
}
