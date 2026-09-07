(() => {
  'use strict';
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  ready(() => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
    const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m]));

    if (!Array.isArray(window.menu)) {
      console.error('Menu data failed to load.');
      const grid = $('#grid');
      if (grid) grid.innerHTML = '<p class="empty">The menu could not be loaded. Please refresh the page.</p>';
      return;
    }

    let cart = {};
    try { cart = JSON.parse(localStorage.getItem('amarCart') || '{}') || {}; } catch (_) { cart = {}; }
    let active = 'All';
    let shown = 24;

    const save = () => localStorage.setItem('amarCart', JSON.stringify(cart));
    const totals = () => {
      let sub = 0, count = 0;
      Object.entries(cart).forEach(([id, q]) => {
        const x = window.menu.find(m => String(m.id) === String(id));
        const qty = Number(q);
        if (x && qty > 0) { sub += Number(x.price) * qty; count += qty; }
      });
      const svc = sub ? Math.max(100, Math.round(sub * 0.05)) : 0;
      return { sub, svc, total: sub + svc, count };
    };

    const toast = (message) => {
      const t = $('#toast');
      if (!t) return;
      t.textContent = message;
      t.classList.add('on');
      clearTimeout(window.__amarToast);
      window.__amarToast = setTimeout(() => t.classList.remove('on'), 2200);
    };

    const closeCart = () => {
      const drawer = $('#drawer'), shade = $('#shade');
      if (drawer) drawer.classList.remove('open');
      if (shade) shade.hidden = true;
      document.body.classList.remove('lock');
    };

    const openCart = () => {
      const drawer = $('#drawer'), shade = $('#shade');
      if (!drawer) return;
      drawer.classList.add('open');
      if (shade) shade.hidden = false;
      document.body.classList.add('lock');
    };

    const closeModal = () => {
      const modal = $('#modal');
      if (modal) modal.hidden = true;
      document.body.classList.remove('lock');
    };

    const openModal = () => {
      const t = totals();
      if (!t.count) { toast('Add at least one dish first'); return; }
      closeCart();
      const final = $('#final'), preview = $('#preview'), modal = $('#modal');
      if (final) final.textContent = money(t.total);
      if (preview) {
        const rows = Object.entries(cart).map(([id, q]) => {
          const x = window.menu.find(m => String(m.id) === String(id));
          return x ? `<div class="order"><span>${esc(x.name)} × ${Number(q)}</span><b>${money(x.price * q)}</b></div>` : '';
        }).join('');
        preview.innerHTML = rows + `<div class="sum"><span>Subtotal</span><b>${money(t.sub)}</b></div><div class="sum"><span>Service estimate</span><b>${money(t.svc)}</b></div><div class="sum total"><span>Estimated total</span><b>${money(t.total)}</b></div>`;
      }
      if (modal) { modal.hidden = false; document.body.classList.add('lock'); }
    };

    const cartRender = () => {
      const t = totals();
      const count = $('#count'), itemCount = $('#itemCount'), sub = $('#sub'), svc = $('#svc'), total = $('#total'), items = $('#items');
      if (count) count.textContent = t.count;
      if (itemCount) itemCount.textContent = t.count;
      if (sub) sub.textContent = money(t.sub);
      if (svc) svc.textContent = money(t.svc);
      if (total) total.textContent = money(t.total);
      if (!items) return;
      const rows = Object.entries(cart).map(([id, q]) => {
        const x = window.menu.find(m => String(m.id) === String(id));
        if (!x || Number(q) <= 0) return '';
        return `<div class="cartline"><img src="${esc(x.image)}" alt="${esc(x.name)}"><div><h4>${esc(x.name)}</h4><span class="unit">${money(x.price)} each</span><div class="qty"><button type="button" data-cart-action="minus" data-id="${x.id}">−</button><span>${Number(q)}</span><button type="button" data-cart-action="plus" data-id="${x.id}">+</button></div></div><div class="line"><b>${money(x.price * q)}</b><button type="button" class="remove" data-cart-action="remove" data-id="${x.id}">remove</button></div></div>`;
      }).join('');
      items.innerHTML = rows || '<p class="empty">Your cart is empty. Add dishes from the menu.</p>';
    };

    const render = () => {
      const search = $('#search');
      const query = search ? search.value.trim().toLowerCase() : '';
      const list = window.menu.filter(x => (active === 'All' || x.category === active) && (!query || x.name.toLowerCase().includes(query)));
      const result = $('#result'), grid = $('#grid'), more = $('#more');
      if (result) result.textContent = `${list.length} dishes`;
      if (grid) {
        grid.innerHTML = list.slice(0, shown).map(x => `<article class="card"><div class="pic"><img loading="lazy" src="${esc(x.image)}" alt="${esc(x.name)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85'"></div><div class="body"><div class="cat">${esc(x.category)}</div><h3>${esc(x.name)}</h3><div class="row"><span class="price">${money(x.price)}</span><button type="button" class="add" data-add-id="${x.id}">Add to cart</button></div></div></article>`).join('') || '<p class="empty">No dishes found.</p>';
      }
      if (more) more.style.display = list.length > shown ? 'block' : 'none';
    };

    const filters = () => {
      const holder = $('#filters');
      if (!holder) return;
      const cats = ['All', ...new Set(window.menu.map(x => x.category))];
      holder.innerHTML = cats.map((c, i) => `<button type="button" class="filter ${i === 0 ? 'active' : ''}" data-category="${esc(c)}">${esc(c)}</button>`).join('');
    };

    document.addEventListener('click', (event) => {
      const add = event.target.closest('[data-add-id]');
      if (add) {
        const id = String(add.dataset.addId);
        cart[id] = Number(cart[id] || 0) + 1;
        save(); cartRender(); toast('Added to cart');
        return;
      }
      const filter = event.target.closest('[data-category]');
      if (filter) {
        active = filter.dataset.category; shown = 24;
        $$('.filter').forEach(b => b.classList.toggle('active', b === filter));
        render(); return;
      }
      const action = event.target.closest('[data-cart-action]');
      if (action) {
        const id = String(action.dataset.id), type = action.dataset.cartAction;
        if (type === 'plus') cart[id] = Number(cart[id] || 0) + 1;
        if (type === 'minus') { cart[id] = Number(cart[id] || 0) - 1; if (cart[id] <= 0) delete cart[id]; }
        if (type === 'remove') delete cart[id];
        save(); cartRender(); return;
      }
    });

    $('#cartBtn')?.addEventListener('click', openCart);
    $('#closeCart')?.addEventListener('click', closeCart);
    $('#shade')?.addEventListener('click', closeCart);
    $('#checkout')?.addEventListener('click', openModal);
    $('#closeModal')?.addEventListener('click', closeModal);
    $('#back')?.addEventListener('click', () => { closeModal(); openCart(); });
    $('#book')?.addEventListener('click', () => totals().count ? openModal() : document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }));
    $('#hamb')?.addEventListener('click', () => $('#nav')?.classList.toggle('open'));
    $$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav')?.classList.remove('open')));
    $('#search')?.addEventListener('input', () => { shown = 24; render(); });
    $('#clear')?.addEventListener('click', () => { const s = $('#search'); if (s) s.value = ''; shown = 24; render(); });
    $('#more')?.addEventListener('click', () => { shown += 24; render(); });

    const date = $('#date');
    if (date) {
      const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      date.min = now.toISOString().slice(0, 10);
    }

    $('#form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const phone = ($('#phone')?.value || '').replace(/\D/g, '');
      if (phone.length < 10) { toast('Please enter a valid 10-digit phone number'); return; }
      if (!$('#name')?.value.trim() || !$('#date')?.value || !$('#time')?.value || !$('#guests')?.value || !$('#address')?.value.trim()) { toast('Please complete all required event details'); return; }
      const t = totals();
      const items = Object.entries(cart).map(([id, q]) => { const x = window.menu.find(m => String(m.id) === String(id)); return x ? `${x.name} x${q} — ${money(x.price * q)}` : ''; }).filter(Boolean).join('\n');
      const msg = `Hello Amar Catering Services!\n\nI want to enquire/book catering.\nName: ${$('#name').value.trim()}\nPhone: ${$('#phone').value.trim()}\nEvent date: ${$('#date').value}\nEvent time: ${$('#time').value}\nGuests: ${$('#guests').value}\nEvent type: ${$('#type')?.value.trim() || 'Not specified'}\nAddress: ${$('#address').value.trim()}\n\nSelected dishes:\n${items}\n\nSubtotal: ${money(t.sub)}\nService estimate: ${money(t.svc)}\nEstimated final price: ${money(t.total)}\nSpecial instructions: ${$('#notes')?.value.trim() || 'None'}`;
      const url = 'https://wa.me/919866184951?text=' + encodeURIComponent(msg);
      const popup = window.open(url, '_blank', 'noopener,noreferrer');
      if (!popup) window.location.href = url;
      toast('WhatsApp enquiry prepared');
    });

    filters(); render(); cartRender();
  });
})();
