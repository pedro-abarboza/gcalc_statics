/*
 * masks.js — gcalc
 *
 * Máscaras de input para campos com o atributo data-mask.
 * Valores suportados: "cpf", "cnpj", "cnj".
 *
 * Uso no template:
 *   <input type="text" data-mask="cpf">
 *   <input type="text" data-mask="cnpj">
 *   <input type="text" data-mask="cnj">
 */
(() => {
  const formats = {
    cpf:  raw => { const d = raw.replace(/\D/g,'').slice(0,11);  let o=''; for(let i=0;i<d.length;i++){ if(i===3||i===6)o+='.'; else if(i===9)o+='-'; o+=d[i]; } return o; },
    cnpj: raw => { const d = raw.replace(/\D/g,'').slice(0,14);  let o=''; for(let i=0;i<d.length;i++){ if(i===2||i===5)o+='.'; else if(i===8)o+='/'; else if(i===12)o+='-'; o+=d[i]; } return o; },
    cnj:  raw => { const d = raw.replace(/\D/g,'').slice(0,20);  let o=''; for(let i=0;i<d.length;i++){ if(i===7)o+='-'; else if(i===9||i===13||i===14||i===16)o+='.'; o+=d[i]; } return o; },
  };

  function applyMask(el, fmt) {
    el.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const special = ['Backspace','Delete','Tab','Escape','Enter',
                       'ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
      if (special.includes(e.key)) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    });
    el.addEventListener('input', function () {
      const pos = this.selectionStart;
      const digitsBeforeCursor = this.value.slice(0, pos).replace(/\D/g, '').length;
      this.value = fmt(this.value);
      let seen = 0, newPos = 0;
      for (let i = 0; i < this.value.length; i++) {
        if (/\d/.test(this.value[i])) seen++;
        if (seen === digitsBeforeCursor) { newPos = i + 1; break; }
      }
      if (digitsBeforeCursor === 0) newPos = 0;
      this.setSelectionRange(newPos, newPos);
    });
    el.addEventListener('paste', function (e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      this.value = fmt(text);
      const end = this.value.length;
      this.setSelectionRange(end, end);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    Object.entries(formats).forEach(([key, fmt]) => {
      document.querySelectorAll(`[data-mask="${key}"]`).forEach(el => applyMask(el, fmt));
    });
  });
})();
