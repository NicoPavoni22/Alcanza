// =======================================================================
// ui/share.js — Compartir una promo. Usa la Web Share API nativa (celulares)
// y, si no está disponible, copia el texto al portapapeles como fallback.
// =======================================================================

import { showToast } from "./toast.js";

export async function compartir({ title, text, url }) {
  // Web Share API: abre el menú nativo de compartir (WhatsApp, etc.).
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
    } catch (e) {
      // El usuario canceló el menú de compartir: no es un error, no hacemos nada.
    }
    return;
  }
  // Fallback (mayormente escritorio): copiar al portapapeles.
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
    showToast("Copiado — pegalo donde quieras compartir");
  } catch (e) {
    showToast("Compartir no está disponible en este navegador");
  }
}