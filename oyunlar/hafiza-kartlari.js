// Hafıza Kartları – 16 kart, 8 çift. En az hamlede hepsini eşleştir.
(function () {
  const EMOJILER = ["🍎", "🍌", "🍇", "🍒", "🍉", "🍋", "🥝", "🍓"];
  const kutu = document.getElementById("oyun");

  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("hafiza-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="hk-hamle">0</b><span>Hamle</span></div>
      <div class="stat"><b id="hk-eslesen">0/8</b><span>Eşleşen</span></div>
      <div class="stat"><b id="hk-enIyi">${enIyi || "-"}</b><span>En iyi</span></div>
    </div>
    <div class="kart-grid" id="hk-grid"></div>
    <div class="result" id="hk-sonuc"></div>
    <button class="big alt" id="hk-yeni" style="margin-top:12px">Yeni oyun</button>
  `;

  const gridEl = document.getElementById("hk-grid");
  const hamleEl = document.getElementById("hk-hamle");
  const eslesenEl = document.getElementById("hk-eslesen");
  const enIyiEl = document.getElementById("hk-enIyi");
  const sonucEl = document.getElementById("hk-sonuc");

  let kartlar = [];
  let birinci = null;
  let kilit = false;
  let hamle = 0;
  let eslesen = 0;

  function karistir(dizi) {
    const a = dizi.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const gecici = a[i]; a[i] = a[j]; a[j] = gecici;
    }
    return a;
  }

  function goster(k) {
    k.el.textContent = k.emoji;
    k.el.classList.add("acik");
  }
  function gizle(k) {
    k.el.textContent = "?";
    k.el.classList.remove("acik");
  }

  function yeni() {
    hamle = 0; eslesen = 0; birinci = null; kilit = false;
    hamleEl.textContent = "0";
    eslesenEl.textContent = "0/8";
    sonucEl.textContent = "";
    gridEl.innerHTML = "";

    kartlar = karistir(EMOJILER.concat(EMOJILER)).map(function (emoji, i) {
      const el = document.createElement("button");
      el.className = "kart";
      el.textContent = "?";
      el.setAttribute("aria-label", "Kart " + (i + 1));
      gridEl.appendChild(el);
      const k = { emoji: emoji, el: el, acik: false, bulundu: false };
      hizliTikla(el, function () { sec(k); });
      return k;
    });
  }

  function sec(k) {
    if (kilit || k.acik || k.bulundu) return;
    k.acik = true;
    goster(k);

    if (!birinci) { birinci = k; return; }

    hamle++;
    hamleEl.textContent = hamle;
    const ilk = birinci;
    birinci = null;

    if (ilk.emoji === k.emoji) {
      ilk.bulundu = k.bulundu = true;
      ilk.el.classList.add("bulundu");
      k.el.classList.add("bulundu");
      eslesen++;
      eslesenEl.textContent = eslesen + "/8";
      if (eslesen === EMOJILER.length) bitir();
    } else {
      kilit = true;
      setTimeout(function () {
        ilk.acik = false; k.acik = false;
        gizle(ilk); gizle(k);
        kilit = false;
      }, 800);
    }
  }

  function bitir() {
    let mesaj = "Tebrikler! " + hamle + " hamlede bitirdin.";
    if (!enIyi || hamle < enIyi) {
      enIyi = hamle;
      enIyiEl.textContent = enIyi;
      try { localStorage.setItem("hafiza-en-iyi", String(enIyi)); } catch (e) {}
      mesaj += " 🏆 Yeni rekor!";
    }
    sonucEl.textContent = mesaj;
  }

  hizliTikla(document.getElementById("hk-yeni"), yeni);
  yeni();
})();
