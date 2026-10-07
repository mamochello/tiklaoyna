// Yılan – klasik oyun. Ok tuşları, kaydırma veya ekrandaki tuşlarla oynanır.
(function () {
  const N = 15;          // 15x15 ızgara
  const HUCRE = 20;      // piksel
  const kutu = document.getElementById("oyun");

  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("yilan-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="yl-skor">0</b><span>Skor</span></div>
      <div class="stat"><b id="yl-enIyi">${enIyi}</b><span>Rekor</span></div>
    </div>
    <canvas id="yl-tuval" class="yilan-tuval" width="${N * HUCRE}" height="${N * HUCRE}"></canvas>
    <div class="dpad">
      <button class="dpad-btn yukari" id="yl-yukari" aria-label="Yukarı">▲</button>
      <button class="dpad-btn sol" id="yl-sol" aria-label="Sol">◀</button>
      <button class="dpad-btn sag" id="yl-sag" aria-label="Sağ">▶</button>
      <button class="dpad-btn asagi" id="yl-asagi" aria-label="Aşağı">▼</button>
    </div>
    <div class="result" id="yl-sonuc"></div>
    <button class="big" id="yl-basla" style="margin-top:8px">Başla!</button>
  `;

  const tuval = document.getElementById("yl-tuval");
  const ctx = tuval.getContext ? tuval.getContext("2d") : null;
  const skorEl = document.getElementById("yl-skor");
  const enIyiEl = document.getElementById("yl-enIyi");
  const sonucEl = document.getElementById("yl-sonuc");
  const baslaBtn = document.getElementById("yl-basla");

  let yilan, yon, sonraki, yem, skor, calisiyor, zamanlayici;

  function yemKoy() {
    let p;
    do {
      p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) };
    } while (yilan.some(function (s) { return s.x === p.x && s.y === p.y; }));
    yem = p;
  }

  function sifirla() {
    const orta = Math.floor(N / 2);
    yilan = [{ x: orta, y: orta }, { x: orta - 1, y: orta }, { x: orta - 2, y: orta }];
    yon = { x: 1, y: 0 };
    sonraki = { x: 1, y: 0 };
    skor = 0;
    skorEl.textContent = "0";
    sonucEl.textContent = "";
    yemKoy();
    ciz();
  }

  function ciz() {
    if (!ctx) return;
    ctx.fillStyle = "#0f1226";
    ctx.fillRect(0, 0, tuval.width, tuval.height);

    // yem
    ctx.fillStyle = "#ff5d8f";
    ctx.beginPath();
    ctx.arc(yem.x * HUCRE + HUCRE / 2, yem.y * HUCRE + HUCRE / 2, HUCRE / 2 - 3, 0, Math.PI * 2);
    ctx.fill();

    // yılan
    yilan.forEach(function (s, i) {
      ctx.fillStyle = i === 0 ? "#ffb703" : "#4cc9f0";
      ctx.fillRect(s.x * HUCRE + 1, s.y * HUCRE + 1, HUCRE - 2, HUCRE - 2);
    });
  }

  function bekleme() {
    return Math.max(70, 140 - skor * 4);
  }

  function adim() {
    yon = sonraki;
    const bas = { x: yilan[0].x + yon.x, y: yilan[0].y + yon.y };

    if (bas.x < 0 || bas.y < 0 || bas.x >= N || bas.y >= N) return bitir();

    const yedi = bas.x === yem.x && bas.y === yem.y;
    const govde = yedi ? yilan : yilan.slice(0, -1);
    if (govde.some(function (s) { return s.x === bas.x && s.y === bas.y; })) return bitir();

    yilan.unshift(bas);
    if (yedi) {
      skor++;
      skorEl.textContent = skor;
      if (yilan.length >= N * N) { ciz(); return bitir(true); }
      yemKoy();
    } else {
      yilan.pop();
    }
    ciz();
    zamanlayici = setTimeout(adim, bekleme());
  }

  function bitir(kazandi) {
    calisiyor = false;
    clearTimeout(zamanlayici);
    let mesaj = (kazandi ? "🎉 Tüm alanı doldurdun! " : "Oyun bitti! ") + "Skor: " + skor;
    if (skor > enIyi) {
      enIyi = skor;
      enIyiEl.textContent = enIyi;
      try { localStorage.setItem("yilan-en-iyi", String(enIyi)); } catch (e) {}
      mesaj += " 🏆 Yeni rekor!";
    }
    sonucEl.textContent = mesaj;
    baslaBtn.textContent = "Tekrar oyna";
  }

  function baslat() {
    clearTimeout(zamanlayici);
    sifirla();
    calisiyor = true;
    baslaBtn.textContent = "Yeniden başla";
    zamanlayici = setTimeout(adim, bekleme());
  }

  function yonVer(dx, dy) {
    if (!calisiyor) return;
    // Aynı anda tersine dönmeyi engelle (kendi üstüne çarpmasın)
    if (dx === -yon.x && dy === -yon.y) return;
    sonraki = { x: dx, y: dy };
  }

  // Bilgisayar klavyesi
  document.addEventListener("keydown", function (e) {
    const harita = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0]
    };
    const y = harita[e.key];
    if (y) { e.preventDefault(); yonVer(y[0], y[1]); }
  });

  // Telefon: tuval üzerinde kaydırma
  let bx = 0, by = 0;
  tuval.addEventListener("touchstart", function (e) {
    bx = e.touches[0].clientX; by = e.touches[0].clientY;
  }, { passive: true });
  tuval.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  tuval.addEventListener("touchend", function (e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    const dx = t.clientX - bx, dy = t.clientY - by;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) yonVer(dx > 0 ? 1 : -1, 0);
    else yonVer(0, dy > 0 ? 1 : -1);
  }, { passive: false });

  // Ekrandaki yön tuşları
  hizliTikla(document.getElementById("yl-yukari"), function () { yonVer(0, -1); });
  hizliTikla(document.getElementById("yl-asagi"), function () { yonVer(0, 1); });
  hizliTikla(document.getElementById("yl-sol"), function () { yonVer(-1, 0); });
  hizliTikla(document.getElementById("yl-sag"), function () { yonVer(1, 0); });
  hizliTikla(baslaBtn, baslat);

  calisiyor = false;
  sifirla();
})();
