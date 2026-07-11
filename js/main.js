// =======================================================================
// main.js — Punto de entrada. Ensambla los módulos, engancha eventos y
// arranca la carga de datos.
// =======================================================================

import { S, persistSetup } from "./state.js";
import { parseAmount } from "./format.js";
import { renderHero, renderAdvice, renderWeek, renderDetail, renderVerify } from "./ui/render.js";
import { boot } from "./data.js";
import { initTheme } from "./ui/theme.js";
import { initTour } from "./ui/tour.js";
import { initTooltips } from "./ui/tooltip.js";
import { initIosHint } from "./ui/ioshint.js";

// Campo de compra estimada
const amountInput = document.getElementById("amount");
amountInput.value = S.amount ? S.amount.toLocaleString("es-AR") : "";
amountInput.addEventListener("input", e => {
  S.amount = parseAmount(e.target.value);
  e.target.value = S.amount ? S.amount.toLocaleString("es-AR") : "";
  persistSetup();
  renderHero(); renderAdvice(); renderWeek(); renderDetail();
});

initTheme();
initTooltips();
initIosHint();
renderVerify();
initTour();

// Splash animado: se muestra al abrir y se funde cuando la app está lista.
const splashStart = Date.now();
function hideSplash() {
  const s = document.getElementById("splash");
  if (!s) return;
  const espera = Math.max(0, 1600 - (Date.now() - splashStart)); // que se vea la animación + slogan
  setTimeout(() => { s.classList.add("gone"); setTimeout(() => s.remove(), 500); }, espera);
}
boot().finally(hideSplash);
setTimeout(hideSplash, 4000);   // red de seguridad si algo tarda o falla