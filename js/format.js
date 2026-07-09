// =======================================================================
// format.js — Helpers puros de formato.
// =======================================================================

export const fmt         = n => "$" + Math.round(n).toLocaleString("es-AR");
export const cap         = s => s.charAt(0).toUpperCase() + s.slice(1);
export const parseAmount = s => parseInt(String(s).replace(/[^\d]/g, ""), 10) || 0;