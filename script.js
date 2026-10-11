'use strict';
/* ==========================================================================
   MISIÓN COLEGIO LIMPIO · Lógica del juego
   Necesita data.js cargado antes (define MCL).
   ========================================================================== */
(function () {
  const D = MCL;
  const $ = function (s, r) { return (r || document).querySelector(s); };
  const app = $('#app');

  /* ---------- Utilidades ---------- */
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function pct(n, max) { return Math.min(100, Math.round((n * 100) / max)); }
  function plural(n, uno, varios) { return n === 1 ? uno : varios; }
  function anunciar(msg) { const a = $('#anuncio'); a.textContent = ''; setTimeout(function () { a.textContent = msg; }, 30); }

  const ICO = {
    candado: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 16.6 5.4 12.5l-1.9 1.9 6 6L20.5 9.4l-1.9-1.9z"/></svg>',
    jugar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    aviso: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 1.5 20.5h21zM11 9h2v6h-2zm0 8h2v2h-2z"/></svg>',
    nota: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v11.3A3.5 3.5 0 1 0 11 17.5V7.6l8-1.6v6.3A3.5 3.5 0 1 0 21 15.5V3z"/></svg>'
  };

  /* ---------- Estado y progreso (solo durante la sesión) ---------- */
  const SUBS = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2'];
  const CLAVE = 'mcl_progreso_v1';
  const BADGE_DE = { '1.2': 'clasificacion', '2.1': 'patio', '3.1': 'detective' };
  let memoria = null; // plan B si el navegador no deja usar sessionStorage

  function nuevoEstado() {
    const z = {}, f = {}, c = {};
    SUBS.forEach(function (s) { z[s] = 0; f[s] = false; c[s] = 0; });
    return {
      scores: z, done: f, ok: Object.assign({}, c), err: Object.assign({}, c),
      badges: { clasificacion: false, patio: false, detective: false, racha: false, guardian: false },
      desbloqueada: 1, maxRacha: 0
    };
  }
  function cargar() {
    let txt = null;
    try { txt = sessionStorage.getItem(CLAVE); } catch (e) { txt = memoria; }
    if (!txt) return nuevoEstado();
    try {
      const o = JSON.parse(txt), base = nuevoEstado();
      return Object.assign(base, o, { badges: Object.assign(base.badges, o.badges) });
    } catch (e) { return nuevoEstado(); }
  }
  function guardar() {
    const txt = JSON.stringify(S);
    memoria = txt;
    try { sessionStorage.setItem(CLAVE, txt); } catch (e) { /* sigue en memoria */ }
  }
  let S = cargar();

  let run = null;   // reto en curso (no cuenta hasta terminarlo)
  let ctx = { on: {}, teclas: null, timers: [] };

  function sumaGuardada(excepto) {
    return SUBS.reduce(function (a, s) { return a + (s === excepto ? 0 : S.scores[s]); }, 0);
  }
  function totalPuntos() {
    return Math.min(D.puntajeMaximo, sumaGuardada(run ? run.id : null) + (run ? run.score : 0));
  }
  function retosHechos() { return SUBS.filter(function (s) { return S.done[s]; }).length; }
  function misionCompleta(m) { return m.subs.every(function (s) { return S.done[s.id]; }); }
  function todoCompleto() { return retosHechos() === SUBS.length; }

  /* ---------- Barra superior ---------- */
  let ultimoTotal = 0;
  function actualizarHUD(titulo) {
    const hud = $('#hud');
    if (titulo !== undefined) $('#hudTitulo').textContent = titulo;
    const total = totalPuntos();
    const chip = $('.chip-puntos');
    $('#hudPuntos').textContent = total;
    if (total > ultimoTotal) { chip.classList.remove('sube'); void chip.offsetWidth; chip.classList.add('sube'); }
    ultimoTotal = total;
    const n = retosHechos();
    $('#barraTotalRelleno').style.width = (n * 100 / SUBS.length) + '%';
    $('#barraTotal').setAttribute('aria-valuenow', n);
    $('#hudProgreso').textContent = n + ' de ' + SUBS.length + ' retos completados';
    hud.hidden = false;
  }

  /* ---------- Navegación ---------- */
  function limpiar() {
    (ctx.timers || []).forEach(function (t) { clearInterval(t); clearTimeout(t); });
    ctx = { on: {}, teclas: null, timers: [] };
  }
  function montar(html, opciones) {
    const o = opciones || {};
    app.innerHTML = '<section class="pantalla">' + html + '</section>';
    if (o.foco !== false) {
      const h = app.querySelector('[data-foco]');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    if (o.scroll !== false) window.scrollTo({ top: 0 });
  }
  function timeout(fn, ms) { const t = setTimeout(fn, ms); ctx.timers.push(t); return t; }

  /* ---------- Audio ---------- */
  let musica = null, musicaFalla = false, silenciada = false, efectosOn = true, volumen = D.volumenInicial;
  let actx = null;

  function crearMusica() {
    if (musica) return;
    musica = new Audio(D.rutaMusica);
    musica.loop = true;
    musica.volume = volumen;
    musica.muted = silenciada;
    musica.addEventListener('error', function () {
      musicaFalla = true;
      const av = $('#audioAviso');
      av.textContent = 'Falta el archivo ' + D.rutaMusica;
      av.hidden = false;
      syncAudioUI();
    });
    musica.addEventListener('play', syncAudioUI);
    musica.addEventListener('pause', syncAudioUI);
  }
  function toggleMusica() {
    if (musicaFalla) {          // por si el archivo se añadió después: reintenta
      musica = null; musicaFalla = false;
      $('#audioAviso').hidden = true;
    }
    crearMusica();
    if (musica.paused) {
      const p = musica.play();
      if (p && p.catch) p.catch(function () { syncAudioUI(); });
    } else {
      musica.pause();
    }
    syncAudioUI();
  }
  function syncAudioUI() {
    const sonando = !!(musica && !musica.paused && !musicaFalla);
    const b = $('#btnMusica');
    b.setAttribute('aria-pressed', sonando ? 'true' : 'false');
    b.setAttribute('aria-label', sonando ? 'Pausar música' : 'Reproducir música');
    const s = $('#btnSilencio');
    s.setAttribute('aria-pressed', silenciada ? 'true' : 'false');
    s.setAttribute('aria-label', silenciada ? 'Activar el sonido de la música' : 'Silenciar la música');
    const e = $('#btnEfectos');
    e.setAttribute('aria-pressed', efectosOn ? 'true' : 'false');
    e.setAttribute('aria-label', efectosOn ? 'Efectos de sonido activados. Pulsa para desactivarlos' : 'Efectos de sonido desactivados. Pulsa para activarlos');
    const g = $('#btnMusicaGrande');
    if (g) {
      g.setAttribute('aria-pressed', sonando ? 'true' : 'false');
      g.querySelector('.txt').textContent = sonando ? 'Pausar música' : 'Activar música';
    }
  }
  function tono(f, dur, tipo, inicio, vol) {
    const t0 = actx.currentTime + (inicio || 0);
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function sfx(nombre) {
    if (!efectosOn) return;
    try {
      if (!actx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; actx = new AC(); }
      if (actx.state === 'suspended') actx.resume();
      if (nombre === 'ok') { tono(660, .14, 'sine', 0); tono(880, .22, 'sine', .1); }
      else if (nombre === 'mal') { tono(210, .22, 'triangle', 0, .14); tono(160, .28, 'triangle', .14, .14); }
      else if (nombre === 'insignia') { [523, 659, 784, 1047].forEach(function (f, i) { tono(f, .3, 'sine', i * .11, .13); }); }
      else if (nombre === 'clic') { tono(480, .06, 'sine', 0, .06); }
      else if (nombre === 'fin') { [392, 523, 659].forEach(function (f, i) { tono(f, .25, 'sine', i * .13, .12); }); }
    } catch (e) { /* sin audio, el juego sigue */ }
  }

  /* ---------- Insignias (ventana dentro de la página) ---------- */
  let colaInsignias = [];
  function mostrarInsignias(lista) {
    colaInsignias = colaInsignias.concat(lista);
    if ($('#modal').hidden) siguienteInsignia();
  }
  function siguienteInsignia() {
    const id = colaInsignias.shift();
    const modal = $('#modal');
    if (!id) { modal.hidden = true; return; }
    const b = D.insignias[id];
    $('#modalContenido').innerHTML =
      '<img src="' + b.img + '" alt="' + b.alt + '">' +
      '<h2 id="modalTitulo">¡Nueva insignia!</h2>' +
      '<div class="etq-insignia">' + b.nombre + '</div>' +
      '<p>' + b.como + '</p>' +
      '<button type="button" class="btn" id="modalOk">¡Genial!</button>';
    modal.hidden = false;
    sfx('insignia');
    anunciar('Nueva insignia: ' + b.nombre);
    $('#modalOk').focus();
    $('#modalOk').addEventListener('click', siguienteInsignia);
  }

  /* ---------- Piezas de interfaz ---------- */
  function binsHTML(opts) {
    const o = opts || {};
    const html = ['blanca', 'negra', 'verde'].map(function (id) {
      const c = D.canecas[id];
      return '<button type="button" class="bin" data-act="caneca" data-caneca="' + id + '"' + (o.deshabilitar ? ' disabled' : '') + '>' +
        '<span class="bin-tecla" aria-hidden="true">' + c.tecla + '</span>' +
        '<img src="' + c.img + '" alt="' + c.alt + '">' +
        '<span class="bin-nombre">' + c.color + '</span>' +
        (o.sinPistas ? '' : '<span class="bin-grupo">' + c.grupo + '</span>') + '</button>';
    }).join('');
    return '<div class="bins' + (o.pequenas ? ' pequenas' : '') + '" role="group" aria-label="Elige una caneca">' + html + '</div>';
  }
  function fb(tipo, titulo, texto, puntos) {
    return '<div class="feedback ' + tipo + '" role="status">' +
      '<span class="fb-titulo">' + titulo + '</span>' +
      '<span class="fb-texto">' + texto + '</span>' +
      (puntos ? '<span class="fb-puntos">+' + puntos + ' ' + plural(puntos, 'punto', 'puntos') + '</span>' : '') + '</div>';
  }
  function barraHTML(valor, extraClase, etiqueta) {
    return '<div class="barra ' + (extraClase || '') + '" role="progressbar" aria-label="' + etiqueta + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(valor) + '"><span style="width:' + valor + '%"></span></div>';
  }
  function cabecera(id, titulo, instruccion) {
    return '<div class="act-cab"><div>' +
      '<span class="etiqueta">Reto ' + id + '</span>' +
      '<h2 data-foco>' + titulo + '</h2>' +
      '<p class="instr">' + instruccion + '</p></div>' +
      '<div class="act-lateral"><button type="button" class="btn suave pequeno" data-act="reiniciarReto">Reiniciar reto</button></div></div>';
  }
  function nombreMision(id) {
    const n = parseInt(id, 10);
    const m = D.misiones[n - 1];
    const s = m.subs.filter(function (x) { return x.id === id; })[0];
    return { mision: m, sub: s, texto: 'Misión ' + m.id + ' · ' + m.nombre + ' · ' + s.id + ' ' + s.nombre };
  }
  function nuevoRun(id) {
    return { id: id, score: 0, ok: 0, err: 0, errores: [], extra: {} };
  }
  function registrarError(item) {
    if (!run.errores.some(function (e) { return e.clave === item.clave; })) run.errores.push(item);
  }
  function chispasHTML(n) {
    const cols = ['#2f9e55', '#1f7fd6', '#f2a81d', '#7a4bc4', '#e8534f'];
    let h = '';
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 140;
      h += '<span class="chispa" style="left:' + (20 + Math.random() * 60) + '%;top:' + (20 + Math.random() * 50) + '%;background:' + cols[i % cols.length] +
        ';--dx:' + Math.round(Math.cos(ang) * dist) + 'px;--dy:' + Math.round(Math.sin(ang) * dist - 30) + 'px;animation-delay:' + (Math.random() * .5).toFixed(2) + 's"></span>';
    }
    return '<div class="chispas" aria-hidden="true">' + h + '</div>';
  }

  /* ==========================================================================
     PANTALLAS PRINCIPALES
     ========================================================================== */
  function irBienvenida() {
    limpiar(); run = null;
    $('#hud').hidden = true;
    const n = retosHechos();
    montar(
      '<div class="bienvenida">' +
        '<div class="heroe-caja"><img src="assets/img/ecoheroe.png" alt="Ecohéroe: un niño con capa verde y camiseta con una hoja, que levanta el pulgar"></div>' +
        '<div>' +
          '<h1 data-foco>Misión <span>Colegio Limpio</span></h1>' +
          '<p class="eslogan">«Tu basura no desaparece. Tú decides dónde termina».</p>' +
          '<p class="texto-bienvenida">Completa las misiones, aprende a separar los residuos y conviértete en Guardián Ambiental.</p>' +
          '<ul class="cuatro-misiones" aria-label="Las cuatro misiones">' +
            D.misiones.map(function (m) { return '<li><b>' + m.id + '</b>' + m.nombre + '</li>'; }).join('') +
          '</ul>' +
          '<p class="texto-bienvenida">El juego tiene <b>cuatro misiones</b> y cada una tiene dos retos. Ganas puntos, desbloqueas insignias y al final descubres tu título.</p>' +
          '<div class="progreso-bienvenida"><div class="etq"><span>Tu progreso</span><span>' + n + ' de ' + SUBS.length + ' retos</span></div>' +
            barraHTML(n * 100 / SUBS.length, '', 'Progreso del juego') + '</div>' +
          '<div class="acciones-bienvenida">' +
            '<button type="button" class="btn grande" data-act="comenzar">COMENZAR</button>' +
            '<button type="button" class="btn suave btn-musica-grande" id="btnMusicaGrande" data-act="musica" aria-pressed="false">' + ICO.nota + '<span class="txt">Activar música</span></button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    syncAudioUI();
  }

  function irMenu() {
    limpiar(); run = null;
    actualizarHUD('Menú de misiones');
    const tarjetas = D.misiones.map(function (m) {
      const abierta = m.id <= S.desbloqueada;
      const subs = m.subs.map(function (s, i) {
        const habilitada = abierta && (i === 0 || S.done[s.id]);
        const hecha = S.done[s.id];
        let estado;
        if (hecha) estado = ICO.check + S.scores[s.id] + ' pts';
        else if (habilitada) estado = ICO.jugar + 'Jugar';
        else estado = ICO.candado + 'Bloqueado';
        return '<button type="button" class="sub-btn' + (hecha ? ' hecha' : '') + '" data-act="sub" data-id="' + s.id + '"' + (habilitada ? '' : ' disabled') + '>' +
          '<span class="sub-id">' + s.id + '</span><span>' + s.nombre + '</span><span class="sub-estado">' + estado + '</span></button>';
      }).join('');
      const alguna = m.subs.some(function (s) { return S.done[s.id]; });
      return '<article class="tarjeta mision-card' + (abierta ? '' : ' bloqueada') + '">' +
        '<div class="mision-cab"><span class="mision-num" aria-hidden="true">' + m.id + '</span>' +
        '<div><h3>Misión ' + m.id + ': ' + m.nombre + '</h3></div></div>' +
        '<p class="obj">' + (abierta ? m.objetivo : 'Termina la misión anterior para desbloquearla.') + '</p>' +
        '<div class="subs">' + subs + '</div>' +
        (alguna ? '<div class="mision-pie"><button type="button" class="link-btn" data-act="reiniciarMision" data-id="' + m.id + '">Reiniciar misión</button></div>' : '') +
        '</article>';
    }).join('');
    const insignias = Object.keys(D.insignias).map(function (k) {
      const b = D.insignias[k], tiene = S.badges[k];
      return '<div class="insignia-slot' + (tiene ? '' : ' bloqueada') + '"><img src="' + b.img + '" alt="' + (tiene ? b.alt : 'Insignia ' + b.nombre + ' bloqueada') + '">' + b.nombre + '</div>';
    }).join('');
    montar(
      '<div class="cab-menu"><div class="heroe-mini"><img src="assets/img/ecoheroe.png" alt="Ecohéroe">' +
        '<div><h2 class="titulo-pantalla" data-foco>Menú de misiones</h2><p class="subtitulo">Elige un reto y salva el colegio.</p></div></div>' +
        (todoCompleto() ? '<button type="button" class="btn azul" data-act="verFinal">Ver mis resultados</button>' : '') +
      '</div>' +
      '<div class="misiones-grid">' + tarjetas + '</div>' +
      '<h3 class="seccion-titulo">Tus insignias</h3><div class="insignias-fila">' + insignias + '</div>'
    );
  }

  /* ---------- Cómo se guarda un reto terminado ---------- */
  function terminar(id) {
    const nuevas = [];
    S.scores[id] = Math.min(D.maximos[id], run.score);
    S.ok[id] = run.ok; S.err[id] = run.err; S.done[id] = true;
    const m = D.misiones[parseInt(id, 10) - 1];
    if (misionCompleta(m)) S.desbloqueada = Math.max(S.desbloqueada, Math.min(4, m.id + 1));
    const b = BADGE_DE[id];
    if (b && !S.badges[b]) { S.badges[b] = true; nuevas.push(b); }
    if (id === '4.2') {
      S.maxRacha = Math.max(S.maxRacha, run.extra.maxRacha || 0);
      if (run.extra.maxRacha >= 5 && !S.badges.racha) { S.badges.racha = true; nuevas.push('racha'); }
    }
    guardar();
    const hecho = run;
    run = null;
    actualizarHUD();
    pantallaResultado(id, hecho);
    sfx('fin');
    if (nuevas.length) timeout(function () { mostrarInsignias(nuevas); }, 500);
  }

  function disponible(s) {
    const m = D.misiones[parseInt(s, 10) - 1];
    const idx = m.subs.map(function (x) { return x.id; }).indexOf(s);
    return m.id <= S.desbloqueada && (idx === 0 || S.done[m.subs[0].id]);
  }
  function siguienteDe(id) {
    const i = SUBS.indexOf(id);
    if (i < 0 || i === SUBS.length - 1) return null;
    return disponible(SUBS[i + 1]) ? SUBS[i + 1] : null;
  }

  function pantallaResultado(id, hecho) {
    limpiar();
    const info = nombreMision(id);
    const maxSub = D.maximos[id];
    let extras = '';
    if (id === '4.1') {
      extras = '<div class="cifra a"><div class="n">' + hecho.extra.sinResponder + '</div><div class="t">Sin responder</div></div>';
    } else if (id === '4.2') {
      extras = '<div class="cifra b"><div class="n">' + hecho.extra.maxRacha + '</div><div class="t">Mejor racha</div></div>';
    }
    const lista = hecho.errores.length ?
      '<h3 class="seccion-titulo">Para repasar</h3><div class="lista-errores">' + hecho.errores.map(function (e) {
        return '<div class="error-item">' + (e.img ? '<img src="' + e.img + '" alt="' + (e.alt || '') + '">' : '') + '<p><b>' + e.titulo + '</b>' + e.texto + '</p></div>';
      }).join('') + '</div>' : '';
    const sig = siguienteDe(id);
    const ultimo = id === '4.2';
    let botones = '<button type="button" class="btn suave" data-act="repetir" data-id="' + id + '">Repetir reto</button>';
    if (ultimo && todoCompleto()) botones += '<button type="button" class="btn azul" data-act="verFinal">Ver mis resultados</button>';
    else if (sig) botones += '<button type="button" class="btn" data-act="sub" data-id="' + sig + '">Siguiente reto</button>';
    botones += '<button type="button" class="btn suave" data-act="menu">Menú de misiones</button>';
    const mensaje = hecho.err === 0 ? '¡Sin errores! Así se hace.' :
      'Equivocarse también enseña. Revisa lo que falló y vuelve a intentarlo si quieres subir tu puntaje.';
    montar(
      '<div class="resultado tarjeta">' +
        '<span class="etiqueta">' + info.texto + '</span>' +
        '<h2 data-foco>¡Reto completado!</h2>' +
        '<p class="subtitulo">' + mensaje + '</p>' +
        '<div class="cifras">' +
          '<div class="cifra b"><div class="n">' + S.scores[id] + '<small> / ' + maxSub + '</small></div><div class="t">Puntos del reto</div></div>' +
          '<div class="cifra v"><div class="n">' + hecho.ok + '</div><div class="t">' + plural(hecho.ok, 'Acierto', 'Aciertos') + '</div></div>' +
          '<div class="cifra r"><div class="n">' + hecho.err + '</div><div class="t">' + plural(hecho.err, 'Error', 'Errores') + '</div></div>' +
          extras +
        '</div>' + lista +
        '<div class="fila-botones">' + botones + '</div>' +
      '</div>'
    );
    anunciar('Reto completado. Obtuviste ' + S.scores[id] + ' puntos.');
  }

  function irFinal() {
    if (!todoCompleto()) { irMenu(); return; }
    limpiar(); run = null;
    const total = Math.min(D.puntajeMaximo, sumaGuardada(null));
    const p = pct(total, D.puntajeMaximo);
    const rango = D.rangos.filter(function (r) { return p <= r.max; })[0] || D.rangos[D.rangos.length - 1];
    const aciertos = SUBS.reduce(function (a, s) { return a + S.ok[s]; }, 0);
    const errores = SUBS.reduce(function (a, s) { return a + S.err[s]; }, 0);
    const misiones = D.misiones.filter(misionCompleta).length;
    const nuevas = [];
    const eraGuardian = S.badges.guardian;
    S.badges.guardian = p >= 91;
    if (S.badges.guardian && !eraGuardian) nuevas.push('guardian');
    guardar();
    actualizarHUD('Resultados finales');
    const insignias = Object.keys(D.insignias).map(function (k) {
      const b = D.insignias[k], tiene = S.badges[k];
      return '<div class="insignia-slot' + (tiene ? '' : ' bloqueada') + '"><img src="' + b.img + '" alt="' + (tiene ? b.alt : 'Insignia ' + b.nombre + ' no conseguida') + '">' + b.nombre + '</div>';
    }).join('');
    montar(
      '<div class="resultado final tarjeta">' +
        '<img class="heroe-final" src="assets/img/ecoheroe.png" alt="Ecohéroe celebrando">' +
        '<span class="etiqueta">Resultados finales</span>' +
        '<h2 data-foco>¡Misión terminada!</h2>' +
        '<div class="puntuacion-grande">' + total + '<small> / ' + D.puntajeMaximo + '</small></div>' +
        '<div class="porcentaje">' + p + '% del puntaje total</div>' +
        '<div class="titulo-ganado">' + rango.nombre + '</div>' +
        '<p class="subtitulo">' + rango.mensaje + '</p>' +
        '<div class="grid-cifras">' +
          '<div class="cifra v"><div class="n">' + aciertos + '</div><div class="t">Respuestas correctas</div></div>' +
          '<div class="cifra r"><div class="n">' + errores + '</div><div class="t">Errores</div></div>' +
          '<div class="cifra b"><div class="n">' + misiones + '/4</div><div class="t">Misiones completadas</div></div>' +
          '<div class="cifra a"><div class="n">' + Object.keys(S.badges).filter(function (k) { return S.badges[k]; }).length + '/5</div><div class="t">Insignias</div></div>' +
        '</div>' +
        '<h3 class="seccion-titulo">Tus insignias</h3><div class="insignias-fila">' + insignias + '</div>' +
        '<p class="eslogan">«Tu basura no desaparece. Tú decides dónde termina».</p>' +
        '<div class="fila-botones">' +
          '<button type="button" class="btn" data-act="jugarDeNuevo">VOLVER A JUGAR</button>' +
          '<button type="button" class="btn suave" data-act="menu">VOLVER AL MENÚ</button>' +
        '</div>' +
      '</div>'
    );
    sfx('fin');
    if (nuevas.length) timeout(function () { mostrarInsignias(nuevas); }, 600);
  }

  /* ==========================================================================
     RETOS
     ========================================================================== */
  function iniciarSub(id) {
    limpiar();
    run = nuevoRun(id);
    actualizarHUD(nombreMision(id).texto);
    switch (id) {
      case '1.1': return actClasificar(id, D.sub11, false);
      case '1.2': return actClasificar(id, D.sub12, true);
      case '2.1': return actPatio();
      case '2.2': return actSituaciones();
      case '3.1': return actMapa();
      case '3.2': return actPlan();
      case '4.1': return introRelampago();
      case '4.2': return introRacha();
    }
  }

  /* ---------- 1.1 y 1.2: clasificar ---------- */
  function actClasificar(id, ids, misteriosa) {
    const items = shuffle(ids);
    const n = items.length;
    const P = D.puntos[id];
    let i = 0, intentos = 0, resuelto = false, revelado = !misteriosa;
    let probadas = [];

    function cajaHTML() {
      const r = D.residuos[items[i]];
      if (!revelado) {
        return '<div class="misteriosa" aria-hidden="true">?</div><div class="residuo-nombre">Residuo misterioso</div>' +
          '<button type="button" class="btn azul" data-act="revelar">Revelar residuo</button>';
      }
      return '<img class="residuo-img" src="' + r.img + '" alt="' + r.alt + '">' +
        '<div class="residuo-nombre">' + r.nombre + '</div>' +
        '<div class="pregunta">¿En qué caneca va?</div>';
    }
    function dibujar() {
      intentos = 0; resuelto = false; probadas = [];
      if (misteriosa) revelado = false;
      montar(
        cabecera(id, misteriosa ? 'La caneca misteriosa' : 'Clasificación básica',
          misteriosa ? 'Revela cada residuo y elígele su caneca. Esta vez sin pistas, solo con lo que ya sabes.' : 'Mira el residuo y elige la caneca correcta. Puedes usar las teclas 1, 2 y 3.') +
        '<div class="paso-info"><span>Residuo ' + (i + 1) + ' de ' + n + '</span><span>' + run.ok + ' ' + plural(run.ok, 'acierto', 'aciertos') + '</span></div>' +
        barraHTML(i * 100 / n, '', 'Progreso del reto') +
        '<div style="height:14px"></div>' +
        '<div class="residuo-caja" id="caja">' + cajaHTML() + '</div>' +
        binsHTML({ deshabilitar: misteriosa, sinPistas: misteriosa }) +
        '<div id="fb"></div>' +
        '<div class="fila-botones" id="sig" hidden><button type="button" class="btn" data-act="siguiente">' + (i === n - 1 ? 'Ver resultado' : 'Siguiente residuo') + '</button></div>',
        { scroll: i === 0 }
      );
      if (i > 0) { const h = $('#caja'); if (h) h.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
    ctx.on.revelar = function () {
      revelado = true; sfx('clic');
      $('#caja').innerHTML = cajaHTML();
      app.querySelectorAll('.bin').forEach(function (b) { b.disabled = false; });
      anunciar('El residuo es: ' + D.residuos[items[i]].nombre);
    };
    ctx.on.caneca = function (t) { elegir(t.dataset.caneca); };
    function elegir(c) {
      if (resuelto || !revelado) return;
      if (probadas.indexOf(c) !== -1) return;
      const r = D.residuos[items[i]];
      const caja = $('#caja');
      const boton = app.querySelector('.bin[data-caneca="' + c + '"]');
      if (c === r.caneca) {
        resuelto = true;
        const pts = intentos === 0 ? P.primera : P.reintento;
        run.score += pts; run.ok++;
        boton.classList.add('correcta');
        app.querySelectorAll('.bin').forEach(function (b) { b.disabled = true; });
        caja.classList.remove('error'); caja.classList.add('acierto');
        $('#fb').innerHTML = fb('ok', '¡Correcto! Va en la caneca ' + D.canecas[c].color.toLowerCase() + '.', r.explicacion, pts);
        sfx('ok'); actualizarHUD();
        $('#sig').hidden = false; $('#sig .btn').focus();
      } else {
        intentos++; run.err++; probadas.push(c);
        registrarError({ clave: items[i], img: r.img, alt: r.alt, titulo: r.nombre + ': va en la caneca ' + D.canecas[r.caneca].color.toLowerCase() + '.', texto: r.explicacion });
        boton.classList.add('incorrecta'); boton.disabled = true;
        caja.classList.remove('error'); void caja.offsetWidth; caja.classList.add('error');
        $('#fb').innerHTML = fb('mal', 'Esa no es. Inténtalo otra vez.', 'Recuerda: la blanca es para aprovechables, la negra para no aprovechables y la verde para orgánicos.');
        sfx('mal');
      }
    }
    ctx.teclas = function (k) {
      const mapa = { '1': 'blanca', '2': 'negra', '3': 'verde' };
      if (mapa[k]) elegir(mapa[k]);
    };
    ctx.on.siguiente = function () {
      i++;
      if (i >= n) terminar(id); else dibujar();
    };
    dibujar();
  }

  /* ---------- 2.1: limpia el patio ---------- */
  function actPatio() {
    const id = '2.1', P = D.patio, pts = D.puntos[id];
    const total = P.items.length;
    const resueltos = {}, errs = {};
    let sel = null, hechos = 0, terminado = false;

    function sprites() {
      // Los grandes primero y los pequeños al final, para que queden encima y se puedan tocar
      const porTamano = P.items.slice().sort(function (a, b) { return b.w * b.h - a.w * a.h; });
      return porTamano.map(function (it) {
        return '<button type="button" class="sprite" data-act="seleccionar" data-id="' + it.id + '" ' +
          'style="left:' + (it.x / P.w * 100) + '%;top:' + (it.y / P.h * 100) + '%;width:' + (it.w / P.w * 100) + '%;height:' + (it.h / P.h * 100) + '%">' +
          '<img src="assets/img/patio/' + it.id + '.png" alt="' + it.nombre + '"></button>';
      }).join('');
    }
    function panelVacio() {
      return '<div class="vacio"><img src="assets/img/ecoheroe.png" alt=""><p><b>Toca un residuo del patio</b> para recogerlo.</p></div>';
    }
    montar(
      cabecera(id, 'Limpia el patio', 'Toca cada residuo, recógelo y llévalo a la caneca correcta.') +
      '<div class="escena-layout">' +
        '<div class="escena" id="escena"><img class="base" src="' + P.base + '" alt="' + P.alt + '">' + sprites() + '</div>' +
        '<aside class="tarjeta panel" aria-label="Panel de acciones">' +
          '<div class="contador" id="contador">Resueltos: 0 de ' + total + '</div>' +
          '<div id="panel">' + panelVacio() + '</div>' +
        '</aside>' +
      '</div>'
    );
    function contador() { $('#contador').textContent = 'Resueltos: ' + hechos + ' de ' + total; }
    function itemPorId(x) { return P.items.filter(function (i) { return i.id === x; })[0]; }

    ctx.on.seleccionar = function (t) {
      if (terminado) return;
      const it = itemPorId(t.dataset.id);
      if (resueltos[it.id]) return;
      sel = it.id; sfx('clic');
      app.querySelectorAll('.sprite').forEach(function (s) { s.classList.toggle('activo', s.dataset.id === sel); });
      const acciones = shuffle(P.acciones).map(function (a) {
        return '<button type="button" class="opcion" data-act="accion" data-a="' + a.id + '">' + a.texto + '</button>';
      }).join('');
      const r = D.residuos[it.residuo];
      $('#panel').innerHTML =
        '<h3 data-p>' + it.nombre + '</h3><p class="subtitulo">¿Qué haces?</p>' +
        '<div class="opciones">' + acciones + '</div><div id="fbp"></div>';
      const h = $('#panel [data-p]'); h.setAttribute('tabindex', '-1');
      if (window.matchMedia('(max-width: 860px)').matches) $('#panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      anunciar('Seleccionaste: ' + it.nombre);
    };
    ctx.on.accion = function (t) {
      const a = P.acciones.filter(function (x) { return x.id === t.dataset.a; })[0];
      if (!sel) return;
      if (a.correcta) {
        sfx('clic');
        $('#panel').innerHTML =
          '<h3>' + itemPorId(sel).nombre + '</h3><p class="subtitulo">Lo recogiste. ¿En qué caneca lo depositas?</p>' +
          '<div style="height:10px"></div>' + binsHTML({ pequenas: true }) + '<div id="fbp"></div>';
      } else {
        errs[sel] = (errs[sel] || 0) + 1; run.err++;
        t.classList.add('incorrecta'); t.disabled = true;
        $('#fbp').innerHTML = fb('mal', 'Mejor no.', a.feedback);
        sfx('mal');
      }
    };
    function depositar(c) {
      if (!sel || terminado) return;
      const it = itemPorId(sel);
      if (resueltos[it.id]) return;
      const r = D.residuos[it.residuo];
      const boton = app.querySelector('.bin[data-caneca="' + c + '"]');
      if (!boton || boton.disabled) return;
      if (c === r.caneca) {
        resueltos[it.id] = true; hechos++;
        const ganados = (errs[it.id] || 0) === 0 ? pts.primera : pts.reintento;
        run.score += ganados; run.ok++;
        if ((errs[it.id] || 0) > 0) registrarError({ clave: it.id, img: r.img, alt: r.alt, titulo: it.nombre + ': va en la caneca ' + D.canecas[r.caneca].color.toLowerCase() + '.', texto: r.explicacion });
        const sp = app.querySelector('.sprite[data-id="' + it.id + '"]');
        sp.classList.remove('activo'); sp.classList.add('recogido'); sp.tabIndex = -1; sp.setAttribute('aria-hidden', 'true');
        sel = null; contador(); actualizarHUD(); sfx('ok');
        if (hechos === total) { celebrar(ganados, r, c); return; }
        $('#panel').innerHTML =
          fb('ok', '¡Bien hecho! Va en la caneca ' + D.canecas[c].color.toLowerCase() + '.', r.explicacion, ganados) +
          '<p class="subtitulo" style="margin-top:12px;text-align:center">Elige otro residuo del patio.</p>';
      } else {
        errs[it.id] = (errs[it.id] || 0) + 1; run.err++;
        boton.classList.add('incorrecta'); boton.disabled = true;
        $('#fbp').innerHTML = fb('mal', 'Esa caneca no es. Prueba con otra.', 'Piensa de qué material está hecho el residuo y si está limpio.');
        sfx('mal');
      }
    }
    ctx.on.caneca = function (t) { depositar(t.dataset.caneca); };
    ctx.teclas = function (k) {
      const mapa = { '1': 'blanca', '2': 'negra', '3': 'verde' };
      if (mapa[k] && app.querySelector('#panel .bins')) depositar(mapa[k]);
    };
    function celebrar(ganados, r, c) {
      terminado = true;
      $('#escena').insertAdjacentHTML('beforeend', chispasHTML(26) + '<div class="cartel-exito">¡Patio limpio!</div>');
      $('#panel').innerHTML =
        fb('ok', '¡Lo lograste! El patio quedó limpio.', r.explicacion, ganados) +
        '<div class="fila-botones"><button type="button" class="btn" data-act="continuar">Continuar</button></div>';
      $('#panel .btn').focus();
      anunciar('Patio limpio. Terminaste todos los residuos.');
      sfx('fin');
    }
    ctx.on.continuar = function () { terminar(id); };
  }

  /* ---------- 2.2: ¿Qué harías tú? ---------- */
  function actSituaciones() {
    const id = '2.2', P = D.puntos[id];
    const lista = shuffle(D.situaciones);
    const n = lista.length;
    let i = 0, respondida = false;

    function dibujar() {
      respondida = false;
      const s = lista[i];
      const ops = shuffle(s.opciones.map(function (o, k) { return { o: o, k: k }; })).map(function (x, pos) {
        return '<button type="button" class="opcion" data-act="opcion" data-k="' + x.k + '">' + x.o.texto + '</button>';
      }).join('');
      montar(
        cabecera(id, '¿Qué harías tú?', 'Lee la situación y elige lo que harías de verdad.') +
        '<div class="paso-info"><span>Situación ' + (i + 1) + ' de ' + n + '</span><span>' + run.ok + ' ' + plural(run.ok, 'acierto', 'aciertos') + '</span></div>' +
        barraHTML(i * 100 / n, 'azul', 'Progreso del reto') +
        '<div style="height:14px"></div>' +
        '<div class="tarjeta" style="max-width:720px;margin:0 auto">' +
          '<p style="font-size:1.2rem;font-weight:800">' + s.texto + '</p>' +
          '<div class="opciones" id="ops">' + ops + '</div>' +
          '<div id="fb"></div>' +
          '<div class="fila-botones" id="sig" hidden><button type="button" class="btn" data-act="siguiente">' + (i === n - 1 ? 'Ver resultado' : 'Siguiente situación') + '</button></div>' +
        '</div>',
        { scroll: i === 0 }
      );
    }
    ctx.on.opcion = function (t) {
      if (respondida) return;
      respondida = true;
      const s = lista[i], o = s.opciones[parseInt(t.dataset.k, 10)];
      app.querySelectorAll('#ops .opcion').forEach(function (b) {
        b.disabled = true;
        if (s.opciones[parseInt(b.dataset.k, 10)].ok) b.classList.add('correcta');
      });
      if (o.ok) {
        run.score += P.acierto; run.ok++;
        $('#fb').innerHTML = fb('ok', '¡Buena decisión!', o.why, P.acierto);
        sfx('ok'); actualizarHUD();
      } else {
        run.err++; t.classList.add('incorrecta');
        const bien = s.opciones.filter(function (x) { return x.ok; })[0];
        $('#fb').innerHTML = fb('mal', 'Mejor otra opción.', o.why + ' <b>Lo mejor era:</b> ' + bien.texto);
        registrarError({ clave: s.id, titulo: s.texto, texto: bien.why });
        sfx('mal');
      }
      $('#sig').hidden = false; $('#sig .btn').focus();
    };
    ctx.on.siguiente = function () { i++; if (i >= n) terminar(id); else dibujar(); };
    dibujar();
  }

  /* ---------- 3.1: detectives ambientales ---------- */
  const NIVEL_ICO = { bien: ICO.check, atencion: '!', urgente: '!!' };
  function actMapa() {
    const id = '3.1', P = D.puntos[id], M = D.mapa;
    const evaluadas = {}, intentos = {};
    let sel = null, terminado = false;

    function zonasHTML() {
      return D.zonas.map(function (z) {
        return '<button type="button" class="zona" data-act="zona" data-id="' + z.id + '" aria-label="Zona: ' + z.nombre + '" ' +
          'style="left:' + (z.rect.x / M.w * 100) + '%;top:' + (z.rect.y / M.h * 100) + '%;width:' + (z.rect.w / M.w * 100) + '%;height:' + (z.rect.h / M.h * 100) + '%">' +
          '<span class="marca" aria-hidden="true">?</span></button>';
      }).join('');
    }
    function panelInicio() {
      return '<div class="vacio"><img src="assets/img/ecoheroe.png" alt=""><p><b>Toca una zona del mapa</b> para investigar qué pasó allí.</p></div>';
    }
    montar(
      cabecera(id, 'Detectives ambientales', 'Visita las cuatro zonas del colegio y decide cuánta ayuda necesita cada una.') +
      '<div class="aviso-ejemplo" role="note">' + ICO.aviso + '<span>Los casos que vas a ver son <b>escenarios de ejemplo para aprender</b>. No son datos reales de nuestro colegio.</span></div>' +
      '<div class="escena-layout">' +
        '<div><div class="escena" id="escena"><img class="base" src="' + M.img + '" alt="' + M.alt + '">' + zonasHTML() + '</div>' +
          '<div class="leyenda"><span><i class="punto b"></i>Sin evaluar</span><span><i class="punto v"></i>Va bien</span><span><i class="punto a"></i>Necesita atención</span><span><i class="punto r"></i>Atención urgente</span></div></div>' +
        '<aside class="tarjeta panel" aria-label="Detalle de la zona">' +
          '<div class="contador" id="contador">Zonas evaluadas: 0 de ' + D.zonas.length + '</div>' +
          '<div id="panel">' + panelInicio() + '</div>' +
        '</aside>' +
      '</div>'
    );
    function contador() { $('#contador').textContent = 'Zonas evaluadas: ' + Object.keys(evaluadas).length + ' de ' + D.zonas.length; }
    function zonaPorId(x) { return D.zonas.filter(function (z) { return z.id === x; })[0]; }
    function nivelPorId(x) { return D.niveles.filter(function (n) { return n.id === x; })[0]; }

    ctx.on.zona = function (t) {
      if (terminado) return;
      const z = zonaPorId(t.dataset.id);
      sel = z.id; sfx('clic');
      app.querySelectorAll('.zona').forEach(function (b) { b.classList.toggle('activa', b.dataset.id === sel); });
      let cuerpo;
      if (evaluadas[z.id]) {
        const n = nivelPorId(z.nivel);
        cuerpo = '<p class="escenario">' + z.escenario + '</p>' + fb('ok', 'Esta zona: ' + n.texto, z.porque);
      } else {
        const ops = shuffle(D.niveles).map(function (n) {
          return '<button type="button" class="opcion" data-act="nivel" data-n="' + n.id + '">' + n.texto + '</button>';
        }).join('');
        cuerpo = '<p class="escenario">' + z.escenario + '</p><p class="subtitulo"><b>¿Cómo está esta zona?</b></p><div class="opciones">' + ops + '</div><div id="fbp"></div>';
      }
      $('#panel').innerHTML = '<h3 data-p>' + z.nombre + '</h3>' + cuerpo;
      if (window.matchMedia('(max-width: 860px)').matches) $('#panel').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    ctx.on.nivel = function (t) {
      const z = zonaPorId(sel);
      if (!z || evaluadas[z.id]) return;
      if (t.dataset.n === z.nivel) {
        const ganados = (intentos[z.id] || 0) === 0 ? P.primera : P.reintento;
        run.score += ganados; run.ok++;
        evaluadas[z.id] = true;
        const b = app.querySelector('.zona[data-id="' + z.id + '"]');
        b.classList.add('evaluada', nivelPorId(z.nivel).clase);
        b.querySelector('.marca').innerHTML = z.nivel === 'bien' ? ICO.check : NIVEL_ICO[z.nivel];
        b.setAttribute('aria-label', 'Zona ' + z.nombre + ': ' + nivelPorId(z.nivel).texto);
        contador(); actualizarHUD(); sfx('ok');
        let extra = '';
        if (Object.keys(evaluadas).length === D.zonas.length) {
          terminado = true;
          extra = '<div class="fila-botones"><button type="button" class="btn" data-act="continuar">Continuar</button></div>';
          $('#escena').insertAdjacentHTML('beforeend', chispasHTML(18));
          sfx('fin');
        }
        $('#panel').innerHTML = '<h3>' + z.nombre + '</h3><p class="escenario">' + z.escenario + '</p>' +
          fb('ok', '¡Bien investigado! ' + nivelPorId(z.nivel).texto + '.', z.porque, ganados) +
          (extra || '<p class="subtitulo" style="margin-top:12px;text-align:center">Toca otra zona del mapa.</p>');
        if (extra) $('#panel .btn').focus();
      } else {
        intentos[z.id] = (intentos[z.id] || 0) + 1; run.err++;
        registrarError({ clave: z.id, titulo: z.nombre + ': ' + nivelPorId(z.nivel).texto, texto: z.porque });
        t.disabled = true; t.classList.add('incorrecta');
        $('#fbp').innerHTML = fb('mal', 'Mmm, revisa otra vez.', 'Fíjate en cuánta basura hay, si hay canecas cerca y si se están usando.');
        sfx('mal');
      }
    };
    ctx.on.continuar = function () { terminar(id); };
  }

  /* ---------- 3.2: plan de rescate ---------- */
  function actPlan() {
    const id = '3.2', P = D.puntos[id];
    const necesitan = D.zonas.filter(function (z) { return z.nivel !== 'bien'; });
    const orden = shuffle(D.medidas);
    const puntosMedida = {}, malas = {};
    let zona = null, marcadas = {}, evaluado = false, bonoDado = false, evaluaciones = 0;

    function recalcular() {
      let s = 0;
      Object.keys(puntosMedida).forEach(function (k) { s += puntosMedida[k]; });
      run.score = s + (bonoDado ? P.bonificacion : 0);
      run.ok = Object.keys(puntosMedida).length;
      run.err = Object.keys(malas).length;
    }
    function dibujar() {
      const chips = necesitan.map(function (z) {
        return '<button type="button" class="chip-zona" data-act="zonaPlan" data-id="' + z.id + '" aria-pressed="' + (zona && zona.id === z.id) + '">' + z.nombre + '</button>';
      }).join('');
      let plan = '';
      if (zona) {
        const medidas = orden.map(function (m) {
          let cl = marcadas[m.id] ? ' marcada' : '', aporte = '';
          if (evaluado) {
            if (marcadas[m.id] && m.ok) { cl = ' ok'; aporte = '<span class="aporte">' + m.aporte + '</span>'; }
            else if (marcadas[m.id] && !m.ok) { cl = ' mal'; aporte = '<span class="aporte">' + m.aporte + '</span>'; }
            else if (!marcadas[m.id] && m.ok) { cl = ' falto'; aporte = '<span class="aporte"><b>Te faltó pensar en esta:</b> ' + m.aporte + '</span>'; }
          }
          return '<label class="medida' + cl + '"><input type="checkbox" data-act="medida" data-id="' + m.id + '"' + (marcadas[m.id] ? ' checked' : '') + (evaluado ? ' disabled' : '') + '>' +
            '<span class="txt">' + m.texto + aporte + '</span></label>';
        }).join('');
        plan = '<div class="tarjeta" style="margin-top:14px"><h3 style="font-weight:900">Plan para: ' + zona.nombre + '</h3>' +
          '<p class="escenario">' + zona.escenario + '</p>' +
          '<p class="subtitulo"><b>Marca todas las medidas que ayudarían.</b> Puede haber varias correctas.</p>' +
          '<div class="medidas">' + medidas + '</div>' +
          '<div id="fb">' + (evaluado ? resumen() : '') + '</div>' +
          '<div class="fila-botones">' +
            (evaluado ?
              '<button type="button" class="btn suave" data-act="mejorar">Mejorar mi plan</button><button type="button" class="btn" data-act="continuar">Continuar</button>' :
              '<button type="button" class="btn azul" data-act="revisar"' + (Object.keys(marcadas).length ? '' : ' disabled') + ' id="btnRevisar">Revisar mi plan</button>') +
          '</div></div>';
      }
      montar(
        cabecera(id, 'Plan de rescate', 'Elige una zona que necesite ayuda y arma un plan con las medidas que sirven.') +
        '<div class="aviso-ejemplo" role="note">' + ICO.aviso + '<span>Recuerda: las zonas y casos son <b>ejemplos educativos</b>, no datos reales del colegio.</span></div>' +
        '<p class="subtitulo"><b>Zonas que necesitan ayuda</b></p><div class="chips-zonas">' + chips + '</div>' + plan,
        { scroll: !zona }
      );
    }
    function resumen() {
      const validas = Object.keys(marcadas).filter(function (k) { return D.medidas.filter(function (m) { return m.id === k; })[0].ok; }).length;
      const invalidas = Object.keys(marcadas).length - validas;
      if (invalidas === 0 && validas >= 3) {
        return fb('ok', '¡Plan coherente!', 'Elegiste medidas que se complementan: enseñar, señalizar, tener canecas y organizar al grupo.', run.score);
      }
      if (invalidas > 0) {
        return fb('mal', 'Casi, pero hay medidas que no ayudan.', 'Las que no ayudan no suman puntos. Si las quitas y dejas solo las que sirven, ganas la bonificación.');
      }
      return fb('info', 'Buen comienzo.', 'Tus medidas sirven, pero un plan fuerte combina por lo menos tres. Mira las que te faltaron.');
    }
    ctx.on.zonaPlan = function (t) {
      zona = D.zonas.filter(function (z) { return z.id === t.dataset.id; })[0];
      marcadas = {}; evaluado = false; sfx('clic'); dibujar();
    };
    ctx.on.medida = function (t) {
      if (t.checked) marcadas[t.dataset.id] = true; else delete marcadas[t.dataset.id];
      t.closest('.medida').classList.toggle('marcada', t.checked);
      $('#btnRevisar').disabled = !Object.keys(marcadas).length;
    };
    ctx.on.revisar = function () {
      if (evaluado || !Object.keys(marcadas).length) return;
      evaluado = true; evaluaciones++;
      const ids = Object.keys(marcadas);
      const buenas = ids.filter(function (k) { return D.medidas.filter(function (m) { return m.id === k; })[0].ok; });
      const malasAhora = ids.filter(function (k) { return !D.medidas.filter(function (m) { return m.id === k; })[0].ok; });
      const limpio = malasAhora.length === 0;
      buenas.forEach(function (k) {
        const v = limpio ? P.medidaLimpia : P.medidaConError;
        puntosMedida[k] = Math.max(puntosMedida[k] || 0, v);
      });
      malasAhora.forEach(function (k) { malas[k] = true; });
      if (limpio && buenas.length >= 3 && !bonoDado) bonoDado = true;
      recalcular();
      sfx(limpio ? 'ok' : 'mal'); actualizarHUD();
      dibujar();
      const b = app.querySelector('[data-act="continuar"]'); if (b) b.focus();
    };
    ctx.on.mejorar = function () { evaluado = false; sfx('clic'); dibujar(); };
    ctx.on.continuar = function () {
      D.medidas.forEach(function (m) {
        if (malas[m.id]) registrarError({ clave: m.id, titulo: m.texto, texto: m.aporte });
      });
      terminar(id);
    };
    dibujar();
  }

  /* ---------- 4.1: clasificación relámpago ---------- */
  function introRelampago() {
    montar(
      cabecera('4.1', 'Clasificación relámpago', 'Mucha rapidez, pero con cabeza.') +
      '<div class="tarjeta resultado"><h3 style="font-weight:900;font-size:1.4rem">Prepárate</h3>' +
      '<p class="subtitulo">Tienes <b>' + D.tiempoRelampago + ' segundos</b> para clasificar hasta <b>' + D.cantidadRelampago + ' residuos</b>. Cada acierto suma ' + D.puntos['4.1'].acierto + ' puntos. Si te equivocas, pasas al siguiente.</p>' +
      '<div class="fila-botones"><button type="button" class="btn grande azul" data-act="empezar">¡EMPEZAR!</button></div></div>'
    );
    ctx.on.empezar = function () { actRelampago(); };
  }
  function actRelampago() {
    const id = '4.1', P = D.puntos[id];
    const items = shuffle(D.pool4).slice(0, D.cantidadRelampago);
    const n = items.length;
    const total = D.tiempoRelampago * 1000;
    const fin = Date.now() + total;
    let i = 0, respondidas = 0, bloqueado = false, terminado = false;
    ctx.on = {};

    montar(
      cabecera(id, 'Clasificación relámpago', 'Elige la caneca antes de que se acabe el tiempo. Teclas 1, 2 y 3.') +
      '<div class="tiempo"><div class="num" id="seg" aria-hidden="true">' + D.tiempoRelampago + '</div>' +
        '<div style="flex:1">' + barraHTML(100, 'azul gruesa', 'Tiempo restante') + '</div></div>' +
      '<div class="paso-info"><span id="pos">Residuo 1 de ' + n + '</span><span id="aci">0 aciertos</span></div>' +
      '<div id="zonaItem"></div>' + binsHTML(),
      { scroll: true }
    );
    function mostrar() {
      const r = D.residuos[items[i]];
      $('#zonaItem').innerHTML = '<div class="residuo-caja" id="caja" style="min-height:210px">' +
        '<img class="residuo-img" style="height:120px" src="' + r.img + '" alt="' + r.alt + '"><div class="residuo-nombre">' + r.nombre + '</div></div>';
      $('#pos').textContent = 'Residuo ' + (i + 1) + ' de ' + n;
      $('#aci').textContent = run.ok + ' ' + plural(run.ok, 'acierto', 'aciertos');
      anunciar(r.nombre);
    }
    function elegir(c) {
      if (bloqueado || terminado) return;
      bloqueado = true; respondidas++;
      const r = D.residuos[items[i]];
      const caja = $('#caja');
      if (c === r.caneca) {
        run.score += P.acierto; run.ok++; caja.classList.add('acierto'); sfx('ok'); actualizarHUD();
      } else {
        run.err++; caja.classList.add('error'); sfx('mal');
        registrarError({ clave: items[i], img: r.img, alt: r.alt, titulo: r.nombre + ': va en la caneca ' + D.canecas[r.caneca].color.toLowerCase() + '.', texto: r.explicacion });
      }
      timeout(function () {
        if (terminado) return;
        i++;
        if (i >= n) { cerrar(); return; }
        bloqueado = false; mostrar();
      }, 550);
    }
    function cerrar() {
      if (terminado) return;
      terminado = true;
      run.extra.sinResponder = n - respondidas;
      terminar(id);
    }
    ctx.on.caneca = function (t) { elegir(t.dataset.caneca); };
    ctx.teclas = function (k) { const m = { '1': 'blanca', '2': 'negra', '3': 'verde' }; if (m[k]) elegir(m[k]); };
    const reloj = setInterval(function () {
      const resta = Math.max(0, fin - Date.now());
      const barra = $('.tiempo .barra > span');
      if (!barra) return;
      const seg = Math.ceil(resta / 1000);
      barra.style.width = (resta / total * 100) + '%';
      $('#seg').textContent = seg;
      $('#seg').classList.toggle('poco', seg <= 10);
      $('.tiempo .barra').setAttribute('aria-valuenow', Math.round(resta / total * 100));
      if (resta <= 0) { cerrar(); }
    }, 100);
    ctx.timers.push(reloj);
    mostrar();
  }

  /* ---------- 4.2: racha ecológica ---------- */
  function introRacha() {
    const bonos = D.puntos['4.2'].bonos;
    const lista = Object.keys(bonos).map(function (k) { return k + ' aciertos seguidos: +' + bonos[k]; }).join(' · ');
    montar(
      cabecera('4.2', 'Racha ecológica', 'Acierta varias seguidas para ganar bonificaciones.') +
      '<div class="tarjeta resultado"><h3 style="font-weight:900;font-size:1.4rem">Reglas de la racha</h3>' +
      '<p class="subtitulo">Son <b>' + D.cantidadRacha + ' residuos</b> uno tras otro. Cada acierto suma ' + D.puntos['4.2'].acierto + ' puntos. Bonificaciones: <b>' + lista + '</b>. Si fallas, la racha vuelve a cero, pero la partida sigue.</p>' +
      '<div class="fila-botones"><button type="button" class="btn grande azul" data-act="empezar">¡EMPEZAR!</button></div></div>'
    );
    ctx.on.empezar = function () { actRacha(); };
  }
  function actRacha() {
    const id = '4.2', P = D.puntos[id];
    const items = shuffle(D.pool4).slice(0, D.cantidadRacha);
    const n = items.length;
    let i = 0, racha = 0, mejor = 0, resuelto = false;
    const estados = [];
    ctx.on = {};

    function puntos() {
      return items.map(function (_, k) {
        const cl = estados[k] === true ? ' ok' : estados[k] === false ? ' mal' : '';
        return '<span class="racha-punto' + cl + (k === i ? ' actual' : '') + '"></span>';
      }).join('');
    }
    function dibujar() {
      resuelto = false;
      const r = D.residuos[items[i]];
      montar(
        cabecera(id, 'Racha ecológica', 'Mantén la racha. Puedes usar las teclas 1, 2 y 3.') +
        '<div class="racha-fila" role="img" aria-label="Residuo ' + (i + 1) + ' de ' + n + '">' + puntos() + '</div>' +
        '<div class="racha-info" id="racha">' + (racha >= 2 ? 'Racha actual: ' + racha : 'Racha actual: ' + racha) + '</div>' +
        '<div class="residuo-caja" id="caja"><img class="residuo-img" src="' + r.img + '" alt="' + r.alt + '"><div class="residuo-nombre">' + r.nombre + '</div><div class="pregunta">¿En qué caneca va?</div></div>' +
        binsHTML() + '<div id="fb"></div>' +
        '<div class="fila-botones" id="sig" hidden><button type="button" class="btn" data-act="siguiente">' + (i === n - 1 ? 'Ver resultado' : 'Siguiente residuo') + '</button></div>',
        { scroll: i === 0 }
      );
      if (i > 0) { $('#caja').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    }
    function elegir(c) {
      if (resuelto) return;
      resuelto = true;
      const r = D.residuos[items[i]];
      const caja = $('#caja');
      app.querySelectorAll('.bin').forEach(function (b) { b.disabled = true; });
      const marcada = app.querySelector('.bin[data-caneca="' + c + '"]');
      if (c === r.caneca) {
        racha++; mejor = Math.max(mejor, racha); estados[i] = true;
        run.score += P.acierto; run.ok++;
        let ganados = P.acierto, bono = P.bonos[racha] || 0;
        if (bono) { run.score += bono; }
        marcada.classList.add('correcta'); caja.classList.add('acierto');
        $('#fb').innerHTML = fb('ok', bono ? '¡Racha de ' + racha + '! Bonificación +' + bono : '¡Correcto!', r.explicacion, ganados + bono);
        sfx(bono ? 'insignia' : 'ok');
      } else {
        racha = 0; estados[i] = false; run.err++;
        marcada.classList.add('incorrecta'); caja.classList.add('error');
        app.querySelector('.bin[data-caneca="' + r.caneca + '"]').classList.add('correcta');
        $('#fb').innerHTML = fb('mal', 'Esta vez no. La racha vuelve a cero.', 'Va en la caneca ' + D.canecas[r.caneca].color.toLowerCase() + '. ' + r.explicacion);
        registrarError({ clave: items[i], img: r.img, alt: r.alt, titulo: r.nombre + ': va en la caneca ' + D.canecas[r.caneca].color.toLowerCase() + '.', texto: r.explicacion });
        sfx('mal');
      }
      $('#racha').textContent = 'Racha actual: ' + racha;
      app.querySelector('.racha-fila').innerHTML = puntos();
      actualizarHUD();
      $('#sig').hidden = false; $('#sig .btn').focus();
    }
    ctx.on.caneca = function (t) { elegir(t.dataset.caneca); };
    ctx.teclas = function (k) { const m = { '1': 'blanca', '2': 'negra', '3': 'verde' }; if (m[k]) elegir(m[k]); };
    ctx.on.siguiente = function () {
      i++;
      if (i >= n) { run.extra.maxRacha = mejor; terminar(id); } else dibujar();
    };
    dibujar();
  }

  /* ==========================================================================
     ACCIONES GLOBALES Y EVENTOS
     ========================================================================== */
  const G = {
    comenzar: function () { sfx('clic'); irMenu(); },
    musica: function () { toggleMusica(); },
    menu: function () { irMenu(); },
    verFinal: function () { irFinal(); },
    sub: function (t) { sfx('clic'); iniciarSub(t.dataset.id); },
    repetir: function (t) { iniciarSub(t.dataset.id); },
    reiniciarReto: function () { if (run) iniciarSub(run.id); },
    reiniciarMision: function (t) {
      // Doble pulsación para confirmar, sin ventanas del navegador
      if (t.dataset.seguro !== '1') {
        t.dataset.seguro = '1'; t.textContent = '¿Seguro? Pulsa otra vez';
        setTimeout(function () { if (t.isConnected) { t.dataset.seguro = ''; t.textContent = 'Reiniciar misión'; } }, 3500);
        return;
      }
      const m = D.misiones[parseInt(t.dataset.id, 10) - 1];
      m.subs.forEach(function (s) {
        S.scores[s.id] = 0; S.ok[s.id] = 0; S.err[s.id] = 0; S.done[s.id] = false;
        if (BADGE_DE[s.id]) S.badges[BADGE_DE[s.id]] = false;
        if (s.id === '4.2') { S.badges.racha = false; S.maxRacha = 0; }
      });
      S.badges.guardian = false;
      guardar(); irMenu();
      anunciar('Misión reiniciada.');
    },
    jugarDeNuevo: function () { S = nuevoEstado(); guardar(); ultimoTotal = 0; irMenu(); }
  };

  app.addEventListener('click', function (e) {
    const t = e.target.closest('[data-act]');
    if (!t || !app.contains(t)) return;
    if (t.disabled || t.getAttribute('aria-disabled') === 'true') return;
    const fn = (ctx.on && ctx.on[t.dataset.act]) || G[t.dataset.act];
    if (fn) fn(t, e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('#modal').hidden) { siguienteInsignia(); return; }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
    if (ctx.teclas && $('#modal').hidden) ctx.teclas(e.key);
  });

  $('#btnMenu').addEventListener('click', function () { sfx('clic'); irMenu(); });
  $('#btnAudioAbrir').addEventListener('click', function (e) {
    const dock = $('#audioDock');
    const abierto = dock.classList.toggle('abierto');
    e.currentTarget.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    e.currentTarget.setAttribute('aria-label', abierto ? 'Ocultar los controles de audio' : 'Mostrar los controles de audio');
  });
  $('#btnMusica').addEventListener('click', toggleMusica);
  $('#btnSilencio').addEventListener('click', function () {
    silenciada = !silenciada;
    if (musica) musica.muted = silenciada;
    syncAudioUI();
  });
  $('#btnEfectos').addEventListener('click', function () { efectosOn = !efectosOn; syncAudioUI(); if (efectosOn) sfx('clic'); });
  $('#volumen').value = Math.round(volumen * 100);
  $('#volumen').addEventListener('input', function (e) {
    volumen = e.target.value / 100;
    if (musica) musica.volume = volumen;
  });

  syncAudioUI();
  irBienvenida();
})();
