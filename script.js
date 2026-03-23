const STORAGE_KEY = "personalEnglishSentenceQuizV1";
const CUSTOM_CATEGORY_VALUE = "__custom__";
const CATEGORY_PRESETS = ["상태", "감정", "취향", "일상", "일", "공부", "이동"];
const QUIZ_THINKING_DELAY_MS = 1700;
const QUIZ_AUTO_NEXT_DELAY_MS = 1000;
const QUIZ_MODES = {
  ko_to_en: {
    label: "한국어 → 영어",
    promptPrefix: "영어 문장을 먼저 떠올려 보세요.",
    thinkingCopy: "영어 문장을 먼저 떠올린 뒤 보기를 열어보세요."
  },
  en_to_ko: {
    label: "영어 → 뜻",
    promptPrefix: "뜻을 먼저 떠올려 보세요.",
    thinkingCopy: "뜻을 먼저 떠올린 뒤 보기를 열어보세요."
  },
  fill_blank: {
    label: "빈칸 채우기",
    promptPrefix: "빈칸 표현을 먼저 떠올려 보세요.",
    thinkingCopy: "빈칸에 들어갈 표현을 먼저 생각해 보세요."
  }
};
const STOPWORDS = new Set(["i","you","he","she","it","we","they","am","is","are","was","were","be","been","being","a","an","the","to","of","for","and","or","but","do","does","did","have","has","had","will","would","can","could","should","just","very","really","so","that","this","my","your","our","their","in","on","at","with","from","today","now","yet"]);
const DEFAULT_SENTENCES = [
  { id: "seed-not-sure", category: "상태", korean: "\uC798 \uBAA8\uB974\uACA0\uC5B4", english: "I'm not sure.", pattern: "I'm not + adjective", note: "확신이 없을 때 쓰는 표현", example: "I'm not sure if I can make it.", difficulty: 1 },
  { id: "seed-not-used-yet", category: "상태", korean: "\uC544\uC9C1 \uC775\uC219\uD558\uC9C0 \uC54A\uC544", english: "I'm not used to it yet.", pattern: "I'm not used to + noun + yet", note: "아직 적응 중일 때 쓰는 표현", example: "I'm not used to this schedule yet.", difficulty: 2 },
  { id: "seed-bit-unclear", category: "상태", korean: "\uC880 \uC560\uB9E4\uD574", english: "It's a bit unclear.", pattern: "It's a bit + adjective", note: "상황이 애매할 때 쓰는 표현", example: "It's a bit unclear right now.", difficulty: 1 },
  { id: "seed-no-energy", category: "감정", korean: "\uC624\uB298\uC740 \uAE30\uC6B4\uC774 \uC5C6\uC5B4", english: "I don't have much energy today.", pattern: "I don't have much + noun + today", note: "기운이 없을 때 쓰는 표현", example: "I don't have much energy today, so I'll rest.", difficulty: 2 },
  { id: "seed-better-than-expected", category: "일상", korean: "\uC0DD\uAC01\uBCF4\uB2E4 \uAD1C\uCC2E\uC558\uC5B4", english: "It was better than I expected.", pattern: "It was better than + I expected", note: "예상보다 괜찮았을 때 쓰는 표현", example: "The class was better than I expected.", difficulty: 2 }
];

const refs = {
  viewButtons: [...document.querySelectorAll("[data-view-target]")],
  views: {
    dashboard: document.getElementById("dashboardView"),
    library: document.getElementById("libraryView"),
    add: document.getElementById("addView"),
    quiz: document.getElementById("quizView")
  },
  totalCountText: document.getElementById("totalCountText"),
  reviewCountText: document.getElementById("reviewCountText"),
  speakingPendingText: document.getElementById("speakingPendingText"),
  favoriteCountText: document.getElementById("favoriteCountText"),
  todaySentenceList: document.getElementById("todaySentenceList"),
  recentSentenceList: document.getElementById("recentSentenceList"),
  favoriteSentenceList: document.getElementById("favoriteSentenceList"),
  categoryFilter: document.getElementById("categoryFilter"),
  statusFilter: document.getElementById("statusFilter"),
  searchInput: document.getElementById("searchInput"),
  favoriteOnlyFilter: document.getElementById("favoriteOnlyFilter"),
  sentenceList: document.getElementById("sentenceList"),
  sentenceForm: document.getElementById("sentenceForm"),
  addViewTitle: document.getElementById("addViewTitle"),
  editNotice: document.getElementById("editNotice"),
  editNoticeText: document.getElementById("editNoticeText"),
  cancelEditButton: document.getElementById("cancelEditButton"),
  additionalInfoDetails: document.getElementById("additionalInfoDetails"),
  categoryInput: document.getElementById("categoryInput"),
  customCategoryField: document.getElementById("customCategoryField"),
  customCategoryInput: document.getElementById("customCategoryInput"),
  koreanInput: document.getElementById("koreanInput"),
  englishInput: document.getElementById("englishInput"),
  similarSentenceHint: document.getElementById("similarSentenceHint"),
  patternInput: document.getElementById("patternInput"),
  difficultyPreview: document.getElementById("difficultyPreview"),
  noteInput: document.getElementById("noteInput"),
  toggleExampleButton: document.getElementById("toggleExampleButton"),
  exampleField: document.getElementById("exampleField"),
  exampleInput: document.getElementById("exampleInput"),
  submitSentenceButton: document.getElementById("submitSentenceButton"),
  forceDuplicateSaveButton: document.getElementById("forceDuplicateSaveButton"),
  formMessage: document.getElementById("formMessage"),
  postSaveActions: document.getElementById("postSaveActions"),
  continueAddButton: document.getElementById("continueAddButton"),
  goHomeAfterSaveButton: document.getElementById("goHomeAfterSaveButton"),
  modeButtons: [...document.querySelectorAll("[data-mode]")],
  quizRemainingText: document.getElementById("quizRemainingText"),
  quizProgressText: document.getElementById("quizProgressText"),
  autoNextToggle: document.getElementById("autoNextToggle"),
  resetQuizButton: document.getElementById("resetQuizButton"),
  quizEmptyState: document.getElementById("quizEmptyState"),
  quizCard: document.getElementById("quizCard"),
  quizModeBadge: document.getElementById("quizModeBadge"),
  quizPromptText: document.getElementById("quizPromptText"),
  quizHintText: document.getElementById("quizHintText"),
  quizFavoriteButton: document.getElementById("quizFavoriteButton"),
  quizSpeakingButton: document.getElementById("quizSpeakingButton"),
  quizInputArea: document.getElementById("quizInputArea"),
  quizChoiceArea: document.getElementById("quizChoiceArea"),
  quizResultCard: document.getElementById("quizResultCard"),
  quizFeedbackText: document.getElementById("quizFeedbackText"),
  quizRepeatPromptText: document.getElementById("quizRepeatPromptText"),
  quizHintLine: document.getElementById("quizHintLine"),
  resultEnglishText: document.getElementById("resultEnglishText"),
  resultKoreanText: document.getElementById("resultKoreanText"),
  resultPatternText: document.getElementById("resultPatternText"),
  resultExampleText: document.getElementById("resultExampleText"),
  resultNoteText: document.getElementById("resultNoteText"),
  resultSpeakingButton: document.getElementById("resultSpeakingButton"),
  revealAnswerButton: document.getElementById("revealAnswerButton"),
  nextQuestionButton: document.getElementById("nextQuestionButton")
};

let state = loadState();
let uiState = {
  currentView: "dashboard",
  editingSentenceId: null,
  pendingDuplicateConfirm: null,
  exampleFieldVisible: false,
  filters: { category: "all", status: "all", favoriteOnly: false, query: "" },
  quizMode: state.preferences.quiz_mode,
  quizQueue: [],
  quizIndex: 0,
  quizStats: { correct: 0, wrong: 0 },
  currentQuestion: null,
  answerState: null,
  answerControlsVisible: false,
  revealReady: false,
  quizTimers: { thinking: null, autoNext: null }
};

function createId() { return `sentence-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function cleanText(value) { return String(value || "").trim().replace(/\s+/g, " "); }
function escapeHtml(value) { return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function clampDifficulty(value) { return Math.min(3, Math.max(1, Math.round(Number(value) || 1))); }
function normalizeStatus(value) { return value === "learning" || value === "familiar" ? value : "new"; }
function normalizeCount(value) { return Math.max(0, Number(value) || 0); }
function getStatusLabel(value) {
  if (value === "learning") { return "학습 중"; }
  if (value === "familiar") { return "익숙함"; }
  return "새 문장";
}
function getSentenceSignature(sentence) { return `${cleanText(sentence.korean).toLowerCase()}::${cleanText(sentence.english).toLowerCase()}`; }
function getSentenceById(id) { return state.sentences.find((sentence) => sentence.id === id) || null; }
function shuffle(list) { const copy = [...list]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
function getEnglishWords(value) { return cleanText(value).replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean); }

function createSentence(input) {
  const time = Date.now();
  return {
    id: input.id || createId(),
    category: cleanText(input.category) || "일상",
    korean: cleanText(input.korean),
    english: cleanText(input.english),
    pattern: cleanText(input.pattern),
    note: cleanText(input.note),
    example: cleanText(input.example),
    difficulty: clampDifficulty(input.difficulty),
    status: normalizeStatus(input.status),
    wrong_count: normalizeCount(input.wrong_count),
    speaking_checked: Boolean(input.speaking_checked),
    favorite: Boolean(input.favorite),
    created_at: Number(input.created_at) || time,
    updated_at: Number(input.updated_at) || time,
    success_count: normalizeCount(input.success_count)
  };
}

function hydrateState(saved) {
  const merged = new Map();
  DEFAULT_SENTENCES.forEach((sentence, index) => {
    merged.set(getSentenceSignature(sentence), createSentence({
      ...sentence,
      status: "new",
      wrong_count: 0,
      speaking_checked: false,
      favorite: false,
      success_count: 0,
      created_at: 1000 + index,
      updated_at: 1000 + index
    }));
  });
  (Array.isArray(saved?.sentences) ? saved.sentences : []).map(createSentence).forEach((sentence) => {
    merged.set(getSentenceSignature(sentence), sentence);
  });
  return {
    sentences: [...merged.values()].sort((left, right) => right.created_at - left.created_at),
    preferences: { quiz_mode: QUIZ_MODES[saved?.preferences?.quiz_mode] ? saved.preferences.quiz_mode : "ko_to_en" }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { return hydrateState(JSON.parse(raw)); }
  } catch (error) {}
  return hydrateState({});
}

function saveState() {
  state.preferences.quiz_mode = uiState.quizMode;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateSentence(id, transformer) {
  let changed = false;
  state.sentences = state.sentences.map((sentence) => {
    if (sentence.id !== id) { return sentence; }
    changed = true;
    return transformer({ ...sentence });
  });
  if (changed) { saveState(); }
}

function reconcileStatus(sentence) {
  const next = { ...sentence };
  if (next.status === "new" && next.success_count > 0) { next.status = "learning"; }
  if (next.status === "learning" && next.success_count >= 2 && next.speaking_checked) { next.status = "familiar"; }
  if (next.status === "familiar" && (!next.speaking_checked || next.success_count < 2)) { next.status = "learning"; }
  return next;
}

function applyQuizResult(sentence, isCorrect) {
  const next = { ...sentence, updated_at: Date.now() };
  if (next.status === "new") { next.status = "learning"; }
  if (isCorrect) {
    next.success_count += 1;
    next.wrong_count = Math.max(0, next.wrong_count - 1);
  } else {
    next.success_count = 0;
    next.wrong_count += 1;
    if (next.status === "familiar") { next.status = "learning"; }
  }
  return reconcileStatus(next);
}

function toggleFavorite(id) { updateSentence(id, (sentence) => ({ ...sentence, favorite: !sentence.favorite, updated_at: Date.now() })); renderApp(); }
function toggleSpeaking(id) { updateSentence(id, (sentence) => reconcileStatus({ ...sentence, speaking_checked: !sentence.speaking_checked, updated_at: Date.now() })); renderApp(); }
function deleteSentence(id) {
  if (!getSentenceById(id) || !window.confirm("이 문장을 삭제할까요?\n삭제하면 되돌릴 수 없습니다.")) { return; }
  state.sentences = state.sentences.filter((sentence) => sentence.id !== id);
  saveState();
  if (uiState.editingSentenceId === id) { exitEditMode({ clearMessage: true }); }
  resetQuizSession();
  renderApp();
}

function getReviewScore(sentence) { return sentence.wrong_count * 12 + (sentence.speaking_checked ? 0 : 8) + { new: 6, learning: 3, familiar: 0 }[sentence.status] + sentence.difficulty; }
function sortByReviewPriority(sentences) { return [...sentences].sort((left, right) => (getReviewScore(right) - getReviewScore(left)) || (right.updated_at - left.updated_at)); }
function isReviewNeeded(sentence) { return sentence.status !== "familiar" || !sentence.speaking_checked || sentence.wrong_count > 0; }
function getTodaySentences() { return sortByReviewPriority(state.sentences).slice(0, 5); }
function getRecentSentences() { return [...state.sentences].sort((left, right) => right.created_at - left.created_at).slice(0, 5); }
function getFavoriteSentences() { return state.sentences.filter((sentence) => sentence.favorite).sort((left, right) => right.updated_at - left.updated_at).slice(0, 5); }
function getAllCategories() { return [...new Set([...CATEGORY_PRESETS, ...state.sentences.map((sentence) => sentence.category)])]; }

function populateCategoryInputs() {
  const categories = getAllCategories();
  const previousFilter = refs.categoryFilter.value || uiState.filters.category;
  const previousCategory = refs.categoryInput.value || "일상";
  refs.categoryFilter.innerHTML = ['<option value="all">전체</option>', ...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)].join("");
  refs.categoryFilter.value = categories.includes(previousFilter) ? previousFilter : "all";
  refs.categoryInput.innerHTML = [...categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`), `<option value="${CUSTOM_CATEGORY_VALUE}">직접 입력</option>`].join("");
  refs.categoryInput.value = previousCategory === CUSTOM_CATEGORY_VALUE || categories.includes(previousCategory) ? previousCategory : "일상";
}

function updateCategoryInputVisibility() {
  refs.customCategoryField.classList.toggle("hidden-field", refs.categoryInput.value !== CUSTOM_CATEGORY_VALUE);
}

function generatePatternFromEnglish(english) {
  const text = cleanText(english).replace(/[.?!]+$/g, "");
  if (!text) { return ""; }
  const normalized = text.toLowerCase();
  if (/\bused to\b/.test(normalized)) { return text.replace(/\bused to\b\s+.+$/i, "used to + noun"); }
  if (/\bwant to\b/.test(normalized)) { return text.replace(/\bwant to\b\s+.+$/i, "want to + verb"); }
  if (/\bhave much\b/.test(normalized)) { return text.replace(/\bhave much\b\s+.+$/i, "have much + noun"); }
  if (/\bit(?:'s| is)\s+a bit\b/i.test(text)) { return text.replace(/\ba bit\b\s+.+$/i, "a bit + adjective"); }
  if (/\bi(?:'m| am)\s+not\b/i.test(text)) { return text.replace(/\bnot\b\s+.+$/i, "not + adjective"); }
  if (/\bbetter than\b/i.test(text)) { return text.replace(/\bbetter than\b\s+.+$/i, "better than + expected"); }
  const words = getEnglishWords(text);
  return words.length >= 3 ? `${words.slice(0, 3).join(" ")} + ...` : text;
}

function estimateDifficultyFromEnglish(english) {
  const words = getEnglishWords(english);
  const normalized = cleanText(english).toLowerCase();
  let level = 1;
  if (words.length >= 7) { level += 1; }
  if (words.length >= 11 || /\b(because|although|instead|expected|used to|have much)\b/.test(normalized)) { level += 1; }
  return clampDifficulty(level);
}

function updateAutoGeneratedFields() {
  const english = cleanText(refs.englishInput.value);
  refs.patternInput.value = generatePatternFromEnglish(english);
  refs.difficultyPreview.textContent = english ? `자동 난이도: Lv.${estimateDifficultyFromEnglish(english)}` : "난이도는 문장 길이와 구조를 보고 자동으로 정해집니다.";
}

function getTokenOverlap(left, right) {
  const leftWords = new Set(getEnglishWords(left).map((word) => word.toLowerCase()));
  const rightWords = new Set(getEnglishWords(right).map((word) => word.toLowerCase()));
  if (!leftWords.size || !rightWords.size) { return 0; }
  let overlap = 0;
  leftWords.forEach((word) => { if (rightWords.has(word)) { overlap += 1; } });
  return overlap / Math.max(leftWords.size, rightWords.size);
}
function findSimilarEnglishSentence(english, excludeId = null) {
  const normalized = cleanText(english).toLowerCase();
  if (!normalized) { return null; }
  let best = null;
  let bestScore = 0;
  state.sentences.forEach((sentence) => {
    if (sentence.id === excludeId) { return; }
    const candidate = cleanText(sentence.english).toLowerCase();
    const score = candidate === normalized ? 1 : getTokenOverlap(candidate, normalized);
    if (score >= 0.5 && score > bestScore) { best = sentence; bestScore = score; }
  });
  return best;
}
function updateSimilarSentenceHint() {
  const similar = findSimilarEnglishSentence(refs.englishInput.value, uiState.editingSentenceId);
  if (!similar) {
    refs.similarSentenceHint.textContent = "";
    refs.similarSentenceHint.classList.add("hidden-field");
    return;
  }
  refs.similarSentenceHint.textContent = `이미 비슷한 문장이 있어요: ${similar.english}`;
  refs.similarSentenceHint.classList.remove("hidden-field");
}
function getSelectedCategory() { return refs.categoryInput.value === CUSTOM_CATEGORY_VALUE ? cleanText(refs.customCategoryInput.value) : cleanText(refs.categoryInput.value); }
function getDuplicateInfo(payload, excludeId = null) {
  let exactMatch = null;
  let sameKorean = null;
  let sameEnglish = null;
  state.sentences.forEach((sentence) => {
    if (sentence.id === excludeId) { return; }
    const sameKo = cleanText(sentence.korean).toLowerCase() === payload.korean.toLowerCase();
    const sameEn = cleanText(sentence.english).toLowerCase() === payload.english.toLowerCase();
    if (!sameKorean && sameKo) { sameKorean = sentence; }
    if (!sameEnglish && sameEn) { sameEnglish = sentence; }
    if (!exactMatch && sameKo && sameEn) { exactMatch = sentence; }
  });
  return { exactMatch, sameKorean, sameEnglish };
}
function getFormPayload() {
  const english = cleanText(refs.englishInput.value);
  return {
    category: getSelectedCategory() || "일상",
    korean: cleanText(refs.koreanInput.value),
    english,
    pattern: generatePatternFromEnglish(english),
    note: cleanText(refs.noteInput.value),
    example: cleanText(refs.exampleInput.value),
    difficulty: estimateDifficultyFromEnglish(english)
  };
}
function clearDuplicateConfirm(clearMessage = false) {
  uiState.pendingDuplicateConfirm = null;
  refs.forceDuplicateSaveButton.classList.add("hidden-field");
  if (clearMessage) { refs.formMessage.textContent = ""; }
}
function resetSentenceForm(options = {}) {
  refs.sentenceForm.reset();
  refs.categoryInput.value = "일상";
  refs.customCategoryInput.value = "";
  refs.patternInput.value = "";
  refs.difficultyPreview.textContent = "난이도는 문장 길이와 구조를 보고 자동으로 정해집니다.";
  refs.similarSentenceHint.textContent = "";
  refs.similarSentenceHint.classList.add("hidden-field");
  refs.additionalInfoDetails.open = false;
  uiState.exampleFieldVisible = false;
  refs.exampleField.classList.add("hidden-field");
  refs.toggleExampleButton.textContent = "+ 확장 예문 추가";
  refs.postSaveActions.classList.add("hidden-field");
  updateCategoryInputVisibility();
  clearDuplicateConfirm(Boolean(options.clearMessage));
  if (options.clearMessage) { refs.formMessage.textContent = ""; }
}
function fillSentenceForm(sentence) {
  populateCategoryInputs();
  if (getAllCategories().includes(sentence.category)) {
    refs.categoryInput.value = sentence.category;
    refs.customCategoryInput.value = "";
  } else {
    refs.categoryInput.value = CUSTOM_CATEGORY_VALUE;
    refs.customCategoryInput.value = sentence.category;
  }
  refs.koreanInput.value = sentence.korean;
  refs.englishInput.value = sentence.english;
  refs.patternInput.value = sentence.pattern;
  refs.noteInput.value = sentence.note;
  refs.exampleInput.value = sentence.example;
  uiState.exampleFieldVisible = Boolean(sentence.example);
  refs.exampleField.classList.toggle("hidden-field", !uiState.exampleFieldVisible);
  refs.toggleExampleButton.textContent = uiState.exampleFieldVisible ? "확장 예문 닫기" : "+ 확장 예문 추가";
  refs.additionalInfoDetails.open = Boolean(sentence.pattern || sentence.note || sentence.example || sentence.category !== "일상");
  updateCategoryInputVisibility();
  updateAutoGeneratedFields();
  updateSimilarSentenceHint();
}
function renderFormState() {
  const editingSentence = uiState.editingSentenceId ? getSentenceById(uiState.editingSentenceId) : null;
  const isEditing = Boolean(editingSentence);
  refs.addViewTitle.textContent = isEditing ? "문장 수정" : "문장 추가";
  refs.submitSentenceButton.textContent = isEditing ? "수정 저장" : "문장 저장";
  refs.editNotice.classList.toggle("hidden-field", !isEditing);
  refs.editNoticeText.textContent = isEditing ? `수정 중: ${editingSentence.english}` : "";
}
function enterEditMode(id) {
  const sentence = getSentenceById(id);
  if (!sentence) { return; }
  uiState.editingSentenceId = sentence.id;
  fillSentenceForm(sentence);
  refs.postSaveActions.classList.add("hidden-field");
  refs.formMessage.textContent = "";
  clearDuplicateConfirm();
  renderFormState();
  setCurrentView("add");
}
function exitEditMode(options = {}) { uiState.editingSentenceId = null; resetSentenceForm({ clearMessage: Boolean(options.clearMessage) }); renderFormState(); }
function persistSentenceForm(payload, options = {}) {
  const duplicateInfo = getDuplicateInfo(payload, uiState.editingSentenceId);
  const forceDuplicateSave = Boolean(options.forceDuplicateSave);
  const hasSimilar = !duplicateInfo.exactMatch && (duplicateInfo.sameKorean || duplicateInfo.sameEnglish);
  if (duplicateInfo.exactMatch && !forceDuplicateSave) {
    uiState.pendingDuplicateConfirm = payload;
    refs.forceDuplicateSaveButton.classList.remove("hidden-field");
    refs.formMessage.textContent = "완전히 같은 문장이 이미 있어요. 원하면 '중복이어도 저장'을 눌러주세요.";
    return;
  }
  if (uiState.editingSentenceId) {
    updateSentence(uiState.editingSentenceId, (sentence) => ({ ...sentence, ...payload, updated_at: Date.now() }));
    refs.formMessage.textContent = hasSimilar ? "비슷한 문장이 있었지만 수정 내용은 저장했어요." : `저장했어요: ${payload.english}`;
    exitEditMode();
    setCurrentView("library");
  } else {
    state.sentences.unshift(createSentence({ ...payload, status: "new", wrong_count: 0, speaking_checked: false, favorite: false, success_count: 0 }));
    saveState();
    resetSentenceForm();
    refs.postSaveActions.classList.remove("hidden-field");
    refs.formMessage.textContent = duplicateInfo.exactMatch ? "중복 문장도 저장했어요." : hasSimilar ? "비슷한 문장이 있었지만 저장했어요." : `저장했어요: ${payload.english}`;
    refs.koreanInput.focus();
  }
  clearDuplicateConfirm();
  resetQuizSession();
}
function handleSentenceSubmit(event) {
  event.preventDefault();
  const payload = getFormPayload();
  if (!payload.korean || !payload.english) {
    refs.formMessage.textContent = "한국어와 영어 문장을 모두 입력해 주세요.";
    return;
  }
  persistSentenceForm(payload);
}
function renderMiniCards(container, sentences, emptyText) {
  if (!sentences.length) {
    container.innerHTML = `<p class="empty-state">${escapeHtml(emptyText)}</p>`;
    return;
  }
  container.innerHTML = sentences.map((sentence) => `
    <article class="mini-card">
      <div class="mini-card-top">
        <span class="pill">${escapeHtml(sentence.category)}</span>
        <span class="pill status-pill-${escapeHtml(sentence.status)}">${escapeHtml(getStatusLabel(sentence.status))}</span>
      </div>
      <strong>${escapeHtml(sentence.english)}</strong>
      <p>${escapeHtml(sentence.korean)}</p>
      <p class="sentence-meta">오답 ${sentence.wrong_count} · ${sentence.speaking_checked ? "말해봄 완료" : "말하기 미완료"}</p>
    </article>
  `).join("");
}
function renderSummary() {
  refs.totalCountText.textContent = String(state.sentences.length);
  refs.reviewCountText.textContent = String(state.sentences.filter(isReviewNeeded).length);
  refs.speakingPendingText.textContent = String(state.sentences.filter((sentence) => !sentence.speaking_checked).length);
  refs.favoriteCountText.textContent = String(state.sentences.filter((sentence) => sentence.favorite).length);
  renderMiniCards(refs.todaySentenceList, getTodaySentences(), "짧은 문장을 하나 추가하면 바로 시작할 수 있어요.");
  renderMiniCards(refs.recentSentenceList, getRecentSentences(), "최근 추가한 문장이 여기에 보여요.");
  renderMiniCards(refs.favoriteSentenceList, getFavoriteSentences(), "자주 쓰는 문장을 즐겨찾기로 남겨보세요.");
}
function getFilteredSentences() {
  const query = uiState.filters.query.trim().toLowerCase();
  return state.sentences.filter((sentence) => {
    const matchesCategory = uiState.filters.category === "all" || sentence.category === uiState.filters.category;
    const matchesStatus = uiState.filters.status === "all" || sentence.status === uiState.filters.status;
    const matchesFavorite = !uiState.filters.favoriteOnly || sentence.favorite;
    const haystack = [sentence.category, sentence.korean, sentence.english, sentence.pattern, sentence.note, sentence.example].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesCategory && matchesStatus && matchesFavorite && matchesQuery;
  });
}

function renderSentenceList() {
  const sentences = getFilteredSentences();
  if (!sentences.length) {
    refs.sentenceList.innerHTML = '<p class="empty-state">조건에 맞는 문장이 없어요.</p>';
    return;
  }
  refs.sentenceList.innerHTML = sentences.map((sentence) => `
    <article class="sentence-card">
      <div class="sentence-head">
        <div class="mini-card-top">
          <span class="pill">${escapeHtml(sentence.category)}</span>
          <span class="pill status-pill-${escapeHtml(sentence.status)}">${escapeHtml(getStatusLabel(sentence.status))}</span>
          <span class="pill">Lv.${sentence.difficulty}</span>
        </div>
      </div>
      <div class="sentence-main-card">
        <button class="favorite-icon-button${sentence.favorite ? " is-active" : ""}" type="button" data-action="toggle-favorite" data-id="${escapeHtml(sentence.id)}" aria-label="${sentence.favorite ? "즐겨찾기 해제" : "즐겨찾기"}" title="${sentence.favorite ? "즐겨찾기 해제" : "즐겨찾기"}">${sentence.favorite ? "★" : "☆"}</button>
        <p class="sentence-korean">${escapeHtml(sentence.korean)}</p>
        <p class="sentence-english">${escapeHtml(sentence.english)}</p>
      </div>
      <div class="sentence-action-row">
        <button class="primary-button sentence-action-button" type="button" data-action="toggle-speaking" data-id="${escapeHtml(sentence.id)}">${sentence.speaking_checked ? "말해봄 완료" : "말해봄"}</button>
        <button class="secondary-button sentence-action-button" type="button" data-action="edit-sentence" data-id="${escapeHtml(sentence.id)}">수정</button>
        <button class="danger-button sentence-action-button" type="button" data-action="delete-sentence" data-id="${escapeHtml(sentence.id)}">삭제</button>
      </div>
      <div class="sentence-info-grid">
        ${sentence.pattern ? `<div class="meta-box"><span>기본 틀</span><strong>${escapeHtml(sentence.pattern)}</strong></div>` : ""}
        ${sentence.note ? `<div class="meta-box"><span>메모</span><strong>${escapeHtml(sentence.note)}</strong></div>` : ""}
        ${sentence.example ? `<div class="meta-box"><span>응용 예문</span><strong>${escapeHtml(sentence.example)}</strong></div>` : ""}
        <div class="meta-box learning-status-box"><span>학습 상태</span><strong>오답 ${sentence.wrong_count} · ${sentence.speaking_checked ? "말해봄 완료" : "말하기 미완료"}</strong></div>
      </div>
      <details class="learning-details">
        <summary><span class="summary-closed">학습 정보 보기 ▾</span><span class="summary-open">학습 정보 숨기기 ▴</span></summary>
        <div class="learning-detail-grid">
          <div class="learning-detail-item"><span>상태</span><strong>${escapeHtml(getStatusLabel(sentence.status))}</strong></div>
          <div class="learning-detail-item"><span>우선순위</span><strong>${getReviewScore(sentence)}</strong></div>
        </div>
      </details>
    </article>
  `).join("");
}
function createBlankQuestion(sentence) {
  const words = sentence.english.match(/[A-Za-z][A-Za-z'-]*/g);
  if (!words || !words.length) { return null; }
  const sorted = [...words].sort((left, right) => {
    const leftPenalty = STOPWORDS.has(left.toLowerCase()) ? 1 : 0;
    const rightPenalty = STOPWORDS.has(right.toLowerCase()) ? 1 : 0;
    if (leftPenalty !== rightPenalty) { return leftPenalty - rightPenalty; }
    return right.length - left.length;
  });
  const answer = sorted[0];
  if (!answer || answer.length < 2) { return null; }
  return { answer, masked: sentence.english.replace(answer, "_".repeat(Math.max(4, answer.length))) };
}
function buildChoiceOptions(answerSentence, field) {
  const seen = new Set([cleanText(answerSentence[field]).toLowerCase()]);
  const distractors = [];
  shuffle(state.sentences).forEach((sentence) => {
    const value = cleanText(sentence[field]).toLowerCase();
    if (sentence.id === answerSentence.id || seen.has(value)) { return; }
    seen.add(value);
    distractors.push({ id: sentence.id, label: sentence[field] });
  });
  return shuffle([{ id: answerSentence.id, label: answerSentence[field] }, ...distractors.slice(0, 3)]);
}
function createQuestionPayload(sentence) {
  if (uiState.quizMode === "ko_to_en") { return { sentenceId: sentence.id, mode: uiState.quizMode, prompt: sentence.korean, hint: sentence.pattern ? `힌트: ${sentence.pattern}` : QUIZ_MODES[uiState.quizMode].promptPrefix, options: buildChoiceOptions(sentence, "english") }; }
  if (uiState.quizMode === "en_to_ko") { return { sentenceId: sentence.id, mode: uiState.quizMode, prompt: sentence.english, hint: sentence.note ? `힌트: ${sentence.note}` : QUIZ_MODES[uiState.quizMode].promptPrefix, options: buildChoiceOptions(sentence, "korean") }; }
  const blank = createBlankQuestion(sentence);
  return { sentenceId: sentence.id, mode: uiState.quizMode, prompt: blank ? blank.masked : sentence.english, hint: sentence.korean, blankAnswer: blank?.answer || "" };
}
function getQuizEligibleSentences() {
  if (!state.sentences.length) { return []; }
  if (uiState.quizMode === "fill_blank") { return sortByReviewPriority(state.sentences.filter((sentence) => createBlankQuestion(sentence))); }
  const field = uiState.quizMode === "ko_to_en" ? "english" : "korean";
  const uniqueValues = new Set(state.sentences.map((sentence) => cleanText(sentence[field]).toLowerCase()));
  return uniqueValues.size < 2 ? [] : sortByReviewPriority(state.sentences);
}
function clearQuizTimers() {
  if (uiState.quizTimers.thinking) { window.clearTimeout(uiState.quizTimers.thinking); uiState.quizTimers.thinking = null; }
  if (uiState.quizTimers.autoNext) { window.clearTimeout(uiState.quizTimers.autoNext); uiState.quizTimers.autoNext = null; }
}
function unlockQuizAnswerControls() { uiState.answerControlsVisible = true; uiState.revealReady = true; uiState.quizTimers.thinking = null; renderQuiz(); }
function scheduleQuizThinkingPhase() {
  clearQuizTimers();
  uiState.answerControlsVisible = false;
  uiState.revealReady = false;
  uiState.quizTimers.thinking = window.setTimeout(() => unlockQuizAnswerControls(), QUIZ_THINKING_DELAY_MS);
}
function resetQuizSession() {
  clearQuizTimers();
  uiState.quizQueue = getQuizEligibleSentences().map((sentence) => sentence.id).slice(0, 12);
  uiState.quizIndex = 0;
  uiState.quizStats = { correct: 0, wrong: 0 };
  uiState.currentQuestion = null;
  uiState.answerState = null;
  uiState.answerControlsVisible = false;
  uiState.revealReady = false;
  saveState();
  renderApp();
}
function ensureCurrentQuestion() {
  const sentenceId = uiState.quizQueue[uiState.quizIndex];
  if (!sentenceId) { uiState.currentQuestion = null; return null; }
  if (uiState.currentQuestion && uiState.currentQuestion.sentenceId === sentenceId && uiState.currentQuestion.mode === uiState.quizMode) { return uiState.currentQuestion; }
  const sentence = getSentenceById(sentenceId);
  if (!sentence) { uiState.currentQuestion = null; return null; }
  uiState.currentQuestion = createQuestionPayload(sentence);
  uiState.answerState = null;
  scheduleQuizThinkingPhase();
  return uiState.currentQuestion;
}
function getQuizEmptyMessage() {
  if (!state.sentences.length) { return "문장을 하나 이상 추가하면 바로 시작할 수 있어요."; }
  if (uiState.quizMode === "fill_blank") { return "빈칸 채우기는 가릴 핵심 표현이 있는 문장이 필요해요."; }
  return "선택형 퀴즈는 서로 다른 문장이 최소 2개 필요해요.";
}
function renderQuizThinkingState() {
  refs.quizChoiceArea.innerHTML = "";
  refs.quizInputArea.innerHTML = `<div class="thought-card"><p class="thought-label">먼저 떠올려 보세요.</p><p class="thought-copy">${escapeHtml(QUIZ_MODES[uiState.quizMode].thinkingCopy)}</p><button class="secondary-button compact-button thought-button" type="button" data-quiz-action="show-options">생각했으면 보기</button></div>`;
}
function renderChoiceQuestion(question, sentence, isAnswered) {
  refs.quizInputArea.innerHTML = "";
  refs.quizChoiceArea.innerHTML = question.options.map((option) => {
    let className = "choice-button";
    if (isAnswered && option.id === sentence.id) { className += " is-correct"; }
    if (isAnswered && !uiState.answerState.isCorrect && option.id === uiState.answerState.userValue) { className += " is-wrong"; }
    return `<button class="${className}" type="button" data-choice-id="${escapeHtml(option.id)}" ${isAnswered ? "disabled" : ""}>${escapeHtml(option.label)}</button>`;
  }).join("");
}
function renderBlankQuestion(question, sentence, isAnswered) {
  const userValue = isAnswered ? uiState.answerState.userValue : "";
  refs.quizChoiceArea.innerHTML = "";
  refs.quizInputArea.innerHTML = `<form class="quiz-answer-form" id="blankAnswerForm"><input id="blankAnswerInput" type="text" placeholder="빈칸에 들어갈 표현" value="${escapeHtml(userValue)}" ${isAnswered ? "disabled" : ""}><button class="quiz-submit-button" type="submit" ${isAnswered ? "disabled" : ""}>확인</button></form><p class="sentence-meta">뜻 힌트: ${escapeHtml(sentence.korean)}</p>`;
}
function renderQuizResult(sentence) {
  const isCorrect = Boolean(uiState.answerState?.isCorrect);
  const hintSource = sentence.pattern || sentence.note || "문장 구조를 다시 한 번 확인해 보세요.";
  refs.quizResultCard.classList.remove("hidden-field");
  refs.quizResultCard.classList.toggle("is-correct", isCorrect);
  refs.quizResultCard.classList.toggle("is-wrong", !isCorrect);
  refs.quizFeedbackText.textContent = isCorrect ? "정답!" : "오답";
  refs.quizRepeatPromptText.textContent = "한 번 읽어보세요.";
  refs.resultEnglishText.textContent = sentence.english;
  refs.resultKoreanText.textContent = sentence.korean;
  refs.resultPatternText.textContent = sentence.pattern || "-";
  refs.resultExampleText.textContent = sentence.example || "-";
  refs.resultNoteText.textContent = sentence.note || "메모 없음";
  refs.quizHintLine.textContent = isCorrect ? "" : `힌트: ${hintSource}`;
  refs.quizHintLine.classList.toggle("hidden-field", isCorrect);
  refs.resultSpeakingButton.dataset.id = sentence.id;
  refs.resultSpeakingButton.textContent = sentence.speaking_checked ? "말해봄 완료" : "말해봄";
  refs.resultSpeakingButton.classList.remove("hidden-field");
  refs.resultSpeakingButton.classList.toggle("is-complete", sentence.speaking_checked);
}
function renderQuizCompleteState() {
  refs.quizModeBadge.textContent = QUIZ_MODES[uiState.quizMode].label;
  refs.quizPromptText.textContent = "이번 라운드를 마쳤어요.";
  refs.quizHintText.textContent = `정답 ${uiState.quizStats.correct}개 · 오답 ${uiState.quizStats.wrong}개`;
  refs.quizFavoriteButton.classList.add("hidden-field");
  refs.quizSpeakingButton.classList.add("hidden-field");
  refs.quizInputArea.innerHTML = "";
  refs.quizChoiceArea.innerHTML = "";
  refs.quizResultCard.classList.remove("hidden-field");
  refs.quizResultCard.classList.remove("is-wrong");
  refs.quizResultCard.classList.add("is-correct");
  refs.quizFeedbackText.textContent = "새 라운드를 시작하면 우선순위대로 다시 복습할 수 있어요.";
  refs.quizRepeatPromptText.textContent = "자주 틀린 문장은 다시 더 자주 나오게 됩니다.";
  refs.resultEnglishText.textContent = `전체 문장 ${state.sentences.length}`;
  refs.resultKoreanText.textContent = `복습 필요 ${state.sentences.filter(isReviewNeeded).length}`;
  refs.resultPatternText.textContent = `즐겨찾기 ${state.sentences.filter((sentence) => sentence.favorite).length}`;
  refs.resultExampleText.textContent = `말하기 미완료 ${state.sentences.filter((sentence) => !sentence.speaking_checked).length}`;
  refs.resultNoteText.textContent = "적은 문장을 반복해서 내 표현으로 만들어 보세요.";
  refs.quizHintLine.textContent = "";
  refs.quizHintLine.classList.add("hidden-field");
  refs.resultSpeakingButton.classList.add("hidden-field");
  refs.revealAnswerButton.disabled = true;
  refs.nextQuestionButton.disabled = true;
}
function renderQuiz() {
  refs.modeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === uiState.quizMode));
  const eligible = getQuizEligibleSentences();
  if (eligible.length && !uiState.quizQueue.length) { uiState.quizQueue = eligible.map((sentence) => sentence.id).slice(0, 12); }
  const total = uiState.quizQueue.length;
  refs.quizRemainingText.textContent = String(Math.max(total - uiState.quizIndex, 0));
  refs.quizProgressText.textContent = total ? `${Math.min(uiState.quizIndex + 1, total)} / ${total}` : "0 / 0";
  if (!eligible.length) {
    clearQuizTimers();
    refs.quizEmptyState.textContent = getQuizEmptyMessage();
    refs.quizEmptyState.classList.remove("hidden-field");
    refs.quizCard.classList.add("hidden-field");
    return;
  }
  refs.quizEmptyState.classList.add("hidden-field");
  refs.quizCard.classList.remove("hidden-field");
  if (uiState.quizIndex >= total) { clearQuizTimers(); renderQuizCompleteState(); return; }
  const question = ensureCurrentQuestion();
  const sentence = question ? getSentenceById(question.sentenceId) : null;
  if (!question || !sentence) { return; }
  const isAnswered = Boolean(uiState.answerState && uiState.answerState.questionId === sentence.id);
  refs.quizFavoriteButton.classList.remove("hidden-field");
  refs.quizSpeakingButton.classList.remove("hidden-field");
  refs.quizFavoriteButton.dataset.id = sentence.id;
  refs.quizSpeakingButton.dataset.id = sentence.id;
  refs.quizFavoriteButton.textContent = sentence.favorite ? "즐겨찾기됨" : "즐겨찾기";
  refs.quizSpeakingButton.textContent = sentence.speaking_checked ? "말해봄 완료" : "말해봄";
  refs.quizFavoriteButton.classList.toggle("is-active", sentence.favorite);
  refs.quizSpeakingButton.classList.toggle("is-active", sentence.speaking_checked);
  refs.quizModeBadge.textContent = QUIZ_MODES[uiState.quizMode].label;
  refs.quizPromptText.textContent = question.prompt;
  refs.quizHintText.textContent = question.hint || QUIZ_MODES[uiState.quizMode].promptPrefix;
  refs.revealAnswerButton.disabled = isAnswered || !uiState.revealReady;
  refs.nextQuestionButton.disabled = !isAnswered;
  if (isAnswered) {
    if (uiState.quizMode === "fill_blank") { renderBlankQuestion(question, sentence, true); } else { renderChoiceQuestion(question, sentence, true); }
    renderQuizResult(sentence);
    return;
  }
  refs.quizResultCard.classList.add("hidden-field");
  refs.quizResultCard.classList.remove("is-correct", "is-wrong");
  refs.quizHintLine.classList.add("hidden-field");
  refs.resultSpeakingButton.classList.add("hidden-field");
  if (!uiState.answerControlsVisible) { renderQuizThinkingState(); }
  else if (uiState.quizMode === "fill_blank") { renderBlankQuestion(question, sentence, false); }
  else { renderChoiceQuestion(question, sentence, false); }
}
function finalizeQuizAnswer(isCorrect, userValue) {
  clearQuizTimers();
  const question = ensureCurrentQuestion();
  const sentence = question ? getSentenceById(question.sentenceId) : null;
  if (!question || !sentence) { return; }
  updateSentence(sentence.id, (currentSentence) => applyQuizResult(currentSentence, isCorrect));
  uiState.answerState = { questionId: sentence.id, isCorrect, userValue };
  if (isCorrect) { uiState.quizStats.correct += 1; }
  else {
    uiState.quizStats.wrong += 1;
    const occurrences = uiState.quizQueue.filter((id) => id === sentence.id).length;
    if (occurrences < 3) { uiState.quizQueue.splice(Math.min(uiState.quizIndex + 2, uiState.quizQueue.length), 0, sentence.id); }
  }
  renderApp();
  if (isCorrect && refs.autoNextToggle.checked) { uiState.quizTimers.autoNext = window.setTimeout(() => moveToNextQuestion(), QUIZ_AUTO_NEXT_DELAY_MS); }
}
function moveToNextQuestion() {
  if (!uiState.answerState) { return; }
  clearQuizTimers();
  uiState.quizIndex += 1;
  uiState.currentQuestion = null;
  uiState.answerState = null;
  uiState.answerControlsVisible = false;
  uiState.revealReady = false;
  renderApp();
}
function showQuizOptionsNow() { if (!uiState.answerState && !uiState.answerControlsVisible) { unlockQuizAnswerControls(); } }
function revealAnswer() {
  if (uiState.answerState || !uiState.revealReady) { return; }
  const question = ensureCurrentQuestion();
  if (question) { finalizeQuizAnswer(false, uiState.quizMode === "fill_blank" ? question.blankAnswer : "__revealed__"); }
}
function setCurrentView(viewName) { uiState.currentView = refs.views[viewName] ? viewName : "dashboard"; if (uiState.currentView !== "quiz") { clearQuizTimers(); } renderView(); }
function renderView() {
  Object.entries(refs.views).forEach(([viewName, element]) => element.classList.toggle("is-active", uiState.currentView === viewName));
  refs.viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.viewTarget === uiState.currentView));
}
function handleLibraryAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) { return; }
  if (button.dataset.action === "edit-sentence") { enterEditMode(button.dataset.id); }
  if (button.dataset.action === "toggle-favorite") { toggleFavorite(button.dataset.id); }
  if (button.dataset.action === "toggle-speaking") { toggleSpeaking(button.dataset.id); }
  if (button.dataset.action === "delete-sentence") { deleteSentence(button.dataset.id); }
}
function handleViewButtons(event) { const button = event.target.closest("[data-view-target]"); if (button) { setCurrentView(button.dataset.viewTarget); } }
function handleModeButtons(event) {
  const button = event.target.closest("[data-mode]");
  if (!button || !QUIZ_MODES[button.dataset.mode]) { return; }
  uiState.quizMode = button.dataset.mode;
  resetQuizSession();
}
function handleQuizChoiceClick(event) {
  const button = event.target.closest("[data-choice-id]");
  if (!button || uiState.answerState || !uiState.answerControlsVisible) { return; }
  const question = ensureCurrentQuestion();
  if (question) { finalizeQuizAnswer(button.dataset.choiceId === question.sentenceId, button.dataset.choiceId); }
}
function handleBlankSubmit(event) {
  if (event.target.id !== "blankAnswerForm" || uiState.answerState || !uiState.answerControlsVisible) { return; }
  event.preventDefault();
  const input = document.getElementById("blankAnswerInput");
  const question = ensureCurrentQuestion();
  if (!input || !question) { return; }
  const userAnswer = cleanText(input.value);
  finalizeQuizAnswer(userAnswer.toLowerCase() === cleanText(question.blankAnswer).toLowerCase(), userAnswer);
}
function bindEvents() {
  document.addEventListener("click", handleViewButtons);
  document.addEventListener("click", handleModeButtons);
  refs.categoryInput.addEventListener("change", updateCategoryInputVisibility);
  refs.englishInput.addEventListener("input", () => { updateAutoGeneratedFields(); updateSimilarSentenceHint(); });
  refs.toggleExampleButton.addEventListener("click", () => {
    uiState.exampleFieldVisible = !uiState.exampleFieldVisible;
    refs.exampleField.classList.toggle("hidden-field", !uiState.exampleFieldVisible);
    refs.toggleExampleButton.textContent = uiState.exampleFieldVisible ? "확장 예문 닫기" : "+ 확장 예문 추가";
    refs.additionalInfoDetails.open = true;
  });
  refs.sentenceForm.addEventListener("input", () => {
    if (!uiState.pendingDuplicateConfirm) { return; }
    const pending = uiState.pendingDuplicateConfirm;
    const payload = getFormPayload();
    const sameAsPending = pending.category === payload.category && pending.korean === payload.korean && pending.english === payload.english && pending.pattern === payload.pattern && pending.note === payload.note && pending.example === payload.example && pending.difficulty === payload.difficulty;
    if (!sameAsPending) { clearDuplicateConfirm(true); }
  });
  refs.sentenceForm.addEventListener("submit", handleSentenceSubmit);
  refs.cancelEditButton.addEventListener("click", () => exitEditMode({ clearMessage: true }));
  refs.forceDuplicateSaveButton.addEventListener("click", () => { if (uiState.pendingDuplicateConfirm) { persistSentenceForm(uiState.pendingDuplicateConfirm, { forceDuplicateSave: true }); } });
  refs.continueAddButton.addEventListener("click", () => { refs.postSaveActions.classList.add("hidden-field"); refs.formMessage.textContent = ""; refs.koreanInput.focus(); });
  refs.goHomeAfterSaveButton.addEventListener("click", () => { refs.postSaveActions.classList.add("hidden-field"); setCurrentView("dashboard"); });
  refs.sentenceList.addEventListener("click", handleLibraryAction);
  refs.categoryFilter.addEventListener("change", (event) => { uiState.filters.category = event.target.value; renderSentenceList(); });
  refs.statusFilter.addEventListener("change", (event) => { uiState.filters.status = event.target.value; renderSentenceList(); });
  refs.searchInput.addEventListener("input", (event) => { uiState.filters.query = event.target.value; renderSentenceList(); });
  refs.favoriteOnlyFilter.addEventListener("change", (event) => { uiState.filters.favoriteOnly = event.target.checked; renderSentenceList(); });
  refs.quizChoiceArea.addEventListener("click", handleQuizChoiceClick);
  refs.quizInputArea.addEventListener("submit", handleBlankSubmit);
  refs.quizInputArea.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-quiz-action]");
    if (actionButton?.dataset.quizAction === "show-options") { showQuizOptionsNow(); }
  });
  refs.revealAnswerButton.addEventListener("click", revealAnswer);
  refs.nextQuestionButton.addEventListener("click", moveToNextQuestion);
  refs.resetQuizButton.addEventListener("click", resetQuizSession);
  refs.quizFavoriteButton.addEventListener("click", () => { if (refs.quizFavoriteButton.dataset.id) { toggleFavorite(refs.quizFavoriteButton.dataset.id); } });
  refs.quizSpeakingButton.addEventListener("click", () => { if (refs.quizSpeakingButton.dataset.id) { toggleSpeaking(refs.quizSpeakingButton.dataset.id); } });
  refs.resultSpeakingButton.addEventListener("click", () => { if (refs.resultSpeakingButton.dataset.id) { toggleSpeaking(refs.resultSpeakingButton.dataset.id); } });
}
function renderApp() {
  populateCategoryInputs();
  updateCategoryInputVisibility();
  renderView();
  renderFormState();
  renderSummary();
  renderSentenceList();
  renderQuiz();
}
function init() { bindEvents(); resetSentenceForm({ clearMessage: true }); renderApp(); }
init();
