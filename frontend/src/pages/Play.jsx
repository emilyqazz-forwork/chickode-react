import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { javaProblems } from '../data/problems';
import { addAttempt, getProfile } from '../state/app-state';

export function Play({ t }) {
  const location = useLocation();
  const navigate = useNavigate();
  const settings = location.state || { count: 10, ratio: 50, chapter: 1, difficulty: '중' };
  
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [termOutput, setTermOutput] = useState([
    { type: 'system', text: '> Chickode IDE Console v1.0.0' },
    { type: 'system', text: '> Ready for compilation...' }
  ]);
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: '안녕! 첫 번째 문제야. 힘내보자 삐약!' }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [hintUnlocks, setHintUnlocks] = useState(1);
  const [resultStatus, setResultStatus] = useState(t('quiz_result_wait'));
  const [resultColor, setResultColor] = useState('#d4d4d4');

  const editorRef = useRef(null);
  const cmInstance = useRef(null);
  const chatDisplayRef = useRef(null);

  useEffect(() => {
    if (settings.singleProblemId) {
      const targetProblem = javaProblems.find(p => p.id === settings.singleProblemId || p.title === settings.singleProblemId);
      if (targetProblem) {
        setQuizList([targetProblem]);
        return;
      }
    }

    // Generate quiz list
    const { count, ratio, chapter, difficulty } = settings;
    let pool = javaProblems.filter(p => (p.chapter === chapter || chapter === 0) && p.difficulty === difficulty);
    if (pool.length === 0) pool = javaProblems.filter(p => p.chapter === chapter || chapter === 0);
    if (pool.length === 0) pool = javaProblems;

    const objPercent = ratio;
    const objCount = Math.round(count * (objPercent / 100));
    const subCount = count - objCount;
    const objPool = pool.filter(p => p.type === 'ox' || p.type === 'multiple').sort(() => 0.5 - Math.random());
    const subPool = pool.filter(p => p.type === 'coding').sort(() => 0.5 - Math.random());

    let list = [];
    if (objPool.length > 0) for(let i=0; i<objCount; i++) list.push(objPool[i % objPool.length]);
    if (subPool.length > 0) for(let i=0; i<subCount; i++) list.push(subPool[i % subPool.length]);
    list.sort(() => 0.5 - Math.random());
    
    setQuizList(list);
  }, []);

  useEffect(() => {
    if (quizList.length === 0) return;
    const currentProblem = quizList[currentIndex];
    
    // reset turn state
    setIsSubmitted(false);
    setSelectedOption(null);
    setTermOutput([
      { type: 'system', text: '> Chickode IDE Console v1.0.0' },
      { type: 'system', text: '> Ready for compilation...' }
    ]);
    setResultStatus(t('quiz_result_wait'));
    setResultColor('#d4d4d4');
    setHintUnlocks(1);

    setChatHistory(prev => [...prev, { role: 'bot', text: `안녕! ${currentIndex + 1}번째 문제야. 힘내보자 삐약!` }]);

    if (currentProblem.type === 'coding') {
      if (window.CodeMirror && editorRef.current && !cmInstance.current) {
        cmInstance.current = window.CodeMirror.fromTextArea(editorRef.current, {
          mode: "text/x-java",
          lineNumbers: true,
          autoCloseBrackets: true,
          matchBrackets: true,
          theme: "default" // or darcula if preferred
        });
      }
      setTimeout(() => {
        if (cmInstance.current) {
          cmInstance.current.setValue(currentProblem.template);
          cmInstance.current.refresh();
        }
      }, 50);
    }
  }, [currentIndex, quizList]);

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const addTermLog = (msg, type='system') => {
    setTermOutput(prev => [...prev, { type, text: `> ${msg}` }]);
  };

  const handleHintClick = async (level) => {
    if (level > hintUnlocks) return;
    
    const currentProblem = quizList[currentIndex];
    setChatHistory(prev => [...prev, { role: 'user', text: `힌트 ${level}번 줘 삐약!` }]);
    setChatHistory(prev => [...prev, { role: 'bot', text: '힌트를 열심히 생각하는 중이야... 🐣', thinking: true }]);
    
    try {
      const codeValue = cmInstance.current ? cmInstance.current.getValue() : '';
      const res = await fetch('http://localhost:8000/generate-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: codeValue, problem_context: currentProblem.title, hint_level: level })
      });
      const data = await res.json();
      setChatHistory(prev => {
        const next = prev.filter(m => !m.thinking);
        next.push({ role: 'bot', text: data.hint });
        return next;
      });
      if (level < 3) setHintUnlocks(level + 1);
    } catch(e) {
      setChatHistory(prev => {
        const next = prev.filter(m => !m.thinking);
        const mockHint = currentProblem?.keywords?.length 
            ? `이 문제의 핵심 키워드 중 하나는 '${currentProblem.keywords[0]}'야! 삐약! (서버 미연결)` 
            : `이건 ${level}번째 힌트야! 삐약! (서버 미연결)`;
        next.push({ role: 'bot', text: mockHint });
        return next;
      });
      if (level < 3) setHintUnlocks(level + 1);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text }]);
    setChatHistory(prev => [...prev, { role: 'bot', text: '생각중이야 삐약... 🤔', thinking: true }]);

    try {
      const currentProblem = quizList[currentIndex];
      const codeValue = cmInstance.current ? cmInstance.current.getValue() : '';
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_question: text, user_code: codeValue, problem_context: currentProblem?.title || "" })
      });
      const data = await res.json();
      setChatHistory(prev => {
        const next = prev.filter(m => !m.thinking);
        next.push({ role: 'bot', text: data.answer });
        return next;
      });
    } catch(e) {
      setChatHistory(prev => {
        const next = prev.filter(m => !m.thinking);
        next.push({ role: 'bot', text: "지금은 서버와 연결되지 않아서 대답하기 어려워 삐약! 🐥" });
        return next;
      });
    }
  };

  const handleSubmit = () => {
    if (!quizList[currentIndex]) return;
    
    if (isSubmitted) {
      if (currentIndex + 1 < quizList.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Go to result
        navigate('/result', { state: { total: quizList.length, correct: correctCount } });
      }
      return;
    }

    let isCorrect = false;
    const currentProblem = quizList[currentIndex];
    const codeValue = cmInstance.current ? cmInstance.current.getValue() : '';

    if (currentProblem.type === 'multiple' || currentProblem.type === 'ox') {
      if (!selectedOption) { alert("답을 선택해주세요!"); return; }
      isCorrect = (selectedOption === currentProblem.answer);
    } else {
      isCorrect = currentProblem.keywords.every(kw => codeValue.includes(kw));
    }

    addAttempt({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      problemId: currentProblem.id,
      chapter: currentProblem.chapter,
      type: currentProblem.type,
      title: currentProblem.title,
      desc: currentProblem.desc,
      difficulty: currentProblem.difficulty,
      keywords: currentProblem.keywords || [],
      userCode: currentProblem.type === 'coding' ? codeValue : selectedOption || "",
      expectedExample: currentProblem.expectedExample || currentProblem.answer || "",
      isCorrect
    });

    setIsSubmitted(true);
    addTermLog("============================", "system");
    addTermLog("Evaluating code...", "system");

    setTimeout(() => {
      if (isCorrect) {
        setCorrectCount(c => c + 1);
        addTermLog("Compile Success: 0 errors, 0 warnings", "success");
        addTermLog("Output: [정상 실행됨]", "success");
        addTermLog("Result: O 정답입니다!", "success");
        setResultStatus("결과: 🎉 정답이야!");
        setResultColor("#55ff55");
        setChatHistory(prev => [...prev, { role: 'bot', text: "정답! 아주 잘했어 삐약! 👏" }]);
      } else {
        addTermLog("Compile/Execution finished.", "system");
        addTermLog("Output: 예상결과와 다름!", "error");
        addTermLog("Result: X 오답입니다!", "error");
        setResultStatus("결과: ❌ 오답입니다!");
        setResultColor("#ff5555");
        setChatHistory(prev => [...prev, { role: 'bot', text: "아쉽지만 오답이야... 다음 번엔 맞출 수 있을 거야! 🐥" }]);
      }
    }, 500);
  };

  if(!quizList.length) return <div style={{color:'white', padding: '50px'}}>Loading...</div>;
  const currentProblem = quizList[currentIndex];
  const profile = getProfile();
  const savedUser = JSON.parse(localStorage.getItem('chickode_user') || 'null');
  const nickname = savedUser ? savedUser.nickname : profile.name;

  return (
    <div className="coding-view" style={{ display: 'flex' }}>
      <nav className="top-nav">
        <button id="backToMain" title="돌아가기" onClick={() => navigate(-1)}>❮</button>
        <div className="logo">CHICKODE</div>
        <div className="top-right-group">
          <span className="chapter-badge">Chapter {settings.chapter}</span>
          <div className="user-tag">👤 {nickname} 님</div>
        </div>
      </nav>
      <main className="content">
        <div className="left">
          <div className="problem-card">
            <h3>[{currentIndex + 1}/{quizList.length}] {currentProblem.title}</h3>
            <p>{currentProblem.desc}</p>
          </div>
          <div className="hints">
            {[1, 2, 3].map(level => (
              <button 
                key={level} 
                className={`hint-box ${level > hintUnlocks ? 'locked' : ''}`} 
                onClick={() => handleHintClick(level)}
              >
                <span className="lock-icon">{level > hintUnlocks ? '🔒' : '🔓'}</span> 
                <span>{t(`hint_${level}`)}</span>
              </button>
            ))}
          </div>
          <img src="/images/chick.png" alt="병아리 선배" className="big-chick" />
        </div>

        <div className="center">
          <div className="editor" style={{ display: currentProblem.type === 'coding' ? 'block' : 'none' }}>
            <textarea ref={editorRef} defaultValue={currentProblem.template} />
          </div>

          <div className="mcq-container" style={{ display: currentProblem.type !== 'coding' ? 'flex' : 'none' }}>
            <div className="mcq-options">
              {currentProblem.type !== 'coding' && currentProblem.options.map((opt, i) => (
                <button 
                  key={i} 
                  className={`mcq-option-btn ${selectedOption === opt ? 'selected' : ''}`}
                  onClick={() => { if(!isSubmitted) setSelectedOption(opt); }}
                >
                  {currentProblem.type === 'ox' ? opt : `${i + 1}. ${opt}`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="terminal-container">
            <div className="terminal-header">
              <span>Terminal</span>
              <span style={{ color: resultColor }}>{resultStatus}</span>
            </div>
            <div className="terminal-output">
              {termOutput.map((l, i) => (
                <div key={i} className={`term-line ${l.type}`}>{l.text}</div>
              ))}
            </div>
          </div>

          <div className="footer" style={{ marginTop: 'auto' }}>
            <button className="clay-submit" onClick={handleSubmit} style={{ width: '100%' }}>
              {isSubmitted 
                ? (currentIndex + 1 < quizList.length ? "다음 문제 ➔" : "결과 보기 ➔") 
                : t('btn_submit')}
            </button>
          </div>
        </div>

        <div className="right">
          <div className="chat-container">
            <div className="chat-display" ref={chatDisplayRef}>
              {chatHistory.map((m, i) => (
                <div key={i} className={`msg-row ${m.role === 'bot' ? 'bot-msg' : 'user-msg'}`}>
                  {m.role === 'bot' && <div className="avatar"><img src="/images/chick.png" alt="병아리" /></div>}
                  <div style={{ display:'flex', flexDirection:'column', alignItems: m.role==='bot'?'flex-start':'flex-end', maxWidth:'75%' }}>
                    <div className="msg-meta">{m.role === 'bot' ? "병아리 선배 🐥" : "나"}</div>
                    <div className="bubble">{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chat-input-area">
              <input 
                type="text" 
                placeholder={t('chat_placeholder')} 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()} 
              />
              <button onClick={handleSendChat}>{t('btn_send')}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
