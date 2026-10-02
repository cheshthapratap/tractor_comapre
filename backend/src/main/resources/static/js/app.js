const API = '/api';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let T = [], sel = [], user = null, mx = {}, authMode = 'login';
try { user = JSON.parse(localStorage.getItem('tc_user')); } catch (e) {}

/* ---------- load data (Spring Boot API, fallback to data.js) ---------- */
async function load() {
  try {
    const r = await fetch(API + '/tractors');
    if (!r.ok) throw new Error('api');
    T = await r.json();
    $('#status').textContent = 'Live data from Spring Boot + MySQL';
  } catch (e) {
    T = window.TRACTOR_DATA.slice();
    $('#status').textContent = 'Offline demo data (Spring Boot backend not running). Sample specs are approximate.';
  }
  mx = {
    hp: Math.max(...T.map(t => t.hp)), lift: Math.max(...T.map(t => t.liftKg)),
    rpm: Math.max(...T.map(t => t.rpm)), val: Math.max(...T.map(t => t.hp / t.priceLakh))
  };
  T.forEach(t => { t.value = t.hp / t.priceLakh; t.score = score(t); });
  const cos = [...new Set(T.map(t => t.company))].sort();
  $('#fCompany').innerHTML += cos.map(c => `<option>${c}</option>`).join('');
  $('#vSel').innerHTML = T.map(t => `<option value="${t.id}">${t.company} ${t.model} (${t.hp} HP)</option>`).join('');
  renderCatalog(); renderUser();
}

/* Overall score out of 100: power 35, lift 15, cylinders 15, rpm 5, drive 10, value for money 20 */
function score(t) {
  return Math.round(t.hp / mx.hp * 35 + t.liftKg / mx.lift * 15 + t.cylinders / 6 * 15 +
    t.rpm / mx.rpm * 5 + (t.drive === '4WD' ? 10 : 4) + t.value / mx.val * 20);
}

/* ---------- 2D tractor picture ---------- */
function pic(t) {
  const c = t.colorHex, fr = t.drive === '4WD' ? 30 : 24;
  return `<svg viewBox="0 0 300 170" role="img" aria-label="${t.company} ${t.model}">
  <rect x="0" y="160" width="300" height="2" fill="#0003"/>
  <rect x="80" y="112" width="180" height="12" fill="#333"/>
  <rect x="148" y="82" width="118" height="36" rx="5" fill="${c}"/>
  <rect x="258" y="88" width="10" height="26" fill="#222"/>
  <rect x="232" y="48" width="7" height="36" fill="#222"/>
  <rect x="60" y="44" width="84" height="64" rx="4" fill="#bcd3dc" stroke="#333" stroke-width="3"/>
  <rect x="52" y="36" width="100" height="10" rx="3" fill="${c}"/>
  <circle cx="92" cy="118" r="42" fill="#1c1c1c"/><circle cx="92" cy="118" r="24" fill="${c}" stroke="#ddd" stroke-width="3"/>
  <circle cx="238" cy="${160 - fr}" r="${fr}" fill="#1c1c1c"/><circle cx="238" cy="${160 - fr}" r="${fr * .55}" fill="${c}" stroke="#ddd" stroke-width="2"/>
  </svg>`;
}

/* ---------- catalog ---------- */
function filtered() {
  const q = $('#q').value.toLowerCase(), co = $('#fCompany').value, cy = $('#fCyl').value,
    dr = $('#fDrive').value, mn = +$('#fMinHp').value || 0, mxh = +$('#fMaxHp').value || 1e9, so = $('#fSort').value;
  const r = T.filter(t => (t.company + ' ' + t.model).toLowerCase().includes(q) && (!co || t.company === co) &&
    (!cy || t.cylinders == cy) && (!dr || t.drive === dr) && t.hp >= mn && t.hp <= mxh);
  const key = { score: t => -t.score, hp: t => -t.hp, price: t => t.priceLakh, value: t => -t.value }[so];
  return r.sort((a, b) => key(a) - key(b));
}
function card(t) {
  const on = sel.includes(t.id);
  return `<article class="card"><div class="img">${pic(t)}</div><div class="body">
    <div><h3>${t.company} ${t.model}</h3><small>${t.drive} · ${t.gears}</small></div>
    <div class="chips"><span class="hp">${t.hp} HP</span><span>${t.cylinders} cyl</span><span>${t.rpm} rpm</span>
      <span><i class="dot" style="background:${t.colorHex}"></i>${t.color}</span></div>
    <div>Approx. ₹${t.priceLakh} lakh · Score <span class="score">${t.score}</span>/100</div>
    <div class="row"><button class="${on ? 'on' : ''}" onclick="toggle(${t.id})">${on ? 'Added' : 'Compare'}</button>
      <button onclick="details(${t.id})">Details</button><button onclick="view3d(${t.id})">3D view</button></div>
  </div></article>`;
}
function renderCatalog() {
  const r = filtered();
  $('#grid').innerHTML = r.length ? r.map(card).join('') : '<p class="empty">No tractor matches these filters. Clear a filter to see more.</p>';
  $('#cmpCount').textContent = sel.length;
}
['#q', '#fCompany', '#fCyl', '#fDrive', '#fMinHp', '#fMaxHp', '#fSort'].forEach(s => $(s).addEventListener('input', () => { show('catalog'); renderCatalog(); }));

function toggle(id) {
  if (sel.includes(id)) sel = sel.filter(x => x !== id);
  else if (sel.length >= 4) { alert('You can compare up to 4 tractors. Remove one first.'); return; }
  else sel.push(id);
  renderCatalog(); renderCompare(); if ($('#match').classList.contains('on')) runMatch();
}

/* ---------- details ---------- */
function details(id) {
  const t = T.find(x => x.id === id);
  $('#modalBody').innerHTML = `<h2>${t.company} ${t.model}</h2>${pic(t)}<p>${t.description}</p>` +
    specRows(t) + `<p class="note">Specs are sample values. Confirm with the manufacturer or dealer before buying.</p>`;
  $('#modal').showModal();
}
function specRows(t) {
  const rows = [['Company', t.company], ['Power', t.hp + ' HP (' + (t.hp * 0.7457).toFixed(1) + ' kW)'], ['Cylinders', t.cylinders],
    ['Rated RPM', t.rpm], ['Color', t.color], ['Drive', t.drive], ['Gears', t.gears], ['Fuel tank', t.fuelTank + ' L'],
    ['Hydraulic lift', t.liftKg + ' kg'], ['Approx. price', '₹' + t.priceLakh + ' lakh'], ['Overall score', t.score + ' / 100']];
  return rows.map(r => `<div class="spec"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
}

/* ---------- compare ---------- */
function renderCompare() {
  $('#cmpCount').textContent = sel.length;
  const L = sel.map(id => T.find(t => t.id === id));
  if (L.length < 2) {
    $('#cmpOut').innerHTML = '<p class="empty">Pick at least 2 tractors in the catalog with the Compare button (up to 4).</p>';
    return;
  }
  const best = (fn, dir) => { const v = L.map(fn); const b = dir === 'min' ? Math.min(...v) : Math.max(...v); return v.map(x => x === b); };
  const rows = [
    ['Company', t => t.company], ['Power (HP)', t => t.hp, 'max'], ['Cylinders', t => t.cylinders, 'max'],
    ['Rated RPM', t => t.rpm, 'max'], ['Color', t => `<i class="dot" style="background:${t.colorHex}"></i>${t.color}`],
    ['Drive', t => t.drive === '4WD' ? 1 : 0, 'max', t => t.drive], ['Gears', t => t.gears],
    ['Fuel tank (L)', t => t.fuelTank, 'max'], ['Lift capacity (kg)', t => t.liftKg, 'max'],
    ['Price (₹ lakh)', t => t.priceLakh, 'min'], ['HP per lakh', t => +t.value.toFixed(2), 'max'], ['Overall score', t => t.score, 'max']
  ];
  const win = L.reduce((a, b) => a.score >= b.score ? a : b);
  const pow = L.reduce((a, b) => a.hp >= b.hp ? a : b);
  const val = L.reduce((a, b) => a.value >= b.value ? a : b);
  let h = `<div class="banner"><h2>Best overall: ${win.company} ${win.model} (${win.score}/100)</h2>
    <p>Most powerful: <b>${pow.company} ${pow.model}</b> (${pow.hp} HP). Best value for money: <b>${val.company} ${val.model}</b> (${val.value.toFixed(1)} HP per lakh).</p></div>`;
  h += `<div class="scroll"><table><thead><tr><th></th>${L.map(t => `<th>${t.company} ${t.model}<br><button class="ghost" onclick="toggle(${t.id})">Remove</button></th>`).join('')}</tr></thead><tbody>`;
  rows.forEach(r => {
    const b = r[2] ? best(r[1], r[2]) : [];
    h += `<tr><th>${r[0]}</th>${L.map((t, i) => `<td class="${b[i] ? 'best' : ''}">${r[3] ? r[3](t) : r[1](t)}</td>`).join('')}</tr>`;
  });
  h += `</tbody></table></div><div class="bars"><h3>Power comparison (HP)</h3>` +
    L.map(t => `<div class="bar"><span>${t.company} ${t.model}</span><i style="width:${t.hp / Math.max(...L.map(x => x.hp)) * 100}%;background:${t.colorHex === '#cbd5e1' ? '#64748b' : t.colorHex}"></i><b>${t.hp}</b></div>`).join('') + '</div>';
  $('#cmpOut').innerHTML = h + '<p class="note">Green cells show the best value in each row. The score weighs power, lift, cylinders, rpm, drive and value for money.</p>';
}

/* ---------- find my tractor (requirement matching) ---------- */
function runMatch() {
  const [lo, hi] = $('#mSize').value.split('-').map(Number), bud = +$('#mBudget').value,
    dr = $('#mDrive').value, cy = $('#mCyl').value;
  const r = T.filter(t => t.hp >= lo && t.hp <= hi && t.priceLakh <= bud && (!dr || t.drive === dr) && (!cy || t.cylinders == cy))
    .sort((a, b) => b.score - a.score);
  $('#mOut').innerHTML = r.length ? r.map(card).join('') :
    '<p class="empty">No tractor fits all of these. Raise the budget or choose "Any" for drive or cylinders.</p>';
}
$('#mForm').addEventListener('submit', e => { e.preventDefault(); runMatch(); });

/* ---------- tabs ---------- */
function show(id) {
  $$('.tab').forEach(s => s.classList.toggle('on', s.id === id));
  $$('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === id));
  if (id === 'compare') renderCompare();
  if (id === 'viewer') { init3d(); loadModel(+$('#vSel').value); }
  if (id === 'match') runMatch();
}
$$('nav button').forEach(b => b.onclick = () => show(b.dataset.tab));
function view3d(id) { $('#vSel').value = id; show('viewer'); }

/* ---------- 3D viewer (Three.js) ---------- */
let renderer, scene, camera, model, drag = false, px = 0, dist = 7;
function init3d() {
  if (renderer) { resize(); return; }
  if (typeof THREE === 'undefined') { $('.v-stage').insertAdjacentHTML('afterbegin', '<p class="empty">Three.js could not load. Check your internet connection.</p>'); return; }
  const cv = $('#c3d');
  renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, .65));
  const d = new THREE.DirectionalLight(0xffffff, .9); d.position.set(5, 8, 6); scene.add(d);
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, .05, 48), new THREE.MeshStandardMaterial({ color: 0x6b7a5a }));
  ground.position.y = -.03; scene.add(ground);
  cv.addEventListener('pointerdown', e => { drag = true; px = e.clientX; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointerup', () => drag = false);
  cv.addEventListener('pointermove', e => { if (drag && model) { model.rotation.y += (e.clientX - px) * .01; px = e.clientX; } });
  cv.addEventListener('wheel', e => { e.preventDefault(); dist = Math.min(14, Math.max(3, dist + e.deltaY * .005)); }, { passive: false });
  window.addEventListener('resize', resize);
  $('#vSel').addEventListener('change', () => loadModel(+$('#vSel').value));
  resize();
  (function loop() {
    requestAnimationFrame(loop);
    if (!$('#viewer').classList.contains('on')) return;
    if (model && !drag) model.rotation.y += .004;
    camera.position.set(0, dist * .45, dist); camera.lookAt(0, 1, 0);
    renderer.render(scene, camera);
  })();
}
function resize() {
  const s = $('.v-stage'); if (!renderer || !s.clientWidth) return;
  renderer.setSize(s.clientWidth, s.clientHeight, false);
  camera.aspect = s.clientWidth / s.clientHeight; camera.updateProjectionMatrix();
}
function buildTractor(t) {
  const g = new THREE.Group(), col = new THREE.Color(t.colorHex);
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .5, metalness: .3 }, o || {}));
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; };
  const hoodL = 1.2 + t.cylinders * .3, cabL = 1.5, L = hoodL + cabL;        // front is +x
  box(L, .3, 1.0, M(0x222222), 0, .6, 0);                                      // chassis
  box(hoodL, .85, .95, M(col), L / 2 - hoodL / 2, 1.2, 0);                     // hood (longer with more cylinders)
  box(.08, .7, .8, M(0x111111), L / 2, 1.2, 0);                                // grill
  box(cabL - .1, 1.25, 1.0, M(0xaed6e6, { transparent: true, opacity: .45 }), -L / 2 + cabL / 2, 1.85, 0); // cab glass
  box(cabL + .1, .1, 1.1, M(col), -L / 2 + cabL / 2, 2.52, 0);                 // roof
  box(.45, .1, .45, M(0x333333), -L / 2 + .7, 1.35, 0); box(.1, .5, .45, M(0x333333), -L / 2 + .5, 1.6, 0); // seat
  const ex = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .9, 12), M(0x111111)); ex.position.set(L / 2 - .5, 2.05, .25); g.add(ex);
  const wheel = (r, w, x, z) => {
    const w0 = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 28), M(0x151515, { roughness: .9 }));
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * .55, r * .55, w + .02, 20), M(col));
    w0.add(tire, rim); w0.rotation.x = Math.PI / 2; w0.position.set(x, r, z); g.add(w0);
  };
  const fr = t.drive === '4WD' ? .62 : .42, rr = .88;
  [.82, -.82].forEach(z => { wheel(rr, .5, -L / 2 + .6, z); wheel(fr, .35, L / 2 - .5, z * .9); });
  g.scale.setScalar(.8 + Math.min(t.hp, 350) / 350 * .5);                       // size follows HP
  g.position.y = 0;
  return g;
}
function loadModel(id) {
  if (!renderer) return;
  const t = T.find(x => x.id === id); if (!t) return;
  if (model) scene.remove(model);
  model = buildTractor(t); model.rotation.y = -.6; scene.add(model);
  $('#vSpecs').innerHTML = `<h3>${t.company} ${t.model}</h3>` + specRows(t);
}

/* ---------- login (Spring Boot /api/auth, offline fallback) ---------- */
function renderUser() {
  $('#loginBtn').textContent = user ? 'Log out (' + user.username + ')' : 'Log in';
}
$('#loginBtn').onclick = () => {
  if (user) { user = null; localStorage.removeItem('tc_user'); renderUser(); return; }
  $('#aErr').textContent = ''; $('#authModal').showModal();
};
$('#aSwap').onclick = () => {
  authMode = authMode === 'login' ? 'register' : 'login';
  $('#authTitle').textContent = $('#aGo').textContent = authMode === 'login' ? 'Log in' : 'Create account';
  $('#aSwap').textContent = authMode === 'login' ? 'Create an account' : 'I already have an account';
};
$('#authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = { username: $('#aUser').value, password: $('#aPass').value };
  try {
    const r = await fetch(API + '/auth/' + authMode, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!r.ok) { $('#aErr').textContent = d.error || 'Login failed'; return; }
    user = d;
  } catch (err) { user = { username: body.username + ' (demo)', token: 'offline' }; }
  localStorage.setItem('tc_user', JSON.stringify(user));
  renderUser(); $('#authModal').close();
});

load();
