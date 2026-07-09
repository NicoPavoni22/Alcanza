// =======================================================================
// ui/feedback.js — Reporte de promos vía Google Forms.
// Arma un link al formulario con el contexto de la promo ya precargado,
// así el reporte que te llega ya dice de qué promo hablan.
// =======================================================================

import { FEEDBACK_FORM } from "../config.js";

// ¿Está configurado el formulario? (mientras diga FORM_ID, no.)
export function feedbackActivo() {
  const f = FEEDBACK_FORM;
  return !!(f && f.base && !f.base.includes("FORM_ID"));
}

// Devuelve el link al formulario con el texto "contexto" precargado en el
// campo de la promo. Si no está configurado, devuelve null.
export function linkFeedback(contexto = "") {
  if (!feedbackActivo()) return null;
  const params = new URLSearchParams({ usp: "pp_url" });
  if (FEEDBACK_FORM.entryPromo) {
    params.set(FEEDBACK_FORM.entryPromo, contexto);
  }
  return `${FEEDBACK_FORM.base}?${params.toString()}`;
}