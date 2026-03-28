/**
 * picklist.js — gcalc
 *
 * Inicializa todos os .picklist-wrapper encontrados na página.
 * Cada wrapper contém:
 *   - Um <select multiple> oculto que é enviado com o form.
 *   - Duas <ul class="picklist-list"> (esquerda e direita).
 *   - Botões de mover (.picklist-btn).
 *   - Inputs de busca (.picklist-search input).
 */
(function () {
  'use strict';

  // ── Helpers ────────────────────────────────────────────────────────────
  function getListDir(wrapper) {
    return wrapper.querySelectorAll('.picklist-list')[1];
  }

  /** Relê os itens da lista da direita e marca as options correspondentes. */
  function resyncSelect(wrapper) {
    const select = wrapper.querySelector('select[multiple]');
    if (!select) return;
    const selectedIds = new Set(
      [...getListDir(wrapper).querySelectorAll('.picklist-item')]
        .map(i => i.dataset.id)
    );
    select.querySelectorAll('option').forEach(opt => {
      opt.selected = selectedIds.has(opt.value);
    });
  }

  function updateCounts(wrapper) {
    const lists = wrapper.querySelectorAll('.picklist-list');
    const counts = wrapper.querySelectorAll('.picklist-count');
    lists.forEach((list, i) => {
      if (counts[i]) counts[i].textContent = list.querySelectorAll('.picklist-item').length;
    });
  }

  function moveItems(items, dst, wrapper) {
    items.forEach(item => {
      item.classList.remove('is-selected');
      dst.appendChild(item);
    });
    // Limpa buscas
    wrapper.querySelectorAll('.picklist-search input').forEach(inp => {
      if (inp.value) { inp.value = ''; applyFilter(inp); }
    });
    resyncSelect(wrapper);
    updateCounts(wrapper);
  }

  function applyFilter(input) {
    const list = document.getElementById(input.dataset.target);
    if (!list) return;
    const q = input.value.toLowerCase();
    list.querySelectorAll('.picklist-item').forEach(item => {
      item.style.display = !q || item.dataset.label.includes(q) ? '' : 'none';
    });
  }

  // ── Wires cada wrapper ──────────────────────────────────────────────────
  document.querySelectorAll('.picklist-wrapper').forEach(wrapper => {
    const [listEsq, listDir] = wrapper.querySelectorAll('.picklist-list');

    // Clique para selecionar / multi-select com Ctrl
    [listEsq, listDir].forEach(list => {
      list.addEventListener('click', e => {
        const item = e.target.closest('.picklist-item');
        if (!item) return;
        if (!e.ctrlKey && !e.metaKey) {
          list.querySelectorAll('.picklist-item.is-selected')
            .forEach(i => i.classList.remove('is-selected'));
        }
        item.classList.toggle('is-selected');
      });

      // Duplo clique → move para o outro lado
      list.addEventListener('dblclick', e => {
        const item = e.target.closest('.picklist-item');
        if (!item) return;
        const dst = list === listEsq ? listDir : listEsq;
        moveItems([item], dst, wrapper);
      });
    });

    // Botões
    wrapper.querySelectorAll('.picklist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const src = document.getElementById(btn.dataset.src);
        const dst = document.getElementById(btn.dataset.dst);
        const action = btn.dataset.action;
        let items;
        if (action === 'move-selected') {
          items = [...src.querySelectorAll('.picklist-item.is-selected')];
        } else {
          items = [...src.querySelectorAll('.picklist-item')]
            .filter(i => i.style.display !== 'none');
        }
        if (items.length) moveItems(items, dst, wrapper);
      });
    });

    // Busca
    wrapper.querySelectorAll('.picklist-search input').forEach(inp => {
      inp.addEventListener('input', () => applyFilter(inp));
    });
  });
})();
