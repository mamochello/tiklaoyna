// Reaksiyon Testi – ekran yeşile dönünce olabildiğince hızlı dokun
(function () {
  const kutu = document.getElementById("oyun");
  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("reaksiyon-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="rt-son">–</b><span>Son (ms)</span></div>
      <div class="stat"><b id="rt-ort">–</b><span>Ortalama</span></div>
      <div class="stat"><b id="rt-en">${enIyi || "–"}</b><span>Rekor (ms)</span></div>
    </div>
    <button class="rt-alan rt-bekle" id="rt-alan">Başlamak için dokun</button>
    <div class="result" id="rt-sonuc">Ekran yeşile dönünce hemen dokun!</div>
  `;
  const alan = document.getElementById("rt-alan");
  const sonEl = document.getElementById("rt-son");
  const ortEl = document.getElementById("rt-ort");
  const enEl = document.getElementById("rt-en");
  const sonucEl = document.getElementById("rt-sonuc");

  let durum = "bos"; // bos, bekle, hazir
  let zamanlayici = null, baslangic = 0, sonuclar = [];

  function ayarla(sinif, yazi) {
    alan.className = "rt-alan " + sinif;
    alan.textContent = yazi;
  }

  function bekle() {
    durum = "bekle";
    ayarla("rt-kirmizi", "Bekle…");
    sonucEl.textContent = "Yeşili bekle, erken dokunma!";
    clearTimeout(zamanlayici);
    zamanlayici = setTimeout(function () {
      durum = "hazir";
      baslangic = performance.now();
      ayarla("rt-yesil", "ŞİMDİ!");
    }, 1500 + Math.random() * 2500);
  }

  function dokun() {
    if (durum === "bos") { bekle(); return; }
    if (durum === "bekle") {
      clearTimeout(zamanlayici);
      durum = "bos";
      ayarla("rt-bekle", "Çok erken! Tekrar dene");
      sonucEl.textContent = "Ekran yeşile dönmeden dokundun.";
      return;
    }
    if (durum === "hazir") {
      const ms = Math.round(performance.now() - baslangic);
      durum = "bos";
      sonuclar.push(ms);
      sonEl.textContent = ms;
      ortEl.textContent = Math.round(sonuclar.reduce(function (a, b) { return a + b; }, 0) / sonuclar.length);
      let mesaj = ms + " ms";
      if (!enIyi || ms < enIyi) {
        enIyi = ms;
        enEl.textContent = ms;
        try { localStorage.setItem("reaksiyon-en-iyi", String(ms)); } catch (e) {}
        mesaj += " 🏆 Yeni rekor!";
      }
      ayarla("rt-bekle", ms + " ms – tekrar için dokun");
      sonucEl.textContent = mesaj;
    }
  }
  hizliTikla(alan, dokun);
})();
