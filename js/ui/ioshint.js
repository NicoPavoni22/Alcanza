// =======================================================================
// ui/ioshint.js — Ayuda de instalación para iPhone/iPad.
// En iOS no hay prompt de "instalar": hay que hacerlo a mano desde Safari
// (Compartir → "Agregar a inicio"). Este cartelito lo explica, y SOLO se
// muestra cuando tiene sentido:
//   - Es iOS (iPhone/iPad).
//   - La app NO está ya instalada (no corre en modo standalone).
//   - El usuario no lo cerró antes.
// Si está en iOS pero NO en Safari (Chrome, Instagram, etc.), el "Agregar a
// inicio" no existe, así que el mensaje le pide abrirla en Safari.
// =======================================================================

import { store, K_IOSHINT } from "../store.js";

function esIOS() {
  const ua = navigator.userAgent || "";
  const iphone = /iphone|ipod|ipad/i.test(ua);
  // iPadOS moderno se hace pasar por Mac: lo detectamos por el touch.
  const ipadNuevo = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return iphone || ipadNuevo;
}

function yaInstalada() {
  return window.navigator.standalone === true ||
         window.matchMedia("(display-mode: standalone)").matches;
}

// ¿Está en Safari de verdad? En iOS todos usan WebKit, pero estos otros
// navegadores/apps NO permiten "Agregar a inicio".
function esSafari() {
  const ua = navigator.userAgent || "";
  const otros = /crios|fxios|edgios|opios|mercury|gsa\//i.test(ua);        // Chrome, Firefox, Edge, Opera, app de Google
  const inApp = /fban|fbav|instagram|line\/|twitter|micromessenger/i.test(ua); // navegadores dentro de apps
  return !otros && !inApp;
}

const ICONO_COMPARTIR = `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-3px"><path d="M12 3v13"/><path d="M8 7l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/></svg>`;

export function initIosHint() {
  if (!esIOS() || yaInstalada()) return;
  if (store.load(K_IOSHINT) === true) return;  // ya lo cerró antes

  const safari = esSafari();
  const msg = safari
    ? `Sumá Alcanza a tu inicio: tocá ${ICONO_COMPARTIR} abajo y elegí <b>“Agregar a inicio”</b>.`
    : `Para instalar Alcanza, abrila en <b>Safari</b> y usá <b>“Agregar a inicio”</b>.`;

  const el = document.createElement("div");
  el.className = "ios-hint";
  el.setAttribute("role", "note");
  el.innerHTML = `<div class="ios-hint-txt">${msg}</div>
    <button class="ios-hint-x" type="button" aria-label="Cerrar">✕</button>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("in"));

  el.querySelector(".ios-hint-x").addEventListener("click", () => {
    el.classList.remove("in");
    store.save(K_IOSHINT, true);
    setTimeout(() => el.remove(), 250);
  });
}