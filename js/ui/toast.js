// =======================================================================
// ui/toast.js — Notificación flotante (no nativa).
// =======================================================================

let toastEl = null, toastTimer = null;

export function showToast(message) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }
  toastEl.innerHTML = `<span class="ico">✓</span><span>${message}</span>`;
  clearTimeout(toastTimer);
  toastEl.classList.remove("in");
  void toastEl.offsetWidth;
  requestAnimationFrame(() => toastEl.classList.add("in"));
  toastTimer = setTimeout(() => toastEl.classList.remove("in"), 2600);
}