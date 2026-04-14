import { getAttempts } from "./app-state.js";

const chapterSidebar = document.getElementById("chapterSidebar");
const wrongList = document.getElementById("wrongList");
const noteEmpty = document.getElementById("noteEmpty");

let activeChapter = "all";
let activeSort = "newest"; // newest | oldest | mostWrong

// --- 1. 이벤트 리스너 등록 (DOMContentLoaded 시점에 한 번만) ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSort = btn.dataset.sort;
            render();
        };
    });
    
    // 초기 렌더링 호출
    render();
});

// --- 2. 유틸리티 및 보조 로직 ---
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getWhyWrong(attempt) {
    const type = attempt.type;
    if (type === 'ox') return "O/X 문제는 개념을 정확히 이해해야 해! 관련 내용을 다시 읽어보고 왜 그 답인지 이유를 말해볼 수 있어?";
    if (type === 'multiple') return `객관식은 오답 선택지가 왜 틀렸는지도 분석해봐! 헷갈린 선택지를 다시 비교해봐.`;
    if (type === 'coding') return `코드 작성 문제야. 키워드가 빠지진 않았는지, 문법 오류는 없는지 한 줄씩 확인해봐!`;
    return "틀린 부분을 다시 한 번 점검해봐!";
}

function getTip(attempt) {
    const ch = attempt.chapter;
    const type = attempt.type;
    const keywords = (attempt.keywords || []).join(", ");

    if (ch === 1 && type === 'coding') return `💡 변수 선언 순서: 타입 → 변수명 → = → 값 → ; 순서로 기억해봐! 키워드: ${keywords}`;
    if (ch === 1) return `💡 자료형마다 저장할 수 있는 값이 달라! int는 정수, double은 실수, String은 문자열이야.`;
    if (ch === 2 && type === 'coding') return `💡 System.out.println()은 줄바꿈 포함, print()는 줄바꿈 없어! 키워드: ${keywords}`;
    if (ch === 2) return `💡 출력 메서드의 차이를 헷갈리지 마! print, println, printf 각각 언제 쓰는지 정리해봐.`;
    if (ch === 3 && type === 'coding') return `💡 조건문은 조건식이 true일 때 실행돼. 중괄호 {} 범위도 꼭 확인해봐! 키워드: ${keywords}`;
    if (ch === 3) return `💡 if-else if-else 흐름을 순서대로 따라가봐. 조건이 겹치진 않는지 확인해!`;
    if (ch === 4 && type === 'coding') return `💡 반복문은 초기식→조건식→실행→증감 순서야! 무한루프 조심하고 키워드: ${keywords}`;
    if (ch === 4) return `💡 break는 반복 종료, continue는 건너뛰기야. 헷갈리면 직접 손으로 흐름을 그려봐!`;
    return `💡 키워드(${keywords || "-"})가 왜 필요한지부터 확인해봐!`;
}

// --- 3. 핵심 렌더링 함수 ---
function render() {
    if (!wrongList || !noteEmpty) return;

    // 전체 시도 기록 중 오답만 필터링
    const allAttempts = getAttempts().filter(a => a && a.isCorrect === false);

    // 문제별 틀린 횟수 집계
    const wrongCountMap = {};
    for (const a of allAttempts) {
        const pid = a.problemId || a.title;
        wrongCountMap[pid] = (wrongCountMap[pid] || 0) + 1;
    }

    // 챕터별 오답 개수 집계 및 사이드바 업데이트
    const chapterCounts = {};
    for (const a of allAttempts) {
        if (a.chapter) chapterCounts[a.chapter] = (chapterCounts[a.chapter] || 0) + 1;
    }

    if (chapterSidebar) {
        chapterSidebar.innerHTML = '';
        const allBtn = document.createElement('button');
        allBtn.className = `chapter-btn ${activeChapter === 'all' ? 'active' : ''}`;
        allBtn.innerText = `전체 (${allAttempts.length})`;
        allBtn.onclick = () => { activeChapter = 'all'; render(); };
        chapterSidebar.appendChild(allBtn);

        Object.keys(chapterCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(ch => {
            const btn = document.createElement('button');
            btn.className = `chapter-btn ${activeChapter === ch ? 'active' : ''}`;
            btn.innerText = `챕터 ${ch} (${chapterCounts[ch]})`;
            btn.onclick = () => { activeChapter = ch; render(); };
            chapterSidebar.appendChild(btn);
        });
    }

    // 챕터 필터링
    let filtered = activeChapter === "all"
        ? allAttempts
        : allAttempts.filter(a => String(a.chapter) === String(activeChapter));

    // 정렬 적용
    if (activeSort === "newest") {
        filtered = [...filtered].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else if (activeSort === "oldest") {
        filtered = [...filtered].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    } else if (activeSort === "mostWrong") {
        filtered = [...filtered].sort((a, b) => {
            const wa = wrongCountMap[a.problemId || a.title] || 0;
            const wb = wrongCountMap[b.problemId || b.title] || 0;
            return wb - wa;
        });
    }

    wrongList.innerHTML = "";

    // 데이터가 없을 경우 처리
    if (filtered.length === 0) {
        noteEmpty.style.display = "block";
        return;
    }
    noteEmpty.style.display = "none";

    // 오답 카드 생성
    for (const a of filtered) {
        const card = document.createElement("div");
        card.className = "wrong-card";
        
        const created = new Date(a.createdAt ?? Date.now()).toLocaleString();
        const pid = a.problemId || a.title;
        const wCount = wrongCountMap[pid] || 1;
        const isMultiple = a.type === 'multiple' || a.type === 'ox';

        // 유형별 정답 영역 레이아웃 분기
        const answerSection = isMultiple ? `
            <div class="answer-compare">
                <div class="answer-box my-answer">
                    <span class="box-label">내가 쓴 답</span>
                    ${escapeHtml(a.userCode || "미제출")}
                </div>
                <div class="answer-box correct-answer">
                    <span class="box-label">정답</span>
                    ${escapeHtml(a.expectedExample || "-")}
                </div>
            </div>
        ` : `
            <div class="code-compare">
                <div class="code-box">
                    <span class="box-label">내가 쓴 답</span>
                    <pre><code>${escapeHtml(a.userCode || "(없음)")}</code></pre>
                </div>
                <div class="code-box">
                    <span class="box-label">정답</span>
                    <pre><code>${escapeHtml(a.expectedExample || "(없음)")}</code></pre>
                </div>
            </div>
        `;

        const formatType = (t) => t === 'multiple' ? '객관식' : t === 'coding' ? '실습 코딩' : t === 'ox' ? 'O/X 퀴즈' : '미분류';

        card.innerHTML = `
            <div class="card-info">
                <div class="info-box">챕터<strong>${escapeHtml(String(a.chapter ?? "-"))}</strong></div>
                <div class="info-box">유형<strong>${escapeHtml(formatType(a.type))}</strong></div>
                <div class="info-box">난이도<strong>${escapeHtml(a.difficulty || "기본")}</strong></div>
                <div class="info-box" style="color:#d32f2f;">틀린 횟수<strong>${wCount}회</strong></div>
                <div class="info-box">일시<strong style="font-size:0.8rem;">${escapeHtml(created)}</strong></div>
            </div>
            <div style="margin-bottom:12px; font-weight:bold; font-size:1.05rem; color:#3e2723; padding:8px 0; border-bottom:1px dashed #c8b89a;">
                ${escapeHtml(a.title ?? "문제")}
            </div>
            ${answerSection}
            <div class="why-wrong-box">
                <span class="box-label">왜 틀렸을까?</span>
                ${getWhyWrong(a)}
            </div>
            <div class="tip-box">${getTip(a)}</div>
            <div class="action-btn-group">
                <button class="action-btn retry-btn" onclick="location.href='index.html?retryId=${encodeURIComponent(pid)}'">다시 풀기</button>
                <button class="action-btn ai-btn" onclick="alert('AI에게 질문 기능은 준비 중이야 삐약!')">AI에게 질문</button>
            </div>
        `;
        wrongList.appendChild(card);
    }
}