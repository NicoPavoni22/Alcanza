// =======================================================================
// ui/theme.js — Modo claro / oscuro.
// Se guarda la preferencia; si el usuario nunca la tocó, se sigue el tema
// del sistema. El tema inicial ya se aplica en un script inline del <head>
// para evitar el flash; acá solo sincronizamos el botón y el toggle.
// =======================================================================

import { store, K_THEME } from "../store.js";

const SUN_ICON  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/></svg>`;
const MOON_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.6 6.6 0 0 0 10.5 10.5Z"/></svg>`;

function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("themeBtn");
  btn.innerHTML = t === "dark" ? SUN_ICON : MOON_ICON;
  btn.setAttribute("aria-label", t === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
}

export function initTheme() {
  let theme = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(theme);
  document.getElementById("themeBtn").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    store.save(K_THEME, theme);
    applyTheme(theme);
  });
}