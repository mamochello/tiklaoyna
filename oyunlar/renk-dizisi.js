// Renk Dizisi – Yanan renkleri sırayla aklında tut ve aynı sırayla tekrar et.
(function () {
  const kutu = document.getElementById("oyun");

  let enIyi = 0;
  try { enIyi = Number(localStorage.getItem("renk-en-iyi")) || 0; } catch (e) {}

  kutu.innerHTML = `
    <div class="stats">
      <div class="stat"><b id="rd-seviye">0</b><span>Seviye</span></div>
      <div class="stat"><b id="rd-enIyi">${enIyi}</b><span>Rekor</span></div>
    </div>
    <div class="simon-grid" id="rd-grid"></div>
    <div class="result" id="rd-sonuc">Başla'ya bas ve renklere dikkat et.</div>
    <button class="big" id="rd-basla" style="margin-top:8px">Başla!</button>
  `;

  const gridEl = document.getElementById("rd-grid");
  const seviyeEl = document.getElementById("rd-seviye");
  const enIyiEl = document.getElementById("rd-enIyi");
  const sonucEl = document.getElementById("rd-sonuc");
  const baslaBtn = document.getElementById("rd-basla");

  let dizi = [], konum = 0, girisAcik = false, nesil = 0;

  const padler = [];
  for (let i = 0; i < 4; i++) {
    const p = document.createElement("button");
    p.className = "simon-pad p" + i;
    p.setAttribute("aria-label", "Renk " + (i + 1));
    gridEl.appendChild(p);
    hizliTikla(p, function () { padaBas(i); });
    padler.push(p);
  }

  function yak(i) { padler[i].classList.add("yan"); }
  function sondur(i) { padler[i].classList.remove("yan"); }

  function oynat(id, i) {
    if (id !== nesil) return;
    if (i >= dizi.length) {
      girisAcik = true;
      konum = 0;
      sonucEl.textContent = "Sıra sende!";
      return;
    }
    setTimeout(function () {
      if (id !== nesil) return;
      yak(dizi[i]);
      setTimeout(function () {
        sondur(dizi[i]);
        oynat(id, i + 1);
      }, 400);
    }, 250);
  }

  function sonrakiTur(id) {
    if (id !== nesil) return;
    dizi.push(Math.floor(Math.random() * 4));
    seviyeEl.textContent = dizi.length;
    girisAcik = false;
    sonucEl.textContent = "Dikkatle izle…";
    oynat(id, 0);
  }

  function padaBas(i) {
    if (!girisAcik) return;
    yak(i);
    setTimeout(function () { sondur(i); }, 200);

    if (i !== dizi[konum]) { bitir(); return; }
    konum++;
    if (konum === dizi.length) {
      girisAcik = false;
      sonucEl.textContent = "Doğru! 👏";
      const id = nesil;
      setTimeout(function () { sonrakiTur(id); }, 800);
    }
  }

  function bitir() {
    girisAcik = false;
    nesil++; // bekleyen zamanlayıcıları geçersiz kıl
    const seviye = dizi.length - 1; // tamamlanan son seviye
    let mesaj = "Yanlış renk! " + Math.max(0, seviye) + " seviye tamamladın.";
    if (seviye > enIyi) {
      enIyi = seviye;
      enIyiEl.textContent = enIyi;
      try { localStorage.setItem("renk-en-iyi", String(enIyi)); } catch (e) {}
      mesaj += " 🏆 Yeni rekor!";
    }
    sonucEl.textContent = mesaj;
    baslaBtn.textContent = "Tekrar oyna";
  }

  function baslat() {
    nesil++;
    dizi = [];
    konum = 0;
    girisAcik = false;
    seviyeEl.textContent = "0";
    baslaBtn.textContent = "Yeniden başla";
    padler.forEach(function (_, i) { sondur(i); });
    const id = nesil;
    setTimeout(function () { sonrakiTur(id); }, 400);
  }

  hizliTikla(baslaBtn, baslat);
})();
