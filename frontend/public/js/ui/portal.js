// portal.js — interacciones de demo del portal (sin backend).
// F2.4 reemplaza el filtro por datos reales; F2.5 cablea "crear/unirse".
import { toast } from "/js/ui/toast.js";

// ---- Filtros del catálogo ----
const filterGroup = document.querySelector('[aria-label="Filtrar por tipo"]');
if (filterGroup) {
  const cards = [...document.querySelectorAll("#catalogo [data-cat]")];
  filterGroup.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      filterGroup.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      const f = chip.dataset.filter;
      cards.forEach((card) => {
        card.hidden = f !== "todos" && card.dataset.cat !== f;
      });
    });
  });
}

// ---- Tarjetas de juego (todas "Próximamente") ----
document.querySelectorAll("#catalogo [data-game]").forEach((card) => {
  const announce = () => toast(`${card.dataset.game} abre pronto — todavía no se puede jugar`);
  card.addEventListener("click", announce);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      announce();
    }
  });
});

// ---- Hero: "Crear sala rápida" (demo) ----
document.querySelector("[data-create-room]")?.addEventListener("click", () => {
  toast("Los juegos abren pronto. Vas a poder crear una sala desde acá.");
});

// ---- "Unirse con código" (demo) ----
const joinBtn = document.querySelector("[data-join-submit]");
const joinInput = document.querySelector("[data-join-code]");
joinBtn?.addEventListener("click", () => {
  const code = (joinInput?.value || "").trim();
  if (!code) {
    toast("Escribí el código que te pasaron.");
    joinInput?.focus();
    return;
  }
  toast(`Pronto vas a poder unirte a "${code}".`);
});
