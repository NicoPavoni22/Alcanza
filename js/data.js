// =======================================================================
// data.js — Carga de promos desde Supabase y estados de carga/error.
// =======================================================================

import { S } from "./state.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, MEDIOS_MASTER } from "./config.js";
import { store, K_SETUP } from "./store.js";
import { mapRow } from "./promos.js";
import { renderAll, renderSavings } from "./ui/render.js";

export async function fetchPromos() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/promos?select=*`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

export function showLoading() {
  const stamp = document.getElementById("stamp"); stamp.className = "stamp"; stamp.textContent = "Cargando promos…";
  const hero = document.getElementById("hero"); hero.className = "tag is-empty";
  hero.innerHTML = `<div class="tag-day">Alcanza</div><div class="tag-chain">Cargando promociones…</div>`;
}

export function showError() {
  const stamp = document.getElementById("stamp"); stamp.className = "stamp warn"; stamp.textContent = "No pudimos cargar las promos — revisá tu conexión";
  const hero = document.getElementById("hero"); hero.className = "tag is-empty";
  hero.innerHTML = `<div class="tag-day">Sin conexión con los datos</div><div class="tag-chain">No se pudieron cargar las promociones. Recargá la página.</div>`;
  document.getElementById("advice").style.display = "none";
  renderSavings(false);   // el historial local del usuario igual se muestra
}

export async function boot() {
  showLoading();
  try {
    const rows = await fetchPromos();
    S.PROMOS = rows.map(mapRow);

    // MEDIOS = medios visibles de la lista maestra + cualquier medio de una promo
    // que no esté en la lista maestra. Los medios con visible:false se ocultan.
    const masterNames  = MEDIOS_MASTER.map(m => m.nombre);
    const visibleNames = MEDIOS_MASTER.filter(m => m.visible).map(m => m.nombre);
    const extra = [...new Set(S.PROMOS.map(p => p.medioPago))].filter(m => !masterNames.includes(m));
    S.MEDIOS = [...visibleNames, ...extra.sort((a, b) => a.localeCompare(b))];

    // La fecha del sello = la verificación más reciente cargada
    const maxAct = S.PROMOS.reduce((m, p) => (p.actualizado && p.actualizado > m) ? p.actualizado : m, "");
    if (maxAct) S.ACTUALIZADO = maxAct;

    // Recuperar la selección guardada (ya conocemos MEDIOS); si no hay, elegir los 2 primeros
    const g = store.load(K_SETUP);
    S.selectedMethods = new Set(
      (g && Array.isArray(g.methods)) ? g.methods.filter(m => S.MEDIOS.includes(m))
                                      : S.MEDIOS.slice(0, 2)
    );
    renderAll();
  } catch (e) {
    console.error("Alcanza: error al cargar promos", e);
    showError();
  }
}