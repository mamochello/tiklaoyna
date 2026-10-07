// Tıkla Hızı – 10 saniyede kaç kez tıklayabilirsin?
(function () {
  const SURE = 10;
  const kutu = document.getElementById("oyun");

  let rekor = 0;
  try { rekor = Number(localStorage.getItem("tikla-hizi-rekor")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="th-sayi">0</b><span>Tıklama</span></div>
      <div class="stat"><b id="th-sure">${SURE}</b><span>Saniye</span></div>
      <div class="stat"><b id="th-rekor">${rekor}</b><span>Rekor</span></div>
    </div>
    <button class="big" id="th-btn">Başla!</button>
    <div class="result" id="th-sonuc"></div>
  `;

  const btn = document.getElementById("th-btn");
  const sayiEl = document.getElementById("th-sayi");
  const sureEl = document.getElementById("th-sure");
  const rekorEl = document.getElementById("th-rekor");
  const sonucEl = document.getElementById("th-sonuc");

  let durum = "bekle"; // bekle | oynuyor
  let sayi = 0;
  let kalan = SURE;
  let zamanlayici = null;

  function baslat() {
    durum = "oynuyor";
    sayi = 1;
    kalan = SURE;
    sayiEl.textContent = sayi;
    sureEl.textContent = kalan;
    sonucEl.textContent = "";
    btn.textContent = "TIKLA!";
    btn.classList.add("alt");

    zamanlayici = setInterval(function () {
      kalan--;
      sureEl.textContent = kalan;
      if (kalan <= 0) bitir();
    }, 1000);
  }

  function bitir() {
    clearInterval(zamanlayici);
    durum = "bekle";
    btn.classList.remove("alt");
    btn.textContent = "Tekrar oyna";

    const saniyedeKac = (sayi / SURE).toFixed(1);
    let mesaj = sayi + " tıklama! (saniyede " + saniyedeKac + ")";

    if (sayi > rekor) {
      rekor = sayi;
      rekorEl.textContent = rekor;
      try { localStorage.setItem("tikla-hizi-rekor", String(rekor)); } catch (e) {}
      mesaj += " 🏆 Yeni rekor!";
    }
    sonucEl.textContent = mesaj;
  }

  function tikla() {
    if (durum === "bekle") {
      baslat();
    } else {
      sayi++;
      sayiEl.textContent = sayi;
    }
  }

  // Bilgisayar: normal fare tıklaması
  btn.addEventListener("click", tikla);

  // Telefon: dokunuşu biz yakalarız, böylece hızlı tıklamada
  // tarayıcının "çift dokunmayla yakınlaştır" özelliği devreye girmez.
  kutu.style.touchAction = "manipulation";
  kutu.addEventListener("touchend", function (e) {
    e.preventDefault();
    if (e.target.closest("#th-btn")) tikla();
  }, { passive: false });
})();
