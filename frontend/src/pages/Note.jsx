import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttempts } from '../state/app-state';
import { apiPost } from '../hooks/useApi';
import { getTip, whyWrong } from '../data/tips';

const TYPE_LABEL = { multiple: '객관식', coding: '실습 코딩', ox: 'O/X 퀴즈' };

export function Note({ t }) {
  const [chapter, setChapter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [items, setItems] = useState([]);
  const [chMap, setChMap] = useState({});
  const [wrongMap, setWrongMap] = useState({});
  const [aiModal, setAiModal] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const all = getAttempts().filter(a => a && !a.isCorrect);
    const wMap = {}, cMap = {};
    for (const a of all) {
      const pid = a.problemId || a.title;
      wMap[pid] = (wMap[pid] || 0) + 1;
      if (a.chapter) cMap[a.chapter] = (cMap[a.chapter] || 0) + 1;
    }
    setWrongMap(wMap); setChMap(cMap); setItems(all);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatLog]);

  const openAI = (attempt) => {
    setAiModal(attempt);
    setChatLog([{ role: 'bot', text: `'${attempt.title}' 문제 궁금한 거 물어봐! 삐약! 🐥` }]);
    setInput('');
  };

  const sendChat = async () => {
    if (!input.trim() || !aiModal) return;
    const text = input.trim();
    setInput('');
    setChatLog(prev => [...prev, { role: 'user', text }, { role: 'bot', text: '생각중이야 삐약... 🤔', thinking: true }]);
    try {
      const data = await apiPost('/chat', { user_question: text, user_code: aiModal.userCode || '', problem_context: aiModal.title || '' });
      setChatLog(prev => [...prev.filter(m => !m.thinking), { role: 'bot', text: data.answer }]);
    } catch {
      setChatLog(prev => [...prev.filter(m => !m.thinking), { role: 'bot', text: '서버와 연결되지 않아서 어려워 삐약! 🐥' }]);
    }
  };

  const getList = () => {
    let filtered = chapter === 'all' ? items : items.filter(a => String(a.chapter) === String(chapter));
    if (sort === 'newest') return [...filtered].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    if (sort === 'oldest') return [...filtered].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    if (sort === 'mostWrong') return [...filtered].sort((a, b) => (wrongMap[b.problemId || b.title] || 0) - (wrongMap[a.problemId || a.title] || 0));
    return filtered;
  };

  const list = getList();

  return (
    <div className="note-container" style={{ paddingTop: '20px', position: 'relative' }}>
      <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '5px', color: 'white', fontSize: '1.2rem', cursor: 'pointer', padding: '5px 12px' }}>
        ❮ 뒤로가기
      </button>
      <main className="note-book">
        <div className="book-title-tag">CHICKODE: 오답노트</div>
        <div className="book-content">
          <aside className="chapter-sidebar">
            <div className="sidebar-section-title">정렬</div>
            <div className="sort-btn-group">
              {[['newest', '최신순'], ['oldest', '오래된 순'], ['mostWrong', '많이 틀린 순']].map(([val, label]) => (
                <button key={val} className={`sort-btn ${sort === val ? 'active' : ''}`} onClick={() => setSort(val)}>{label}</button>
              ))}
            </div>
            <div className="sidebar-divider" />
            <div className="sidebar-section-title">챕터</div>
            <button className={`chapter-btn ${chapter === 'all' ? 'active' : ''}`} onClick={() => setChapter('all')}>전체 ({items.length})</button>
            {Object.keys(chMap).sort((a, b) => parseInt(a) - parseInt(b)).map(ch => (
              <button key={ch} className={`chapter-btn ${chapter === ch ? 'active' : ''}`} onClick={() => setChapter(ch)}>챕터 {ch} ({chMap[ch]})</button>
            ))}
          </aside>

          <section className="wrong-answer-area">
            <h3 className="area-title">오답 모음</h3>
            {!list.length && <div className="tip-box">아직 오답이 없어! 문제를 풀고 틀리면 여기에 저장돼.</div>}
            <div className="wrong-item-container">
              {list.map(a => (
                <div key={a.id} className="wrong-card">
                  <div className="card-info">
                    <div className="info-box">챕터<strong>{a.chapter ?? '-'}</strong></div>
                    <div className="info-box">유형<strong>{TYPE_LABEL[a.type] || '미분류'}</strong></div>
                    <div className="info-box">난이도<strong>{a.difficulty || '기본'}</strong></div>
                    <div className="info-box" style={{ color: '#d32f2f' }}>틀린 횟수<strong>{wrongMap[a.problemId || a.title] || 1}회</strong></div>
                    <div className="info-box">일시<strong style={{ fontSize: '0.8rem' }}>{new Date(a.createdAt ?? Date.now()).toLocaleString()}</strong></div>
                  </div>
                  <div style={{ marginBottom: '12px', fontWeight: 'bold', fontSize: '1.05rem', color: '#3e2723', padding: '8px 0', borderBottom: '1px dashed #c8b89a' }}>
                    {a.title ?? '문제'}
                  </div>
                  {a.type === 'multiple' || a.type === 'ox' ? (
                    <div className="answer-compare">
                      <div className="answer-box my-answer"><span className="box-label">내가 쓴 답</span>{a.userCode || '미제출'}</div>
                      <div className="answer-box correct-answer"><span className="box-label">정답</span>{a.expectedExample || '-'}</div>
                    </div>
                  ) : (
                    <div className="code-compare">
                      <div className="code-box"><span className="box-label">내가 쓴 답</span><pre><code>{a.userCode || '(없음)'}</code></pre></div>
                      <div className="code-box"><span className="box-label">정답</span><pre><code>{a.expectedExample || '(없음)'}</code></pre></div>
                    </div>
                  )}
                  <div className="why-wrong-box"><span className="box-label">왜 틀렸을까?</span>{whyWrong(a)}</div>
                  <div className="tip-box">{getTip(a)}</div>
                  <div className="action-btn-group">
                    <button className="action-btn retry-btn" onClick={() => navigate('/play', { state: { singleProblemId: a.problemId || a.title } })}>다시 풀기</button>
                    <button className="action-btn ai-btn" onClick={() => openAI(a)}>AI에게 질문</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {aiModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} onClick={e => { if (e.target === e.currentTarget) setAiModal(null); }}>
          <div className="modal-content" style={{ width: '480px', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
            <button className="close-btn" onClick={() => setAiModal(null)}>&times;</button>
            <h2 className="modal-header">🐥 AI에게 질문</h2>
            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '12px' }}>{aiModal.title}</p>
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              {chatLog.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'bot' ? 'flex-start' : 'flex-end' }}>
                  <div style={{ maxWidth: '80%', padding: '8px 12px', borderRadius: '12px', background: m.role === 'bot' ? 'rgba(255,255,255,0.15)' : '#f9a825', color: 'white', fontSize: '0.9rem' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" className="setting-input" placeholder="병아리 선배에게 질문하기..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} style={{ flex: 1 }} />
              <button className="clay-submit" onClick={sendChat} style={{ padding: '8px 16px' }}>전송</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
