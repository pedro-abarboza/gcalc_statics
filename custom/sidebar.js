/*
 * sidebar.js — gcalc
 *
 * Controla o comportamento da sidebar:
 * - Desktop: recolhe/expande persistindo estado no localStorage.
 * - Mobile: gaveta deslizante com overlay.
 */
(() => {
  const sidebar     = document.getElementById('sidebar');
  const mainWrapper = document.getElementById('mainWrapper');
  const toggle      = document.getElementById('sidebarToggle');
  const overlay     = document.getElementById('sidebarOverlay');
  const BREAKPOINT  = 768;
  const KEY         = 'gcalc_sidebar_collapsed';

  const isMobile = () => window.innerWidth <= BREAKPOINT;

  /* ── Desktop: recolhe/expande com margem ── */
  function applyDesktop(collapsed) {
    sidebar.classList.toggle('collapsed', collapsed);
    mainWrapper.classList.toggle('sidebar-collapsed', collapsed);
    localStorage.setItem(KEY, collapsed ? '1' : '0');
  }

  /* ── Mobile: gaveta deslizante + overlay ── */
  function openMobile() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }
  function closeMobile() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
  }

  /* ── Toggle (serve para os dois modos) ─── */
  toggle.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.contains('open') ? closeMobile() : openMobile();
    } else {
      applyDesktop(!sidebar.classList.contains('collapsed'));
    }
  });

  /* ── Overlay fecha sidebar no mobile ────── */
  overlay.addEventListener('click', closeMobile);

  /* ── Fecha gaveta ao navegar (link na sidebar) ── */
  sidebar.querySelectorAll('a[href]:not([data-bs-toggle])').forEach(link => {
    link.addEventListener('click', () => { if (isMobile()) closeMobile(); });
  });

  /* ── Ajusta ao redimensionar ─────────────── */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isMobile()) {
        closeMobile();
        applyDesktop(localStorage.getItem(KEY) === '1');
      }
    }, 100);
  });

  /* ── Estado inicial ──────────────────────── */
  if (!isMobile()) {
    applyDesktop(localStorage.getItem(KEY) === '1');
  }
})();
