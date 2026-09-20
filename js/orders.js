/* =====================================================
   DESKFOX · carrito y envío de pedidos a Supabase
   Requiere que /js/supabase-config.js y el SDK de Supabase
   estén cargados ANTES que este archivo.
   ===================================================== */
(function () {
    'use strict';
    if (window.__deskfoxOrders) return;
    window.__deskfoxOrders = true;

    var sb = null;
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
        window.SUPABASE_URL.indexOf('TU-PROYECTO') === -1) {
        sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }

    var cart = [];               // [{name, price, qty}]

    /* ---------- Estilos ---------- */
    var css =
        '#dx-cart-btn { position: fixed; right: 20px; bottom: 20px; z-index: 1000;' +
        '  width: 60px; height: 60px; border-radius: 50%; background: #ff8c42; color: #fff;' +
        '  border: 3px solid #5b3a22; display: flex; align-items: center; justify-content: center;' +
        '  font-size: 26px; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,.35); }' +
        '#dx-cart-btn .dx-count { position: absolute; top: -4px; right: -4px; background: #c0392b;' +
        '  color: #fff; font: 700 13px/1 sans-serif; min-width: 22px; height: 22px; border-radius: 11px;' +
        '  display: flex; align-items: center; justify-content: center; border: 2px solid #fff; padding: 0 3px; }' +
        '#dx-cart-btn .dx-count.hide { display: none; }' +

        '#dx-cart-panel { position: fixed; right: 20px; bottom: 92px; z-index: 1000; width: 320px;' +
        '  max-height: 70vh; overflow-y: auto; background: #fff; border: 2px solid #ff8c42;' +
        '  border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,.35); padding: 16px;' +
        '  display: none; font-family: "Poppins","Segoe UI",sans-serif; color: #3d2817; }' +
        '#dx-cart-panel.show { display: block; }' +
        '#dx-cart-panel h3 { margin: 0 0 12px; font-size: 18px; color: #e67e22; }' +
        '.dx-empty { color: #999; font-size: 14px; text-align: center; padding: 20px 0; }' +
        '.dx-row { display: flex; align-items: center; justify-content: space-between; gap: 8px;' +
        '  padding: 8px 0; border-bottom: 1px solid #f2e4d5; font-size: 14px; }' +
        '.dx-row-name { flex: 1; }' +
        '.dx-qty { display: flex; align-items: center; gap: 6px; }' +
        '.dx-qty button { width: 22px; height: 22px; border-radius: 6px; border: 1px solid #ff8c42;' +
        '  background: #fff3e6; color: #e67e22; font-weight: 700; cursor: pointer; }' +
        '.dx-remove { background: none; border: none; color: #c0392b; cursor: pointer; font-size: 16px; }' +
        '#dx-cart-total { display: flex; justify-content: space-between; font-weight: 700; margin: 12px 0; }' +
        '#dx-cart-field { width: 100%; box-sizing: border-box; padding: 9px 10px; margin-bottom: 10px;' +
        '  border: 1px solid #ddd; border-radius: 8px; font: 14px "Poppins","Segoe UI",sans-serif; }' +
        '#dx-cart-send { width: 100%; padding: 11px; border: none; border-radius: 10px;' +
        '  background: #ff8c42; color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; }' +
        '#dx-cart-send:disabled { opacity: .6; cursor: default; }' +
        '#dx-cart-msg { font-size: 13px; margin-top: 8px; text-align: center; }' +
        '#dx-cart-msg.ok { color: #2e7d32; }' +
        '#dx-cart-msg.err { color: #c0392b; }' +

        '.dx-add-btn { margin-top: 8px; padding: 6px 14px; border: none; border-radius: 20px;' +
        '  background: #ff8c42; color: #fff; font-weight: 700; font-size: 13px; cursor: pointer; }' +
        '.dx-add-btn:active { transform: scale(.96); }';

    var styleEl = document.createElement('style');
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    /* ---------- Botón "Agregar" en cada producto ---------- */
    document.querySelectorAll('.menu-item').forEach(function (item) {
        var nameEl = item.querySelector('.menu-item-header h3');
        var priceEl = item.querySelector('.menu-price');
        if (!nameEl || !priceEl) return;

        var name = nameEl.textContent.trim();
        var price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dx-add-btn';
        btn.textContent = 'Agregar al pedido';
        item.appendChild(btn);

        btn.addEventListener('click', function (e) {
            e.stopPropagation();     // no interferir con la animación del zorrito
            addToCart(name, price);
        });
    });

    /* ---------- Estado del carrito ---------- */
    function addToCart(name, price) {
        var line = cart.find(function (l) { return l.name === name; });
        if (line) line.qty++;
        else cart.push({ name: name, price: price, qty: 1 });
        renderCart();
        panel.classList.add('show');
    }

    function total() {
        return cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
    }

    /* ---------- UI del carrito ---------- */
    var cartBtn = document.createElement('div');
    cartBtn.id = 'dx-cart-btn';
    cartBtn.innerHTML = '🛒<span class="dx-count hide">0</span>';
    document.body.appendChild(cartBtn);

    var panel = document.createElement('div');
    panel.id = 'dx-cart-panel';
    document.body.appendChild(panel);

    cartBtn.addEventListener('click', function () {
        panel.classList.toggle('show');
    });

    function renderCart() {
        var count = cart.reduce(function (s, l) { return s + l.qty; }, 0);
        var badge = cartBtn.querySelector('.dx-count');
        badge.textContent = count;
        badge.classList.toggle('hide', count === 0);

        var rows = '';
        if (cart.length === 0) {
            rows = '<div class="dx-empty">Tu pedido está vacío</div>';
        } else {
            cart.forEach(function (l, i) {
                rows +=
                    '<div class="dx-row">' +
                    '<span class="dx-row-name">' + l.name + '</span>' +
                    '<div class="dx-qty">' +
                    '<button data-i="' + i + '" data-d="-1">−</button>' +
                    '<span>' + l.qty + '</span>' +
                    '<button data-i="' + i + '" data-d="1">+</button>' +
                    '</div>' +
                    '<span>$' + (l.price * l.qty).toFixed(2) + '</span>' +
                    '<button class="dx-remove" data-remove="' + i + '">✕</button>' +
                    '</div>';
            });
        }

        panel.innerHTML =
            '<h3>Tu pedido</h3>' + rows +
            (cart.length ? '<div id="dx-cart-total"><span>Total</span><span>$' + total().toFixed(2) + '</span></div>' : '') +
            '<input id="dx-cart-field" placeholder="Tu nombre o número de mesa" ' + (cart.length ? '' : 'style="display:none"') + '>' +
            '<button id="dx-cart-send" ' + (cart.length ? '' : 'style="display:none"') + '>Enviar pedido</button>' +
            '<div id="dx-cart-msg"></div>';

        panel.querySelectorAll('[data-i]').forEach(function (b) {
            b.addEventListener('click', function () {
                var i = +b.dataset.i, d = +b.dataset.d;
                cart[i].qty += d;
                if (cart[i].qty <= 0) cart.splice(i, 1);
                renderCart();
            });
        });
        panel.querySelectorAll('[data-remove]').forEach(function (b) {
            b.addEventListener('click', function () {
                cart.splice(+b.dataset.remove, 1);
                renderCart();
            });
        });
        var sendBtn = panel.querySelector('#dx-cart-send');
        if (sendBtn) sendBtn.addEventListener('click', sendOrder);
    }

    /* ---------- Enviar pedido a Supabase ---------- */
    function sendOrder() {
        var msg = panel.querySelector('#dx-cart-msg');
        var field = panel.querySelector('#dx-cart-field');
        var sendBtn = panel.querySelector('#dx-cart-send');
        var mesaNombre = field.value.trim();

        if (!mesaNombre) {
            msg.textContent = 'Escribe tu nombre o número de mesa';
            msg.className = 'err';
            return;
        }
        if (!sb) {
            msg.textContent = 'Falta configurar Supabase (revisa js/supabase-config.js)';
            msg.className = 'err';
            return;
        }

        sendBtn.disabled = true;
        msg.textContent = 'Enviando...';
        msg.className = '';

        sb.from('pedidos').insert({
            mesa_nombre: mesaNombre,
            items: cart.map(function (l) { return { producto: l.name, precio: l.price, cantidad: l.qty }; }),
            total: total()
        }).then(function (res) {
            if (res.error) {
                msg.textContent = 'Error: ' + res.error.message;
                msg.className = 'err';
                sendBtn.disabled = false;
                return;
            }
            msg.textContent = '¡Pedido enviado! Gracias 🦊';
            msg.className = 'ok';
            cart = [];
            setTimeout(function () {
                renderCart();
                panel.classList.remove('show');
            }, 1600);
        });
    }

    renderCart();
})();
