(() => {
  'use strict';
  const ready = fn => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  ready(() => {
    const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
    const M = window.menu = (typeof menu !== 'undefined' ? menu : []);
    const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');
    const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    if (!M.length) { $('#grid').innerHTML='<p class="empty">Menu could not be loaded. Please refresh.</p>'; return; }
    let cart={};try{cart=JSON.parse(localStorage.getItem('amarCart')||'{}')||{}}catch(e){} let active='All',shown=24;
    const save=()=>localStorage.setItem('amarCart',JSON.stringify(cart));
    const totals=()=>{let sub=0,count=0;Object.entries(cart).forEach(([id,q])=>{const x=M.find(m=>String(m.id)===id),n=Number(q);if(x&&n>0){sub+=x.price*n;count+=n}});const svc=sub?Math.max(100,Math.round(sub*.05)):0;return{sub,svc,total:sub+svc,count}};
    const toast=s=>{const t=$('#toast');if(!t)return;t.textContent=s;t.classList.add('on');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('on'),2200)};
    const cartRender=()=>{const t=totals();$('#count').textContent=t.count;$('#itemCount').textContent=t.count;$('#sub').textContent=money(t.sub);$('#svc').textContent=money(t.svc);$('#total').textContent=money(t.total);$('#items').innerHTML=Object.entries(cart).map(([id,q])=>{const x=M.find(m=>String(m.id)===id);return x&&q>0?`<div class="cartline"><img src="${esc(x.image)}" alt="${esc(x.name)}"><div><h4>${esc(x.name)}</h4><span class="unit">${money(x.price)} each</span><div class="qty"><button type="button" data-cart="-" data-id="${x.id}">−</button><span>${q}</span><button type="button" data-cart="+" data-id="${x.id}">+</button></div></div><div class="line"><b>${money(x.price*q)}</b><button type="button" class="remove" data-cart="r" data-id="${x.id}">remove</button></div></div>`:''}).join('')||'<p class="empty">Your cart is empty. Add dishes from the menu.</p>'};
    const render=()=>{const q=($('#search')?.value||'').trim().toLowerCase(),list=M.filter(x=>(active==='All'||x.category===active)&&(!q||x.name.toLowerCase().includes(q)));$('#result').textContent=list.length+' dishes';$('#grid').innerHTML=list.slice(0,shown).map(x=>`<article class="card"><div class="pic"><img loading="lazy" src="${esc(x.image)}" alt="${esc(x.name)}" onerror="this.onerror=null;this.src='${M[0].image}'></div><div class="body"><div class="cat">${esc(x.category)}</div><h3>${esc(x.name)}</h3><div class="row"><span class="price">${money(x.price)}</span><button type="button" class="add" data-add="${x.id}">Add to cart</button></div></div></article>`).join('')||'<p class="empty">No dishes found.</p>';$('#more').style.display=list.length>shown?'block':'none'};
    $('#filters').innerHTML=['All',...new Set(M.map(x=>x.category))].map((c,i)=>`<button type="button" class="filter ${i?'':'active'}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    const openCart=()=>{$('#drawer').classList.add('open');$('#shade').hidden=false;document.body.classList.add('lock')},closeCart=()=>{$('#drawer').classList.remove('open');$('#shade').hidden=true;document.body.classList.remove('lock')};
    document.addEventListener('click',e=>{const a=e.target.closest('[data-add]');if(a){const id=a.dataset.add;cart[id]=(cart[id]||0)+1;save();cartRender();toast('Added to cart');return}const f=e.target.closest('[data-cat]');if(f){active=f.dataset.cat;shown=24;$$('.filter').forEach(b=>b.classList.toggle('active',b===f));render();return}const c=e.target.closest('[data-cart]');if(c){const id=c.dataset.id,t=c.dataset.cart;if(t==='+')cart[id]=(cart[id]||0)+1;else if(t==='-'){cart[id]=(cart[id]||0)-1;if(cart[id]<=0)delete cart[id]}else delete cart[id];save();cartRender()}});
    $('#cartBtn').onclick=openCart;$('#closeCart').onclick=closeCart;$('#shade').onclick=closeCart;
    $('#hamb').onclick=()=>$('#nav').classList.toggle('open');$$('#nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));$('#search').oninput=()=>{shown=24;render()};$('#clear').onclick=()=>{$('#search').value='';shown=24;render()};$('#more').onclick=()=>{shown+=24;render()};
    render();cartRender();
  });
})();