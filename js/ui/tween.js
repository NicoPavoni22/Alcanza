// =======================================================================
// ui/tween.js — Animación del contador de pesos (respeta reduce-motion).
// =======================================================================

import { reduce } from "../config.js";
import { fmt } from "../format.js";

let tweenId = null;

export function tweenPesos(el, to) {
  if (reduce) { el.textContent = fmt(to); return; }
  cancelAnimationFrame(tweenId);
  const start = performance.now(), dur = 520;
  (function step(now) {
    const t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(to * e);
    if (t < 1) tweenId = requestAnimationFrame(step);
  })(start);
}