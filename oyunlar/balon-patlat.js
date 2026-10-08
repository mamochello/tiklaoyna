// Balon Patlat – 30 saniyede yükselen balonlara dokun. Küçük balonlar 2 puan!
(function () {
  const W = 300, H = 400;
  const SURE = 30; // saniye
  const RENKLER = ["#ff5d8f", "#4cc9f0", "#ffb703", "#2dc653", "#b388ff", "#ff8fab"];
  const kutu = document.getElementById("oyun");

  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("balon-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="bl-skor">0</b><span>Skor</span></div>
      <div class="stat"><b id="bl-sure">${SURE}</b><span>Saniye</span></div>
      <div class="stat"><b id="bl-enIyi">${enIyi}</b><span>Rekor</span></div>
    </div>
    <canvas id="bl-tuval" class="balon-tuval" width="${W}" height="${H}"></canvas>
    <div class="result" id="bl-sonuc">Küçük balon 2 puan, büyük balon 1 puan.</div>
    <button class="big" id="bl-basla" style="margin-top:8px">Başla!</button>
  `;

  const tuval = document.getElementById("bl-tuval");
  const ctx = tuval.getContext ? tuval.getContext("2d") : null;
  const skorEl = document.getElementById("bl-skor");
  const sureEl = document.getElementById("bl-sure");
  const enIyiEl = document.getElementById("bl-enIyi");
  const sonucEl = document.getElementById("bl-sonuc");
  const baslaBtn = document.getElementById("bl-basla");

  let balonlar = [], efektler = [], skor = 0, oyun = false, nesil = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function balonEkle() {
    const r = rnd(22, 36);
    balonlar.push({
      x: rnd(r, W - r), y: H + r, r: r,
      hiz: rnd(1.2, 2.6) + (36 - r) * 0.03,
      renk: RENKLER[Math.floor(Math.random() * RENKLER.length)],
      puan: r < 28 ? 2 : 1
    });
  }

  function ciz() {
    if (!ctx) return;
    ctx.fillStyle = "#0f1226";
    ctx.fillRect(0, 0, W, H);

    balonlar.forEach(function (b) {
      // ip
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.r);
      ctx.lineTo(b.x, b.y + b.r + 14);
      ctx.stroke();
      // balon
      ctx.fillStyle = b.renk;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      // parlama
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    });

    efektler.forEach(function (e) {
      ctx.strokeStyle = "rgba(255,255,255," + (1 - e.t / 200).toFixed(2) + ")";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10 + e.t / 6, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  function vur(x, y) {
    if (!oyun) return;
    for (let i = balonlar.length - 1; i >= 0; i--) {
      const b = balonlar[i];
      const dx = x - b.x, dy = y - b.y;
      if (dx * dx + dy * dy <= (b.r + 8) * (b.r + 8)) {
        balonlar.splice(i, 1);
        efektler.push({ x: b.x, y: b.y, t: 0 });
        skor += b.puan;
        skorEl.textContent = skor;
        return;
      }
    }
  }

  function koordinat(clientX, clientY) {
    const r = tuval.getBoundingClientRect ? tuval.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    const ox = W / (r.width || W), oy = H / (r.height || H);
    return { x: (clientX - r.left) * ox, y: (clientY - r.top) * oy };
  }

  function dongu(id) {
    let baslangic = 0, son = 0, birikim = 0, gosterilen = SURE;
    return function kare(ts) {
      if (id !== nesil || !oyun) return;
      if (!baslangic) { baslangic = ts; son = ts; }
      const dt = Math.min(ts - son, 100);
      son = ts;
      const gecen = ts - baslangic;

      const kalan = Math.max(0, Math.ceil((SURE * 1000 - gecen) / 1000));
      if (kalan !== gosterilen) { gosterilen = kalan; sureEl.textContent = kalan; }

      // balon üret (zamanla sıklaşır)
      birikim += dt;
      const aralik = Math.max(350, 800 - gecen / 60);
      while (birikim >= aralik) { balonEkle(); birikim -= aralik; }

      // hareket
      balonlar.forEach(function (b) { b.y -= b.hiz * dt / 16.67; });
      balonlar = balonlar.filter(function (b) { return b.y + b.r > 0; });
      efektler.forEach(function (e) { e.t += dt; });
      efektler = efektler.filter(function (e) { return e.t < 200; });

      ciz();

      if (gecen >= SURE * 1000) { bitir(); return; }
      requestAnimationFrame(kare);
    };
  }

  function bitir() {
    oyun = false;
    sureEl.textContent = "0";
    let mesaj = "Süre doldu! Skor: " + skor;
    if (skor > enIyi) {
      enIyi = skor;
      enIyiEl.textContent = enIyi;
      try { localStorage.setItem("balon-en-iyi", String(enIyi)); } catch (e) {}
      mesaj += " 🏆 Yeni rekor!";
    }
    sonucEl.textContent = mesaj;
    baslaBtn.textContent = "Tekrar oyna";
  }

  function baslat() {
    nesil++;
    balonlar = []; efektler = []; skor = 0; oyun = true;
    skorEl.textContent = "0";
    sureEl.textContent = String(SURE);
    sonucEl.textContent = "";
    baslaBtn.textContent = "Yeniden başla";
    requestAnimationFrame(dongu(nesil));
  }

  // Telefon: dokunuş (çoklu parmak desteği)
  tuval.addEventListener("touchstart", function (e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const p = koordinat(t.clientX, t.clientY);
      vur(p.x, p.y);
    }
  }, { passive: false });
  tuval.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });

  // Bilgisayar: fare
  tuval.addEventListener("mousedown", function (e) {
    const p = koordinat(e.clientX, e.clientY);
    vur(p.x, p.y);
  });

  hizliTikla(baslaBtn, baslat);
  ciz();
})();
