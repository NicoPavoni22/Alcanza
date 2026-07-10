// =======================================================================
// promos.js — Lógica de negocio sobre las promos.
// El ahorro real se calcula como mín(compra × %, tope).
// =======================================================================

import { S } from "./state.js";
import { HOY_ISO } from "./config.js";

export function estaVigente(p) {
  return (!p.desde || p.desde <= HOY_ISO) && (!p.hasta || HOY_ISO <= p.hasta);
}

export function ahorroReal(p) {
  const bruto = S.amount * p.porcentaje / 100;
  const real  = p.tope == null ? bruto : Math.min(bruto, p.tope);
  return {
    pesos: real,
    efectivo: S.amount ? real / S.amount * 100 : 0,
    topeAlcanzado: p.tope != null && bruto > p.tope,
    bajoMinimo: S.amount < p.minimo
  };
}

export function promosDelDia(dia) {
  return S.PROMOS
    .filter(p => p.dias.includes(dia) && S.selectedMethods.has(p.medioPago) && estaVigente(p))
    .map(p => ({ ...p, ...ahorroReal(p) }))
    .sort((a, b) => b.pesos - a.pesos);
}

export function ganadorDelDia(dia) {
  return promosDelDia(dia).find(p => !p.bajoMinimo) || null;
}

export function mejorDeLaSemana() {
  let best = null, bestDay = null;
  for (let d = 0; d < 7; d++) {
    const g = ganadorDelDia(d);
    if (g && (!best || g.pesos > best.pesos)) { best = g; bestDay = d; }
  }
  return best ? { best, bestDay } : null;
}

// Convierte una fila cruda de Supabase (snake_case) al shape que usa la app.
export function mapRow(r) {
  return {
    cadena: r.cadena,
    medioPago: r.medio_pago,
    dias: Array.isArray(r.dias) ? r.dias.map(Number) : [],
    porcentaje: Number(r.porcentaje),
    tope: r.tope == null ? null : Number(r.tope),
    topePeriodo: r.tope_periodo || "—",
    minimo: Number(r.minimo) || 0,
    desde: r.desde || null,
    hasta: r.hasta || null,
    actualizado: r.actualizado || null,
    nota: r.nota || null,
    condicion: r.condicion || null
  };
}