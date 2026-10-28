/* Botón flotante «¿Necesitas ayuda?» → Pablo, el asistente de EmprendeX, en modo instalación.
   Habla con la plataforma (POST /api/asistente/publico) con la misma clave del enlace (#k=...).
   Sin clave no manda nada: solo explica cómo abrir la página con el enlace completo. */
(function () {
  'use strict';
  var API = 'https://www.emprendexpro.com/api/asistente/publico';
  var MAX_CAPTURAS = 3, LADO_MAX = 1568, TURNOS = 10;

  function clave() {
    var m = (location.hash || '').match(/k=([A-Za-z0-9_-]+)/);
    try {
      if (m) { localStorage.setItem('emx-bienvenida-k', m[1]); return m[1]; }
      return localStorage.getItem('emx-bienvenida-k') || '';
    } catch (e) { return m ? m[1] : ''; }
  }

  var css = '' +
    '.ayu-btn{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:60;display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 18px 0 14px;border:0;border-radius:999px;background:#A3E635;color:#1A2605;font-family:"Outfit","Segoe UI",Arial,sans-serif;font-weight:800;font-size:1rem;box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 0 rgba(163,230,53,.5);cursor:pointer;animation:ayu-late 2.4s ease-out 1.2s 2}' +
    '@keyframes ayu-late{0%{box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 0 rgba(163,230,53,.55)}70%{box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 16px rgba(163,230,53,0)}100%{box-shadow:0 12px 30px rgba(0,0,0,.45),0 0 0 0 rgba(163,230,53,0)}}' +
    '.ayu-btn i{width:30px;height:30px;border-radius:50%;background:#1A2605;display:grid;place-items:center;font-style:normal;color:#A3E635;font-family:"Outfit",sans-serif;font-weight:900}' +
    '.ayu-btn.abierto{display:none}' +
    '.ayu-panel{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:61;width:min(400px,calc(100vw - 24px));height:min(640px,calc(100vh - 24px - env(safe-area-inset-bottom,0px)));display:none;flex-direction:column;background:#0C0C0E;color:#F6F4F0;border:1.5px solid #2E2E33;border-radius:22px;box-shadow:0 24px 60px rgba(0,0,0,.6);overflow:hidden;font-family:"Space Grotesk","Helvetica Neue",Arial,sans-serif}' +
    '.ayu-panel.abierto{display:flex}' +
    '.ayu-cab{display:flex;align-items:center;gap:12px;padding:14px 14px 12px;border-bottom:1px solid #1F1F23;background:#141416}' +
    '.ayu-cab .av{width:40px;height:40px;border-radius:12px;background:#A3E635;color:#1A2605;display:grid;place-items:center;font-family:"Outfit",sans-serif;font-weight:900;font-size:1.2rem;flex:none}' +
    '.ayu-cab b{display:block;font-family:"Outfit",sans-serif;font-weight:800;font-size:1.02rem;line-height:1.1}' +
    '.ayu-cab small{display:block;color:#A9A49C;font-size:.8rem;margin-top:2px}' +
    '.ayu-cab button{margin-left:auto;width:36px;height:36px;border-radius:10px;border:1px solid #2E2E33;background:transparent;color:#A9A49C;font-size:1.2rem;cursor:pointer}' +
    '.ayu-hilo{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}' +
    '.ayu-m{max-width:88%;padding:10px 13px;border-radius:16px;font-size:.95rem;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}' +
    '.ayu-m.pablo{align-self:flex-start;background:#1D1D20;border-bottom-left-radius:6px}' +
    '.ayu-m.yo{align-self:flex-end;background:#A3E635;color:#1A2605;border-bottom-right-radius:6px}' +
    '.ayu-m.error{align-self:stretch;background:rgba(255,93,78,.1);border:1px solid rgba(255,93,78,.5);color:#FFC9C3;font-size:.9rem}' +
    '.ayu-m img{display:block;max-width:160px;max-height:160px;border-radius:10px;margin-top:6px;border:1px solid rgba(0,0,0,.2)}' +
    '.ayu-m.pablo .ayu-pensando{display:inline-flex;gap:5px;align-items:center;height:18px}' +
    '.ayu-pensando i{width:7px;height:7px;border-radius:50%;background:#A9A49C;animation:ayu-p 1s infinite}' +
    '.ayu-pensando i:nth-child(2){animation-delay:.2s}.ayu-pensando i:nth-child(3){animation-delay:.4s}' +
    '@keyframes ayu-p{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}' +
    '.ayu-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}' +
    '.ayu-chips button{border:1px solid #2E2E33;background:#141416;color:#F6F4F0;border-radius:999px;padding:7px 11px;font-size:.84rem;cursor:pointer}' +
    '.ayu-pie{border-top:1px solid #1F1F23;background:#141416;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));display:grid;gap:8px}' +
    '.ayu-fotos{display:flex;gap:6px;flex-wrap:wrap}' +
    '.ayu-fotos div{position:relative}' +
    '.ayu-fotos img{width:52px;height:52px;object-fit:cover;border-radius:8px;border:1px solid #2E2E33;display:block}' +
    '.ayu-fotos button{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;border:0;background:#FF5D4E;color:#fff;font-size:.75rem;line-height:1;cursor:pointer}' +
    '.ayu-fila{display:flex;gap:8px;align-items:flex-end}' +
    '.ayu-fila textarea{flex:1;min-height:44px;max-height:120px;resize:none;padding:11px 12px;border-radius:12px;border:1.5px solid #2E2E33;background:#0C0C0E;color:#F6F4F0;font:inherit;font-size:16px;line-height:1.35}' +
    '.ayu-fila textarea:focus{outline:none;border-color:#A3E635}' +
    '.ayu-fila label,.ayu-fila .env{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;cursor:pointer;flex:none;border:1.5px solid #2E2E33;background:transparent;color:#A9A49C}' +
    '.ayu-fila .env{background:#A3E635;border-color:#A3E635;color:#1A2605;font-family:"Outfit",sans-serif;font-weight:900}' +
    '.ayu-fila .env[disabled]{opacity:.45;cursor:default}' +
    '.ayu-fila input[type=file]{display:none}' +
    '.ayu-nota{font-size:.74rem;color:#77726B;text-align:center}' +
    '@media (max-width:480px){.ayu-panel{right:0;bottom:0;width:100vw;height:100%;height:100dvh;border-radius:0;border:0}}' +
    '@media (prefers-reduced-motion:reduce){.ayu-btn{animation:none}.ayu-pensando i{animation:none}}';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var hilo = [];           // [{rol:'usuario'|'pablo', texto}]
  var fotos = [];          // [{mime, base64, url}]
  var ocupado = false;

  var style = el('style'); style.textContent = css; document.head.appendChild(style);
  var btn = el('button', 'ayu-btn', '<i>P</i>¿Necesitas ayuda?'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
  var panel = el('div', 'ayu-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Ayuda de Pablo');
  panel.innerHTML =
    '<div class="ayu-cab"><span class="av">P</span><div><b>Pablo · asistente de EmprendeX</b><small>Te ayudo a conectar WhatsApp. Gratis, no gasta créditos.</small></div><button type="button" aria-label="Cerrar">×</button></div>' +
    '<div class="ayu-hilo" aria-live="polite"></div>' +
    '<div class="ayu-chips"><button type="button">No me llega el código</button><button type="button">Dice que no cumple los requisitos</button><button type="button">Cerré la ventana y sigue sin conectar</button><button type="button">¿Qué tarjeta pongo en Meta?</button></div>' +
    '<div class="ayu-pie"><div class="ayu-fotos"></div><div class="ayu-fila"><label title="Adjuntar la captura del aviso" aria-label="Adjuntar captura"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3.5"/><path d="M8 5l1.2-2h5.6L16 5"/></svg><input type="file" accept="image/*" multiple></label><textarea rows="1" placeholder="Escribe aquí o manda la captura del aviso…" aria-label="Tu pregunta"></textarea><button type="button" class="env" aria-label="Enviar">➤</button></div><p class="ayu-nota">Pablo responde con el manual de instalación de EmprendeX. Si no resuelve, pregunta en el grupo VIP.</p></div>';
  document.body.appendChild(btn); document.body.appendChild(panel);

  var $hilo = panel.querySelector('.ayu-hilo'), $fotos = panel.querySelector('.ayu-fotos'), $txt = panel.querySelector('textarea'),
      $env = panel.querySelector('.env'), $file = panel.querySelector('input[type=file]'), $chips = panel.querySelector('.ayu-chips');

  function burbuja(rol, texto, imgs) {
    var m = el('div', 'ayu-m ' + rol); m.textContent = texto || '';
    (imgs || []).forEach(function (f) { var im = el('img'); im.src = f.url; im.alt = 'Captura adjunta'; m.appendChild(im); });
    $hilo.appendChild(m); $hilo.scrollTop = $hilo.scrollHeight; return m;
  }
  function errorB(t) { var m = el('div', 'ayu-m error'); m.textContent = t; $hilo.appendChild(m); $hilo.scrollTop = $hilo.scrollHeight; }

  function abre() {
    panel.classList.add('abierto'); btn.classList.add('abierto');
    if (!$hilo.children.length) {
      if (!clave()) {
        burbuja('pablo', 'Hola 👋 Para ayudarte necesito que abras esta página con el enlace completo que te mandó Samantha (el que termina en #k=…). Con ese enlace me activo.');
      } else {
        burbuja('pablo', 'Hola, soy Pablo 👋 Cuéntame qué te sale al conectar tu WhatsApp, o mándame la captura del aviso y te digo qué hacer.');
      }
    }
    setTimeout(function () { $txt.focus(); }, 50);
  }
  function cierra() { panel.classList.remove('abierto'); btn.classList.remove('abierto'); btn.focus(); }
  btn.addEventListener('click', abre);
  panel.querySelector('.ayu-cab button').addEventListener('click', cierra);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('abierto')) cierra(); });

  $chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; $txt.value = b.textContent; envia(); });

  /* capturas: se reducen en el teléfono antes de salir (lado mayor 1568 px, JPEG) */
  function reduce(file) {
    return new Promise(function (ok, mal) {
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        var esc = Math.min(1, LADO_MAX / Math.max(im.width, im.height)), w = Math.round(im.width * esc), h = Math.round(im.height * esc);
        var c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h);
        var data = c.toDataURL('image/jpeg', 0.85); URL.revokeObjectURL(url);
        ok({ mime: 'image/jpeg', base64: data.split(',')[1], url: data });
      };
      im.onerror = function () { URL.revokeObjectURL(url); mal(new Error('no se pudo leer la imagen')); };
      im.src = url;
    });
  }
  function pintaFotos() {
    $fotos.innerHTML = '';
    fotos.forEach(function (f, i) {
      var d = el('div'); var im = el('img'); im.src = f.url; im.alt = 'Captura ' + (i + 1); var x = el('button', null, '×'); x.type = 'button'; x.setAttribute('aria-label', 'Quitar captura');
      x.addEventListener('click', function () { fotos.splice(i, 1); pintaFotos(); });
      d.appendChild(im); d.appendChild(x); $fotos.appendChild(d);
    });
  }
  $file.addEventListener('change', function () {
    var lista = Array.prototype.slice.call($file.files || []); $file.value = '';
    lista.forEach(function (f) {
      if (fotos.length >= MAX_CAPTURAS) { errorB('Máximo ' + MAX_CAPTURAS + ' capturas por mensaje.'); return; }
      reduce(f).then(function (r) { if (fotos.length < MAX_CAPTURAS) { fotos.push(r); pintaFotos(); } }).catch(function () { errorB('Esa imagen no se pudo leer. Prueba con una captura de pantalla.'); });
    });
  });

  $txt.addEventListener('input', function () { $txt.style.height = 'auto'; $txt.style.height = Math.min(120, $txt.scrollHeight) + 'px'; });
  $txt.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envia(); } });
  $env.addEventListener('click', envia);

  function envia() {
    if (ocupado) return;
    var pregunta = $txt.value.trim();
    if (!pregunta && !fotos.length) return;
    if (!pregunta) pregunta = 'Me sale esto al conectar WhatsApp. ¿Qué hago?';
    var k = clave();
    if (!k) { errorB('Abre esta página con tu enlace completo (el que termina en #k=…) para que pueda responderte.'); return; }
    var adj = fotos.slice(); fotos = []; pintaFotos();
    burbuja('yo', pregunta, adj);
    $txt.value = ''; $txt.style.height = 'auto';
    var previos = hilo.slice(-TURNOS);
    hilo.push({ rol: 'usuario', texto: pregunta });
    ocupado = true; $env.disabled = true;
    var pensando = burbuja('pablo', ''); pensando.innerHTML = '<span class="ayu-pensando"><i></i><i></i><i></i></span>';
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var reloj = ctrl && setTimeout(function () { ctrl.abort(); }, 90000);
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Clave-Alumnos': k },
      body: JSON.stringify({ pregunta: pregunta, capturas: adj.map(function (f) { return { mime: f.mime, base64: f.base64 }; }), conversacion: previos }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; });
    }).then(function (res) {
      pensando.remove();
      if (res.ok && res.j && res.j.respuesta) { burbuja('pablo', res.j.respuesta); hilo.push({ rol: 'pablo', texto: res.j.respuesta }); }
      else {
        hilo.pop();
        var t = (res.j && res.j.error) || (res.status === 401 ? 'Tu enlace no es válido. Pídele a Samantha el enlace completo de la bienvenida.' : res.status === 429 ? 'Llegaste al tope de preguntas de hoy. Mañana Pablo te sigue atendiendo; mientras, pregunta en el grupo VIP.' : 'Pablo no pudo responder ahora. Inténtalo en un momento o pregunta en el grupo VIP.');
        errorB(t);
      }
    }).catch(function () {
      pensando.remove(); hilo.pop();
      errorB('No hubo conexión con la plataforma. Revisa tu internet e inténtalo otra vez.');
    }).then(function () { if (reloj) clearTimeout(reloj); ocupado = false; $env.disabled = false; });
  }
})();
