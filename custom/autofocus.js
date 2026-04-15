/*
 * autofocus.js — gcalc
 *
 * Foca automaticamente o primeiro campo editável de formulários POST,
 * evitando a necessidade de atributo autofocus em cada template.
 */
document.addEventListener('DOMContentLoaded', () => {
  const SKIP = 'input[type="hidden"], input[type="checkbox"], input[type="radio"], [disabled], [readonly]';
  for (const form of document.querySelectorAll('form[method="post"]')) {
    const field = form.querySelector(`input:not(${SKIP}), textarea:not([disabled]):not([readonly]), select:not([disabled]):not([readonly])`);
    if (field) { field.focus(); break; }
  }
});
