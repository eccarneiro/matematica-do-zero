import { modules, findLesson, findModule, practiceTopics } from '../content/curriculum.js';
import { isLessonDone, setLessonDone, getScore, getTheme, setTheme, resetAll } from './lib/storage.js';
import { renderMath, escapeHtml } from './lib/math-render.js';
import { mountPractice } from './practice.js';

const view = document.getElementById('view');
const SECTIONS = [
  ['historia', 'História'], ['ideia', 'A ideia'], ['uso', 'Pra que serve'], ['pensar', 'Pra pensar'],
  ['videos', 'Vídeos'], ['exemplos', 'Exemplos'], ['treino', 'Treino'],
];
const LEVELS = ['Fácil', 'Médio', 'Difícil'];

// ---------- Tema ----------
function applyTheme() {
  const t = getTheme();
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}
function currentTheme() {
  return getTheme() || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
document.querySelectorAll('[data-action="theme"]').forEach((b) => b.addEventListener('click', () => {
  setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  applyTheme();
}));
applyTheme();

// ---------- Utilidades ----------
function lessonProgress(mod) {
  const ready = mod.lessons.filter((l) => l.ready);
  const done = ready.filter((l) => isLessonDone(l.id));
  return { ready: ready.length, done: done.length, total: mod.lessons.length };
}

function nextLesson() {
  for (const mod of modules) for (const l of mod.lessons) if (l.ready && !isLessonDone(l.id)) return { mod, l };
  return null;
}

const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function setTitle(t) { document.title = t ? `${t} · Matemática do Zero` : 'Matemática do Zero'; }

function setActiveNav(name) {
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === name));
}

// ---------- Telas ----------
function lessonRow(mod, l, i) {
  const done = isLessonDone(l.id);
  const inner = `
    <span class="lesson-num ${done ? 'is-done' : ''}">${done ? '✓' : i + 1}</span>
    <span class="lesson-text"><span class="lesson-title">${escapeHtml(l.title)}</span>
      ${l.summary ? `<span class="lesson-sum">${escapeHtml(l.summary)}</span>` : ''}</span>
    ${l.ready ? '<span class="chev" aria-hidden="true">›</span>' : '<span class="badge">em breve</span>'}`;
  return l.ready
    ? `<li><a class="lesson-row" href="#/aula/${l.id}">${inner}</a></li>`
    : `<li><div class="lesson-row is-soon" aria-disabled="true">${inner}</div></li>`;
}

function renderHome() {
  setTitle('');
  setActiveNav('trilha');
  const next = nextLesson();
  const anyReady = modules.some((m) => m.lessons.some((l) => l.ready));
  view.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Curso gratuito · do básico ao cálculo</p>
      <h1>Matemática do zero,<br><em>com história e sentido.</em></h1>
      <p class="lead">Cada aula conta quem inventou a ideia e por quê, explica com desenhos que você mexe,
        mostra pra que serve hoje e termina com treino infinito: questões novas sempre que você quiser.</p>
      <div class="hero-actions">
        ${next ? `<a class="btn btn-primary" href="#/aula/${next.l.id}">${isLessonDone(modules[0].lessons[0].id) ? 'Continuar' : 'Começar'}: ${escapeHtml(next.l.title)}</a>`
          : anyReady ? '<span class="pill">Você concluiu todas as aulas disponíveis!</span>' : ''}
        <a class="btn btn-ghost" href="#/treino-misto">Treino misto</a>
      </div>
    </section>
    <section class="trail" aria-label="Trilha de módulos">
      ${modules.map((mod) => {
        const p = lessonProgress(mod);
        const soon = p.ready === 0;
        return `
        <article class="module-card c-${mod.color} ${soon ? 'is-soon' : ''}">
          <header>
            <span class="module-num">${mod.number}</span>
            <div>
              <h2><a href="#/modulo/${mod.id}">${escapeHtml(mod.title)}</a></h2>
              <p>${escapeHtml(mod.tagline)}</p>
            </div>
            ${soon ? '<span class="badge">em breve</span>' : `<span class="progress-label">${p.done}/${p.ready}</span>`}
          </header>
          ${soon ? '' : `<div class="bar"><span style="width:${(100 * p.done) / p.ready}%"></span></div>`}
          <ol class="lesson-list">${mod.lessons.map((l, i) => lessonRow(mod, l, i)).join('')}</ol>
        </article>`;
      }).join('')}
    </section>`;
}

function renderModule(id) {
  const mod = findModule(id);
  if (!mod) return renderNotFound();
  setTitle(mod.title);
  setActiveNav('trilha');
  const p = lessonProgress(mod);
  view.innerHTML = `
    <nav class="crumbs"><a href="#/">Trilha</a> › <span>Módulo ${mod.number}</span></nav>
    <article class="module-card module-card--page c-${mod.color} ${p.ready ? '' : 'is-soon'}">
      <header>
        <span class="module-num">${mod.number}</span>
        <div><h1>${escapeHtml(mod.title)}</h1><p>${escapeHtml(mod.tagline)}</p></div>
      </header>
      ${p.ready ? `<div class="bar"><span style="width:${(100 * p.done) / p.ready}%"></span></div>` : '<p class="note">Este módulo está sendo preparado. As aulas aparecem aqui assim que ficarem prontas.</p>'}
      <ol class="lesson-list">${mod.lessons.map((l, i) => lessonRow(mod, l, i)).join('')}</ol>
    </article>`;
}

function videoCard(v) {
  return `
    <div class="video">
      <button class="video-thumb" data-yt="${escapeHtml(v.id)}" aria-label="Assistir: ${escapeHtml(v.title)}">
        <img src="https://i.ytimg.com/vi/${escapeHtml(v.id)}/hqdefault.jpg" alt="" loading="lazy">
        <span class="play" aria-hidden="true"></span>
      </button>
      <p class="video-title">${escapeHtml(v.title)}</p>
      <p class="video-channel">${escapeHtml(v.channel)} · <a href="https://www.youtube.com/watch?v=${escapeHtml(v.id)}" target="_blank" rel="noopener">abrir no YouTube</a></p>
    </div>`;
}

function exampleCard(ex, i) {
  return `
    <div class="example">
      <p class="example-label">Exemplo ${i + 1}</p>
      <div class="example-problem">${ex.problem}</div>
      <ol class="steps steps--reveal">${ex.steps.map((s) => `<li hidden>${s}</li>`).join('')}</ol>
      <div class="example-actions">
        <button class="btn btn-soft" data-step>Mostrar 1º passo</button>
        <button class="btn btn-ghost" data-all>Mostrar tudo</button>
      </div>
    </div>`;
}

async function mountInteractives(root) {
  const nodes = [...root.querySelectorAll('[data-interactive]')];
  await Promise.all(nodes.map(async (el) => {
    try {
      const mod = await import(`./interactives/${el.dataset.interactive}.js`);
      const config = el.dataset.config ? JSON.parse(el.dataset.config) : {};
      mod.mount(el, config);
      renderMath(el);
    } catch (err) {
      console.error(err);
      el.innerHTML = '<p class="note">Não foi possível carregar este interativo.</p>';
    }
  }));
}

async function renderLesson(id) {
  const found = findLesson(id);
  if (!found || !found.lesson.ready) return renderNotFound();
  const { module: mod, lesson, index } = found;
  setTitle(lesson.title);
  setActiveNav('trilha');
  view.innerHTML = '<div class="loading">Carregando aula…</div>';
  const content = (await import(`../content/${mod.id}/${lesson.id}.js`)).default;
  const prev = mod.lessons[index - 1];
  const next = mod.lessons[index + 1];
  const done = isLessonDone(lesson.id);
  const h = content.history;

  view.innerHTML = `
    <article class="lesson c-${mod.color}">
      <header class="lesson-hero">
        <nav class="crumbs"><a href="#/">Trilha</a> › <a href="#/modulo/${mod.id}">${escapeHtml(mod.title)}</a> › <span>Aula ${index + 1}</span></nav>
        <h1>${escapeHtml(lesson.title)}</h1>
        <p class="lead">${escapeHtml(lesson.summary || '')}</p>
        <nav class="toc" aria-label="Seções da aula">
          ${SECTIONS.map(([sid, name], i) => `<a href="#/aula/${lesson.id}/${sid}" data-sec="${sid}"><span>${i + 1}</span>${name}</a>`).join('')}
        </nav>
      </header>

      <section id="historia" class="sec sec-history">
        <p class="sec-eyebrow">1 · A história</p>
        <h2>${h.title}</h2>
        <div class="history-meta">
          <span>🕰️ ${h.when}</span><span>📍 ${h.where}</span>${h.who ? `<span>👤 ${h.who}</span>` : ''}
        </div>
        <div class="prose">${h.html}</div>
      </section>

      <section id="ideia" class="sec">
        <p class="sec-eyebrow">2 · A ideia</p>
        <div class="prose">${content.idea}</div>
      </section>

      <section id="uso" class="sec">
        <p class="sec-eyebrow">3 · Pra que serve hoje</p>
        <div class="uses">${content.uses.map((u) => `
          <div class="use"><span class="use-icon" aria-hidden="true">${u.icon}</span>
            <h3>${u.title}</h3><p>${u.text}</p></div>`).join('')}</div>
      </section>

      <section id="pensar" class="sec">
        <p class="sec-eyebrow">4 · Pra pensar</p>
        <blockquote class="think">
          <p class="think-q">${content.think.question}</p>
          <div class="prose">${content.think.html}</div>
        </blockquote>
      </section>

      <section id="videos" class="sec">
        <p class="sec-eyebrow">5 · Videoaulas</p>
        <div class="videos">${content.videos.map(videoCard).join('')}</div>
      </section>

      <section id="exemplos" class="sec">
        <p class="sec-eyebrow">6 · Exemplos resolvidos</p>
        <div class="examples">${content.examples.map(exampleCard).join('')}</div>
      </section>

      <section id="treino" class="sec">
        <p class="sec-eyebrow">7 · Treino infinito</p>
        <p class="sec-intro">Questões novas a cada clique. Acerte ${5} seguidas para subir de nível.
          <a href="#/treino/${lesson.id}">Abrir em tela cheia ›</a></p>
        <div id="practice-root"></div>
      </section>

      <footer class="lesson-foot">
        <button class="btn ${done ? 'btn-soft' : 'btn-primary'}" id="done-btn">${done ? '✓ Aula concluída' : 'Marcar aula como concluída'}</button>
        <div class="pager">
          ${prev ? `<a href="#/aula/${prev.id}" class="pager-link">‹ ${escapeHtml(prev.title)}</a>` : '<span></span>'}
          ${next && next.ready ? `<a href="#/aula/${next.id}" class="pager-link pager-next">${escapeHtml(next.title)} ›</a>` : ''}
        </div>
      </footer>
    </article>`;

  renderMath(view);
  mountInteractives(view);
  if (lesson.generator) {
    mountPractice(view.querySelector('#practice-root'), [{ generator: lesson.generator, title: lesson.title }], { compact: true });
  }

  view.querySelectorAll('.video-thumb').forEach((btn) => btn.addEventListener('click', () => {
    const id = btn.dataset.yt;
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    frame.title = btn.getAttribute('aria-label');
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;
    btn.replaceWith(frame);
  }));

  view.querySelectorAll('.example').forEach((ex) => {
    const steps = [...ex.querySelectorAll('.steps li')];
    const stepBtn = ex.querySelector('[data-step]');
    const allBtn = ex.querySelector('[data-all]');
    const update = () => {
      const shown = steps.filter((s) => !s.hidden).length;
      if (shown === steps.length) { stepBtn.hidden = true; allBtn.hidden = true; }
      else stepBtn.textContent = shown === 0 ? 'Mostrar 1º passo' : 'Próximo passo';
    };
    stepBtn.addEventListener('click', () => { const s = steps.find((x) => x.hidden); if (s) s.hidden = false; update(); });
    allBtn.addEventListener('click', () => { steps.forEach((s) => { s.hidden = false; }); update(); });
  });

  view.querySelector('#done-btn').addEventListener('click', (e) => {
    const now = !isLessonDone(lesson.id);
    setLessonDone(lesson.id, now);
    e.currentTarget.textContent = now ? '✓ Aula concluída' : 'Marcar aula como concluída';
    e.currentTarget.classList.toggle('btn-primary', !now);
    e.currentTarget.classList.toggle('btn-soft', now);
  });

  // Destaca a seção visível no índice.
  const tocLinks = [...view.querySelectorAll('.toc a')];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) tocLinks.forEach((a) => a.classList.toggle('is-active', a.dataset.sec === en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  view.querySelectorAll('.sec').forEach((s) => io.observe(s));
}

function renderPractice(lessonId) {
  const found = findLesson(lessonId);
  if (!found || !found.lesson.generator) return renderNotFound();
  const { module: mod, lesson } = found;
  setTitle(`Treino: ${lesson.title}`);
  setActiveNav('treino');
  view.innerHTML = `
    <div class="practice-page c-${mod.color}">
      <nav class="crumbs"><a href="#/treino-misto">Treino</a> › <a href="#/aula/${lesson.id}">${escapeHtml(lesson.title)}</a></nav>
      <h1>Treino: ${escapeHtml(lesson.title)}</h1>
      <div id="practice-root"></div>
    </div>`;
  mountPractice(view.querySelector('#practice-root'), [{ generator: lesson.generator, title: lesson.title }]);
}

function renderMixed() {
  setTitle('Treino misto');
  setActiveNav('treino');
  const all = practiceTopics();
  const studied = all.filter(({ lesson }) => isLessonDone(lesson.id) || getScore(lesson.generator).total > 0);
  const defaults = new Set((studied.length >= 2 ? studied : all).map((t) => t.lesson.id));

  view.innerHTML = `
    <div class="practice-page">
      <h1>Treino</h1>
      <p class="lead">Escolha um tópico para treinar, ou misture vários para revisar. No treino misto, as questões
        sorteiam o tópico e usam o nível que você já alcançou em cada um.</p>
      <h2 class="h-small">Por tópico</h2>
      <div class="topic-grid">${all.map(({ module: mod, lesson }) => {
        const s = getScore(lesson.generator);
        return `<a class="topic-card c-${mod.color}" href="#/treino/${lesson.id}">
          <span class="topic-title">${escapeHtml(lesson.title)}</span>
          <span class="topic-stats">${s.total ? `${s.correct}/${s.total} acertos · ${LEVELS[s.level - 1]}` : 'ainda não treinado'}</span>
        </a>`;
      }).join('')}</div>
      <h2 class="h-small">Treino misto</h2>
      <p class="note">${studied.length >= 2 ? 'Marcamos os tópicos que você já estudou ou treinou.' : 'Quando você concluir aulas, elas serão marcadas aqui automaticamente.'}</p>
      <div class="chips" id="mix-chips">${all.map(({ lesson }) => `
        <label class="chip"><input type="checkbox" value="${lesson.id}" ${defaults.has(lesson.id) ? 'checked' : ''}>
          <span>${escapeHtml(lesson.title)}</span></label>`).join('')}</div>
      <div id="practice-root"></div>
    </div>`;

  const root = view.querySelector('#practice-root');
  const start = () => {
    const chosen = [...view.querySelectorAll('#mix-chips input:checked')].map((i) => i.value);
    const topics = all.filter((t) => chosen.includes(t.lesson.id))
      .map((t) => ({ generator: t.lesson.generator, title: t.lesson.title }));
    if (topics.length < 2) {
      root.className = '';
      root.innerHTML = '<p class="note">Escolha pelo menos dois tópicos para misturar.</p>';
      return;
    }
    mountPractice(root, topics);
  };
  view.querySelector('#mix-chips').addEventListener('change', start);
  start();
}

function renderSearch(q = '') {
  setTitle('Buscar');
  setActiveNav('busca');
  view.innerHTML = `
    <div class="search-page">
      <h1>Buscar assunto</h1>
      <input id="search-input" class="search-input" type="search" placeholder="Ex.: frações, Pitágoras, derivada…"
        value="${escapeHtml(q)}" autocomplete="off" aria-label="Buscar assunto">
      <ul class="search-results" id="search-results"></ul>
    </div>`;
  const input = view.querySelector('#search-input');
  const results = view.querySelector('#search-results');
  const entries = modules.flatMap((mod) => mod.lessons.map((l) => ({
    mod, l, hay: normalize(`${l.title} ${l.keywords || ''} ${l.summary || ''} ${mod.title}`),
  })));
  const run = () => {
    const terms = normalize(input.value).split(/\s+/).filter(Boolean);
    const list = terms.length ? entries.filter((e) => terms.every((t) => e.hay.includes(t))) : entries;
    results.innerHTML = list.length ? list.map(({ mod, l }) => `
      <li>${l.ready ? `<a href="#/aula/${l.id}">` : '<div class="is-soon">'}
        <span class="result-mod c-${mod.color}">${escapeHtml(mod.title)}</span>
        <span class="result-title">${escapeHtml(l.title)}</span>
        ${l.ready ? '' : '<span class="badge">em breve</span>'}
      ${l.ready ? '</a>' : '</div>'}</li>`).join('')
      : '<li class="note">Nada encontrado. Tente outra palavra.</li>';
    history.replaceState(null, '', `#/busca${input.value ? `?q=${encodeURIComponent(input.value)}` : ''}`);
  };
  input.addEventListener('input', run);
  run();
  input.focus();
}

function renderNotFound() {
  setTitle('Página não encontrada');
  view.innerHTML = `<div class="empty"><h1>Ops, essa página não existe.</h1><p><a class="btn btn-primary" href="#/">Voltar para a trilha</a></p></div>`;
}

// ---------- Roteador ----------
let lastRoute = '';
async function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  const routeKey = parts.slice(0, 2).join('/');

  // Âncora de seção dentro da mesma aula: só rola a página.
  if (parts[0] === 'aula' && parts[2] && routeKey === lastRoute) {
    document.getElementById(parts[2])?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (parts[0] === 'busca' && lastRoute === 'busca') return;
  lastRoute = routeKey;

  switch (parts[0]) {
    case undefined: renderHome(); break;
    case 'modulo': renderModule(parts[1]); break;
    case 'aula':
      await renderLesson(parts[1]);
      if (parts[2]) { document.getElementById(parts[2])?.scrollIntoView(); return; }
      break;
    case 'treino': renderPractice(parts[1]); break;
    case 'treino-misto': renderMixed(); break;
    case 'busca': renderSearch(new URLSearchParams(query).get('q') || ''); break;
    default: renderNotFound();
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();

document.getElementById('reset-progress')?.addEventListener('click', () => {
  if (confirm('Apagar todo o seu progresso (aulas concluídas e placar)?')) { resetAll(); applyTheme(); lastRoute = ''; route(); }
});
