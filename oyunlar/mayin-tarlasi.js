// Mayın Tarlası – 9x9, 10 mayın
(function () {
  const N = 9, MAYIN = 10;
  const kutu = document.getElementById("oyun");
  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("mayin-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="m-kalan">${MAYIN}</b><span>Mayın</span></div>
      <div class="stat"><b id="m-sure">0</b><span>Saniye</span></div>
      <div class="stat"><b id="m-en">${enIyi || "–"}</b><span>Rekor (sn)</span></div>
    </div>
    <div class="m-tahta" id="m-tahta"></div>
    <div class="m-mod">
      <button class="m-m secili" id="m-ac">⛏️ Aç</button>
      <button class="m-m" id="m-bayrak">🚩 Bayrak</button>
    </div>
    <div class="result" id="m-sonuc">Bir kareye dokunarak başla. İlk dokunuş güvenlidir.</div>
    <button class="big" id="m-yeni" style="margin-top:8px">Yeni oyun</button>
  `;
  const tahtaEl = document.getElementById("m-tahta");
  const kalanEl = document.getElementById("m-kalan");
  const sureEl = document.getElementById("m-sure");
  const enEl = document.getElementById("m-en");
  const sonucEl = document.getElementById("m-sonuc");
  const acBtn = document.getElementById("m-ac");
  const bayrakBtn = document.getElementById("m-bayrak");
  const yeniBtn = document.getElementById("m-yeni");

  let mayin, acik, bayrak, baslamis, bitti, sure, zaman, bayrakModu = false;
  const hucre = [];

  for (let i = 0; i < N * N; i++) {
    const b = document.createElement("button");
    b.className = "m-hucre";
    tahtaEl.appendChild(b);
    hizliTikla(b, function () { tikla(i); });
    b.addEventListener("contextmenu", function (e) { e.preventDefault(); bayrakKoy(i); });
    hucre.push(b);
  }

  function komsular(i) {
    const r = Math.floor(i / N), c = i % N, liste = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < N && cc >= 0 && cc < N) liste.push(rr * N + cc);
    }
    return liste;
  }

  function mayinYerlestir(guvenli) {
    mayin = Array(N * N).fill(false);
    const yasak = [guvenli].concat(komsular(guvenli));
    let konan = 0;
    while (konan < MAYIN) {
      const i = Math.floor(Math.random() * N * N);
      if (mayin[i] || yasak.indexOf(i) >= 0) continue;
      mayin[i] = true; konan++;
    }
  }
  function say(i) { return komsular(i).filter(function (k) { return mayin[k]; }).length; }

  function ciz(i) {
    const h = hucre[i];
    let s = "m-hucre", y = "";
    if (acik[i]) {
      s += " acik";
      if (mayin[i]) { s += " patladi"; y = "💣"; }
      else { const n = say(i); if (n) { y = String(n); s += " n" + n; } }
    } else if (bayrak[i]) { y = "🚩"; }
    h.className = s; h.textContent = y;
  }
  function hepsiniCiz() { for (let i = 0; i < N * N; i++) ciz(i); }

  function ac(i) {
    const yigin = [i];
    while (yigin.length) {
      const k = yigin.pop();
      if (acik[k] || bayrak[k]) continue;
      acik[k] = true; ciz(k);
      if (!mayin[k] && say(k) === 0) komsular(k).forEach(function (x) { if (!acik[x]) yigin.push(x); });
    }
  }

  function bayrakSay() { return bayrak.filter(Boolean).length; }
  function bayrakKoy(i) {
    if (bitti || acik[i]) return;
    bayrak[i] = !bayrak[i];
    kalanEl.textContent = MAYIN - bayrakSay();
    ciz(i);
  }

  function saat() {
    clearInterval(zaman);
    zaman = setInterval(function () { sure++; sureEl.textContent = sure; }, 1000);
  }

  function tikla(i) {
    if (bitti) return;
    if (bayrakModu) { bayrakKoy(i); return; }
    if (acik[i] || bayrak[i]) return;
    if (!baslamis) { baslamis = true; mayinYerlestir(i); saat(); sonucEl.textContent = "Mayınlara dikkat!"; }
    if (mayin[i]) {
      bitti = true; clearInterval(zaman);
      for (let k = 0; k < N * N; k++) if (mayin[k]) acik[k] = true;
      hepsiniCiz();
      sonucEl.textContent = "💥 Mayına bastın! Tekrar dene.";
      return;
    }
    ac(i);
    let kalan = 0;
    for (let k = 0; k < N * N; k++) if (!mayin[k] && !acik[k]) kalan++;
    if (kalan === 0) {
      bitti = true; clearInterval(zaman);
      let m = "🎉 Tebrikler, " + sure + " saniyede bitirdin!";
      if (!enIyi || sure < enIyi) {
        enIyi = sure; enEl.textContent = sure;
        try { localStorage.setItem("mayin-en-iyi", String(sure)); } catch (e) {}
        m += " 🏆 Yeni rekor!";
      }
      sonucEl.textContent = m;
    }
  }

  function modGuncelle() {
    acBtn.classList.toggle("secili", !bayrakModu);
    bayrakBtn.classList.toggle("secili", bayrakModu);
  }
  hizliTikla(acBtn, function () { bayrakModu = false; modGuncelle(); });
  hizliTikla(bayrakBtn, function () { bayrakModu = true; modGuncelle(); });

  function yeni() {
    clearInterval(zaman);
    mayin = Array(N * N).fill(false);
    acik = Array(N * N).fill(false);
    bayrak = Array(N * N).fill(false);
    baslamis = false; bitti = false; sure = 0;
    sureEl.textContent = "0"; kalanEl.textContent = MAYIN;
    sonucEl.textContent = "Bir kareye dokunarak başla. İlk dokunuş güvenlidir.";
    hepsiniCiz();
  }
  hizliTikla(yeniBtn, yeni);
  yeni();
})();
