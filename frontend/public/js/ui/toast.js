// toast.js — aviso efímero al pie de la pantalla. Estilo: clase `.toast` de la skill.
let el;

export function toast(msg, ms = 2400) {
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.hidden = true;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.hidden = false;
  void el.offsetWidth; // reflow: la transición de entrada dispara
  el.classList.add("is-shown");
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.classList.remove("is-shown");
    setTimeout(() => {
      el.hidden = true;
    }, 220);
  }, ms);
}
