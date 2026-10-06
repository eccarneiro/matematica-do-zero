// Progresso salvo no navegador (localStorage).
// Estrutura: { lessons: { [id]: { done, at } }, topics: { [gen]: Score }, theme }

const KEY = 'matematica-do-zero:v1';

const empty = () => ({ lessons: {}, topics: {}, theme: null });

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* modo privado */ }
}

export function isLessonDone(id) {
  return !!state.lessons[id]?.done;
}

export function setLessonDone(id, done) {
  if (done) state.lessons[id] = { done: true, at: Date.now() };
  else delete state.lessons[id];
  save();
}

export function getScore(topic) {
  return { correct: 0, total: 0, streak: 0, best: 0, level: 1, ...(state.topics[topic] || {}) };
}

export function setScore(topic, score) {
  state.topics[topic] = score;
  save();
}

export function getTheme() { return state.theme; }
export function setTheme(t) { state.theme = t; save(); }

export function resetAll() {
  state = empty();
  save();
}
