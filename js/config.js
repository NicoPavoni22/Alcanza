// =======================================================================
// config.js — Configuración y constantes que no cambian en runtime.
// =======================================================================

// Datos de TU proyecto Supabase (Settings > API).
// La anon key es segura de exponer: con RLS activado (ver supabase_setup.sql)
// solo puede LEER promos activas, no escribir ni borrar.
export const SUPABASE_URL      = "https://oywyrbvtejcocvmffyoh.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95d3lyYnZ0ZWpjb2N2bWZmeW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNDM0OTAsImV4cCI6MjA5ODkxOTQ5MH0.XdEmUeaIFdX_3j2A3eBlccsa2MkiD0sdYgSNr1GxlW8";

// Días: 0=Dom 1=Lun 2=Mar 3=Mié 4=Jue 5=Vie 6=Sáb
export const DIAS  = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
export const DIAS3 = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

export const HOY     = new Date().getDay();
export const HOY_ISO = new Date().toISOString().slice(0,10);

// A partir de cuántos días sin verificar se avisa que conviene revisar las promos.
export const DIAS_PARA_ALERTAR = 12;

// Respeta la preferencia del sistema de reducir animaciones.
export const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

// Cuántas compras se muestran por página en la sección de ahorro.
export const SAVINGS_PAGE_SIZE = 6;

// Formulario de feedback (Google Forms). Cómo obtener estos dos valores:
//  1) Creá el formulario con un campo de respuesta corta "¿Sobre qué promo?".
//  2) Menú (⋮) > "Obtener vínculo prellenado", escribí cualquier cosa en ese
//     campo y copiá el link generado.
//  3) La parte antes del "?" es "base"; el "entry.XXXX" del campo es "entryPromo".
// Mientras diga FORM_ID, el botón de reportar no aparece (queda desactivado).
export const FEEDBACK_FORM = {
  base:       "https://docs.google.com/forms/d/e/FORM_ID/viewform",
  entryPromo: "entry.000000"
};

// Links a las páginas oficiales de promos de cada cadena, para que el usuario
// pueda verificar en la fuente. La clave se compara SIN distinguir mayúsculas
// ni acentos, así "Día" / "DIA" / "Dia" matchean igual. Si una cadena no está
// acá, el link simplemente no aparece (nada de links rotos).
export const LINKS_CADENA = {
  "Carrefour": "https://www.carrefour.com.ar/descuentos-bancarios?filtro=entidad&formato=market",
  "Día":       "https://diaonline.supermercadosdia.com.ar/medios-de-pago-y-promociones",
  "NINI":      "https://www.nini.com.ar/promociones",
  "ChangoMás": "https://www.masonline.com.ar/promociones-bancarias",
  "Coto":      "https://www.coto.com.ar/descuentos",
  "Vea":       "https://www.vea.com.ar/descuentos-del-dia?type=por-banco"
};

function _norm(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
const _LINKS_NORM = Object.fromEntries(
  Object.entries(LINKS_CADENA).map(([k, v]) => [_norm(k), v])
);
// Devuelve el link oficial de la cadena, o null si no está configurada.
export function linkCadena(cadena) {
  return _LINKS_NORM[_norm(cadena)] || null;
}


// Sucursales reales en La Plata por cadena (solo la dirección). El orden es el
// que se muestra. Para sumar/editar, tocá acá nada más.
export const SUCURSALES = {
  "Carrefour": [
    "Cno. Gral. Belgrano e/ 514 y 517",
    "Calle 12 e/ 56 y 57",
    "Calle 7 e/ 47 y 48"
  ],
  "Coto": [
    "Calle 43 e/ 10 y 11 Nº 782"
  ],
  "ChangoMás": [
    "Cam. Parque Centenario 1876, Gonnet"
  ],
  "Día": [
    "Av. 44 e/ 6 y Pza Italia Nº 561",
    "Calle 48 e/ 13 y 14 Nº 944",
    "Calle 56 Nº 1029",
    "Calle 12 Nº 1514",
    "Av. 122 Nº 365",
    "Av. 7 e/ 58 y 59 Nº 1286",
    "Av. 7 e/ 40 y 41 Nº 423"
  ],
  "NINI": [
    "Av. 520 Nº 2800, Gonnet"
  ],
  "Vea": [
    "Av. 13 e/ 71 y 72 Nº 1936",
    "Calle 45 e/ 2 y 3 Nº 377",
    "Calle 47 esq. 11",
    "Calle 525 e/ 8 y 9"
  ]
};

const _SUC_NORM = Object.fromEntries(
  Object.entries(SUCURSALES).map(([k, v]) => [_norm(k), { nombre: k, dirs: v }])
);
// Devuelve { nombre, dirs } de la cadena, o null si no tiene sucursales cargadas.
export function sucursalesDe(cadena) {
  return _SUC_NORM[_norm(cadena)] || null;
}

// Link a Google Maps para una dirección puntual. Incluye el nombre de la cadena
// para que el mapa caiga en el local exacto, y completa la localidad.
export function mapaDireccion(cadena, dir) {
  let q = `${cadena} ${dir}`;
  if (!/plata|gonnet/i.test(q)) q += ", La Plata";
  q += ", Buenos Aires, Argentina";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
// Nivel banco/billetera. "nombre" debe coincidir EXACTO con medio_pago de las promos.
// "visible": ponelo en false para ocultar el medio de los chips sin borrarlo,
// y en true para volver a mostrarlo. Un medio oculto no aparece aunque tenga promos.
export const MEDIOS_MASTER = [
  { nombre: "Cuenta DNI",   visible: true },
  { nombre: "Mercado Pago", visible: true },
  { nombre: "Efectivo",     visible: true },
  { nombre: "MODO",         visible: true },
  { nombre: "Galicia",      visible: true },
  { nombre: "Santander",    visible: true },
  { nombre: "Macro",        visible: true },
  { nombre: "Nación",       visible: true },
  { nombre: "Patagonia",    visible: false },
  { nombre: "Supervielle",  visible: true },
  { nombre: "Naranja X",    visible: true },
  { nombre: "Columbia",     visible: true },
  { nombre: "Hipotecario",  visible: true }
];