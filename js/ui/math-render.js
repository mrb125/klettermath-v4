export function tex(expr) {
  try {
    return katex.renderToString(expr, { throwOnError: false });
  } catch {
    return expr;
  }
}

export function texD(expr) {
  try {
    return katex.renderToString(expr, { throwOnError: false, displayMode: true });
  } catch {
    return expr;
  }
}

export function renderMath(el) {
  if (!el) return;
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(el, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false
    });
  }
}
