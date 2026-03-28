'use strict';

/**
 * EditableTable — componente de tabela com CRUD inline.
 *
 * Contrato HTML esperado (ver docs inline abaixo):
 *
 *  <div id="{tableId}">
 *    <!-- Forms fora da <table> (HTML válido), IDs seguem o padrão: -->
 *    <form id="form-new-{tableId}"    method="post" action="...">{% csrf_token %}</form>
 *    <form id="form-edit-{tableId}-{pk}" method="post" action="...">{% csrf_token %}</form>
 *    <form id="form-delete-{tableId}-{pk}" method="post" action="...">{% csrf_token %}</form>
 *
 *    <!-- Botão para adicionar nova linha -->
 *    <button data-add-btn data-action="add-row">Novo</button>
 *
 *    <table>
 *      <tbody>
 *        <!-- Linhas existentes -->
 *        <tr data-row="{pk}"
 *            data-val-{fieldname}="{raw_value}"   <!-- valor bruto para inputs -->
 *            ...>
 *          <td data-cell="{fieldname}"
 *              data-input-type="text|number|date"  <!-- padrão: text -->
 *              data-required="true">               <!-- opcional -->
 *            {valor exibido}
 *          </td>
 *          <td>
 *            <div data-mode="view"   class="row-actions">  <!-- visível por padrão -->
 *              <button data-action="edit"   data-pk="{pk}">...</button>
 *              <button data-action="delete" data-pk="{pk}">...</button>
 *            </div>
 *            <div data-mode="edit"   class="row-actions" style="display:none">
 *              <button type="submit" form="form-edit-{tableId}-{pk}">...</button>
 *              <button data-action="cancel-row" data-pk="{pk}">...</button>
 *            </div>
 *            <div data-mode="delete" class="row-actions" style="display:none">
 *              <button type="submit" form="form-delete-{tableId}-{pk}">...</button>
 *            </div>
 *          </td>
 *        </tr>
 *
 *        <!-- Estado vazio (opcional) -->
 *        <tr data-empty-row>...</tr>
 *
 *        <!-- Linha de novo cadastro (sempre oculta inicialmente) -->
 *        <tr data-new-row style="display:none">
 *          <td><input name="{fieldname}" form="form-new-{tableId}" data-field="..."></td>
 *          <td>
 *            <div class="row-actions">
 *              <button type="submit" form="form-new-{tableId}">...</button>
 *              <button data-action="cancel-new">...</button>
 *            </div>
 *          </td>
 *        </tr>
 *      </tbody>
 *    </table>
 *  </div>
 *
 * Uso:
 *   new EditableTable('minha-tabela');
 *
 * Comportamento especial:
 *   - Após salvar novo item (POST bem-sucedido), se a URL contiver ?new=1
 *     a linha de novo cadastro é aberta automaticamente.
 *   - Enter na linha de novo cadastro submete o form e redireciona com ?new=1
 *     (requer que a view adicione ?new=1 na success_url).
 */
class EditableTable {
  constructor(containerId) {
    this.id = containerId;
    this.c  = document.getElementById(containerId);
    if (!this.c) return;
    this._bind();
    this._checkAutoOpen();
  }

  /* ── seletores internos ──────────────────────────────────────── */
  _q  (sel)      { return this.c.querySelector(sel); }
  _qa (sel)      { return this.c.querySelectorAll(sel); }
  _row(pk)       { return this.c.querySelector(`[data-row="${pk}"]`); }
  _mode(pk, m)   { return this.c.querySelector(`[data-row="${pk}"] [data-mode="${m}"]`); }
  _cells(pk)     { return this.c.querySelectorAll(`[data-row="${pk}"] [data-cell]`); }

  _show(el) { if (el) el.style.display = ''; }
  _hide(el) { if (el) el.style.display = 'none'; }

  /* ── event delegation ────────────────────────────────────────── */
  _bind() {
    this.c.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, pk } = btn.dataset;
      switch (action) {
        case 'edit':        this.editRow(pk);       break;
        case 'delete':      this.confirmDelete(pk); break;
        case 'cancel-row':  this.cancelRow(pk);     break;
        case 'add-row':     this.addNewRow();        break;
        case 'cancel-new':  this.cancelNew();        break;
      }
    });

    /* Enter na linha de novo cadastro → submete */
    const newRow = this._q('[data-new-row]');
    if (newRow) {
      newRow.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('keydown', e => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          const submitBtn = newRow.querySelector('button[type="submit"]');
          if (submitBtn) submitBtn.click();
        });
      });
    }
  }

  /* Abre nova linha automaticamente se URL contiver ?new=1 */
  _checkAutoOpen() {
    if (new URLSearchParams(window.location.search).get('new') === '1') {
      history.replaceState({}, '', window.location.pathname);
      this.addNewRow();
    }
  }

  /* ── converter nome de campo para chave de dataset ───────────── */
  /*  "descricao"      → dataset.valDescricao
   *  "dt_ajuizamento" → dataset.valDtAjuizamento  */
  _dataKey(field) {
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    return 'val' + camel[0].toUpperCase() + camel.slice(1);
  }

  /* ── editar linha ────────────────────────────────────────────── */
  editRow(pk) {
    const row = this._row(pk);
    if (!row) return;

    this._cells(pk).forEach(cell => {
      /* salva o HTML original para restaurar no cancelamento */
      cell.dataset.savedDisplay = cell.innerHTML;

      const field = cell.dataset.cell;
      const type  = cell.dataset.inputType || 'text';
      const raw   = row.dataset[this._dataKey(field)] ?? '';

      const inp = document.createElement('input');
      inp.name      = field;
      inp.type      = type;
      inp.className = 'form-control form-control-sm';
      inp.setAttribute('form', `form-edit-${this.id}-${pk}`);
      if (cell.dataset.required === 'true') inp.required = true;
      if (type === 'number') { inp.step = '0.01'; inp.min = '0'; inp.placeholder = '0.00'; }
      if (type === 'date')   { /* nenhum attr extra necessário */ }
      /* popula com o valor bruto (nunca formatado) */
      if (raw !== '') inp.value = raw;

      cell.textContent = '';
      cell.appendChild(inp);
    });

    this._hide(this._mode(pk, 'view'));
    this._show(this._mode(pk, 'edit'));
    this._hide(this._mode(pk, 'delete'));

    const firstInp = this.c.querySelector(`[data-row="${pk}"] [data-cell] input`);
    if (firstInp) firstInp.focus();
  }

  /* ── restaurar linha ao estado original ─────────────────────── */
  _restoreRow(pk) {
    this._cells(pk).forEach(cell => {
      if (cell.dataset.savedDisplay !== undefined) {
        cell.innerHTML = cell.dataset.savedDisplay;
        delete cell.dataset.savedDisplay;
      }
    });
    this._show(this._mode(pk, 'view'));
    this._hide(this._mode(pk, 'edit'));
    this._hide(this._mode(pk, 'delete'));
  }

  cancelRow(pk) { this._restoreRow(pk); }

  /* ── confirmar exclusão inline ───────────────────────────────── */
  confirmDelete(pk) {
    this._cells(pk).forEach((cell, i) => {
      cell.dataset.savedDisplay = cell.innerHTML;
      if (i === 0) {
        cell.innerHTML =
          '<span style="color:#f87171;font-size:.85rem;">' +
          '<i class="bi bi-exclamation-triangle me-1"></i>Excluir este item?' +
          '</span>';
      } else {
        cell.textContent = '';
      }
    });
    this._hide(this._mode(pk, 'view'));
    this._hide(this._mode(pk, 'edit'));
    this._show(this._mode(pk, 'delete'));
  }

  /* ── nova linha ──────────────────────────────────────────────── */
  addNewRow() {
    const newRow   = this._q('[data-new-row]');
    const emptyRow = this._q('[data-empty-row]');
    const addBtn   = this._q('[data-add-btn]');
    if (newRow)   newRow.style.display   = '';
    if (emptyRow) emptyRow.style.display = 'none';
    if (addBtn)   addBtn.style.display   = 'none';
    const firstInp = newRow?.querySelector('input');
    if (firstInp) firstInp.focus();
  }

  cancelNew() {
    const newRow   = this._q('[data-new-row]');
    const emptyRow = this._q('[data-empty-row]');
    const addBtn   = this._q('[data-add-btn]');
    if (newRow) {
      newRow.style.display = 'none';
      newRow.querySelectorAll('input').forEach(i => i.value = '');
    }
    if (emptyRow) emptyRow.style.display = '';
    if (addBtn)   addBtn.style.display   = '';
  }
}
