// =======================================================================
// ui/tooltip.js — Tooltips por tap (mobile-first).
// En el celu no hay "hover", así que el tooltip es un iconito (i) que se
// TOCA para abrir un globito, y se cierra tocando afuera o con Escape.
//
// Uso:
//   import { infoBtn, initTooltips } from "./tooltip.js";
//   ...`<div>13% real ${infoBtn("Texto explicativo")}</div>`
//   initTooltips();  // una sola vez al arrancar la app
//
// Funciona con contenido dinámico porque escucha por delegación en document.
// =======================================================================

let pop = null;      // el globito (uno solo, reutilizado)
let current = null;  // el iconito abierto actualmente

function ensurePop() {
  if (pop) return pop;
  pop = document.createElement("div");
  pop.className = "info-pop";
  pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);
  return pop;
}

function closeTip() {
  if (pop) pop.classList.remove("in");
  current = null;
}

function openTip(btn) {
  const p = ensurePop();
  p.textContent = btn.getAttribute("data-tip") || "";
  p.classList.add("in");
  current = btn;
  // Posición: debajo del iconito; si no entra, arriba. Siempre dentro de pantalla.
  const r = btn.getBoundingClientRect();
  const pw = p.offsetWidth, ph = p.offsetHeight;
  let top = r.bottom + 8;
  if (top + ph > window.innerHeight - 12) top = r.top - ph - 8;
  let left = r.left + r.width / 2 - pw / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - pw - 12));
  p.style.top = Math.max(12, top) + "px";
  p.style.left = left + "px";
}

// Escapa el texto para meterlo en el atributo data-tip sin romper el HTML.
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Devuelve el HTML de un iconito de info con su texto.
export function infoBtn(text) {
  return `<button class="info-dot" type="button" data-tip="${esc(text)}" aria-label="Más información">i</button>`;
}

// Se llama una vez. Engancha la apertura/cierre por delegación.
export function initTooltips() {
  document.addEventListener("click", e => {
    const btn = e.target.closest(".info-dot");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      if (current === btn) closeTip();
      else openTip(btn);
      return;
    }
    if (pop && !e.target.closest(".info-pop")) closeTip();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeTip(); });
  window.addEventListener("scroll", closeTip, true);
  window.addEventListener("resize", closeTip);
}