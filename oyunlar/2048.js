// 2048 – Kaydırarak aynı sayıları birleştir, 2048'e ulaş.
(function () {
  const N = 4;
  const kutu = document.getElementById("oyun");

  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("2048-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="g2-skor">0</b><span>Skor</span></div>
      <div class="stat"><b id="g2-enIyi">${enIyi}</b><span>Rekor</span></div>
    </div>
    <div class="g2048-tahta" id="g2-tahta"></div>
    <div class="dpad">
      <button class="dpad-btn yukari" id="g2-yukari" aria-label="Yukarı">▲</button>
      <button class="dpad-btn sol" id="g2-sol" aria-label="Sol">◀</button>
      <button class="dpad-btn sag" id="g2-sag" aria-label="Sağ">▶</button>
      <button class="dpad-btn asagi" id="g2-asagi" aria-label="Aşağı">▼</button>
    </div>
    <div class="result" id="g2-sonuc"></div>
    <button class="big alt" id="g2-yeni" style="margin-top:8px">Yeni oyun</button>
  `;

  const tahtaEl = document.getElementById("g2-tahta");
  const skorEl = document.getElementById("g2-skor");
  const enIyiEl = document.getElementById("g2-enIyi");
  const sonucEl = document.getElementById("g2-sonuc");

  const hucreler = [];
  for (let i = 0; i < N * N; i++) {
    const h = document.createElement("div");
    h.className = "g2048-hucre";
    tahtaEl.appendChild(h);
    hucreler.push(h);
  }

  let tahta, skor, bitti, kazandi;

  function rastgeleEkle() {
    const bos = [];
    tahta.forEach(function (v, i) { if (!v) bos.push(i); });
    if (!bos.length) return;
    const yer = bos[Math.floor(Math.random() * bos.length)];
    tahta[yer] = Math.random() < 0.9 ? 2 : 4;
  }

  function ciz() {
    for (let i = 0; i < N * N; i++) {
      const v = tahta[i];
      hucreler[i].textContent = v ? String(v) : "";
      hucreler[i].className = "g2048-hucre" + (v ? " v" + (v > 2048 ? "buyuk" : v) : "");
    }
    skorEl.textContent = skor;
  }

  // Bir satırı başa doğru kaydırır ve aynı sayıları birleştirir.
  function satirKaydir(dizi) {
    const a = dizi.filter(Boolean);
    let puan = 0;
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] === a[i + 1]) {
        a[i] *= 2;
        puan += a[i];
        a.splice(i + 1, 1);
      }
    }
    while (a.length < N) a.push(0);
    return { satir: a, puan: puan };
  }

  // k. çizginin hücre numaraları; hareket yönünde ilk eleman başa gelir.
  function cizgi(yon, k) {
    const idx = [];
    for (let j = 0; j < N; j++) {
      if (yon === "sol") idx.push(k * N + j);
      else if (yon === "sag") idx.push(k * N + (N - 1 - j));
      else if (yon === "yukari") idx.push(j * N + k);
      else idx.push((N - 1 - j) * N + k);
    }
    return idx;
  }

  function hamleVarMi() {
    for (let i = 0; i < N * N; i++) {
      if (!tahta[i]) return true;
      const x = i % N, y = Math.floor(i / N);
      if (x < N - 1 && tahta[i] === tahta[i + 1]) return true;
      if (y < N - 1 && tahta[i] === tahta[i + N]) return true;
    }
    return false;
  }

  function hareket(yon) {
    if (bitti) return;
    let degisti = false, puan = 0;
    for (let k = 0; k < N; k++) {
      const idx = cizgi(yon, k);
      const sonuc = satirKaydir(idx.map(function (i) { return tahta[i]; }));
      sonuc.satir.forEach(function (v, j) {
        if (tahta[idx[j]] !== v) degisti = true;
        tahta[idx[j]] = v;
      });
      puan += sonuc.puan;
    }
    if (!degisti) return;

    skor += puan;
    rastgeleEkle();
    ciz();

    if (skor > enIyi) {
      enIyi = skor;
      enIyiEl.textContent = enIyi;
      try { localStorage.setItem("2048-en-iyi", String(enIyi)); } catch (e) {}
    }
    if (!kazandi && tahta.some(function (v) { return v >= 2048; })) {
      kazandi = true;
      sonucEl.textContent = "🎉 2048'e ulaştın! İstersen devam edebilirsin.";
    }
    if (!hamleVarMi()) {
      bitti = true;
      sonucEl.textContent = "Oyun bitti! Skor: " + skor;
    }
  }

  function yeni() {
    tahta = new Array(N * N).fill(0);
    skor = 0; bitti = false; kazandi = false;
    sonucEl.textContent = "";
    rastgeleEkle();
    rastgeleEkle();
    ciz();
  }

  // Bilgisayar klavyesi
  document.addEventListener("keydown", function (e) {
    const harita = { ArrowUp: "yukari", ArrowDown: "asagi", ArrowLeft: "sol", ArrowRight: "sag" };
    const yon = harita[e.key];
    if (yon) { e.preventDefault(); hareket(yon); }
  });

  // Telefon: tahta üzerinde kaydırma
  let bx = 0, by = 0;
  tahtaEl.addEventListener("touchstart", function (e) {
    bx = e.touches[0].clientX; by = e.touches[0].clientY;
  }, { passive: true });
  tahtaEl.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  tahtaEl.addEventListener("touchend", function (e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - bx, dy = t.clientY - by;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) hareket(dx > 0 ? "sag" : "sol");
    else hareket(dy > 0 ? "asagi" : "yukari");
  }, { passive: false });

  // Ekrandaki yön tuşları
  hizliTikla(document.getElementById("g2-yukari"), function () { hareket("yukari"); });
  hizliTikla(document.getElementById("g2-asagi"), function () { hareket("asagi"); });
  hizliTikla(document.getElementById("g2-sol"), function () { hareket("sol"); });
  hizliTikla(document.getElementById("g2-sag"), function () { hareket("sag"); });
  hizliTikla(document.getElementById("g2-yeni"), yeni);

  yeni();
})();
