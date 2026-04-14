import { clearAllData, getProfile, setProfile } from "./app-state.js";

const nameInput = document.getElementById("nameInput");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");

function hydrate() {
  const profile = getProfile();
  if (nameInput) nameInput.value = profile.name ?? "상우";
}

function save() {
  const current = getProfile();
  const nextName = (nameInput?.value ?? "").trim() || "상우";
  setProfile({ ...current, name: nextName });
  alert("저장됐어! 메인 화면으로 돌아가면 이름이 적용돼.");
}

function reset() {
  const ok = confirm("학습기록(오답노트/패턴분석)을 전부 초기화할까?");
  if (!ok) return;
  clearAllData();
  hydrate();
  alert("초기화 완료!");
}

saveBtn?.addEventListener("click", save);
resetBtn?.addEventListener("click", reset);

hydrate();

