import { addAttempt, getProfile, getAttempts } from "./app-state.js";
import { applyLanguage, applyTheme, loadPreferences, translations } from "./i18n.js";

// --- 1. 요소 가져오기 ---
const playBtn = document.getElementById('playBtn');
const navPlayBtn = document.getElementById('navPlayBtn');
const modal = document.getElementById('chapterModal');
const chapterItems = document.querySelectorAll('.chapter-item');
const mainContainer = document.querySelector('.main-container');
const globalSettingsModal = document.getElementById('globalSettingsModal');
const globalSettingsBtn = document.getElementById('globalSettingsBtn');
const themeSelect = document.getElementById('themeSelect');
const langSelect = document.getElementById('langSelect');
const saveGlobalSettingsBtn = document.getElementById('saveGlobalSettingsBtn');
const globalMenuBtn = document.getElementById('globalMenuBtn');
const quizSettingModal = document.getElementById('quizSettingModal');
const ratioSlider = document.getElementById('ratioSlider');
const objRatioLabel = document.getElementById('objRatioLabel');
const subjRatioLabel = document.getElementById('subjRatioLabel');
const questionCountInput = document.getElementById('questionCount');
const difficultySelect = document.getElementById('difficultySelect');
const startQuizBtn = document.getElementById('startQuizBtn');
const codingScreen = document.getElementById('codingScreen');
const backBtn = document.getElementById('backToMain');
const chapterBadge = document.getElementById('chapterBadge');
const problemTitle = document.getElementById('problemTitle');
const problemDesc = document.getElementById('problemDesc');
const resultStatus = document.getElementById('resultStatus');
const submitBtn = document.getElementById('mainSubmitBtn');
const editorContainer = document.getElementById('editorContainer');
const codeEditor = document.getElementById('codeEditor');
const multipleChoiceArea = document.getElementById('multipleChoiceArea');
const mcqOptions = document.getElementById('mcqOptions');
const chatDisplay = document.getElementById('chatDisplay');
const userInput = document.getElementById('userInput');
const userTag = document.getElementById('userTag');
const resultScreen = document.getElementById('resultScreen');
const resTotal = document.getElementById('resTotal');
const resCorrect = document.getElementById('resCorrect');
const resAccuracy = document.getElementById('resAccuracy');
const goHomeBtn = document.getElementById('goHomeBtn');
const authModal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// --- 2. 자바 문제 데이터 ---
const javaProblems = [
    // ===== Chapter 1: 변수 =====
    { id: "ch1-subj-001", chapter: 1, type: "coding", difficulty: "하", title: "01. 변수 기본 선언", desc: "정수 타입 'age'에 20을 대입하세요.", template: "int age = ", keywords: ["int", "age", "20", ";"], expectedExample: "int age = 20;" },
    { id: "ch1-subj-002", chapter: 1, type: "coding", difficulty: "하", title: "01. 문자열 변수 선언", desc: "String 타입 변수 'name'에 \"Java\"를 대입하세요.", template: "String name = ", keywords: ["String", "name", "Java", ";"], expectedExample: "String name = \"Java\";" },
    { id: "ch1-subj-003", chapter: 1, type: "coding", difficulty: "중", title: "01. 실수 변수 선언", desc: "double 타입 변수 'pi'에 3.14를 대입하세요.", template: "double pi = ", keywords: ["double", "pi", "3.14", ";"], expectedExample: "double pi = 3.14;" },
    { id: "ch1-subj-004", chapter: 1, type: "coding", difficulty: "중", title: "01. 불리언 변수 선언", desc: "boolean 타입 변수 'isJava'에 true를 대입하세요.", template: "boolean isJava = ", keywords: ["boolean", "isJava", "true", ";"], expectedExample: "boolean isJava = true;" },
    { id: "ch1-subj-005", chapter: 1, type: "coding", difficulty: "상", title: "01. 변수 덧셈", desc: "int a = 5, b = 3을 선언하고 두 값의 합을 int c에 저장하세요.", template: "int a = 5;\nint b = 3;\nint c = ", keywords: ["int", "a", "b", "c", "5", "3", "+", ";"], expectedExample: "int a = 5;\nint b = 3;\nint c = a + b;" },
    { id: "ch1-obj-001", chapter: 1, type: "multiple", difficulty: "하", title: "01. 변수란?", desc: "다음 중 자바에서 변수에 대한 설명으로 옳은 것은?", options: ["데이터를 담는 그릇이다.", "에러를 표시하는 알림이다.", "자바를 종료하는 명령어다.", "클래스를 의미한다."], answer: "데이터를 담는 그릇이다." },
    { id: "ch1-obj-002", chapter: 1, type: "multiple", difficulty: "하", title: "01. 올바른 변수 타입", desc: "실수(소수점)를 저장할 때 사용하는 타입은?", options: ["int", "double", "String", "boolean"], answer: "double" },
    { id: "ch1-obj-003", chapter: 1, type: "multiple", difficulty: "중", title: "01. 변수 명명 규칙", desc: "자바에서 변수 이름으로 사용할 수 없는 것은?", options: ["myAge", "_count", "2ndName", "firstName"], answer: "2ndName" },
    { id: "ch1-obj-004", chapter: 1, type: "multiple", difficulty: "중", title: "01. 자료형 크기", desc: "자바에서 정수를 저장하는 기본 타입은?", options: ["float", "int", "char", "String"], answer: "int" },
    { id: "ch1-obj-005", chapter: 1, type: "multiple", difficulty: "상", title: "01. 형변환", desc: "int를 double로 변환할 때 올바른 방법은?", options: ["(double) myInt", "(int) myDouble", "String(myInt)", "float(myInt)"], answer: "(double) myInt" },
    { id: "ch1-ox-001", chapter: 1, type: "ox", difficulty: "하", title: "01. 변수 초기화", desc: "자바에서 지역변수는 선언 후 반드시 초기화해야 사용할 수 있다.", options: ["O", "X"], answer: "O" },
    { id: "ch1-ox-002", chapter: 1, type: "ox", difficulty: "중", title: "01. 변수 호환성", desc: "int 타입 변수에는 실수를 저장할 수 있다.", options: ["O", "X"], answer: "X" },
    { id: "ch1-ox-003", chapter: 1, type: "ox", difficulty: "상", title: "01. final 변수", desc: "final로 선언된 변수는 값을 변경할 수 없다.", options: ["O", "X"], answer: "O" },

    // ===== Chapter 2: 출력 =====
    { id: "ch2-subj-001", chapter: 2, type: "coding", difficulty: "하", title: "02. 출력하기", desc: "System.out.print()를 사용해 \"Hello\"를 출력하세요.", template: "System.out.print(", keywords: ["System.out.print", "Hello", ";"], expectedExample: "System.out.print(\"Hello\");" },
    { id: "ch2-subj-002", chapter: 2, type: "coding", difficulty: "하", title: "02. 줄바꿈 출력", desc: "System.out.println()을 사용해 \"Java\"를 출력하세요.", template: "System.out.println(", keywords: ["System.out.println", "Java", ";"], expectedExample: "System.out.println(\"Java\");" },
    { id: "ch2-subj-003", chapter: 2, type: "coding", difficulty: "중", title: "02. 변수 출력", desc: "int num = 42를 선언하고 num을 출력하세요.", template: "int num = 42;\nSystem.out.println(", keywords: ["int", "num", "42", "System.out.println", ";"], expectedExample: "int num = 42;\nSystem.out.println(num);" },
    { id: "ch2-subj-004", chapter: 2, type: "coding", difficulty: "중", title: "02. 문자열 연결 출력", desc: "\"Hello\"와 \"Java\"를 + 연산자로 연결해서 출력하세요.", template: "System.out.println(", keywords: ["System.out.println", "Hello", "Java", "+", ";"], expectedExample: "System.out.println(\"Hello\" + \"Java\");" },
    { id: "ch2-subj-005", chapter: 2, type: "coding", difficulty: "상", title: "02. 포맷 출력", desc: "printf를 사용해 이름과 나이를 출력하세요. (name=\"Kim\", age=20)", template: "String name = \"Kim\";\nint age = 20;\nSystem.out.printf(", keywords: ["printf", "name", "age", ";"], expectedExample: "System.out.printf(\"%s는 %d살\", name, age);" },
    { id: "ch2-obj-001", chapter: 2, type: "multiple", difficulty: "하", title: "02. 줄바꿈 출력 명령어", desc: "출력 후 줄바꿈을 해주는 명령어는?", options: ["System.out.print()", "System.out.println()", "System.in.read()", "console.log()"], answer: "System.out.println()" },
    { id: "ch2-obj-002", chapter: 2, type: "multiple", difficulty: "하", title: "02. 출력 명령어", desc: "줄바꿈 없이 출력하는 명령어는?", options: ["System.out.println()", "System.out.print()", "System.out.write()", "System.err.print()"], answer: "System.out.print()" },
    { id: "ch2-obj-003", chapter: 2, type: "multiple", difficulty: "중", title: "02. printf 형식", desc: "정수를 출력하는 printf 서식 문자는?", options: ["%s", "%f", "%d", "%c"], answer: "%d" },
    { id: "ch2-obj-004", chapter: 2, type: "multiple", difficulty: "중", title: "02. 문자열 서식", desc: "문자열을 출력하는 printf 서식 문자는?", options: ["%d", "%s", "%f", "%b"], answer: "%s" },
    { id: "ch2-obj-005", chapter: 2, type: "multiple", difficulty: "상", title: "02. 출력 스트림", desc: "에러 메시지 출력에 사용하는 스트림은?", options: ["System.out", "System.in", "System.err", "System.log"], answer: "System.err" },
    { id: "ch2-ox-001", chapter: 2, type: "ox", difficulty: "하", title: "02. println 줄바꿈", desc: "System.out.println()은 출력 후 자동으로 줄바꿈을 한다.", options: ["O", "X"], answer: "O" },
    { id: "ch2-ox-002", chapter: 2, type: "ox", difficulty: "중", title: "02. 에러 출력 색상", desc: "System.err로 출력된 문자열은 보통 IDE 콘솔에서 빨간색으로 표시된다.", options: ["O", "X"], answer: "O" },
    { id: "ch2-ox-003", chapter: 2, type: "ox", difficulty: "상", title: "02. print와 println 차이", desc: "System.out.print()와 System.out.println()의 출력 결과는 항상 동일하다.", options: ["O", "X"], answer: "X" },

    // ===== Chapter 3: 조건문 =====
    { id: "ch3-subj-001", chapter: 3, type: "coding", difficulty: "하", title: "03. if문 기초", desc: "score가 90 이상일 때 \"합격\"을 출력하는 if문을 완성하세요.", template: "if (score >= 90) {\n    \n}", keywords: ["System.out.print", "합격"], expectedExample: "if (score >= 90) { System.out.println(\"합격\"); }" },
    { id: "ch3-subj-002", chapter: 3, type: "coding", difficulty: "하", title: "03. if-else문", desc: "num이 0보다 크면 \"양수\", 아니면 \"음수\"를 출력하세요.", template: "if (num > 0) {\n    \n} else {\n    \n}", keywords: ["양수", "음수", "System.out.print"], expectedExample: "if (num > 0) { System.out.println(\"양수\"); } else { System.out.println(\"음수\"); }" },
    { id: "ch3-subj-003", chapter: 3, type: "coding", difficulty: "중", title: "03. 중첩 if문", desc: "score가 90 이상이면 \"A\", 80 이상이면 \"B\", 그 외는 \"C\"를 출력하세요.", template: "if (score >= 90) {\n    \n} else if (score >= 80) {\n    \n} else {\n    \n}", keywords: ["A", "B", "C", "System.out.print"], expectedExample: "if (score >= 90) { System.out.println(\"A\"); } else if (score >= 80) { System.out.println(\"B\"); } else { System.out.println(\"C\"); }" },
    { id: "ch3-subj-004", chapter: 3, type: "coding", difficulty: "중", title: "03. switch문", desc: "day가 1일 때 \"월요일\"을 출력하는 switch문을 작성하세요.", template: "switch (day) {\n    case 1:\n        \n        break;\n}", keywords: ["switch", "case", "월요일", "break"], expectedExample: "switch (day) { case 1: System.out.println(\"월요일\"); break; }" },
    { id: "ch3-subj-005", chapter: 3, type: "coding", difficulty: "상", title: "03. 삼항 연산자", desc: "num이 짝수면 \"짝수\", 홀수면 \"홀수\"를 출력하는 삼항 연산자를 작성하세요.", template: "String result = (num % 2 == 0) ? ", keywords: ["짝수", "홀수", "%", "?", ":"], expectedExample: "String result = (num % 2 == 0) ? \"짝수\" : \"홀수\";" },
    { id: "ch3-obj-001", chapter: 3, type: "multiple", difficulty: "하", title: "03. 조건문 키워드", desc: "조건식이 참일 때 실행되는 블록은 어떤 키워드로 시작하나요?", options: ["for", "else", "if", "break"], answer: "if" },
    { id: "ch3-obj-002", chapter: 3, type: "multiple", difficulty: "하", title: "03. else 역할", desc: "if 조건이 거짓일 때 실행되는 블록은?", options: ["if", "else", "switch", "case"], answer: "else" },
    { id: "ch3-obj-003", chapter: 3, type: "multiple", difficulty: "중", title: "03. switch-case", desc: "switch문에서 각 경우를 나타내는 키워드는?", options: ["if", "else", "case", "when"], answer: "case" },
    { id: "ch3-obj-004", chapter: 3, type: "multiple", difficulty: "중", title: "03. 삼항 연산자", desc: "삼항 연산자의 기호로 올바른 것은?", options: ["? :", "if else", ":: ", "&&"], answer: "? :" },
    { id: "ch3-obj-005", chapter: 3, type: "multiple", difficulty: "상", title: "03. switch default", desc: "switch문에서 어떤 case도 일치하지 않을 때 실행되는 블록은?", options: ["else", "default", "finally", "catch"], answer: "default" },
    { id: "ch3-ox-001", chapter: 3, type: "ox", difficulty: "하", title: "03. else절 필수 여부", desc: "if문 작성 시 else 블록은 반드시 존재해야 한다.", options: ["O", "X"], answer: "X" },
    { id: "ch3-ox-002", chapter: 3, type: "ox", difficulty: "중", title: "03. switch break", desc: "switch문에서 break를 생략하면 다음 case도 실행된다.", options: ["O", "X"], answer: "O" },
    { id: "ch3-ox-003", chapter: 3, type: "ox", difficulty: "상", title: "03. 중첩 if", desc: "if문 안에 또 다른 if문을 중첩해서 사용할 수 있다.", options: ["O", "X"], answer: "O" },

    // ===== Chapter 4: 반복문 =====
    { id: "ch4-subj-001", chapter: 4, type: "coding", difficulty: "하", title: "04. for문 기초", desc: "1부터 5까지 출력하는 for문을 작성하세요.", template: "for (int i = 1; ", keywords: ["for", "i", "5", "System.out.print"], expectedExample: "for (int i = 1; i <= 5; i++) { System.out.println(i); }" },
    { id: "ch4-subj-002", chapter: 4, type: "coding", difficulty: "하", title: "04. while문 기초", desc: "while문의 괄호 안에 무한루프를 도는 조건(true)을 작성하세요.", template: "while ( ) {\n}", keywords: ["true"], expectedExample: "while (true) {}" },
    { id: "ch4-subj-003", chapter: 4, type: "coding", difficulty: "중", title: "04. while문 카운트", desc: "i가 1부터 3이하일 때까지 i를 출력하는 while문을 작성하세요.", template: "int i = 1;\nwhile ( ) {\n    System.out.println(i);\n    \n}", keywords: ["i", "<=", "3", "i++"], expectedExample: "int i = 1;\nwhile (i <= 3) { System.out.println(i); i++; }" },
    { id: "ch4-subj-004", chapter: 4, type: "coding", difficulty: "중", title: "04. break 사용", desc: "i가 3일 때 반복을 멈추는 for문을 작성하세요.", template: "for (int i = 1; i <= 5; i++) {\n    if (i == 3) {\n        \n    }\n}", keywords: ["break", "i == 3"], expectedExample: "for (int i = 1; i <= 5; i++) { if (i == 3) { break; } }" },
    { id: "ch4-subj-005", chapter: 4, type: "coding", difficulty: "상", title: "04. continue 사용", desc: "1~5 중 짝수만 출력하는 for문을 작성하세요. (continue 사용)", template: "for (int i = 1; i <= 5; i++) {\n    if (i % 2 != 0) {\n        \n    }\n    System.out.println(i);\n}", keywords: ["continue", "i % 2"], expectedExample: "for (int i = 1; i <= 5; i++) { if (i % 2 != 0) { continue; } System.out.println(i); }" },
    { id: "ch4-obj-001", chapter: 4, type: "multiple", difficulty: "하", title: "04. for문 구성", desc: "for문의 3가지 요소가 아닌 것은?", options: ["초기식", "조건식", "증감식", "반환식"], answer: "반환식" },
    { id: "ch4-obj-002", chapter: 4, type: "multiple", difficulty: "하", title: "04. while vs do-while", desc: "조건이 거짓이어도 최소 1번은 실행되는 반복문은?", options: ["for문", "while문", "do-while문", "if문"], answer: "do-while문" },
    { id: "ch4-obj-003", chapter: 4, type: "multiple", difficulty: "중", title: "04. 반복 횟수", desc: "for(int i=0; i<5; i++) 에서 반복 횟수는?", options: ["4번", "5번", "6번", "무한"], answer: "5번" },
    { id: "ch4-obj-004", chapter: 4, type: "multiple", difficulty: "중", title: "04. continue 역할", desc: "continue 키워드의 역할은?", options: ["반복문 종료", "현재 반복 건너뛰기", "프로그램 종료", "다음 메서드 호출"], answer: "현재 반복 건너뛰기" },
    { id: "ch4-obj-005", chapter: 4, type: "multiple", difficulty: "상", title: "04. 중첩 반복문", desc: "중첩 for문에서 안쪽 루프의 break는 어디까지 탈출하나?", options: ["전체 반복문", "안쪽 반복문만", "프로그램 종료", "바깥 반복문만"], answer: "안쪽 반복문만" },
    { id: "ch4-ox-001", chapter: 4, type: "ox", difficulty: "하", title: "04. 반복문 탈출", desc: "루프를 강제로 탈출할 때는 break 키워드를 사용한다.", options: ["O", "X"], answer: "O" },
    { id: "ch4-ox-002", chapter: 4, type: "ox", difficulty: "중", title: "04. for문 무한루프", desc: "for(;;)는 무한루프를 만드는 표현이다.", options: ["O", "X"], answer: "O" },
    { id: "ch4-ox-003", chapter: 4, type: "ox", difficulty: "상", title: "04. while 조건", desc: "while(false)의 블록 내 코드는 한 번도 실행되지 않는다.", options: ["O", "X"], answer: "O" },
];

let currentQuizList = [];
let currentQuizIndex = 0;
let correctCount = 0;
let selectedChapter = 1;
let currentProblem = null;
let selectedOptionValue = null;
let isAnswerSubmitted = false;

// --- 3. 로그인 상태 확인 ---
function checkLoginState() {
    const saved = localStorage.getItem('chickode_user');
    if (saved && userTag) {
        const user = JSON.parse(saved);
        userTag.innerText = `👤 ${user.nickname} 님`;
    } else {
        const profile = getProfile();
        if (userTag) userTag.innerText = `👤 ${profile.name} 님`;
    }
}

// --- 4. DOM 로드 후 초기화 ---
let cmEditor = null;

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();

    if (typeof CodeMirror !== 'undefined' && codeEditor) {
        cmEditor = CodeMirror.fromTextArea(codeEditor, {
            mode: "text/x-java",
            lineNumbers: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            theme: "default"
        });
    }

    // [중요] 챕터별 진행률 업데이트 함수 (스코프 내부 정의)
    function updateProgressBars() {
        // app-state.js에서 최신 시도 기록 가져오기
        const attempts = (typeof getAttempts === 'function') ? getAttempts() : [];
        
        // 챕터별 전체 문제 수
        const totalByChapter = { 1: 13, 2: 13, 3: 13, 4: 13 };
        const correctByChapter = {};
        const seenProblems = {};
        
        for (const a of attempts) {
            if (!a.isCorrect) continue;
            const ch = a.chapter;
            const pid = a.problemId || a.title;
            // 중복 문제ID 제거하여 맞춘 개수 산출
            if (!seenProblems[pid]) {
                seenProblems[pid] = true;
                correctByChapter[ch] = (correctByChapter[ch] || 0) + 1;
            }
        }

        // DOM의 chapter-item 탐색하여 바 너비 업데이트
        document.querySelectorAll('.chapter-item').forEach(item => {
            const ch = parseInt(item.getAttribute('data-chapter'));
            const total = totalByChapter[ch] || 1;
            const correct = correctByChapter[ch] || 0;
            const percent = Math.min(Math.round((correct / total) * 100), 100);
            
            const bar = item.querySelector('.progress-bar');
            if (bar) {
                bar.style.width = `${percent}%`;
                // 만약 바가 보이지 않는다면 CSS에서 background-color가 있는지 확인하세요!
            }
        });
    }

    // 초기 실행
    updateProgressBars();

    // 모든 닫기 버튼
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.onclick = () => {
            const m = btn.closest('.modal-overlay');
            if (m) m.style.display = 'none';
        };
    });

    // 네비게이션
    const globalNav = document.getElementById('globalNav');
    if (globalMenuBtn && globalNav) {
        globalMenuBtn.onclick = (e) => {
            e.stopPropagation();
            globalNav.classList.toggle('show');
        };
    }
    document.addEventListener('click', (e) => {
        if (globalNav?.classList.contains('show') && !globalNav.contains(e.target) && e.target !== globalMenuBtn) {
            globalNav.classList.remove('show');
        }
    });

    // 환경 설정
    const prefs = loadPreferences();
    applyTheme(prefs.theme || 'light');
    applyLanguage(prefs.lang || 'ko');
    if (themeSelect) themeSelect.value = prefs.theme || 'light';
    if (langSelect) langSelect.value = prefs.lang || 'ko';

    // 글로벌 설정 모달
    if (globalSettingsBtn) {
        globalSettingsBtn.onclick = () => {
            const currentPrefs = loadPreferences();
            if (themeSelect) themeSelect.value = currentPrefs.theme || 'light';
            if (langSelect) langSelect.value = currentPrefs.lang || 'ko';
            if (globalSettingsModal) globalSettingsModal.style.display = 'flex';
        };
    }
    if (saveGlobalSettingsBtn) {
        saveGlobalSettingsBtn.onclick = () => {
            applyTheme(themeSelect.value);
            applyLanguage(langSelect.value);
            if (globalSettingsModal) globalSettingsModal.style.display = 'none';
        };
    }

    // 로그인
    if (loginBtn) loginBtn.onclick = () => { if (authModal) authModal.style.display = 'flex'; };

    // --- 퀴즈/단원 로직 ---
    const openChapterModal = (e) => { 
        e.preventDefault(); 
        if (modal) modal.style.display = 'flex'; 
        updateProgressBars(); // 모달 열릴 때 최신 진행도 갱신
    };
    if (playBtn) playBtn.onclick = openChapterModal;
    if (navPlayBtn) navPlayBtn.onclick = openChapterModal;

    chapterItems.forEach(item => {
        item.onclick = () => {
            selectedChapter = parseInt(item.getAttribute('data-chapter'));
            modal.style.display = 'none';
            quizSettingModal.style.display = 'flex';
        };
    });

    if (ratioSlider && objRatioLabel && subjRatioLabel) {
        ratioSlider.addEventListener('input', (e) => {
            const objVal = parseInt(e.target.value) || 50;
            objRatioLabel.innerText = objVal;
            subjRatioLabel.innerText = 100 - objVal;
        });
    }

    if (startQuizBtn) {
        startQuizBtn.onclick = () => {
            const count = parseInt(questionCountInput.value) || 10;
            const objPercent = parseInt(ratioSlider.value) || 50;
            const diff = difficultySelect.value;

            let pool = javaProblems.filter(p => (p.chapter === selectedChapter || selectedChapter === 0) && p.difficulty === diff);
            if (pool.length === 0) pool = javaProblems.filter(p => p.chapter === selectedChapter || selectedChapter === 0);
            
            const objCount = Math.round(count * (objPercent / 100));
            const subCount = count - objCount;
            const objPool = pool.filter(p => p.type === 'ox' || p.type === 'multiple').sort(() => 0.5 - Math.random());
            const subPool = pool.filter(p => p.type === 'coding').sort(() => 0.5 - Math.random());

            currentQuizList = [];
            if (objPool.length > 0) for (let i = 0; i < objCount; i++) currentQuizList.push(objPool[i % objPool.length]);
            if (subPool.length > 0) for (let i = 0; i < subCount; i++) currentQuizList.push(subPool[i % subPool.length]);
            currentQuizList = currentQuizList.sort(() => 0.5 - Math.random());

            currentQuizIndex = 0;
            correctCount = 0;
            quizSettingModal.style.display = 'none';
            mainContainer.style.display = 'none';
            codingScreen.style.display = 'flex';
            loadQuestion();
        };
    }

    if (backBtn) {
        backBtn.onclick = () => {
            if (window.location.search.includes('retryId')) window.location.href = 'index.html';
            else {
                codingScreen.style.display = 'none';
                mainContainer.style.display = 'flex';
                updateProgressBars(); 
            }
        };
    }

    if (goHomeBtn) {
        goHomeBtn.onclick = () => {
            if (window.location.search.includes('retryId')) window.location.href = 'index.html';
            else {
                resultScreen.style.display = 'none';
                mainContainer.style.display = 'flex';
                updateProgressBars(); // 정답 맞춘 직후 진행률 갱신
            }
        };
    }

    // 오답노트에서 "다시풀기"로 넘어온 경우 단일 문제 모드로 바로 시작
    const urlParams = new URLSearchParams(window.location.search);
    const retryId = urlParams.get('retryId');
    if (retryId) {
        const targetProblem = javaProblems.find(p => p.id === retryId || p.title === retryId);
        if (targetProblem) {
            currentQuizList = [targetProblem];
            currentQuizIndex = 0;
            correctCount = 0;
            if (mainContainer) mainContainer.style.display = 'none';
            if (quizSettingModal) quizSettingModal.style.display = 'none';
            if (codingScreen) codingScreen.style.display = 'flex';
            loadQuestion();
        }
    }
}); // DOMContentLoaded 끝

// --- 터미널 콘솔 로그 유틸 ---
function addTermLog(msg, type = "system") {
    const termOut = document.getElementById('terminalOutput');
    if (termOut) {
        const div = document.createElement('div');
        div.className = `term-line ${type}`;
        div.innerText = `> ${msg}`;
        termOut.appendChild(div);
        termOut.scrollTop = termOut.scrollHeight;
    }
}

function clearTermLog() {
    const termOut = document.getElementById('terminalOutput');
    if (termOut) {
        termOut.innerHTML = `
            <div class="term-line system">Chickode IDE Console v1.0.0</div>
            <div class="term-line system">Ready for compilation...</div>
        `;
    }
}

// --- 문제 로드 ---
function loadQuestion() {
    isAnswerSubmitted = false;
    currentProblem = currentQuizList[currentQuizIndex];
    const prefs = loadPreferences();
    const lang = prefs.lang || 'ko';

    if (submitBtn) submitBtn.innerText = lang === 'en' ? "Submit" : "제출하기";
    if (chapterBadge) chapterBadge.innerText = `Chapter ${currentProblem.chapter}`;
    if (problemTitle) problemTitle.innerText = `[${currentQuizIndex + 1}/${currentQuizList.length}] ${currentProblem.title}`;
    if (problemDesc) problemDesc.innerText = currentProblem.desc;
    if (resultStatus) { resultStatus.innerText = "결과: (제출 대기 중...)"; resultStatus.style.color = "#d4d4d4"; }
    clearTermLog();

    if (chatDisplay) {
        chatDisplay.innerHTML = "";
        addMessage('bot', `안녕! ${currentQuizIndex + 1}번째 문제야. 힘내보자 삐약!`);
    }

    resetHints();

    if (currentProblem.type === 'multiple' || currentProblem.type === 'ox') {
        editorContainer.style.display = 'none';
        multipleChoiceArea.style.display = 'flex';
        mcqOptions.innerHTML = "";
        selectedOptionValue = null;
        currentProblem.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'mcq-option-btn';
            btn.innerText = currentProblem.type === 'ox' ? opt : `${idx + 1}. ${opt}`;
            btn.onclick = () => {
                if (isAnswerSubmitted) return;
                document.querySelectorAll('.mcq-option-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedOptionValue = opt;
            };
            mcqOptions.appendChild(btn);
        });
    } else {
        editorContainer.style.display = 'flex';
        multipleChoiceArea.style.display = 'none';
        if (cmEditor) {
            cmEditor.setValue(currentProblem.template);
            setTimeout(() => cmEditor.refresh(), 50); // flex 컨테이너에 의해 보여진 후 크기 재계산
        } else if (codeEditor) {
            codeEditor.value = currentProblem.template;
        }
    }
}

// --- 정답 제출 ---
if (submitBtn) {
    submitBtn.onclick = () => {
        if (!currentProblem) return;

        if (isAnswerSubmitted) {
            currentQuizIndex++;
            if (currentQuizIndex < currentQuizList.length) loadQuestion();
            else showResultScreen();
            return;
        }

        let isCorrect = false;
        let submittedCode = cmEditor ? cmEditor.getValue() : codeEditor.value;

        if (currentProblem.type === 'multiple' || currentProblem.type === 'ox') {
            if (!selectedOptionValue) { alert("답을 선택해주세요!"); return; }
            isCorrect = (selectedOptionValue === currentProblem.answer);
        } else {
            isCorrect = currentProblem.keywords.every(kw => submittedCode.includes(kw));
        }

        addAttempt({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    problemId: currentProblem.id,
    chapter: currentProblem.chapter,
    type: currentProblem.type,
    title: currentProblem.title,
    desc: currentProblem.desc,
    difficulty: currentProblem.difficulty,        // 추가
    keywords: currentProblem.keywords || [],      // 추가
    userCode: currentProblem.type === 'coding'    // 추가
        ? (cmEditor ? cmEditor.getValue() : codeEditor.value)
        : selectedOptionValue || "",
    expectedExample: currentProblem.expectedExample  // 추가
        || currentProblem.answer || "",
    isCorrect
});

        isAnswerSubmitted = true;
        
        addTermLog("============================", "system");
        addTermLog("Evaluating code...", "system");
        
        setTimeout(() => {
            if (isCorrect) {
                correctCount++;
                addTermLog("Compile Success: 0 errors, 0 warnings", "success");
                addTermLog("Output: [정상 실행됨]", "success");
                addTermLog("Result: O 정답입니다!", "success");
                if (resultStatus) { resultStatus.innerText = "결과: 🎉 정답이야!"; resultStatus.style.color = "#55ff55"; }
                addMessage('bot', "정답! 아주 잘했어 삐약! 👏");
            } else {
                addTermLog("Compile/Execution finished.", "system");
                addTermLog("Output: 예상결과와 다름!", "error");
                addTermLog("Result: X 오답입니다!", "error");
                if (resultStatus) { resultStatus.innerText = "결과: ❌ 오답입니다!"; resultStatus.style.color = "#ff5555"; }
                addMessage('bot', "아쉽지만 오답이야... 다음 번엔 맞출 수 있을 거야! 🐥");
            }
            submitBtn.innerText = currentQuizIndex + 1 < currentQuizList.length ? "다음 문제 ➔" : "결과 보기 ➔";
        }, 500);
    };
}

function showResultScreen() {
    codingScreen.style.display = 'none';
    resultScreen.style.display = 'flex';
    if (resTotal) resTotal.innerText = currentQuizList.length;
    if (resCorrect) resCorrect.innerText = correctCount;
    const accuracy = Math.round((correctCount / currentQuizList.length) * 100) || 0;
    if (resAccuracy) resAccuracy.innerText = `${accuracy}%`;
}

// --- AI 채팅 및 메시지 로직 ---
function addMessage(sender, text, msgId = null) {
    if (!chatDisplay) return;
    const isBot = sender === 'bot';
    const row = document.createElement('div');
    row.className = `msg-row ${isBot ? 'bot-msg' : 'user-msg'}`;
    if (msgId) row.id = msgId;

    row.innerHTML = `
        ${isBot ? '<div class="avatar"><img src="./images/chick.png" alt="병아리" /></div>' : ''}
        <div style="display:flex; flex-direction:column; align-items:${isBot ? 'flex-start' : 'flex-end'}; max-width:75%;">
            <div class="msg-meta">${isBot ? "병아리 선배 🐥" : "나"}</div>
            <div class="bubble">${text}</div>
        </div>
    `;
    chatDisplay.appendChild(row);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

window.sendMessage = async function() {
    if (!userInput) return;
    const text = userInput.value.trim();
    if (!text) return;
    
    // 유저 메시지 화면에 추가
    addMessage('user', text);
    userInput.value = '';

    // 생각중 메세지
    const thinkingId = 'thinking-' + Date.now();
    addMessage('bot', '생각중이야 삐약... 🤔', thinkingId);

    // 백엔드(main.py)로 메시지 전송
    try {
        const response = await fetch('http://127.0.0.1:8000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_question: text,
                user_code: codeEditor ? codeEditor.value : "",
                problem_context: currentProblem ? currentProblem.title : ""
            })
        });
        
        const thinkingMsg = document.getElementById(thinkingId);
        if (thinkingMsg) thinkingMsg.remove();
        
        if (response.ok) {
            const data = await response.json();
            addMessage('bot', data.answer);
        } else {
            addMessage('bot', "앗! 서버 응답에 문제가 생겼어 삐약!");
        }
    } catch (error) {
        const thinkingMsg = document.getElementById(thinkingId);
        if (thinkingMsg) thinkingMsg.remove();
        
        console.error("Chat API error:", error);
        // 서버 연결 실패 시 기본 안내 (프론트만 띄웠을 경우)
        setTimeout(() => {
            addMessage('bot', "지금은 서버와 연결되지 않아서 대답하기 어려워 삐약! 🐥");
        }, 500);
    }
};

// --- 힌트 시스템 ---
const hintBoxes = document.querySelectorAll('.hint-box');
function resetHints() {
    hintBoxes.forEach((box, idx) => {
        if (idx === 0) {
            box.classList.remove('locked');
            box.innerHTML = `<span class="lock-icon">🔓</span> <span data-i18n="hint_${idx + 1}">힌트 ${idx + 1}</span>`;
        } else {
            box.classList.add('locked');
            box.innerHTML = `<span class="lock-icon">🔒</span> <span data-i18n="hint_${idx + 1}">힌트 ${idx + 1}</span>`;
        }
    });
}

hintBoxes.forEach((box, index) => {
    box.onclick = async () => {
        if (box.classList.contains('locked')) {
            return; // 잠겨있으면 동작 안 함
        }
        
        // 챗봇에 사용자 메시지 표시
        addMessage('user', `힌트 ${index + 1}번 줘 삐약!`);
        
        const thinkingId = 'thinking-hint-' + Date.now();
        addMessage('bot', '힌트를 열심히 생각하는 중이야... 🐣', thinkingId);
        
        // 백엔드(main.py)로 힌트 생성 요청
        try {
            const response = await fetch('http://127.0.0.1:8000/generate-hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_code: codeEditor ? codeEditor.value : "",
                    problem_context: currentProblem ? currentProblem.title : "",
                    hint_level: index + 1
                })
            });
            
            const thinkingMsg = document.getElementById(thinkingId);
            if (thinkingMsg) thinkingMsg.remove();
            
            if (response.ok) {
                const data = await response.json();
                addMessage('bot', data.hint);
                
                // 다음 힌트 잠금 해제
                if (index + 1 < hintBoxes.length) {
                    const nextBox = hintBoxes[index + 1];
                    nextBox.classList.remove('locked');
                    nextBox.innerHTML = `<span class="lock-icon">🔓</span> <span data-i18n="hint_${index + 2}">힌트 ${index + 2}</span>`;
                }
            } else {
                addMessage('bot', "앗! 힌트를 가져오는데 문제가 생겼어 삐약!");
            }
        } catch (error) {
            const thinkingMsg = document.getElementById(thinkingId);
            if (thinkingMsg) thinkingMsg.remove();
            
            console.error("Hint API error:", error);
            // 서버 연결 실패 시 기본 안내 (프론트 단독 실행)
            setTimeout(() => {
                const mockHint = currentProblem?.keywords?.length 
                    ? `이 문제의 핵심 키워드 중 하나는 '${currentProblem.keywords[0]}'야! 삐약! (서버 미연결)` 
                    : `이건 ${index + 1}번째 힌트야! 삐약! (서버 미연결)`;
                
                addMessage('bot', mockHint);
                
                // 다음 힌트 잠금 해제
                if (index + 1 < hintBoxes.length) {
                    const nextBox = hintBoxes[index + 1];
                    nextBox.classList.remove('locked');
                    nextBox.innerHTML = `<span class="lock-icon">🔓</span> <span data-i18n="hint_${index + 2}">힌트 ${index + 2}</span>`;
                }
            }, 600);
        }
    };
});