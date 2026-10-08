// Matematik Hızı – 30 saniyede kaç soruyu doğru bilebilirsin?
(function () {
  const SURE = 30;
  const CEZA = 2; // yanlış cevapta kaybedilen saniye
  const kutu = document.getElementById("oyun");

  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("matematik-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="mt-skor">0</b><span>Doğru</span></div>
      <div class="stat"><b id="mt-sure">${SURE}</b><span>Saniye</span></div>
      <div class="stat"><b id="mt-enIyi">${enIyi}</b><span>Rekor</span></div>
    </div>
    <div class="mt-soru" id="mt-soru">Hazır mısın?</div>
    <div class="mt-secenekler" id="mt-sec"></div>
    <div class="result" id="mt-sonuc"></div>
    <button class="big" id="mt-basla" style="margin-top:8px">Başla!</button>
  `;

  const skorEl = document.getElementById("mt-skor");
  const sureEl = document.getElementById("mt-sure");
  const enIyiEl = document.getElementById("mt-enIyi");
  const soruEl = document.getElementById("mt-soru");
  const secEl = document.getElementById("mt-sec");
  const sonucEl = document.getElementById("mt-sonuc");
  const baslaBtn = document.getElementById("mt-basla");

  let oynuyor = false, skor = 0, kalan = SURE, dogru = 0, nesil = 0;

  const butonlar = [];
  for (let i = 0; i < 4; i++) {
    const b = document.createElement("button");
    b.className = "mt-sec";
    b.textContent = "?";
    secEl.appendChild(b);
    hizliTikla(b, function () { cevapla(b); });
    butonlar.push(b);
  }

  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function yeniSoru() {
    const islem = rnd(0, 2);
    let a, b, cevap, isaret;
    if (islem === 0) { a = rnd(1, 50); b = rnd(1, 50); cevap = a + b; isaret = "+"; }
    else if (islem === 1) { a = rnd(2, 60); b = rnd(1, a); cevap = a - b; isaret = "−"; }
    else { a = rnd(2, 12); b = rnd(2, 12); cevap = a * b; isaret = "×"; }

    soruEl.textContent = a + " " + isaret + " " + b + " = ?";
    dogru = cevap;

    const secenekler = [cevap];
    let guvenlik = 0;
    while (secenekler.length < 4 && guvenlik++ < 100) {
      let d = rnd(-10, 10);
      if (d === 0) continue;
      const aday = cevap + d;
      if (aday >= 0 && secenekler.indexOf(aday) === -1) secenekler.push(aday);
    }
    // Yeterli farklı seçenek çıkmadıysa (çok küçük cevaplar) yukarı doğru tamamla
    for (let k = 1; secenekler.length < 4; k++) {
      if (secenekler.indexOf(cevap + 10 + k) === -1) secenekler.push(cevap + 10 + k);
    }
    for (let i = secenekler.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = secenekler[i]; secenekler[i] = secenekler[j]; secenekler[j] = t;
    }
    butonlar.forEach(function (b, i) { b.textContent = String(secenekler[i]); });
  }

  function cevapla(btn) {
    if (!oynuyor) return;
    if (Number(btn.textContent) === dogru) {
      skor++;
      skorEl.textContent = skor;
      sonucEl.textContent = "";
    } else {
      kalan = Math.max(0, kalan - CEZA);
      sureEl.textContent = kalan;
      sonucEl.textContent = "Yanlış! −" + CEZA + " saniye";
      if (kalan <= 0) { bitir(); return; }
    }
    yeniSoru();
  }

  function tik(id) {
    setTimeout(function () {
      if (id !== nesil || !oynuyor) return;
      kalan--;
      sureEl.textContent = kalan;
      if (kalan <= 0) bitir();
      else tik(id);
    }, 1000);
  }

  function bitir() {
    oynuyor = false;
    soruEl.textContent = "Süre doldu!";
    let mesaj = "Skor: " + skor + " doğru cevap.";
    if (skor > enIyi) {
      enIyi = skor;
      enIyiEl.textContent = enIyi;
      try { localStorage.setItem("matematik-en-iyi", String(enIyi)); } catch (e) {}
      mesaj += " 🏆 Yeni rekor!";
    }
    sonucEl.textContent = mesaj;
    baslaBtn.textContent = "Tekrar oyna";
  }

  function baslat() {
    nesil++;
    skor = 0; kalan = SURE; oynuyor = true;
    skorEl.textContent = "0";
    sureEl.textContent = String(kalan);
    sonucEl.textContent = "";
    baslaBtn.textContent = "Yeniden başla";
    yeniSoru();
    tik(nesil);
  }

  hizliTikla(baslaBtn, baslat);
})();
