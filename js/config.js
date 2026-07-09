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

// Medios de pago que el usuario puede elegir aunque hoy no tengan promo.
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
  { nombre: "Macro",        visible: false },
  { nombre: "Nación",       visible: true },
  { nombre: "Patagonia",    visible: false },
  { nombre: "Supervielle",  visible: false },
  { nombre: "Naranja X",    visible: false },
  { nombre: "Columbia",     visible: false },
  { nombre: "Hipotecario",  visible: false }
];