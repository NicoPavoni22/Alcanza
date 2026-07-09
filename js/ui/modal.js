// =======================================================================
// ui/modal.js — Modal de confirmación genérico (devuelve una Promise<boolean>).
// =======================================================================

import { reduce } from "../config.js";

export function confirmModal({ title, text, confirmLabel = "Borrar", cancelLabel = "Cancelar" }) {
  return new Promise(resolve => {
    const overlay = document.createElement("div"); overlay.className = "modal-overlay";
    const card = document.createElement("div"); card.className = "modal-card";
    card.setAttribute("role", "alertdialog"); card.setAttribute("aria-modal", "true"); card.setAttribute("aria-label", title);
    card.innerHTML = `
      <div class="modal-title">${title}</div>
      <div class="modal-text">${text}</div>
      <div class="modal-actions">
        <button class="modal-cancel" type="button">${cancelLabel}</button>
        <button class="modal-confirm" type="button">${confirmLabel}</button>
      </div>`;
    document.body.append(overlay, card);
    requestAnimationFrame(() => { overlay.classList.add("in"); card.classList.add("in"); });

    function onKey(e) { if (e.key === "Escape") close(false); }
    function close(result) {
      overlay.classList.remove("in"); card.classList.remove("in");
      document.removeEventListener("keydown", onKey);
      setTimeout(() => { overlay.remove(); card.remove(); }, reduce ? 0 : 160);
      resolve(result);
    }
    document.addEventListener("keydown", onKey);
    overlay.onclick = () => close(false);
    card.querySelector(".modal-cancel").onclick = () => close(false);
    card.querySelector(".modal-confirm").onclick = () => close(true);
    card.querySelector(".modal-cancel").focus();
  });
}