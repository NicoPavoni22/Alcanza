// =======================================================================
// ui/tour.js — Recorrido guiado. Se muestra solo la primera vez
// (localStorage) y se puede volver a ver con el botón "?" del encabezado.
// =======================================================================

import { store, K_TOUR } from "../store.js";
import { reduce } from "../config.js";

const TOUR_STEPS = [
  { title: "Bienvenido a Alcanza",
    text: "Te mostramos en un minuto cómo encontrar dónde y cuándo conviene comprar en el súper." },
  { target: "#methods", title: "Elegí tus medios de pago",
    text: "Tocá las tarjetas y billeteras que usás. Alcanza sólo te muestra las promos que podés aprovechar de verdad." },
  { target: ".amount-field", title: "Tu compra estimada",
    text: "Poné cuánto gastás habitualmente. Con ese monto calculamos el ahorro real, tope incluido." },
  { target: "#hero", title: "La mejor promo de hoy",
    text: "Esta tarjeta muestra la cadena, el medio de pago y cuánto ganás hoy con tus tarjetas." },
  { target: "#advice", title: "Cuándo conviene esperar",
    text: "Si te conviene más otro día de la semana, te lo avisamos acá para que no compres antes de tiempo." },
  { target: "#week", title: "Toda la semana de un vistazo",
    text: "Tocá cualquier día para ver su detalle. El cartel “mejor” marca el día más conveniente." },
  { target: "#detail", title: "El detalle completo",
    text: "Todas las promos del día elegido, ordenadas de mayor a menor ahorro." },
  { target: ".savings", title: "Tu ahorro acumulado",
    text: "Cuando compres, tocá “Compré acá” en la tarjeta de arriba. Alcanza va sumando lo que ahorrás, mes a mes." },
  { title: "Listo para ahorrar",
    text: "Podés volver a ver este recorrido cuando quieras tocando el botón con el signo de pregunta, arriba." }
];

let tourIndex = 0, tourOverlay, tourSpotlight, tourTip, tourReposition = null;

function tourBuild() {
  tourOverlay = document.createElement("div"); tourOverlay.className = "tour-overlay";
  tourSpotlight = document.createElement("div"); tourSpotlight.className = "tour-spotlight";
  tourTip = document.createElement("div"); tourTip.className = "tour-tip";
  tourTip.setAttribute("role", "dialog"); tourTip.setAttribute("aria-modal", "true"); tourTip.setAttribute("aria-label", "Cómo funciona Alcanza");
  document.body.append(tourOverlay, tourSpotlight, tourTip);
  requestAnimationFrame(() => tourOverlay.classList.add("in"));
}

function tourPlace(target, onReady) {
  const margin = 14;
  if (!target) {
    tourSpotlight.style.display = "none";
    tourTip.classList.add("center");
    tourReposition = null;
    onReady();
    return;
  }
  tourTip.classList.remove("center");
  const doPlace = () => {
    const r = target.getBoundingClientRect();
    tourSpotlight.style.display = "block";
    tourSpotlight.style.top = (r.top - 8) + "px";
    tourSpotlight.style.left = (r.left - 8) + "px";
    tourSpotlight.style.width = (r.width + 16) + "px";
    tourSpotlight.style.height = (r.height + 16) + "px";

    const tw = tourTip.offsetWidth, th = tourTip.offsetHeight;
    let top = r.bottom + margin;
    if (top + th > window.innerHeight - 16) top = r.top - th - margin;
    if (top < 16) top = Math.max(16, Math.min(window.innerHeight - th - 16, r.top));
    const left = Math.max(16, Math.min(r.left, window.innerWidth - tw - 16));
    tourTip.style.top = top + "px";
    tourTip.style.left = left + "px";
    onReady();
  };
  target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  tourReposition = doPlace;
  setTimeout(doPlace, reduce ? 0 : 320);
}

function tourRender() {
  const step = TOUR_STEPS[tourIndex];
  const raw = step.target ? document.querySelector(step.target) : null;
  const target = (raw && raw.offsetParent !== null) ? raw : null;
  const last = tourIndex === TOUR_STEPS.length - 1;
  tourTip.classList.remove("in");
  tourTip.innerHTML = `
    <div class="tour-step">Paso ${tourIndex + 1} de ${TOUR_STEPS.length}</div>
    <div class="tour-title">${step.title}</div>
    <div class="tour-text">${step.text}</div>
    <div class="tour-foot">
      <div class="tour-dots">${TOUR_STEPS.map((_, i) => `<span class="tour-dot${i === tourIndex ? " on" : ""}"></span>`).join("")}</div>
      <div class="tour-actions">
        ${tourIndex > 0 ? `<button class="tour-back" id="tourBack" type="button">Atrás</button>` : ""}
        ${!last ? `<button class="tour-skip" id="tourSkip" type="button">Saltar</button>` : ""}
        <button class="tour-next" id="tourNext" type="button">${last ? "Entendido" : "Siguiente"}</button>
      </div>
    </div>`;
  tourPlace(target, () => requestAnimationFrame(() => tourTip.classList.add("in")));
  const back = document.getElementById("tourBack");
  const skip = document.getElementById("tourSkip");
  const next = document.getElementById("tourNext");
  if (back) back.onclick = () => { tourIndex--; tourRender(); };
  if (skip) skip.onclick = tourClose;
  next.onclick = () => { if (last) { tourClose(); } else { tourIndex++; tourRender(); } };
}

function tourOnViewportChange() { if (tourReposition) tourReposition(); }
function tourOnKey(e) {
  if (e.key === "Escape") tourClose();
  else if (e.key === "ArrowRight") document.getElementById("tourNext")?.click();
  else if (e.key === "ArrowLeft") document.getElementById("tourBack")?.click();
}

function tourClose() {
  store.save(K_TOUR, true);
  window.removeEventListener("resize", tourOnViewportChange);
  window.removeEventListener("scroll", tourOnViewportChange, true);
  document.removeEventListener("keydown", tourOnKey);
  [tourOverlay, tourSpotlight, tourTip].forEach(el => el && el.remove());
  tourOverlay = tourSpotlight = tourTip = null;
}

export function tourStart() {
  if (tourOverlay) return;
  tourIndex = 0;
  tourBuild();
  tourRender();
  window.addEventListener("resize", tourOnViewportChange);
  window.addEventListener("scroll", tourOnViewportChange, true);
  document.addEventListener("keydown", tourOnKey);
}

export function initTour() {
  document.getElementById("tourBtn").addEventListener("click", tourStart);
  if (!store.load(K_TOUR)) setTimeout(tourStart, 600);
}