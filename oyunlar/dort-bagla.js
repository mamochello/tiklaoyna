// Dört Bağla – bilgisayara karşı (7 sütun x 6 satır)
(function () {
  const S = 7, R = 6;
  const kutu = document.getElementById("oyun");
  let skor = { ben: 0, pc: 0, ber: 0 };
  try { const k = JSON.parse(localStorage.getItem("dort-skor")); if (k && typeof k.ben === "number") skor = k; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="d-ben">${skor.ben}</b><span>Sen (🔴)</span></div>
      <div class="stat"><b id="d-ber">${skor.ber}</b><span>Berabere</span></div>
      <div class="stat"><b id="d-pc">${skor.pc}</b><span>Bilgisayar (🟡)</span></div>
    </div>
    <div class="d-tahta" id="d-tahta"></div>
    <div class="result" id="d-sonuc">Bir sütuna dokunarak taşını bırak.</div>
    <button class="big" id="d-yeni" style="margin-top:8px">Yeni oyun</button>
  `;
  const tahtaEl = document.getElementById("d-tahta");
  const sonucEl = document.getElementById("d-sonuc");
  const yeniBtn = document.getElementById("d-yeni");

  let t, bitti, bekliyor, nesil = 0;
  const hucre = [];
  for (let r = 0; r < R; r++) {
    hucre.push([]);
    for (let c = 0; c < S; c++) {
      const h = document.createElement("button");
      h.className = "d-hucre";
      h.setAttribute("aria-label", (c + 1) + ". sütun");
      tahtaEl.appendChild(h);
      hizliTikla(h, (function (cc) { return function () { hamle(cc); }; })(c));
      hucre[r].push(h);
    }
  }

  function bosTahta() { return Array.from({ length: R }, function () { return Array(S).fill(0); }); }
  function satirBul(d, c) { for (let r = R - 1; r >= 0; r--) if (!d[r][c]) return r; return -1; }

  function dortVar(d, p) {
    const yon = [[0,1],[1,0],[1,1],[1,-1]];
    for (let r = 0; r < R; r++) for (let c = 0; c < S; c++) {
      if (d[r][c] !== p) continue;
      for (const y of yon) {
        const hat = [];
        let ok = true;
        for (let k = 0; k < 4; k++) {
          const rr = r + y[0] * k, cc = c + y[1] * k;
          if (rr < 0 || rr >= R || cc < 0 || cc >= S || d[rr][cc] !== p) { ok = false; break; }
          hat.push([rr, cc]);
        }
        if (ok) return hat;
      }
    }
    return null;
  }
  function dolu(d) { return d[0].every(function (x) { return x; }); }

  function pcSec() {
    const sutunlar = [];
    for (let c = 0; c < S; c++) if (satirBul(t, c) >= 0) sutunlar.push(c);
    // 1) kazanabiliyorsa kazan
    for (const c of sutunlar) { const r = satirBul(t, c); t[r][c] = 2; const k = dortVar(t, 2); t[r][c] = 0; if (k) return c; }
    // 2) rakibin kazanmasını engelle
    for (const c of sutunlar) { const r = satirBul(t, c); t[r][c] = 1; const k = dortVar(t, 1); t[r][c] = 0; if (k) return c; }
    // 3) rakibe kazanma fırsatı vermeyen, ortaya yakın sütunu seç
    const guvenli = sutunlar.filter(function (c) {
      const r = satirBul(t, c);
      if (r - 1 < 0) return true;
      t[r][c] = 2; t[r - 1][c] = 1;
      const k = dortVar(t, 1);
      t[r - 1][c] = 0; t[r][c] = 0;
      return !k;
    });
    const havuz = guvenli.length ? guvenli : sutunlar;
    havuz.sort(function (a, b) { return Math.abs(a - 3) - Math.abs(b - 3) + (Math.random() - 0.5); });
    return havuz[0];
  }

  function ciz() {
    for (let r = 0; r < R; r++) for (let c = 0; c < S; c++) {
      hucre[r][c].className = "d-hucre" + (t[r][c] === 1 ? " k" : t[r][c] === 2 ? " s" : "");
    }
  }
  function kaydet() { try { localStorage.setItem("dort-skor", JSON.stringify(skor)); } catch (e) {} }
  function skorYaz() {
    document.getElementById("d-ben").textContent = skor.ben;
    document.getElementById("d-pc").textContent = skor.pc;
    document.getElementById("d-ber").textContent = skor.ber;
  }

  function bitisKontrol(p) {
    const hat = dortVar(t, p);
    if (hat) {
      bitti = true;
      hat.forEach(function (x) { hucre[x[0]][x[1]].classList.add("kazan"); });
      if (p === 1) { skor.ben++; sonucEl.textContent = "🎉 Kazandın!"; }
      else { skor.pc++; sonucEl.textContent = "Bilgisayar kazandı."; }
      skorYaz(); kaydet();
      return true;
    }
    if (dolu(t)) { bitti = true; skor.ber++; sonucEl.textContent = "Berabere!"; skorYaz(); kaydet(); return true; }
    return false;
  }

  function hamle(c) {
    if (bitti || bekliyor) return;
    const r = satirBul(t, c);
    if (r < 0) return;
    t[r][c] = 1; ciz();
    if (bitisKontrol(1)) return;
    bekliyor = true;
    sonucEl.textContent = "Bilgisayar düşünüyor…";
    const n = nesil;
    setTimeout(function () {
      if (n !== nesil) return;
      const cc = pcSec();
      t[satirBul(t, cc)][cc] = 2; ciz();
      bekliyor = false;
      if (!bitisKontrol(2)) sonucEl.textContent = "Sıra sende!";
    }, 400);
  }

  function yeni() {
    nesil++;
    t = bosTahta(); bitti = false; bekliyor = false;
    sonucEl.textContent = "Bir sütuna dokunarak taşını bırak.";
    ciz();
  }
  hizliTikla(yeniBtn, yeni);
  yeni();
})();
