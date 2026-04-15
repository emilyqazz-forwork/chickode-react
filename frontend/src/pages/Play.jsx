import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { javaProblems } from '../data/problems';
import { addAttempt, getProfile } from '../state/app-state';
import { apiPost } from '../hooks/useApi';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';

const INIT_TERM = [
  { type: 'system', text: '> Chickode IDE Console v1.0.0' },
  { type: 'system', text: '> Ready for compilation...' },
];

export function Play({ t }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const settings = state || { count: 10, ratio: 50, chapter: 1, difficulty: '중' };

  const [list, setList] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState('');
  const [term, setTerm] = useState(INIT_TERM);
  const [chatLog, setChatLog] = useState([{ role: 'bot', text: '안녕! 첫 번째 문제야. 힘내보자 삐약!' }]);
  const [input, setInput] = useState('');
  const [hints, setHints] = useState(1);
  const [result, setResult] = useState({ text: t('quiz_result_wait'), color: '#d4d4d4' });
  const chatRef = useRef(null);

  useEffect(() => {
    if (settings.singleProblemId) {
      const p = javaProblems.find(p => p.id === settings.singleProblemId || p.title === settings.singleProblemId);
      if (p) { setList([p]); return; }
    }
    const { count, ratio, chapter, difficulty } = settings;
    let pool = javaProblems.filter(p => (p.chapter === chapter || chapter === 0) && p.difficulty === difficulty);
    if (!pool.length) pool = javaProblems.filter(p => p.chapter === chapter || chapter === 0);
    if (!pool.length) pool = javaProblems;

    const objN = Math.round(count * (ratio / 100));
    const objPool = pool.filter(p => p.type === 'ox' || p.type === 'multiple').sort(() => 0.5 - Math.random());
    const subPool = pool.filter(p => p.type === 'coding').sort(() => 0.5 - Math.random());
    const picked = [];
    for (let i = 0; i < objN; i++) objPool.length && picked.push(objPool[i % objPool.length]);
    for (let i = 0; i < count - objN; i++) subPool.length && picked.push(subPool[i % subPool.length]);
    setList(picked.sort(() => 0.5 - Math.random()));
  }, []);

  useEffect(() => {
    if (!list.length) return;
    setDone(false); setSelected(null);
    setCode(list[index].template || '');
    setTerm(INIT_TERM);
    setResult({ text: t('quiz_result_wait'), color: '#d4d4d4' });
    setHints(1);
    setChatLog(prev => [...prev, { role: 'bot', text: `${index + 1}번째 문제야. 힘내보자 삐약!` }]);
  }, [index, list]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatLog]);

  const termLog = (msg, type = 'system') => setTerm(prev => [...prev, { type, text: `> ${msg}` }]);

  const botMsg = (text) => setChatLog(prev => [...prev.filter(m => !m.thinking), { role: 'bot', text }]);
  const thinking = () => setChatLog(prev => [...prev, { role: 'bot', text: '생각중이야 삐약... 🤔', thinking: true }]);

  const onHint = async (level) => {
    if (level > hints) return;
    const problem = list[index];
    setChatLog(prev => [...prev, { role: 'user', text: `힌트 ${level}번 줘!` }]);
    thinking();
    try {
      const data = await apiPost('/generate-hint', { user_code: code, problem_context: problem.title, hint_level: level });
      botMsg(data.hint);
    } catch {
      botMsg(problem?.keywords?.length ? `키워드: '${problem.keywords[0]}' 삐약! (서버 미연결)` : `힌트 ${level} 삐약! (서버 미연결)`);
    }
    if (level < 3) setHints(level + 1);
  };

  const sendChat = async (q) => {
    const text = q || input.trim();
    if (!text) return;
    setInput('');
    setChatLog(prev => [...prev, { role: 'user', text }]);
    thinking();
    try {
      const data = await apiPost('/chat', { user_question: text, user_code: code, problem_context: list[index]?.title || '' });
      botMsg(data.answer);
    } catch {
      botMsg('서버와 연결되지 않아서 대답하기 어려워 삐약! 🐥');
    }
  };

  const onSubmit = () => {
    if (!list[index]) return;
    if (done) {
      if (index + 1 < list.length) setIndex(index + 1);
      else navigate('/result', { state: { total: list.length, correct: score } });
      return;
    }
    const problem = list[index];
    let ok = false;
    if (problem.type === 'multiple' || problem.type === 'ox') {
      if (!selected) { alert('답을 선택해주세요!'); return; }
      ok = selected === problem.answer;
    } else {
      ok = problem.keywords.every(kw => code.includes(kw));
    }

    addAttempt({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      problemId: problem.id, chapter: problem.chapter, type: problem.type,
      title: problem.title, desc: problem.desc, difficulty: problem.difficulty,
      keywords: problem.keywords || [],
      userCode: problem.type === 'coding' ? code : selected || '',
      expectedExample: problem.expectedExample || problem.answer || '',
      isCorrect: ok,
    });

    setDone(true);
    termLog('============================');
    termLog('Evaluating code...');
    setTimeout(() => {
      if (ok) {
        setScore(s => s + 1);
        termLog('Compile Success: 0 errors, 0 warnings', 'success');
        termLog('Result: O 정답입니다!', 'success');
        setResult({ text: '결과: 🎉 정답이야!', color: '#55ff55' });
        botMsg('정답! 아주 잘했어 삐약! 👏');
      } else {
        termLog('Result: X 오답입니다!', 'error');
        setResult({ text: '결과: ❌ 오답입니다!', color: '#ff5555' });
        botMsg('아쉽지만 오답이야... 다음엔 맞출 수 있을 거야! 🐥');
      }
    }, 500);
  };

  if (!list.length) return <div style={{ color: 'white', padding: '50px' }}>Loading...</div>;
  const problem = list[index];
  const savedUser = JSON.parse(localStorage.getItem('chickode_user') || 'null');
  const nickname = savedUser ? savedUser.nickname : getProfile().name;

  return (
    <div className="coding-view" style={{ display: 'flex' }}>
      <nav className="top-nav">
        <button onClick={() => navigate(-1)}>❮</button>
        <div className="logo">CHICKODE</div>
        <div className="top-right-group">
          <span className="chapter-badge">Chapter {settings.chapter}</span>
          <div className="user-tag">👤 {nickname} 님</div>
        </div>
      </nav>
      <main className="content">
        <div className="left">
          <div className="problem-card">
            <h3>[{index + 1}/{list.length}] {problem.title}</h3>
            <p>{problem.desc}</p>
          </div>
          <div className="hints">
            {[1, 2, 3].map(lv => (
              <button key={lv} className={`hint-box ${lv > hints ? 'locked' : ''}`} onClick={() => onHint(lv)}>
                <span>{lv > hints ? '🔒' : '🔓'}</span>
                <span>{t(`hint_${lv}`)}</span>
              </button>
            ))}
          </div>
          <img src="/images/chick.png" alt="병아리 선배" className="big-chick" />
        </div>

        <div className="center">
          {problem.type === 'coding' ? (
            <div className="editor">
              <CodeMirror value={code} height="300px" extensions={[java()]} theme={oneDark} onChange={setCode} />
            </div>
          ) : (
            <div className="mcq-container" style={{ display: 'flex' }}>
              <div className="mcq-options">
                {problem.options.map((opt, i) => (
                  <button key={i} className={`mcq-option-btn ${selected === opt ? 'selected' : ''}`} onClick={() => { if (!done) setSelected(opt); }}>
                    {problem.type === 'ox' ? opt : `${i + 1}. ${opt}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="terminal-container">
            <div className="terminal-header">
              <span>Terminal</span>
              <span style={{ color: result.color }}>{result.text}</span>
            </div>
            <div className="terminal-output">
              {term.map((l, i) => <div key={i} className={`term-line ${l.type}`}>{l.text}</div>)}
            </div>
          </div>
          <div className="footer" style={{ marginTop: 'auto' }}>
            <button className="clay-submit" onClick={onSubmit} style={{ width: '100%' }}>
              {done ? (index + 1 < list.length ? '다음 문제 ➔' : '결과 보기 ➔') : t('btn_submit')}
            </button>
          </div>
        </div>

        <div className="right">
          <div className="chat-container">
            <div className="chat-display" ref={chatRef}>
              {chatLog.map((m, i) => (
                <div key={i} className={`msg-row ${m.role === 'bot' ? 'bot-msg' : 'user-msg'}`}>
                  {m.role === 'bot' && <div className="avatar"><img src="/images/chick.png" alt="병아리" /></div>}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'bot' ? 'flex-start' : 'flex-end', maxWidth: '75%' }}>
                    <div className="msg-meta">{m.role === 'bot' ? '병아리 선배 🐥' : '나'}</div>
                    <div className="bubble">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input type="text" placeholder={t('chat_placeholder')} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} />
              <button onClick={() => sendChat()}>{t('btn_send')}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
