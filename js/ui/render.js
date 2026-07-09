// =======================================================================
// ui/render.js — Pintado de la UI + sección de ahorro acumulado.
// Render y ahorro van juntos porque se llaman entre sí (renderHero abre el
// registro de compra, y registrar/borrar vuelven a pintar), así se evita un
// import circular entre módulos.
// =======================================================================

import { S, persistSetup, persistCompras } from "../state.js";
import { DIAS, DIAS3, HOY, HOY_ISO, DIAS_PARA_ALERTAR, reduce, SAVINGS_PAGE_SIZE } from "../config.js";
import { fmt, cap } from "../format.js";
import { promosDelDia, ganadorDelDia, mejorDeLaSemana } from "../promos.js";
import { tweenPesos } from "./tween.js";
import { showToast } from "./toast.js";
import { confirmModal } from "./modal.js";
import { compartir } from "./share.js";
import { linkFeedback } from "./feedback.js";

let savingsPage = 1;

export function renderStamp() {
  const box = document.getElementById("stamp");
  const dias = Math.floor((Date.now() - new Date(S.ACTUALIZADO).getTime()) / 86400000);
  const fecha = new Date(S.ACTUALIZADO).toLocaleDateString("es-AR");
  if (dias > DIAS_PARA_ALERTAR) { box.className = "stamp warn"; box.textContent = `Datos de hace ${dias} días — conviene verificar las promos`; }
  else { box.className = "stamp"; box.textContent = `Promos verificadas el ${fecha} · La Plata`; }
}

export function renderHero() {
  const hero = document.getElementById("hero");
  const label = `${S.selectedDay === HOY ? '<span class="now">hoy</span> · ' : ''}${DIAS[S.selectedDay]}`;
  if (S.selectedMethods.size === 0) { hero.className = "tag is-empty"; hero.innerHTML = `<div class="tag-day">${label}</div><div class="tag-chain">Elegí un medio de pago</div>`; return; }
  const g = ganadorDelDia(S.selectedDay);
  if (!g) { hero.className = "tag is-empty"; hero.innerHTML = `<div class="tag-day">${label}</div><div class="tag-chain">Sin promos este día — probá otro</div>`; return; }
  hero.className = "tag";
  // El botón "Compré acá" solo aparece hoy: uno registra la compra que hace hoy.
  const btn = S.selectedDay === HOY ? `<button class="tag-btn" id="logBtn">✓ Compré acá · sumar ${fmt(g.pesos)}</button>` : "";
  // Reporte atado al veredicto: la promo que "te informamos".
  const ctxHero = `${g.cadena} · ${g.medioPago} · ${DIAS[S.selectedDay]} · ${g.porcentaje}%`;
  const repHero = linkFeedback(ctxHero);
  hero.innerHTML = `
    <div class="tag-day">${label}</div>
    <div class="tag-chain">${g.cadena}</div>
    <div class="tag-figures">
      <div class="tag-save"><div class="k">Ahorrás</div><div class="v" id="heroSave">$0</div></div>
      <div class="tag-pct">${Math.round(g.efectivo)}% real</div>
    </div>
    <div class="tag-with">pagando con <b>${g.medioPago}</b>${g.nota ? ` · ${g.nota}` : ''}${g.topeAlcanzado ? ` · tope ${fmt(g.tope)} ${g.topePeriodo}` : ''}</div>
    <div class="tag-actions">
      ${btn}
      <button class="tag-share" id="shareBtn" type="button" aria-label="Compartir esta promo">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
        Compartir
      </button>
    </div>
    ${repHero ? `<a class="hero-report report-link" href="${repHero}" target="_blank" rel="noopener">¿No ahorraste esto? Reportá la promo</a>` : ""}`;
  tweenPesos(document.getElementById("heroSave"), g.pesos);
  const lb = document.getElementById("logBtn");
  if (lb) lb.onclick = () => registrarCompra(g);
  const sb = document.getElementById("shareBtn");
  if (sb) sb.onclick = () => {
    const dayWord = S.selectedDay === HOY ? "Hoy" : DIAS[S.selectedDay];
    const topeTxt = g.topeAlcanzado ? ` (tope ${fmt(g.tope)})` : "";
    compartir({
      title: "Alcanza",
      text: `${dayWord} conviene comprar en ${g.cadena} con ${g.medioPago}: ${g.porcentaje}% de descuento${topeTxt}. Lo vi en Alcanza 👇`,
      url: location.origin + location.pathname
    });
  };
}

export function renderAdvice() {
  const box = document.getElementById("advice");
  const semana = mejorDeLaSemana();
  if (S.selectedMethods.size === 0 || !semana) { box.style.display = "none"; return; }
  box.style.display = "flex";
  const { best, bestDay } = semana;
  const hoy = ganadorDelDia(HOY);
  const proy = `≈ ${fmt(best.pesos * 4.3)}/mes si comprás siempre el mejor día (estimado)`;
  if (bestDay === HOY) {
    box.className = "advice now";
    box.innerHTML = `<div class="ico">✓</div><div><div class="advice-main"><b>Hoy es el mejor día</b> de la semana para tus medios. Aprovechá.</div><div class="advice-sub">${proy}</div></div>`;
    return;
  }
  const dias = (bestDay - HOY + 7) % 7;
  const cuando = `${DIAS[bestDay]}${dias === 1 ? " (mañana)" : ` (en ${dias} días)`}`;
  const extra = best.pesos - (hoy ? hoy.pesos : 0);
  if (extra >= 1000) {
    box.className = "advice";
    box.innerHTML = `<div class="ico">→</div><div><div class="advice-main">Conviene esperar al <b>${cuando}</b>: ahorrás <b>${fmt(extra)} más</b> en ${best.cadena}.</div><div class="advice-sub">${proy}</div></div>`;
  } else {
    box.className = "advice now";
    box.innerHTML = `<div class="ico">✓</div><div><div class="advice-main">${hoy ? "Hoy ya es una buena opción." : "Hoy no hay promo, pero"} El máximo de la semana es el <b>${DIAS[bestDay]}</b>.</div><div class="advice-sub">${proy}</div></div>`;
  }
}

export function renderMethods() {
  const box = document.getElementById("methods"); box.innerHTML = "";
  S.MEDIOS.forEach(m => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = m; b.setAttribute("aria-pressed", S.selectedMethods.has(m));
    b.onclick = () => { S.selectedMethods.has(m) ? S.selectedMethods.delete(m) : S.selectedMethods.add(m); persistSetup(); renderAll(); };
    box.appendChild(b);
  });
}

export function renderWeek() {
  const box = document.getElementById("week"); box.innerHTML = "";
  const semana = [1, 2, 3, 4, 5, 6, 0];
  const mejorPesos = Math.max(0, ...semana.map(d => { const g = ganadorDelDia(d); return g ? g.pesos : 0; }));
  semana.forEach(dia => {
    const g = ganadorDelDia(dia);
    const b = document.createElement("button");
    b.className = "day" + (dia === HOY ? " is-today" : "");
    b.setAttribute("aria-pressed", dia === S.selectedDay);
    const esMejor = g && g.pesos === mejorPesos && mejorPesos > 0;
    b.innerHTML = `${esMejor ? '<span class="best-flag">mejor</span>' : ''}
      <div class="day-name">${DIAS3[dia]}</div>` +
      (g ? `<div class="day-chain">${g.cadena}</div><div class="day-pct">${Math.round(g.efectivo)}%</div><div class="day-save">${fmt(g.pesos)}</div>`
         : `<div class="day-empty">Sin promos<br>para tus medios</div>`);
    b.onclick = () => { S.selectedDay = dia; renderWeek(); renderHero(); renderDetail(); };
    box.appendChild(b);
  });
}

export function renderDetail() {
  document.getElementById("ticketTitle").textContent = S.selectedDay === HOY ? "Todas las opciones de hoy" : "Todas las opciones";
  document.getElementById("ticketDay").textContent = S.selectedDay === HOY ? "" : DIAS[S.selectedDay].toLowerCase();
  const box = document.getElementById("detail");
  const list = promosDelDia(S.selectedDay);
  if (S.selectedMethods.size === 0) { box.innerHTML = `<div class="empty">Elegí al menos un medio de pago para ver dónde te conviene.</div>`; return; }
  if (list.length === 0) { box.innerHTML = `<div class="empty">No hay promos vigentes ese día para los medios que elegiste. Probá otro día o sumá una tarjeta.</div>`; return; }
  box.innerHTML = list.map((p, i) => {
    const flags = [];
    if (p.bajoMinimo) flags.push({ type: "warn", text: `compra mínima ${fmt(p.minimo)}` });
    if (p.topeAlcanzado) flags.push({ type: "info", text: `llega al tope de ${fmt(p.tope)} (${p.topePeriodo})` });
    // Reporte con la promo precargada: "Cadena · Medio · Día · %"
    const contexto = `${p.cadena} · ${p.medioPago} · ${DIAS[S.selectedDay]} · ${p.porcentaje}%`;
    const rep = linkFeedback(contexto);
    const repLink = rep ? `<a class="report-link" href="${rep}" target="_blank" rel="noopener">¿No ahorraste esto? Reportá la promo</a>` : "";
    return `<div class="row${i === 0 && !p.bajoMinimo ? " best" : ""}">
      <div class="chain">${p.cadena}</div>
      <div class="method">${p.medioPago}${p.nota ? ` · ${p.nota}` : ''} · ${p.porcentaje}% nominal</div>
      ${flags.length ? `<div class="flags">${flags.map(f => `<span class="flag flag-${f.type}">${f.text}</span>`).join("")}</div>` : ""}
      <div class="save-amt" style="color:${p.bajoMinimo ? 'var(--muted)' : 'var(--ink)'}">${p.bajoMinimo ? "—" : fmt(p.pesos)}</div>
      <div class="save-sub">${p.bajoMinimo ? "N/A" : Math.round(p.efectivo) + "% real"}</div>
      ${repLink}
    </div>`;
  }).join("");
}

// ----- Ahorro acumulado -----
export function registrarCompra(g) {
  S.compras.push({ id: Date.now(), fecha: HOY_ISO, cadena: g.cadena, medioPago: g.medioPago, ahorro: Math.round(g.pesos), monto: S.amount });
  persistCompras();
  savingsPage = 1;
  renderSavings(true);
  const lb = document.getElementById("logBtn");
  if (lb) { lb.classList.add("done"); lb.textContent = "¡Sumado! ✓"; setTimeout(renderHero, 1300); }
  showToast(`Sumaste ${fmt(g.pesos)} en ${g.cadena} a tu historial de ahorro`);
}

export function borrarCompra(id) {
  S.compras = S.compras.filter(c => c.id !== id);
  persistCompras();
  renderSavings(false);
}

export function renderSavings(animate) {
  const box = document.getElementById("savingsBody");
  if (S.compras.length === 0) {
    savingsPage = 1;
    box.innerHTML = `<div class="savings-empty">Todavía no registraste compras. Cuando compres en el súper, tocá <b>“Compré acá”</b> en la tarjeta de arriba y Alcanza va sumando lo que ahorrás.</div>`;
    return;
  }
  const mes = HOY_ISO.slice(0, 7);
  const nombreMes = cap(new Date(mes + "-01T12:00:00").toLocaleDateString("es-AR", { month: "long" }));
  const totalMes = S.compras.filter(c => c.fecha.slice(0, 7) === mes).reduce((s, c) => s + c.ahorro, 0);
  const totalHist = S.compras.reduce((s, c) => s + c.ahorro, 0);
  const ordenadas = [...S.compras].sort((a, b) => b.id - a.id);
  const totalPages = Math.max(1, Math.ceil(ordenadas.length / SAVINGS_PAGE_SIZE));
  savingsPage = Math.min(Math.max(savingsPage, 1), totalPages);
  const inicio = (savingsPage - 1) * SAVINGS_PAGE_SIZE;
  const pagina = ordenadas.slice(inicio, inicio + SAVINGS_PAGE_SIZE);

  box.innerHTML = `
    <div class="savings-total" id="savingsTotal">${fmt(totalMes)}</div>
    <div class="savings-total-label">ahorrado en ${nombreMes}</div>
    <div class="savings-stats">Total con Alcanza: ${fmt(totalHist)} · ${S.compras.length} ${S.compras.length === 1 ? "compra" : "compras"}</div>
    <div class="savings-list">
      ${pagina.map(c => {
        const f = new Date(c.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" });
        return `<div class="savings-item">
          <div><div class="who">${c.cadena}</div><div class="meta">${f} · ${c.medioPago} · compra ${fmt(c.monto)}</div></div>
          <div class="amt">${fmt(c.ahorro)}</div>
          <button class="del" data-id="${c.id}" aria-label="Borrar compra">✕</button>
        </div>`;
      }).join("")}
    </div>
    ${totalPages > 1 ? `
    <div class="savings-pager">
      <button class="pager-btn" id="pagerPrev" type="button" aria-label="Página anterior"${savingsPage === 1 ? " disabled" : ""}>‹</button>
      <span class="pager-label">Página ${savingsPage} de ${totalPages}</span>
      <button class="pager-btn" id="pagerNext" type="button" aria-label="Página siguiente"${savingsPage === totalPages ? " disabled" : ""}>›</button>
    </div>` : ""}`;

  box.querySelectorAll(".del").forEach(b => b.onclick = async () => {
    const ok = await confirmModal({
      title: "¿Borrar este registro?",
      text: "Vas a eliminar esta compra de tu historial de ahorro. Esta acción no se puede deshacer."
    });
    if (ok) borrarCompra(Number(b.dataset.id));
  });
  const prevBtn = document.getElementById("pagerPrev");
  const nextBtn = document.getElementById("pagerNext");
  if (prevBtn) prevBtn.onclick = () => { savingsPage--; renderSavings(false); };
  if (nextBtn) nextBtn.onclick = () => { savingsPage++; renderSavings(false); };
  const tot = document.getElementById("savingsTotal");
  if (animate && !reduce && tot) { tot.classList.remove("pulse"); void tot.offsetWidth; tot.classList.add("pulse"); }
}

export function renderAll() {
  renderStamp(); renderMethods(); renderHero(); renderAdvice(); renderWeek(); renderDetail(); renderSavings(false);
}