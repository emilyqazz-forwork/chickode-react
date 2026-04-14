import { useState } from 'react';

export function AuthModal({ onClose, t }) {
  const [tab, setTab] = useState('login'); // 'login' or 'register'
  
  const handleLogin = async () => {
    // Basic logic stub that matches vanilla
    const id = document.getElementById('loginId').value;
    const pw = document.getElementById('loginPw').value;
    const msgLabel = document.getElementById('loginMsg');
    
    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password: pw })
      });
      const data = await res.json();
      if(data.success) {
        msgLabel.innerText = data.message;
        msgLabel.style.color = '#55ff55';
        localStorage.setItem('chickode_user', JSON.stringify({ username: id, nickname: data.nickname }));
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 800);
      } else {
        msgLabel.innerText = data.message;
        msgLabel.style.color = '#ff5555';
      }
    } catch(e) {
      msgLabel.innerText = "서버 오류!";
      msgLabel.style.color = '#ff5555';
    }
  };

  const handleRegister = async () => {
    const id = document.getElementById('regId').value;
    const pw = document.getElementById('regPw').value;
    const nick = document.getElementById('regNickname').value;
    const msgLabel = document.getElementById('registerMsg');

    try {
      const res = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password: pw, nickname: nick })
      });
      const data = await res.json();
      if(data.success) {
        msgLabel.innerText = data.message;
        msgLabel.style.color = '#55ff55';
        setTimeout(() => setTab('login'), 1000);
      } else {
        msgLabel.innerText = data.message;
        msgLabel.style.color = '#ff5555';
      }
    } catch(e) {
      msgLabel.innerText = "서버 오류!";
      msgLabel.style.color = '#ff5555';
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content" style={{ width: '420px', textAlign: 'center' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>로그인</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>회원가입</button>
        </div>
        
        {tab === 'login' && (
          <div className="auth-form">
            <h2 className="modal-header">🐥 로그인</h2>
            <input type="text" id="loginId" className="setting-input" placeholder="아이디" style={{ width: '100%', marginBottom: '12px' }} />
            <input type="password" id="loginPw" className="setting-input" placeholder="비밀번호" style={{ width: '100%', marginBottom: '16px' }} />
            <button className="clay-submit" onClick={handleLogin} style={{ width: '100%' }}>로그인</button>
            <p id="loginMsg" className="auth-msg"></p>
          </div>
        )}

        {tab === 'register' && (
          <div className="auth-form">
            <h2 className="modal-header">🐣 회원가입</h2>
            <input type="text" id="regId" className="setting-input" placeholder="아이디 (3자 이상)" style={{ width: '100%', marginBottom: '12px' }} />
            <input type="password" id="regPw" className="setting-input" placeholder="비밀번호 (4자 이상)" style={{ width: '100%', marginBottom: '12px' }} />
            <input type="text" id="regNickname" className="setting-input" placeholder="닉네임" style={{ width: '100%', marginBottom: '16px' }} />
            <button className="clay-submit" onClick={handleRegister} style={{ width: '100%' }}>가입하기</button>
            <p id="registerMsg" className="auth-msg"></p>
          </div>
        )}
      </div>
    </div>
  );
}
