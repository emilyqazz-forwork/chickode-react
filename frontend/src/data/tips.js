export const TIPS = {
  '1-coding': (kw) => `💡 변수 선언: 타입 → 변수명 → = → 값 → ; 키워드: ${kw}`,
  '1':        () => `💡 int=정수, double=실수, String=문자열`,
  '2-coding': (kw) => `💡 println()=줄바꿈 포함, print()=줄바꿈 없음. 키워드: ${kw}`,
  '2':        () => `💡 print, println, printf 차이를 정리해봐!`,
  '3-coding': (kw) => `💡 조건문은 true일 때 실행. {} 범위 확인. 키워드: ${kw}`,
  '3':        () => `💡 if-else if-else 흐름을 순서대로 따라가봐!`,
  '4-coding': (kw) => `💡 초기식→조건식→실행→증감 순서. 키워드: ${kw}`,
  '4':        () => `💡 break=종료, continue=건너뛰기!`,
};

export const WHY_WRONG = {
  ox:       '개념을 정확히 이해해야 해! 왜 그 답인지 이유를 말해볼 수 있어?',
  multiple: '오답 선택지가 왜 틀렸는지 분석해봐! 헷갈린 선택지를 비교해봐.',
  coding:   '키워드가 빠지진 않았는지, 문법 오류는 없는지 확인해봐!',
};

export function getTip(attempt) {
  const kw = (attempt.keywords || []).join(', ');
  const key = `${attempt.chapter}-${attempt.type}`;
  const fn = TIPS[key] || TIPS[String(attempt.chapter)];
  return fn ? fn(kw) : `💡 키워드(${kw || '-'})가 왜 필요한지 확인해봐!`;
}

export function whyWrong(attempt) {
  return WHY_WRONG[attempt.type] || '틀린 부분을 다시 점검해봐!';
}
