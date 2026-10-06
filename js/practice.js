// Treino infinito: sorteia questões, corrige, dá dica, mostra resolução,
// mantém placar e sobe de nível automaticamente.

import { makeRng } from './lib/random.js';
import { checkAnswer } from './lib/answer.js';
import { getScore, setScore } from './lib/storage.js';
import { renderMath, escapeHtml } from './lib/math-render.js';

const LEVELS = ['Fácil', 'Médio', 'Difícil'];
const LEVEL_UP_STREAK = 5;
const PRAISE = ['Acertou!', 'Mandou bem!', 'Isso aí!', 'Perfeito!', 'Exato!', 'Certinho!'];

const generatorCache = new Map();
export async function loadGenerator(id) {
  if (!generatorCache.has(id)) {
    generatorCache.set(id, import(`./generators/${id}.js`).then((m) => m.default));
  }
  return generatorCache.get(id);
}

/**
 * Monta um treino dentro de `root`.
 * topics: [{ generator, title }] — com mais de um tópico vira treino misto.
 */
export async function mountPractice(root, topics, { compact = false } = {}) {
  const rng = makeRng();
  const gens = await Promise.all(topics.map((t) => loadGenerator(t.generator)));
  const mixed = topics.length > 1;
  const session = { correct: 0, total: 0 };

  root.classList.add('practice');
  if (compact) root.classList.add('practice--compact');
  root.innerHTML = `
    <div class="practice-top">
      <div class="levels" role="radiogroup" aria-label="Nível"></div>
      <div class="scoreboard" aria-live="polite"></div>
    </div>
    <div class="q-card">
      <div class="q-meta"></div>
      <div class="q-prompt"></div>
      <div class="q-figure"></div>
      <form class="q-form" autocomplete="off"></form>
      <div class="q-feedback" aria-live="polite"></div>
      <div class="q-solution" hidden></div>
      <div class="q-actions">
        <button type="button" class="btn btn-primary q-check">Verificar</button>
        <button type="button" class="btn btn-ghost q-show">Ver resolução</button>
        <button type="button" class="btn btn-ghost q-next">Nova questão ↻</button>
      </div>
    </div>
    <div class="level-progress"></div>`;

  const $ = (sel) => root.querySelector(sel);
  const levelsEl = $('.levels');
  const scoreEl = $('.scoreboard');
  const metaEl = $('.q-meta');
  const promptEl = $('.q-prompt');
  const figureEl = $('.q-figure');
  const formEl = $('.q-form');
  const feedbackEl = $('.q-feedback');
  const solutionEl = $('.q-solution');
  const checkBtn = $('.q-check');
  const showBtn = $('.q-show');
  const nextBtn = $('.q-next');
  const progressEl = $('.level-progress');

  let current = null; // { topicIndex, q, attempts, finished, choice }

  function topicOf(i) { return topics[i].generator; }

  function renderLevels() {
    if (mixed) { levelsEl.innerHTML = '<span class="pill">Treino misto</span>'; return; }
    const score = getScore(topicOf(0));
    levelsEl.innerHTML = LEVELS.map((name, i) => `
      <button type="button" role="radio" aria-checked="${score.level === i + 1}"
        class="level-btn ${score.level === i + 1 ? 'is-active' : ''}" data-level="${i + 1}">${name}</button>`).join('');
  }

  function renderScore() {
    if (mixed) {
      scoreEl.innerHTML = `
        <span title="Acertos nesta sessão"><b>${session.correct}</b> acertos</span>
        <span title="Questões feitas nesta sessão"><b>${session.total}</b> feitas</span>`;
      progressEl.textContent = '';
      return;
    }
    const s = getScore(topicOf(0));
    scoreEl.innerHTML = `
      <span title="Acertos de primeira"><b>${s.correct}</b> acertos</span>
      <span title="Sequência atual de acertos" class="${s.streak >= 3 ? 'hot' : ''}"><b>${s.streak}</b> seguidos</span>
      <span title="Total de questões feitas"><b>${s.total}</b> feitas</span>`;
    if (s.level < 3) {
      const ls = Math.min(s.levelStreak || 0, LEVEL_UP_STREAK);
      const dots = Array.from({ length: LEVEL_UP_STREAK }, (_, i) => `<i class="${i < ls ? 'on' : ''}"></i>`).join('');
      progressEl.innerHTML = `<span class="dots">${dots}</span> ${LEVEL_UP_STREAK} acertos seguidos para subir para <b>${LEVELS[s.level]}</b>`;
    } else {
      progressEl.innerHTML = 'Você está no nível mais difícil. Respeito!';
    }
  }

  function buildForm(q) {
    const a = q.answer;
    if (a.type === 'choice') {
      formEl.innerHTML = `<div class="choices">${a.options.map((opt, i) =>
        `<button type="button" class="choice" data-i="${i}">${opt}</button>`).join('')}</div>`;
      return;
    }
    const keys = q.keys || ['-', '/', ','];
    const keyLabel = { '-': '−', '/': 'a/b', ',': ',', '√': '√', '%': '%' };
    const keypad = `<div class="keypad">${keys.map((k) =>
      `<button type="button" class="key" data-key="${escapeHtml(k)}" aria-label="inserir ${escapeHtml(k)}">${keyLabel[k] || k}</button>`).join('')}</div>`;
    if (a.type === 'fields') {
      formEl.innerHTML = `<div class="fields">${a.fields.map((f, i) => `
        <label class="field"><span>${f.label}</span>
          <input class="answer-input" data-i="${i}" inputmode="decimal" autocapitalize="off" spellcheck="false" placeholder="?"></label>`).join('')}</div>${keypad}`;
    } else {
      formEl.innerHTML = `
        <label class="field field--main">
          <span class="sr-only">Sua resposta</span>
          ${q.prefix ? `<span class="affix">${q.prefix}</span>` : ''}
          <input class="answer-input" inputmode="decimal" autocapitalize="off" spellcheck="false"
            placeholder="${escapeHtml(q.placeholder || 'Sua resposta')}">
          ${q.suffix ? `<span class="affix">${q.suffix}</span>` : ''}
        </label>${keypad}`;
    }
  }

  function inputs() { return [...formEl.querySelectorAll('.answer-input')]; }

  function readInput() {
    const a = current.q.answer;
    if (a.type === 'choice') return current.choice;
    if (a.type === 'fields') return inputs().map((i) => i.value);
    return inputs()[0]?.value ?? '';
  }

  function lockForm(lock) {
    inputs().forEach((i) => { i.readOnly = lock; });
    formEl.querySelectorAll('.key, .choice').forEach((b) => { b.disabled = lock; });
  }

  function newQuestion() {
    const topicIndex = mixed ? rng.int(0, topics.length - 1) : 0;
    const level = getScore(topicOf(topicIndex)).level;
    const q = gens[topicIndex].generate(level, rng);
    current = { topicIndex, q, attempts: 0, finished: false, choice: null };

    metaEl.innerHTML = mixed
      ? `<span class="pill">${escapeHtml(topics[topicIndex].title)}</span><span class="pill pill--soft">${LEVELS[level - 1]}</span>`
      : '';
    promptEl.innerHTML = q.prompt;
    figureEl.innerHTML = q.figure || '';
    figureEl.hidden = !q.figure;
    buildForm(q);
    feedbackEl.innerHTML = '';
    feedbackEl.className = 'q-feedback';
    solutionEl.hidden = true;
    solutionEl.innerHTML = '';
    checkBtn.hidden = false;
    showBtn.hidden = true;
    nextBtn.classList.remove('btn-primary');
    nextBtn.classList.add('btn-ghost');
    renderMath(promptEl);
    renderMath(formEl);
    renderLevels();
    renderScore();
    const first = inputs()[0];
    if (first && !compact) first.focus({ preventScroll: true });
  }

  function showSolution() {
    const q = current.q;
    solutionEl.innerHTML = `
      <h4>Resolução passo a passo</h4>
      <ol class="steps">${q.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
      <p class="answer-line">Resposta: <strong>${q.answerDisplay}</strong></p>`;
    solutionEl.hidden = false;
    renderMath(solutionEl);
    showBtn.hidden = true;
  }

  function finish(firstTry) {
    current.finished = true;
    const topic = topicOf(current.topicIndex);
    const s = getScore(topic);
    s.total += 1;
    session.total += 1;
    let levelMsg = '';
    if (firstTry) {
      s.correct += 1;
      s.streak += 1;
      s.best = Math.max(s.best, s.streak);
      s.levelStreak = (s.levelStreak || 0) + 1;
      session.correct += 1;
      if (s.levelStreak >= LEVEL_UP_STREAK && s.level < 3) {
        s.level += 1;
        s.levelStreak = 0;
        levelMsg = `<div class="level-up">Subiu de nível! Agora: <b>${LEVELS[s.level - 1]}</b></div>`;
      }
    }
    setScore(topic, s);
    lockForm(true);
    checkBtn.hidden = true;
    nextBtn.classList.add('btn-primary');
    nextBtn.classList.remove('btn-ghost');
    nextBtn.focus({ preventScroll: true });
    renderScore();
    renderLevels();
    return levelMsg;
  }

  function breakStreak() {
    const topic = topicOf(current.topicIndex);
    const s = getScore(topic);
    s.streak = 0;
    s.levelStreak = 0;
    setScore(topic, s);
    renderScore();
  }

  function check() {
    if (!current || current.finished) return;
    const res = checkAnswer(current.q.answer, readInput());
    if (res.empty) {
      formEl.classList.remove('shake'); void formEl.offsetWidth; formEl.classList.add('shake');
      return;
    }
    if (res.ok) {
      const firstTry = current.attempts === 0;
      const levelMsg = finish(firstTry);
      feedbackEl.className = 'q-feedback is-right';
      feedbackEl.innerHTML = `<b>${firstTry ? rng.pick(PRAISE) : 'Agora sim!'}</b>
        ${firstTry ? '' : ' Na próxima, de primeira.'}${levelMsg}`;
      if (current.q.answer.type === 'choice') markChoices();
      solutionEl.hidden = true;
      showBtn.hidden = false;
      showBtn.textContent = 'Ver resolução';
      return;
    }
    if (res.message && current.attempts === 0 && !res.ok && /Equivalente|Não entendi/.test(res.message)) {
      // Resposta quase certa ou ilegível: avisa sem contar como erro.
      feedbackEl.className = 'q-feedback is-warn';
      feedbackEl.innerHTML = escapeHtml(res.message);
      return;
    }
    current.attempts += 1;
    if (current.attempts === 1) {
      breakStreak();
      feedbackEl.className = 'q-feedback is-wrong';
      feedbackEl.innerHTML = `<b>Quase.</b> ${res.message ? escapeHtml(res.message) + ' ' : ''}Dica: ${current.q.hint}`;
      renderMath(feedbackEl);
      showBtn.hidden = false;
      if (current.q.answer.type === 'choice') {
        formEl.querySelector(`.choice[data-i="${current.choice}"]`)?.classList.add('is-wrong');
        current.choice = null;
        formEl.querySelectorAll('.choice').forEach((b) => b.classList.remove('is-selected'));
      } else {
        inputs()[0]?.select();
      }
    } else {
      finish(false);
      feedbackEl.className = 'q-feedback is-wrong';
      feedbackEl.innerHTML = '<b>Não foi dessa vez.</b> Veja como resolver:';
      if (current.q.answer.type === 'choice') markChoices();
      showSolution();
    }
  }

  function markChoices() {
    formEl.querySelectorAll('.choice').forEach((b) => {
      if (Number(b.dataset.i) === current.q.answer.correct) b.classList.add('is-right');
    });
  }

  // Eventos
  levelsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.level-btn');
    if (!btn) return;
    const topic = topicOf(0);
    const s = getScore(topic);
    s.level = Number(btn.dataset.level);
    s.levelStreak = 0;
    setScore(topic, s);
    newQuestion();
  });

  formEl.addEventListener('submit', (e) => { e.preventDefault(); current?.finished ? newQuestion() : check(); });
  formEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); current?.finished ? newQuestion() : check(); }
  });
  formEl.addEventListener('click', (e) => {
    const key = e.target.closest('.key');
    if (key) {
      const input = document.activeElement?.classList.contains('answer-input') ? document.activeElement : (formEl._lastInput || inputs()[0]);
      if (!input || input.readOnly) return;
      const k = key.dataset.key;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      input.value = input.value.slice(0, start) + k + input.value.slice(end);
      input.focus();
      input.setSelectionRange(start + k.length, start + k.length);
      return;
    }
    const choice = e.target.closest('.choice');
    if (choice && !current.finished) {
      current.choice = Number(choice.dataset.i);
      formEl.querySelectorAll('.choice').forEach((b) => b.classList.toggle('is-selected', b === choice));
      check();
    }
  });
  formEl.addEventListener('focusin', (e) => {
    if (e.target.classList.contains('answer-input')) formEl._lastInput = e.target;
  });
  // Evita que tocar no teclado auxiliar tire o foco do campo no celular.
  formEl.addEventListener('mousedown', (e) => { if (e.target.closest('.key')) e.preventDefault(); });

  checkBtn.addEventListener('click', check);
  nextBtn.addEventListener('click', newQuestion);
  showBtn.addEventListener('click', () => {
    if (!current.finished) {
      // Desistiu: conta como questão feita, sem acerto.
      breakStreak();
      finish(false);
      feedbackEl.className = 'q-feedback';
      feedbackEl.innerHTML = '';
      if (current.q.answer.type === 'choice') markChoices();
    }
    showSolution();
  });

  newQuestion();
}
