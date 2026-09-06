// share.js — copiar al portapapeles y compartir por WhatsApp.
// Se activa con atributos: [data-copy] y [data-wa] (+ [data-wa-text]).
// Las rutas relativas se resuelven a URL absoluta del sitio.

function absolutize(s) {
  return String(s).replace(/(^|\s)(\/[^\s]+)/g, (_, pre, path) => pre + new URL(path, location.origin).href);
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const value = absolutize(btn.dataset.copy).trim();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* algunos navegadores sin permiso: ignorar, igual mostramos feedback */
    }
    const prev = btn.textContent;
    btn.textContent = "copiado ✓";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = prev;
      btn.disabled = false;
    }, 1400);
  });
});

document.querySelectorAll("[data-wa]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const text = absolutize(btn.dataset.waText || "");
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank", "noopener");
  });
});
