// Funcionalidad del menú hamburguesa
const hamburger = document.getElementById('hamburger');
const navbarMenu = document.getElementById('navbarMenu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navbarMenu.classList.toggle('active');
});

// Cerrar menú al hacer click en un enlace
document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navbarMenu.classList.remove('active');
    });
});
/* =====================================================
   DESKFOX · cola de zorro como cursor + zorrito mascota
   - El cursor es la cola de la zorra (la punta blanca señala)
   - Un zorrito tierno camina por la parte de abajo de la pantalla
   - Al hacer clic en algo, corre hasta ahí, se pone gorro de chef
     y anota tu pedido en una libretita
   - Si dejas el cursor quieto (10s) o no pides nada (20s),
     se echa a dormir y le salen las Zzz. Al mover el cursor
     se despierta y vuelve a caminar.
   ===================================================== */
(function () {
    'use strict';
    if (window.__deskfoxPet) return;
    window.__deskfoxPet = true;

    /* ---------- Configuración ---------- */
    var W = 340;                      // ancho del zorrito (px)
    var WALK_SPEED = 38;              // px/seg caminando
    var RUN_SPEED = 380;              // px/seg corriendo al pedido
    var CHEF_TIME = 3200;             // ms que dura anotando
    var BUBBLE_FONT = 34;             // tamaño del texto del globo (px)

    /* --- tiempos de sueño (edítalos a gusto) --- */
    var SLEEP_STILL = 10000;          // 10s sin mover el cursor -> se duerme
    var SLEEP_NO_ORDER = 20000;       // 20s sin elegir un producto -> se duerme
    var STILL_BEFORE_NAP = 2500;      // debe estar quieto 2.5s antes de la siesta

    var HOT = 'a, button, .btn, .menu-item, .specialty-card, .specialty-detail-card, ' +
              '.stat-card, .reserva-feature, .contact-item, .social-link, .navbar-btn';
    var TEXT_FIELDS = 'input, textarea, select, [contenteditable="true"]';

    var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- SVG ---------- */
    var TAIL_SVG =
        '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M4 4C14 4 32 8 41 24C47 35 40 46 29 44C15 41 6 22 4 4Z" fill="#ff8c42" stroke="#5b3a22" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M4 4C10 4 16 5 21 8C15 12 10 17 8 24C5.5 18 4.3 11 4 4Z" fill="#fff1dc" stroke="#5b3a22" stroke-width="1.5" stroke-linejoin="round"/>' +
        '</svg>';

    /* Zorrito tierno de frente (estilo chibi) */
    var FOX_SVG =
        '<svg viewBox="0 -22 140 138" xmlns="http://www.w3.org/2000/svg">' +

        '<ellipse class="fx-shadow" cx="58" cy="110" rx="46" ry="4.8" fill="#2a1a10" opacity=".16"/>' +

        /* Zzz */
        '<g class="fx-zzz" fill="#fff" stroke="#5b3a22" stroke-width="1.6" paint-order="stroke"' +
        ' font-family="Poppins, Segoe UI, sans-serif" font-weight="700">' +
        '<text class="fx-z1" x="106" y="2" font-size="10">z</text>' +
        '<text class="fx-z2" x="114" y="-9" font-size="12">z</text>' +
        '<text class="fx-z3" x="122" y="-20" font-size="14">Z</text>' +
        '</g>' +

        '<g class="fx-all"><g class="fx-breath">' +

        /* cola esponjada */
        '<g class="fx-tail">' +
        '<path d="M30 88C17 98.5 3 88 6 70C9 55.5 22 50.5 30 58.5C37.5 66.5 34.5 80 32 88Z" fill="#f2822d" stroke="#5b3a22" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M6 70C9 55.5 22 50.5 30 58.5C21 62 14 70 12 82C8.5 79 6 75 6 70Z" fill="#fff1dc" stroke="#5b3a22" stroke-width="2" stroke-linejoin="round"/>' +
        '</g>' +

        /* patitas de atras (lado lejano, mas oscuras) */
        '<g class="fx-leg fx-leg-a"><rect x="30" y="84" width="11" height="22" rx="5.5" fill="#d9691f" stroke="#5b3a22" stroke-width="2.2"/>' +
        '<ellipse cx="35.5" cy="104" rx="6.6" ry="4.2" fill="#f0dcc0" stroke="#5b3a22" stroke-width="2.2"/></g>' +
        '<g class="fx-leg fx-leg-b"><rect x="64" y="84" width="11" height="22" rx="5.5" fill="#d9691f" stroke="#5b3a22" stroke-width="2.2"/>' +
        '<ellipse cx="69.5" cy="104" rx="6.6" ry="4.2" fill="#f0dcc0" stroke="#5b3a22" stroke-width="2.2"/></g>' +

        /* cuerpito */
        '<path d="M18 76C18 62 32 55 55 55C78 55 92 62 92 76C92 92 78 99.5 55 99.5C32 99.5 18 92 18 76Z" fill="#ff8c42" stroke="#5b3a22" stroke-width="2.4"/>' +
        '<path d="M25 85C33 96 77 96 85 85C83 95 71 99.5 55 99.5C39 99.5 27 95 25 85Z" fill="#fff1dc"/>' +

        /* patitas de adelante (lado cercano) */
        '<g class="fx-leg fx-leg-b"><rect x="42" y="86" width="11" height="22" rx="5.5" fill="#ff8c42" stroke="#5b3a22" stroke-width="2.2"/>' +
        '<ellipse cx="47.5" cy="106" rx="6.6" ry="4.2" fill="#fff1dc" stroke="#5b3a22" stroke-width="2.2"/></g>' +
        '<g class="fx-leg fx-leg-a"><rect x="76" y="86" width="11" height="22" rx="5.5" fill="#ff8c42" stroke="#5b3a22" stroke-width="2.2"/>' +
        '<ellipse cx="81.5" cy="106" rx="6.6" ry="4.2" fill="#fff1dc" stroke="#5b3a22" stroke-width="2.2"/></g>' +

        /* cabecita de frente (misma cara de siempre) */
        '<g class="fx-head" transform="translate(35 -2)">' +
        '<path d="M27 5.5L63 23L41 35Z" fill="#f2822d" stroke="#5b3a22" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M28 6L41 13L35.5 18.5Z" fill="#c9571d"/>' +
        '<path d="M34.5 13.5L55 23.5L43 29.5Z" fill="#ffe6c7"/>' +
        '<path d="M93 5.5L57 23L79 35Z" fill="#f2822d" stroke="#5b3a22" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M92 6L79 13L84.5 18.5Z" fill="#c9571d"/>' +
        '<path d="M85.5 13.5L65 23.5L77 29.5Z" fill="#ffe6c7"/>' +
        '<circle cx="60" cy="44" r="28" fill="#ff8c42" stroke="#5b3a22" stroke-width="2.4"/>' +
        '<path d="M36 44C30 48.5 22.5 52 16 53.5C24 58 30 60.5 36 61.5C42 68.5 51.5 72 60 72C68.5 72 78 68.5 84 61.5C90 60.5 96 58 104 53.5C97.5 52 90 48.5 84 44C79.5 40 70 38 60 38C50 38 40.5 40 36 44Z" fill="#fff1dc"/>' +
        '<ellipse cx="37" cy="52" rx="5.2" ry="3.2" fill="#ff6f52" opacity=".3"/>' +
        '<ellipse cx="83" cy="52" rx="5.2" ry="3.2" fill="#ff6f52" opacity=".3"/>' +
        '<path class="fx-brow" d="M41 28C44 24.5 49.5 24 53 26.5" fill="none" stroke="#5b3a22" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>' +
        '<path class="fx-brow" d="M79 28C76 24.5 70.5 24 67 26.5" fill="none" stroke="#5b3a22" stroke-width="1.8" stroke-linecap="round" opacity=".75"/>' +
        '<g class="fx-eye-open">' +
        '<ellipse cx="47" cy="38.5" rx="6.6" ry="7.6" fill="#3a2214"/>' +
        '<circle cx="49.4" cy="35.2" r="2.2" fill="#fff"/><circle cx="44.9" cy="41.6" r="1.1" fill="#fff" opacity=".8"/>' +
        '<ellipse cx="73" cy="38.5" rx="6.6" ry="7.6" fill="#3a2214"/>' +
        '<circle cx="75.4" cy="35.2" r="2.2" fill="#fff"/><circle cx="70.9" cy="41.6" r="1.1" fill="#fff" opacity=".8"/>' +
        '</g>' +
        '<g class="fx-eye-shut">' +
        '<path d="M40.5 37.5C43.2 42.5 50.8 42.5 53.5 37.5" fill="none" stroke="#3a2214" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M66.5 37.5C69.2 42.5 76.8 42.5 79.5 37.5" fill="none" stroke="#3a2214" stroke-width="2.4" stroke-linecap="round"/>' +
        '</g>' +
        '<path d="M55.4 47.4C55.4 45.6 64.6 45.6 64.6 47.4C64.6 50.6 61.9 53.2 60 53.2C58.1 53.2 55.4 50.6 55.4 47.4Z" fill="#4a2c17"/>' +
        '<path d="M60 53.6C60 57.2 56.4 58.8 53.8 57M60 53.6C60 57.2 63.6 58.8 66.2 57" fill="none" stroke="#4a2c17" stroke-width="1.7" stroke-linecap="round"/>' +
        '</g>' +

        /* accesorios de chef (mismo dibujo, solo reubicado) */
        '<g class="fx-chef">' +
        '<g class="fx-hat" transform="translate(95 19) scale(1.75) translate(-69 -19.5)">' +
        '<circle cx="63" cy="9" r="5" fill="#fff"/><circle cx="69" cy="6.5" r="6" fill="#fff"/><circle cx="75" cy="9" r="5" fill="#fff"/>' +
        '<rect x="60" y="11" width="19" height="6.5" rx="1.5" fill="#fff" stroke="#d9d9d9" stroke-width=".8"/></g>' +
        '<g transform="translate(106 88) scale(1.7) translate(-75 -47)"><g class="fx-book">' +
        '<rect x="68" y="41" width="13" height="16" rx="1.5" fill="#fff" stroke="#5d4037" stroke-width="1.2"/>' +
        '<path d="M71 46H78M71 49.5H78M71 53H76" stroke="#bbb" stroke-width=".8"/>' +
        '<rect x="68" y="41" width="3" height="16" rx="1" fill="#5d4037"/>' +
        '<g class="fx-pencil"><path d="M76 43L82 37" stroke="#f4c542" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M75.5 43.5L76 43" stroke="#2a1a10" stroke-width="2" stroke-linecap="round"/></g></g></g>' +
        '</g>' +

        '</g></g>' +
        '</svg>';

    /* ---------- Estilos ---------- */
    var css =
        /* cursor */
        'html.fx-cursor, html.fx-cursor * { cursor: none !important; }' +
        'html.fx-cursor input, html.fx-cursor textarea, html.fx-cursor select,' +
        'html.fx-cursor [contenteditable="true"] { cursor: text !important; }' +
        '#fx-tail { position: fixed; left: 0; top: 0; width: 44px; height: 44px; z-index: 2147483000;' +
        '  pointer-events: none; opacity: 0; transform-origin: 4px 4px; will-change: transform;' +
        '  filter: drop-shadow(0 3px 6px rgba(0,0,0,.5)); transition: opacity .2s ease; }' +
        '#fx-tail.on { opacity: 1; }' +
        '#fx-tail svg { width: 100%; height: 100%; display: block; }' +

        /* mascota */
        '#fx-pet { position: fixed; left: 0; bottom: 2px; width: ' + W + 'px; z-index: 1500;' +
        '  pointer-events: none; will-change: transform; }' +
        '#fx-flip { width: 100%; transform-origin: 50% 50%; }' +
        '#fx-flip.left { transform: scaleX(-1); }' +
        '#fx-flip svg { width: 100%; display: block; overflow: visible;' +
        '  filter: drop-shadow(0 4px 6px rgba(0,0,0,.4)); }' +

        '.fx-leg { transform-box: fill-box; transform-origin: 50% 0; transition: opacity .3s ease; }' +
        '.fx-tail { transform-box: fill-box; transform-origin: 90% 78%;' +
        '  animation: fx-wag 1.8s ease-in-out infinite alternate; }' +
        '.fx-head { transform-box: fill-box; transform-origin: 50% 100%;' +
        '  transition: transform .5s cubic-bezier(.34,1.25,.64,1); }' +
        '.fx-all { transition: transform .5s cubic-bezier(.34,1.25,.64,1); }' +
        '.fx-breath { transform-box: fill-box; transform-origin: 50% 100%; }' +

        '.fx-chef { display: none; }' +
        '#fx-pet.is-chef .fx-chef { display: inline; }' +
        '#fx-pet.is-chef .fx-hat { animation: fx-pop .35s cubic-bezier(.34,1.56,.64,1) both; transform-box: fill-box; transform-origin: 50% 100%; }' +
        '#fx-pet.is-chef .fx-book { animation: fx-pop .35s .1s cubic-bezier(.34,1.56,.64,1) both; transform-box: fill-box; transform-origin: 0 100%; }' +
        '#fx-pet.is-chef .fx-pencil { animation: fx-write .28s ease-in-out infinite alternate; }' +

        /* caminar: pasitos + contoneo */
        '#fx-pet.is-walk .fx-leg-a { animation: fx-step .7s ease-in-out infinite alternate; }' +
        '#fx-pet.is-walk .fx-leg-b { animation: fx-step .7s ease-in-out infinite alternate-reverse; }' +
        '#fx-pet.is-run  .fx-leg-a { animation: fx-step .2s ease-in-out infinite alternate; }' +
        '#fx-pet.is-run  .fx-leg-b { animation: fx-step .2s ease-in-out infinite alternate-reverse; }' +
        '#fx-pet.is-walk .fx-breath { animation: fx-bob .35s ease-in-out infinite alternate; }' +
        '#fx-pet.is-run  .fx-breath { animation: fx-bob .16s ease-in-out infinite alternate; }' +
        '#fx-pet.is-run .fx-tail { animation-duration: .3s; }' +

        /* dormido */
        '.fx-eye-shut, .fx-zzz { display: none; }' +
        '#fx-pet.is-sleep .fx-eye-open, #fx-pet.is-sleep .fx-brow { display: none; }' +
        '#fx-pet.is-sleep .fx-eye-shut { display: block; }' +
        '#fx-pet.is-sleep .fx-zzz { display: block; }' +
        '#fx-pet.is-sleep .fx-leg { opacity: 0; animation: none !important; }' +
        '#fx-pet.is-sleep .fx-all { transform: translateY(8px); }' +
        '#fx-pet.is-sleep .fx-head { transform: rotate(-7deg) translateY(3px); }' +
        '#fx-pet.is-sleep .fx-breath { animation: fx-breath 3.6s ease-in-out infinite alternate; }' +
        '#fx-pet.is-sleep .fx-tail { animation-duration: 3.8s; }' +
        '#fx-pet.is-sleep .fx-shadow { transform-box: fill-box; transform-origin: 50% 50%; transform: scaleX(1.08); }' +
        '#fx-pet.is-sleep .fx-z1 { animation: fx-zzz 3s linear infinite; }' +
        '#fx-pet.is-sleep .fx-z2 { animation: fx-zzz 3s linear 1s infinite; }' +
        '#fx-pet.is-sleep .fx-z3 { animation: fx-zzz 3s linear 2s infinite; }' +
        '.fx-zzz text { transform-box: fill-box; transform-origin: 50% 100%; }' +

        '@keyframes fx-step { from { transform: rotate(-24deg); } to { transform: rotate(24deg); } }' +
        '@keyframes fx-bob { from { transform: translateY(0); } to { transform: translateY(-1.8px); } }' +
        '@keyframes fx-wag { from { transform: rotate(-7deg); } to { transform: rotate(8deg); } }' +
        '@keyframes fx-pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }' +
        '@keyframes fx-write { from { transform: translate(-1.5px, 1px); } to { transform: translate(1.5px, -1px); } }' +
        '@keyframes fx-breath { from { transform: scaleY(1) scaleX(1); } to { transform: scaleY(1.04) scaleX(1.012); } }' +
        '@keyframes fx-zzz {' +
        '  0%   { opacity: 0; transform: translate(0, 5px) scale(.6); }' +
        '  20%  { opacity: 1; transform: translate(1px, 1px) scale(1); }' +
        '  75%  { opacity: .9; }' +
        '  100% { opacity: 0; transform: translate(7px, -12px) scale(1.15); } }' +

        /* globo de texto */
        '#fx-bubble { position: absolute; left: 50%; bottom: 100%; margin-bottom: 8px;' +
        '  transform: translateX(-50%); min-width: ' + (BUBBLE_FONT * 9) + 'px; max-width: ' + (BUBBLE_FONT * 18) + 'px;' +
        '  padding: ' + Math.round(BUBBLE_FONT * 0.65) + 'px ' + Math.round(BUBBLE_FONT * 0.95) + 'px;' +
        '  background: #fff; color: #3d2817; border: 2px solid #ff8c42; border-radius: 14px;' +
        '  font: 700 ' + BUBBLE_FONT + 'px/1.3 "Poppins","Segoe UI",sans-serif; text-align: center;' +
        '  box-shadow: 0 8px 24px rgba(0,0,0,.5); opacity: 0; visibility: hidden;' +
        '  transition: opacity .25s ease, visibility .25s ease; white-space: nowrap; }' +
        '#fx-bubble.show { opacity: 1; visibility: visible; }' +
        '#fx-bubble small { display: block; color: #e67e22; font-weight: 600; font-size: ' + Math.round(BUBBLE_FONT * 0.8) + 'px;' +
        '  letter-spacing: 1px; text-transform: uppercase; }' +
        '#fx-bubble span { display: block; overflow: hidden; text-overflow: ellipsis; }' +
        '#fx-bubble::after { content: ""; position: absolute; top: 100%; left: var(--arrow, 50%);' +
        '  margin-left: -7px; border: 7px solid transparent; border-top-color: #ff8c42; }' +

        '@media (max-width: 576px) { #fx-pet { width: 220px; } }';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* =====================================================
       COLA DE ZORRO COMO CURSOR
       ===================================================== */
    if (finePointer) {
        document.documentElement.classList.add('fx-cursor');

        var tail = document.createElement('div');
        tail.id = 'fx-tail';
        tail.innerHTML = TAIL_SVG;
        document.body.appendChild(tail);

        var mx = -100, my = -100, vx = 0, rot = 0;
        var overHot = false, overText = false, down = false, inside = false;

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
            vx = e.movementX || 0;
            inside = true;
        }, { passive: true });

        document.addEventListener('mouseover', function (e) {
            overHot = !!(e.target.closest && e.target.closest(HOT));
            overText = !!(e.target.closest && e.target.closest(TEXT_FIELDS));
        }, { passive: true });

        document.addEventListener('mousedown', function () { down = true; });
        document.addEventListener('mouseup', function () { down = false; });
        document.documentElement.addEventListener('mouseleave', function () { inside = false; });
        document.documentElement.addEventListener('mouseenter', function () { inside = true; });

        (function loop() {
            var goal = Math.max(-35, Math.min(35, -vx * 1.4));
            rot += (goal - rot) * 0.18;
            vx *= 0.85;

            var s = down ? 0.88 : (overHot ? 1.15 : 1);
            tail.style.transform =
                'translate3d(' + (mx - 4) + 'px,' + (my - 4) + 'px,0) rotate(' + rot + 'deg) scale(' + s + ')';
            tail.classList.toggle('on', inside && !overText && mx > 0);
            requestAnimationFrame(loop);
        })();
    }

    /* =====================================================
       ZORRITO MASCOTA
       ===================================================== */
    var pet = document.createElement('div');
    pet.id = 'fx-pet';
    pet.innerHTML = '<div id="fx-bubble"></div><div id="fx-flip">' + FOX_SVG + '</div>';
    document.body.appendChild(pet);

    var flip = pet.querySelector('#fx-flip');
    var bubble = pet.querySelector('#fx-bubble');

    function petW() { return pet.offsetWidth || W; }

    var x = Math.random() * Math.max(0, window.innerWidth - petW());
    var dir = Math.random() < 0.5 ? 1 : -1;
    var state = '';
    var nextChange = 0;
    var targetX = 0;
    var chefTimer = null;
    var orders = [];
    var last = performance.now();

    var lastMove = last;        // última actividad del cursor
    var lastOrder = last;       // último producto elegido

    function setState(s) {
        state = s;
        pet.classList.remove('is-walk', 'is-idle', 'is-run', 'is-chef', 'is-sleep');
        pet.classList.add('is-' + s);
    }

    function rand(a, b) { return a + Math.random() * (b - a); }

    function clampX(v) { return Math.max(0, Math.min(window.innerWidth - petW(), v)); }

    setState(reduceMotion ? 'idle' : 'walk');
    nextChange = last + rand(3000, 6000);

    function render() {
        pet.style.transform = 'translate3d(' + x + 'px,0,0)';
        flip.classList.toggle('left', dir === -1 && state !== 'sleep');
    }

    /* ---------- dormir / despertar ---------- */
    function goSleep() {
        if (state === 'sleep') return;
        clearTimeout(chefTimer);
        bubble.classList.remove('show');
        setState('sleep');
    }

    function wakeUp() {
        if (state !== 'sleep') return;
        lastOrder = performance.now();
        setState(reduceMotion ? 'idle' : 'walk');
        nextChange = performance.now() + rand(2000, 5000);
    }

    function activity() {
        lastMove = performance.now();
        wakeUp();
    }

    document.addEventListener('mousemove', function (e) {
        if (Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) < 2) return;
        activity();
    }, { passive: true });
    document.addEventListener('mousedown', activity, { passive: true });
    document.addEventListener('wheel', activity, { passive: true });
    document.addEventListener('keydown', activity, { passive: true });
    document.addEventListener('touchstart', activity, { passive: true });
    window.addEventListener('scroll', activity, { passive: true });

    function arrive() {
        setState('chef');
        lastOrder = performance.now();
        var label = pet.__label || 'tu pedido';
        orders.push(label);

        bubble.innerHTML = '<small></small><span></span>';
        bubble.querySelector('small').textContent = 'Pedido #' + orders.length;
        bubble.querySelector('span').textContent = '📝 ' + label;

        bubble.style.transform = 'translateX(-50%)';
        bubble.style.setProperty('--arrow', '50%');
        bubble.classList.add('show');
        var r = bubble.getBoundingClientRect();
        var shift = 0;
        if (r.left < 8) shift = 8 - r.left;
        else if (r.right > window.innerWidth - 8) shift = (window.innerWidth - 8) - r.right;
        if (shift) {
            bubble.style.transform = 'translateX(calc(-50% + ' + shift + 'px))';
            bubble.style.setProperty('--arrow', 'calc(50% - ' + shift + 'px)');
        }

        clearTimeout(chefTimer);
        chefTimer = setTimeout(function () {
            bubble.classList.remove('show');
            setState('idle');
            nextChange = performance.now() + 900;
        }, CHEF_TIME);
    }

    function labelFor(el) {
        var t = el.querySelector && el.querySelector('.menu-item-header h3, h3, h2, .stat-label');
        var text = (t ? t.textContent : el.textContent) || '';
        text = text.replace(/\s+/g, ' ').trim();
        if (!text) text = 'algo rico';
        return text.length > 26 ? text.slice(0, 25) + '…' : text;
    }

    document.addEventListener('click', function (e) {
        var el = e.target.closest && e.target.closest(HOT);
        if (!el) return;

        lastMove = performance.now();
        lastOrder = performance.now();
        pet.__label = labelFor(el);
        targetX = clampX(e.clientX - petW() / 2);
        clearTimeout(chefTimer);
        bubble.classList.remove('show');
        dir = targetX >= x ? 1 : -1;
        setState('run');
    }, true);

    window.addEventListener('resize', function () { x = clampX(x); });

    (function tick(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        var maxX = Math.max(0, window.innerWidth - petW());

        if (state !== 'chef' && state !== 'run' && state !== 'sleep') {
            var still = now - lastMove;
            var noOrder = now - lastOrder;
            if (still > SLEEP_STILL || (noOrder > SLEEP_NO_ORDER && still > STILL_BEFORE_NAP)) {
                goSleep();
            }
        }

        if (state === 'walk') {
            x += dir * WALK_SPEED * dt;
            if (x <= 0) { x = 0; dir = 1; }
            if (x >= maxX) { x = maxX; dir = -1; }
            if (now > nextChange) {
                if (Math.random() < 0.5) {
                    setState('idle');
                    nextChange = now + rand(1500, 3500);
                } else {
                    dir = -dir;
                    nextChange = now + rand(3000, 7000);
                }
            }
        } else if (state === 'idle') {
            if (!reduceMotion && now > nextChange) {
                setState('walk');
                if (Math.random() < 0.5) dir = -dir;
                nextChange = now + rand(3000, 7000);
            }
        } else if (state === 'run') {
            var d = targetX - x;
            var step = RUN_SPEED * dt;
            if (Math.abs(d) <= step) {
                x = targetX;
                arrive();
            } else {
                x += Math.sign(d) * step;
                dir = d > 0 ? 1 : -1;
            }
        }

        render();
        requestAnimationFrame(tick);
    })(last);
})();
