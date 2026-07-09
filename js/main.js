// =======================================================================
// main.js — Punto de entrada. Ensambla los módulos, engancha eventos y
// arranca la carga de datos.
// =======================================================================

import { S, persistSetup } from "./state.js";
import { parseAmount } from "./format.js";
import { renderHero, renderAdvice, renderWeek, renderDetail } from "./ui/render.js";
import { boot } from "./data.js";
import { initTheme } from "./ui/theme.js";
import { initTour } from "./ui/tour.js";
import { initTooltips } from "./ui/tooltip.js";

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
initTour();
boot();