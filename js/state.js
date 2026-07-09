// =======================================================================
// state.js — Estado mutable compartido de la app.
// Todos los módulos leen y escriben sobre el objeto S (sus propiedades son
// mutables, así que los cambios se ven desde cualquier módulo).
// =======================================================================

import { store, K_SETUP, K_COMPRAS } from "./store.js";
import { HOY } from "./config.js";

const guardado = store.load(K_SETUP);

export const S = {
  PROMOS: [],
  MEDIOS: [],
  ACTUALIZADO: new Date().toISOString().slice(0, 10),  // se recalcula con la fecha más reciente de la tabla
  selectedMethods: new Set(),                          // se completa en boot(), cuando ya conocemos MEDIOS
  amount: (guardado && Number.isFinite(guardado.amount)) ? guardado.amount : 80000,
  selectedDay: HOY,
  compras: store.load(K_COMPRAS) || []                 // [{id,fecha,cadena,medioPago,ahorro,monto}]
};

export function persistSetup()   { store.save(K_SETUP,   { methods: [...S.selectedMethods], amount: S.amount }); }
export function persistCompras() { store.save(K_COMPRAS, S.compras); }