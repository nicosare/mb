/* ==================  FIREBASE  ================== */
const firebaseConfig = {
  apiKey: "AIzaSyCcVgoGZ6MnjQOghbYRmnvITPU-O-zDYao",
  authDomain: "minibars-17502.firebaseapp.com",
  databaseURL: "https://minibars-17502-default-rtdb.firebaseio.com",
  projectId: "minibars-17502",
  storageBucket: "minibars-17502.firebasestorage.app",
  messagingSenderId: "464067936838",
  appId: "1:464067936838:web:f6c37ecf3ec4ae5d598047"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ==================  GLOBAL HELPERS  ================== */
const $   = s => document.querySelector(s);
const $$  = s => [...document.querySelectorAll(s)];
const appData = JSON.parse(localStorage.getItem('hotelMinibarData') || '{"accises":[],"rooms":[],"gihRecords":[]}');

let isUpdatingFromFirebase = false;

/* Firebase sync */
function saveDebounced() {
  clearTimeout(window.saveTimer);
  window.saveTimer = setTimeout(() => {
    localStorage.setItem('hotelMinibarData', JSON.stringify(appData));
    if (!isUpdatingFromFirebase) db.ref('minibarData').set(appData);
  }, 200);
}
db.ref('minibarData').on('value', snap => {
  if (!snap.val() || isUpdatingFromFirebase) return;
  isUpdatingFromFirebase = true;
  Object.assign(appData, snap.val());
  localStorage.setItem('hotelMinibarData', JSON.stringify(appData));
  isUpdatingFromFirebase = false;
  refreshAll();
});
/* connection indicator */
db.ref('.info/connected').on('value', s => {
  const on = s.val() === true;
  $$('.connection-status, .mobile-connection-indicator').forEach(el =>
    el.classList.toggle('connected', on)
  );
});

/* ==================  NAV & ACTIVE TAB  ================== */
(() => {
  const nav = `
<nav class="nav">
  <div class="logo"><i class="fas fa-wine-bottle"></i> Minibar</div>
  <a class="nav-item ${location.pathname.includes('index.html') ? 'active' : ''}" href="index.html">Акцизы</a>
  <a class="nav-item ${location.pathname.includes('sroki.html') ? 'active' : ''}" href="sroki.html">Сроки</a>
  <a class="nav-item ${location.pathname.includes('gih.html') ? 'active' : ''}" href="gih.html">GIH</a>
  <div class="nav-separator"></div>
  <a class="nav-item ${location.pathname.includes('settings.html') ? 'active' : ''}" href="settings.html">Настройки</a>
  <a class="nav-item ${location.pathname.includes('learning.html') ? 'active' : ''}" href="learning.html">Обучение</a>
  <a class="nav-item ${location.pathname.includes('practice.html') ? 'active' : ''}" href="practice.html">Практика</a>
  <a class="nav-item ${location.pathname.includes('history.html') ? 'active' : ''}" href="history.html">История</a>
  <div class="nav-separator"></div>
  <div class="connection-status disconnected"><span class="dot"></span><span class="text">Соединение…</span></div>
</nav>

<div id="bottom-nav" class="bottom-nav">
  <div class="mobile-connection-indicator disconnected"></div>
  <a class="b-item ${location.pathname.includes('index.html') ? 'active' : ''}" href="index.html"><i class="fas fa-file-invoice"></i><span>Акцизы</span></a>
  <a class="b-item ${location.pathname.includes('sroki.html') ? 'active' : ''}" href="sroki.html"><i class="fas fa-door-closed"></i><span>Сроки</span></a>
  <a class="b-item ${location.pathname.includes('gih.html') ? 'active' : ''}" href="gih.html"><i class="fas fa-users"></i><span>GIH</span></a>
</div>`;
  if (!$('#global-nav')) document.body.insertAdjacentHTML('afterbegin', nav);
})();

/* ==================  ACCISES  ================== */
if (location.pathname.includes('index.html')) (() => {
  initAccises();
  function initAccises() {
    const bind = el => {
      if (!el) return;
      let t; el.addEventListener('input', () => {
        clearTimeout(t); t = setTimeout(() => { addAccise(el.value); el.value = ''; }, 1000);
      });
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); clearTimeout(t); addAccise(el.value); el.value = ''; }
      });
    };
    bind($('#new-accise'));
    $('#copy-accises').onclick = copyAccises;
    refreshAccises();
  }

  function addAccise(raw) {
    if (!raw.trim()) return;
    const text = convertLayout(raw.trim().split(/\s+/)[0]);
    if (appData.accises.find(a => a.text === text)) { alert('Уже есть'); return; }
    appData.accises.unshift({ id: Date.now(), text, isValid: text.length >= 20 && /^\d/.test(text), ts: new Date().toISOString() });
    saveDebounced(); refreshAccises();
  }

  function refreshAccises() {
    const list = $('#accises-list');
    list.innerHTML = '';
    appData.accises.forEach(a => {
      const div = document.createElement('div');
      div.className = 'accise-item ' + (a.isValid ? 'valid' : 'invalid');
      div.dataset.id = a.id;
      div.style.cssText = 'position:relative;padding:12px 44px 28px 12px;border-radius:10px;margin-bottom:8px;';
      div.innerHTML = `
        <button class="btn ghost small" style="position:absolute;top:8px;right:8px;width:28px;height:28px;padding:0;"><i class="fas fa-trash"></i></button>
        <div style="font-weight:600">${a.text}</div>
        <small class="muted" style="position:absolute;left:12px;bottom:8px">${new Date(a.ts).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small>`;
      div.querySelector('button').onclick = () => { appData.accises = appData.accises.filter(x => x.id !== a.id); saveDebounced(); refreshAccises(); };
      list.prepend(div);
    });
    $('#total-accises').textContent = appData.accises.length;
    $('#total-chars').textContent = appData.accises.reduce((s, a) => s + a.text.length, 0);
  }

  function copyAccises() {
    const valid = appData.accises.filter(a => a.isValid).map(a => a.text);
    if (!valid.length) return alert('Нет валидных');
    navigator.clipboard.writeText(valid.join('\n')).then(() => alert('Скопировано'));
  }

  function convertLayout(t) {
    const ru = 'йцукенгшщзхъфывапролджэячсмитьбюЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮ';
    const en = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,./QWERTYUIOP{}ASDFGHJKL:"ZXCVBNM<>?';
    return [...t].map(ch => ru.includes(ch) ? en[ru.indexOf(ch)] : ch).join('');
  }
})();

/* ==================  SROKI  ================== */
if (location.pathname.includes('sroki.html')) (() => {
  initSroki();
  function initSroki() {
    renderRooms();
    $('#modal-close').onclick = closeModal;
    $('#modal').onclick = e => e.target === $('#modal') && closeModal();
    $('#modal-save').onclick = () => saveRoom();
    $('#modal-ok-order').onclick = okOrder;
    $('#modal-reset').onclick = resetRoom;
  }

  function renderRooms() {
    const grid = $('#rooms-grid');
    grid.innerHTML = '';
    appData.roomsList.forEach(num => {
      let room = appData.rooms.find(r => r.number === num);
      if (!room) {
        const isLux = (num % 2 === 1) || String(num).endsWith('00') || String(num).endsWith('34');
        room = { number: num, type: isLux ? 'lux' : 'standard', completed: false, products: {} };
        appData.rooms.push(room);
      }
      const el = document.createElement('div');
      el.className = 'room-item' + (room.completed ? ' completed' : Object.keys(room.products).length ? ' has-products' : '');
      el.innerHTML = `<div class="room-number">${room.number}</div><div class="room-products">${Object.entries(room.products).filter(([,c])=>c).map(([k,c])=>`${k}${c>1?`x${c}`:''}`).join(', ') || '&nbsp;'}</div>`;
      el.onclick = () => openModal(room);
      grid.appendChild(el);
    });
  }
  function openModal(room) {
    appData.selectedRoom = room.number;
    $('#modal-room').textContent = room.number;
    $('#modal').classList.add('show');
    renderProductButtons($('#modal-products'), appData.roomProducts[room.type] || [], room.products, () => renderRooms(), {allowMaxTwo:true});
  }
  function closeModal() { $('#modal').classList.remove('show'); appData.selectedRoom = null; }
  function saveRoom() {
    const room = appData.rooms.find(r => r.number === appData.selectedRoom);
    if (room) { room.completed = true; room.completedAt = new Date().toISOString(); saveDebounced(); renderRooms(); }
    closeModal();
  }
  function okOrder() {
    const room = appData.rooms.find(r => r.number === appData.selectedRoom);
    if (!room) return;
    room.products = {}; saveDebounced(); renderRooms();
  }
  function resetRoom() {
    const room = appData.rooms.find(r => r.number === appData.selectedRoom);
    if (!room) return;
    renderProductButtons($('#modal-products'), appData.roomProducts[room.type] || [], room.products, () => renderRooms(), {allowMaxTwo:true});
  }
})();

/* ==================  GIH  ================== */
if (location.pathname.includes('gih.html')) (() => {
  initGIH();
  function initGIH() {
    buildGIHProductsArea();
    $('#add-gih-btn').onclick = toggleForm;
    $('#cancel-gih').onclick = closeForm;
    $('#save-gih').onclick = handleGIHSave;
    $('#gih-sort-btn').onclick = sortToggle;
    refreshAllGIH();
  }

  let editingGIHId = null, gihSortAsc = true;

  function toggleForm() {
    const f = $('#gih-form');
    f.style.display = f.style.display === 'block' ? 'none' : 'block';
    if (f.style.display === 'block') $('#gih-room').focus();
  }
  function closeForm() { $('#gih-form').style.display = 'none'; editingGIHId = null; resetGIHForm(); }

  function buildGIHProductsArea() {
    const area = $('#gih-products-area');
    area.innerHTML = '';
    Object.keys(appData.products).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'product-btn';
      btn.textContent = appData.products[key];
      btn.onclick = () => { btn.classList.toggle('active'); };
      area.appendChild(btn);
    });
  }

  function handleGIHSave() {
    const room = $('#gih-room').value.trim();
    if (!room) return alert('Введите номер комнаты');
    const products = [...$$('#gih-products-area .product-btn.active')].map(b => b.textContent);
    if (!products.length) return alert('Выберите продукты');
    // сохранение...
    saveDebounced(); refreshAllGIH(); closeForm();
  }

  function refreshAllGIH() {
    $('#gih-records').innerHTML = '';
    appData.gihRecords.sort((a, b) => gihSortAsc ? (a.room - b.room) : (b.room - a.room));
    appData.gihRecords.forEach(renderGIHRecord);
    updateGIHSummary(); updateGIHRoomsSummary();
  }

  function sortToggle() {
    gihSortAsc = !gihSortAsc;
    refreshAllGIH();
  }

  function resetGIHForm() { $('#gih-room').value = ''; $$('#gih-products-area .product-btn').forEach(b => b.classList.remove('active')); }

  /* упрощённый renderGIHRecord, summaries, etc. – добавьте по необходимости */
})();

/* ==================  SETTINGS / LEARNING / PRACTICE / HISTORY  ================== */
/* на этих страницах нет JS-логики, поэтому просто подключён общий файл */

/* ==================  UTILS / INITIAL  ================== */
function refreshAll() {
  if (location.pathname.includes('index.html')) refreshAccises();
  if (location.pathname.includes('sroki.html')) renderRooms();
  if (location.pathname.includes('gih.html')) refreshAllGIH();
}

document.addEventListener('DOMContentLoaded', () => {
  refreshAll();
});
