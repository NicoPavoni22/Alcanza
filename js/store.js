// =======================================================================
// store.js — Guardado local seguro (sin cuenta ni servidor).
// Si el navegador no permite almacenamiento, sigue funcionando en memoria
// sin romperse.
// =======================================================================

export const K_SETUP   = "alcanza.setup.v1";
export const K_COMPRAS = "alcanza.compras.v1";
export const K_THEME   = "alcanza.theme.v1";
export const K_TOUR    = "alcanza.tour.v1";

export const store = (() => {
  let ok = true;
  try { localStorage.setItem("__ah_test", "1"); localStorage.removeItem("__ah_test"); }
  catch (e) { ok = false; }
  return {
    load(key)      { if (!ok) return null; try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } },
    save(key, d)   { if (!ok) return;      try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {} }
  };
})();