// shell.js — cascarón del portal: menú-hoja que abre el botón ☰ (única navegación).
// La topbar es CSS puro. Este módulo solo maneja la hoja: abrir/cerrar, backdrop,
// Escape, trampa de foco y scroll-lock.

const sheet = document.getElementById("menu-sheet");
if (sheet) {
  const openers = document.querySelectorAll('[data-sheet="menu"]');
  const root = document.documentElement;
  let lastFocused = null;

  const firstLink = () => sheet.querySelector("a") || sheet.querySelector("button");

  function open() {
    lastFocused = document.activeElement;
    sheet.hidden = false;
    root.classList.add("overflow-hidden");
    openers.forEach((b) => b.setAttribute("aria-expanded", "true"));
    // dejar que el frame pinte antes de mover el foco (para que la animación arranque)
    requestAnimationFrame(() => firstLink()?.focus());
    document.addEventListener("keydown", onKey);
  }

  function close() {
    sheet.hidden = true;
    root.classList.remove("overflow-hidden");
    openers.forEach((b) => b.setAttribute("aria-expanded", "false"));
    document.removeEventListener("keydown", onKey);
    lastFocused?.focus?.();
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    // trampa de foco mínima: mantener el tab dentro de la hoja
    if (e.key === "Tab") {
      const items = [...sheet.querySelectorAll("a, button")].filter((el) => !el.disabled);
      if (!items.length) return;
      const i = items.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0 || i === -1)) {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    }
  }

  openers.forEach((b) => b.addEventListener("click", open));
  sheet.querySelectorAll("[data-sheet-close], a").forEach((el) => el.addEventListener("click", close));
}
