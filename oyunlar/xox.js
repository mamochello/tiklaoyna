// XOX (Tic-Tac-Toe) – bilgisayara karşı
(function () {
  const kutu = document.getElementById("oyun");
  let skor = { ben: 0, pc: 0, ber: 0 };
  try { const k = JSON.parse(localStorage.getItem("xox-skor")); if (k && typeof k.ben === "number") skor = k; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="x-ben">${skor.ben}</b><span>Sen (X)</span></div>
      <div class="stat"><b id="x-ber">${skor.ber}</b><span>Berabere</span></div>
      <div class="stat"><b id="x-pc">${skor.pc}</b><span>Bilgisayar (O)</span></div>
    </div>
    <div class="x-tahta" id="x-tahta"></div>
    <div class="x-zorluk">
      <button class="x-z" data-z="kolay">Kolay</button>
      <button class="x-z" data-z="zor">Zor</button>
    </div>
    <div class="result" id="x-sonuc">Sıra sende!</div>
    <button class="big" id="x-yeni" style="margin-top:8px">Yeni oyun</button>
  `;
  const tahtaEl = document.getElementById("x-tahta");
  const sonucEl = document.getElementById("x-sonuc");
  const yeniBtn = document.getElementById("x-yeni");
  const zBtn = Array.prototype.slice.call(kutu.querySelectorAll(".x-z"));
  let zorluk = "kolay";
  try { zorluk = localStorage.getItem("xox-zorluk") === "zor" ? "zor" : "kolay"; } catch (e) {}

  const HATLAR = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let t = Array(9).fill(""), bitti = false, bekliyor = false, nesil = 0;
  const hucre = [];

  for (let i = 0; i < 9; i++) {
    const b = document.createElement("button");
    b.className = "x-hucre";
    tahtaEl.appendChild(b);
    hizliTikla(b, function () { hamle(i); });
    hucre.push(b);
  }
  zBtn.forEach(function (b) {
    hizliTikla(b, function () {
      zorluk = b.getAttribute("data-z");
      try { localStorage.setItem("xox-zorluk", zorluk); } catch (e) {}
      zGuncelle(); yeni();
    });
  });
  function zGuncelle() { zBtn.forEach(function (b) { b.classList.toggle("secili", b.getAttribute("data-z") === zorluk); }); }

  function kazanan(d) {
    for (const h of HATLAR) if (d[h[0]] && d[h[0]] === d[h[1]] && d[h[1]] === d[h[2]]) return d[h[0]];
    return d.every(function (x) { return x; }) ? "B" : "";
  }

  function minimax(d, sira) {
    const k = kazanan(d);
    if (k === "O") return 1;
    if (k === "X") return -1;
    if (k === "B") return 0;
    let en = sira === "O" ? -2 : 2;
    for (let i = 0; i < 9; i++) {
      if (d[i]) continue;
      d[i] = sira;
      const p = minimax(d, sira === "O" ? "X" : "O");
      d[i] = "";
      en = sira === "O" ? Math.max(en, p) : Math.min(en, p);
    }
    return en;
  }

  function pcHamle() {
    const bos = [];
    for (let i = 0; i < 9; i++) if (!t[i]) bos.push(i);
    if (zorluk === "kolay" && Math.random() < 0.6) return bos[Math.floor(Math.random() * bos.length)];
    let en = -2, secim = [];
    for (const i of bos) {
      t[i] = "O";
      const p = minimax(t, "X");
      t[i] = "";
      if (p > en) { en = p; secim = [i]; } else if (p === en) secim.push(i);
    }
    return secim[Math.floor(Math.random() * secim.length)];
  }

  function ciz() {
    for (let i = 0; i < 9; i++) {
      hucre[i].textContent = t[i];
      hucre[i].className = "x-hucre" + (t[i] === "X" ? " x" : t[i] === "O" ? " o" : "");
    }
  }

  function kaydet() { try { localStorage.setItem("xox-skor", JSON.stringify(skor)); } catch (e) {} }
  function skorYaz() {
    document.getElementById("x-ben").textContent = skor.ben;
    document.getElementById("x-pc").textContent = skor.pc;
    document.getElementById("x-ber").textContent = skor.ber;
  }

  function kontrol() {
    const k = kazanan(t);
    if (!k) return false;
    bitti = true;
    if (k === "X") { skor.ben++; sonucEl.textContent = "🎉 Kazandın!"; }
    else if (k === "O") { skor.pc++; sonucEl.textContent = "Bilgisayar kazandı."; }
    else { skor.ber++; sonucEl.textContent = "Berabere!"; }
    for (const h of HATLAR) if (t[h[0]] && t[h[0]] === t[h[1]] && t[h[1]] === t[h[2]]) h.forEach(function (i) { hucre[i].classList.add("kazan"); });
    skorYaz(); kaydet();
    return true;
  }

  function hamle(i) {
    if (bitti || bekliyor || t[i]) return;
    t[i] = "X"; ciz();
    if (kontrol()) return;
    bekliyor = true;
    sonucEl.textContent = "Bilgisayar düşünüyor…";
    const n = nesil;
    setTimeout(function () {
      if (n !== nesil) return;
      t[pcHamle()] = "O"; ciz();
      bekliyor = false;
      if (!kontrol()) sonucEl.textContent = "Sıra sende!";
    }, 350);
  }

  function yeni() {
    nesil++;
    t = Array(9).fill(""); bitti = false; bekliyor = false;
    sonucEl.textContent = "Sıra sende!";
    ciz();
  }
  hizliTikla(yeniBtn, yeni);
  zGuncelle(); ciz();
})();
