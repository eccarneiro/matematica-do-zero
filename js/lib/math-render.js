// Renderiza fórmulas com KaTeX (carregado via CDN no index.html).
// Delimitadores: \( ... \) para fórmulas na linha e \[ ... \] em destaque.
// (Não usamos $ porque "R$" aparece muito nos textos.)

const opts = {
  delimiters: [
    { left: '\\[', right: '\\]', display: true },
    { left: '\\(', right: '\\)', display: false },
  ],
  throwOnError: false,
};

export function renderMath(el) {
  if (!el) return;
  if (window.renderMathInElement) {
    window.renderMathInElement(el, opts);
  } else {
    // KaTeX ainda carregando: tenta de novo em instantes.
    setTimeout(() => renderMath(el), 120);
  }
}

// Atalho para escrever HTML com fórmulas dentro de JS.
export const html = String.raw;

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
