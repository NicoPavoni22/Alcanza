# Alcanza

**Alcanza** te dice, con la tarjeta o billetera que ya tenés, **dónde y qué día
conviene comprar** en los supermercados de La Plata. Comparás los descuentos
bancarios vigentes y ves el ahorro real de hoy, sin registrarte y en segundos.

> Ahorro real = mín(monto de compra × %, tope). Alcanza ya calcula el tope por
> vos, así no te ilusionás con un 30% que en realidad tenía un techo.

## Qué hace

- Muestra el **veredicto del día**: con tus medios de pago, dónde comprar hoy.
- Te da un **consejo de timing**: si conviene esperar a otro día y cuánto más
  ahorrarías, con una proyección mensual.
- Tira semanal con el mejor descuento de cada día.
- Ticket con todas las opciones del día ordenadas por ahorro.
- **Ahorro acumulado**: registrás lo que compraste y vas viendo cuánto juntaste.
- Funciona como **PWA**: se instala en el celu y anda sin conexión.
- Tema claro/oscuro y un tour guiado la primera vez.

Todo esto sin login. Los datos de tus medios y tus compras quedan en tu
dispositivo (localStorage), no en un servidor.

## Stack

- **Frontend**: HTML, CSS y JavaScript (módulos ES), sin frameworks ni build.
- **Backend**: [Supabase](https://supabase.com) (Postgres) — solo lectura pública
  de las promos vigentes vía su API REST.
- **Hosting**: GitHub Pages (sitio estático).
- **PWA**: `manifest.webmanifest` + service worker (`sw.js`).

## Estructura

```
Alcanza/
├─ index.html            # markup + carga de js/main.js + ganchos PWA
├─ manifest.webmanifest  # config de la PWA (nombre, íconos, colores)
├─ sw.js                 # service worker (offline + caché del app shell)
├─ icons/                # íconos de la PWA (192, 512, maskable)
├─ css/
│  └─ styles.css         # estilos + modo oscuro
└─ js/
   ├─ config.js          # URL/keys de Supabase, días, medios (MEDIOS_MASTER)
   ├─ store.js           # wrapper de localStorage (claves "alcanza.*")
   ├─ state.js           # estado compartido de la app
   ├─ format.js          # formateo de moneda, montos, texto
   ├─ promos.js          # lógica de promos: vigencia, ahorro real, ganadores
   ├─ data.js            # fetch a Supabase + armado de medios
   ├─ main.js            # punto de entrada
   └─ ui/
      ├─ render.js       # todo el pintado de la pantalla
      ├─ theme.js        # tema claro/oscuro
      ├─ tour.js         # recorrido guiado
      ├─ share.js        # compartir (Web Share API + fallback)
      └─ tween.js, toast.js, modal.js   # utilidades de UI
```

## Correr en local

Al ser módulos ES, no alcanza con abrir el `index.html` con doble clic (el
navegador bloquea los módulos vía `file://`). Levantá un servidor estático:

```bash
# con Python
python -m http.server 8000
# o con Node
npx serve
```

Y entrá a `http://localhost:8000`.

## Base de datos (Supabase)

Las promos viven en la tabla `public.promos`. El script `supabase_setup.sql`
crea la tabla con RLS (Row Level Security) que permite **solo lectura pública**
de las promos activas.

Modelo de una promo (columnas principales):

| Columna | Qué es |
|---|---|
| `cadena` | supermercado (ej. "Carrefour") |
| `medio_pago` | banco/billetera (ej. "Cuenta DNI") |
| `dias` | días que aplica, array Postgres `int2[]` (0=Dom … 6=Sáb) |
| `porcentaje` | % de descuento |
| `tope` | tope de reintegro (`null` = sin tope) |
| `tope_periodo` | `semanal` / `mensual` / `diario` / `transaccion` / `—` |
| `minimo` | compra mínima (0 si no hay) |
| `desde` / `hasta` | vigencia (fechas) |
| `nota` | condición legible (ej. "crédito vía MODO") |

La app oculta sola las promos vencidas por fecha.

## Actualizar las promos

La actualización es un **reemplazo atómico** de los datos. El SQL tiene esta
forma (borra e inserta en una transacción, para que nunca quede a medias):

```sql
begin;
delete from public.promos where cadena in ('Carrefour', 'ChangoMás');
insert into public.promos (...) values (...);
commit;
```

Ese SQL se genera de forma semiautomática con el **scraper** (repo/carpeta
aparte): baja los feeds de las cadenas, filtra lo que sirve, y deja un borrador
para revisar antes de aplicar. La revisión humana es parte del proceso: el dato
confiable es el diferencial de la app.

## Desplegar (GitHub Pages)

1. Subí el repo a GitHub.
2. En **Settings → Pages**, elegí la rama `main` y la carpeta raíz (`/root`).
3. Esperá el deploy; la app queda en `https://TU-USUARIO.github.io/alcanza/`
   (o en tu dominio propio si configurás uno).

> Importante: `sw.js` y `manifest.webmanifest` deben estar en la **raíz** del
> sitio. El service worker solo controla su carpeta y las de abajo, así que si
> queda en un subdirectorio, la PWA no cachea bien.

## Privacidad

Alcanza no pide registro ni recopila datos personales. Los medios de pago que
elegís y tu historial de compras se guardan localmente en tu navegador. La app
solo lee las promos públicas desde Supabase.
