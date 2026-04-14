import { getAttempts, summarizeAttempts } from "./app-state.js";

const statTotal = document.getElementById("statTotal");
const statCorrect = document.getElementById("statCorrect");
const statWrong = document.getElementById("statWrong");
const dataTableBody = document.getElementById("dataTableBody");
const aiMessage = document.getElementById("aiMessage");

let doughnutChartInstance = null;
let lineChartInstance = null;


function render() {
  const attempts = getAttempts();
  const summary = summarizeAttempts(attempts);

  // 1. Update High-level Stats
  if (statTotal) statTotal.textContent = String(summary.total);
  if (statCorrect) statCorrect.textContent = String(summary.correct);
  if (statWrong) statWrong.textContent = String(summary.wrong);

  if (summary.total === 0) {
      if (aiMessage) aiMessage.innerHTML = "아직 푼 문제가 없어! 메인에서 문제를 풀면 여기서 <strong>지원님</strong>만의 패턴을 분석해줄게 삐약!";
      return; // No data to plot
  }

  const formatType = (t) => t === 'multiple' ? '객관식' : t === 'coding' ? '실습 코딩' : t === 'ox' ? 'O/X 퀴즈' : '미분류';

  // 2. Data grouping by Type and sorting by lowest accuracy (ascending)
  const byTypeEntries = Object.entries(summary.byType).map(([k, v]) => {
      const correct = v.correct ?? 0;
      const total = v.total ?? 0;
      const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
      return { type: formatType(k), total, correct, wrong: v.wrong ?? 0, accuracy };
  });
  
  // Sort from lowest to highest accuracy
  byTypeEntries.sort((a, b) => {
      if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
      return b.wrong - a.wrong; // Tie breaker: more wrong answers first
  });

  // 3. Update AI Insight Message
  if (aiMessage && byTypeEntries.length > 0) {
      const weakest = byTypeEntries[0];
      if (weakest.accuracy < 60) {
          aiMessage.innerHTML = `현재 <strong>'${weakest.type}'</strong> 유형의 정답률이 <strong>${weakest.accuracy}%</strong>로 가장 취약해! 이 부분을 집중적으로 복습해보자 삐약!`;
      } else {
          aiMessage.innerHTML = `정말 대단해! 전체적으로 준수한 정답률을 기록하고 있어. 지금처럼 계속 꾸준히 공부하자 삐약!`;
      }
  }

  // 4. Update Data Table
  if (dataTableBody) {
      dataTableBody.innerHTML = "";
      byTypeEntries.forEach(item => {
          const isWeak = item.accuracy < 50;
          const rowClass = isWeak ? "data-grid-row weak-row" : "data-grid-row";
          const highlightStyle = isWeak ? "class='weak-point'" : "style='color:#3e2723;'";
          
          const rowHTML = `
              <div class="data-grid-row ${isWeak ? 'weak-row' : ''}">
                  <div><strong>${item.type}</strong></div>
                  <div ${highlightStyle}>${item.accuracy}%</div>
                  <div><span style="color:#2e7d32">${item.correct}</span> / <span style="color:#c62828">${item.wrong}</span></div>
                  <div>
                      <button class="cta-btn" onclick="location.href='index.html'" title="메인으로 돌아갑니다">복습하기 ➔</button>
                  </div>
              </div>
          `;
          dataTableBody.insertAdjacentHTML('beforeend', rowHTML);
      });
  }

  // 5. Chart.js Drawing Setup
  // Destroy old instances to prevent overlay bugs
  if(doughnutChartInstance) doughnutChartInstance.destroy();
  if(lineChartInstance) lineChartInstance.destroy();


  // (A) Doughnut Chart: Overall Correct vs Wrong
  const ctxDoughnut = document.getElementById('doughnutChart');
  if (ctxDoughnut) {
      doughnutChartInstance = new Chart(ctxDoughnut, {
          type: 'doughnut',
          data: {
              labels: ['정답', '오답'],
              datasets: [{
                  data: [summary.correct, summary.wrong],
                  backgroundColor: ['#66bb6a', '#ef5350'],
                  hoverBackgroundColor: ['#4caf50', '#f44336'],
                  borderWidth: 2,
                  borderColor: '#fff'
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '60%',
              plugins: { legend: { position: 'bottom' } }
          }
      });
  }



  // (C) Line Chart: Trend Over Last 5 Days
  const ctxLine = document.getElementById('lineChart');
  if (ctxLine) {
      const dateMap = {};
      // attempts array is from newest to oldest in our app-state.js addAttempt logic
      // let's iterate and extract YYYY-MM-DD
      attempts.forEach(a => {
          const dObj = new Date(a.createdAt ?? Date.now());
          const dStr = `${dObj.getMonth() + 1}/${dObj.getDate()}`; // MM/DD
          if (!dateMap[dStr]) dateMap[dStr] = { total: 0, correct: 0 };
          dateMap[dStr].total++;
          if (a.isCorrect) dateMap[dStr].correct++;
      });
      
      // Sort keys correctly (Wait, we can just sort by real time but string keys might sort weirdly if cross-year, 
      // but assuming recent days this is fine. Let's sort simply by preserving occurrence order or rebuilding)
      const sortedDateKeys = Object.keys(dateMap).slice(-5).reverse(); // take last 5
      
      const lineLabels = sortedDateKeys;
      const lineData = sortedDateKeys.map(k => {
          const d = dateMap[k];
          return d.total === 0 ? 0 : Math.round((d.correct / d.total) * 100);
      });

      lineChartInstance = new Chart(ctxLine, {
          type: 'line',
          data: {
              labels: lineLabels.length ? lineLabels : ['오늘'],
              datasets: [{
                  label: '일별 정답률 (%)',
                  data: lineData.length ? lineData : [0],
                  borderColor: '#8d6e63',
                  backgroundColor: 'rgba(141, 110, 99, 0.2)',
                  borderWidth: 3,
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: '#5d4037',
                  pointRadius: 5
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  y: { beginAtZero: true, max: 100 }
              },
              plugins: { legend: { display: false } }
          }
      });
  }
}

render();
