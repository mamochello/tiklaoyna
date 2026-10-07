// Kelime Bulmaca – 6 denemede 5 harfli gizli kelimeyi bul.
(function () {
  const KELIMELER = [
    "ARABA", "BALIK", "BAHAR", "BEBEK", "BUGÜN", "ÇİÇEK", "ÇOCUK", "DENİZ", "DOLAP", "DÜNYA",
    "ELMAS", "EKMEK", "FİDAN", "GÜNEŞ", "GÜZEL", "HAYAT", "İNSAN", "KALEM", "KAPAK", "KİTAP",
    "KÖPEK", "KUZEY", "LİMON", "MASAL", "MELEK", "MEYVE", "MUTLU", "NEFES", "ORMAN", "PAZAR",
    "RESİM", "SABAH", "SAHİL", "SEVGİ", "SİYAH", "SOKAK", "ŞEKER", "ŞEHİR", "TAVUK", "TARLA",
    "TATLI", "TEMİZ", "UZMAN", "VAPUR", "YAZAR", "YEMEK", "YOLCU", "ZAMAN", "AYRAN", "BAKIR",
    "BULUT", "CADDE", "DALGA", "DERYA", "DOĞAL", "DUVAR", "GÖLGE", "HAVUÇ", "KAYIK", "KAZAK",
    "KUMAŞ", "LAMBA", "MAKAS", "MERAK", "MÜZİK", "PARÇA", "RADYO", "SAKİN", "SALON", "SINIF",
    "SİNEK", "TABAK", "TAKIM", "YARIN", "YASAK", "YATAK", "YAYLA", "YOĞUN", "KOLAY", "KİRAZ"
  ].filter(function (k) { return Array.from(k).length === 5; });

  const SATIRLAR = [
    ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
    ["ENTER", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "SİL"]
  ];
  const HARFLER = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";
  const DENEME = 6, UZUNLUK = 5;

  const kutu = document.getElementById("oyun");
  kutu.innerHTML = `
    <div class="kb-tahta" id="kb-tahta"></div>
    <div class="result" id="kb-mesaj"></div>
    <div class="kb-klavye" id="kb-klavye"></div>
    <button class="big alt" id="kb-yeni" style="margin-top:16px">Yeni kelime</button>
  `;
  const tahtaEl = document.getElementById("kb-tahta");
  const mesajEl = document.getElementById("kb-mesaj");
  const klavyeEl = document.getElementById("kb-klavye");

  let cevap, tahmin, satir, bitti, kutular, tuslar;

  function trBuyuk(s) { return s.toLocaleUpperCase("tr-TR"); }

  function gununKelimesi() {
    const gun = Math.floor(Date.now() / 86400000);
    return KELIMELER[gun % KELIMELER.length];
  }
  function rastgeleKelime() {
    return KELIMELER[Math.floor(Math.random() * KELIMELER.length)];
  }

  function kur(kelime) {
    cevap = Array.from(kelime);
    tahmin = [];
    satir = 0;
    bitti = false;
    mesajEl.textContent = "";

    tahtaEl.innerHTML = "";
    kutular = [];
    for (let r = 0; r < DENEME; r++) {
      const sat = document.createElement("div");
      sat.className = "kb-satir";
      const kRow = [];
      for (let c = 0; c < UZUNLUK; c++) {
        const k = document.createElement("div");
        k.className = "kb-kutu";
        sat.appendChild(k);
        kRow.push(k);
      }
      tahtaEl.appendChild(sat);
      kutular.push(kRow);
    }

    klavyeEl.innerHTML = "";
    tuslar = {};
    SATIRLAR.forEach(function (harfler) {
      const sat = document.createElement("div");
      sat.className = "kb-tus-satir";
      harfler.forEach(function (h) {
        const b = document.createElement("button");
        b.className = "kb-tus" + (h.length > 1 ? " genis" : "");
        b.textContent = h === "SİL" ? "⌫" : h;
        b.setAttribute("aria-label", h);
        hizliTikla(b, function () { tusaBas(h); });
        sat.appendChild(b);
        tuslar[h] = b;
      });
      klavyeEl.appendChild(sat);
    });
  }

  function guncelleSatir() {
    for (let c = 0; c < UZUNLUK; c++) {
      kutular[satir][c].textContent = tahmin[c] || "";
      kutular[satir][c].classList.toggle("dolu", !!tahmin[c]);
    }
  }

  function tusaBas(h) {
    if (bitti) return;
    if (h === "SİL") {
      tahmin.pop();
      guncelleSatir();
      mesajEl.textContent = "";
    } else if (h === "ENTER") {
      gonder();
    } else if (tahmin.length < UZUNLUK) {
      tahmin.push(h);
      guncelleSatir();
      mesajEl.textContent = "";
    }
  }

  function degerlendir(t) {
    // Standart iki geçişli renklendirme: önce doğru yer, sonra yanlış yer.
    const sonuc = new Array(UZUNLUK).fill("yok");
    const kalan = {};
    for (let i = 0; i < UZUNLUK; i++) {
      if (t[i] === cevap[i]) sonuc[i] = "dogru";
      else kalan[cevap[i]] = (kalan[cevap[i]] || 0) + 1;
    }
    for (let i = 0; i < UZUNLUK; i++) {
      if (sonuc[i] === "dogru") continue;
      if (kalan[t[i]] > 0) { sonuc[i] = "var"; kalan[t[i]]--; }
    }
    return sonuc;
  }

  const ONCELIK = { yok: 1, var: 2, dogru: 3 };

  function gonder() {
    if (tahmin.length < UZUNLUK) {
      mesajEl.textContent = "5 harf girmelisin.";
      return;
    }
    const sonuc = degerlendir(tahmin);
    for (let c = 0; c < UZUNLUK; c++) {
      kutular[satir][c].classList.add(sonuc[c]);
      const tus = tuslar[tahmin[c]];
      if (tus) {
        const eski = tus.dataset.durum;
        if (!eski || ONCELIK[sonuc[c]] > ONCELIK[eski]) {
          tus.dataset.durum = sonuc[c];
          tus.classList.remove("yok", "var", "dogru");
          tus.classList.add(sonuc[c]);
        }
      }
    }

    if (tahmin.join("") === cevap.join("")) {
      bitti = true;
      mesajEl.textContent = "🎉 Tebrikler! " + (satir + 1) + ". denemede buldun.";
      return;
    }
    satir++;
    tahmin = [];
    if (satir >= DENEME) {
      bitti = true;
      mesajEl.textContent = "Olmadı! Doğru kelime: " + cevap.join("");
    }
  }

  // Bilgisayar klavyesi desteği
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Enter") { tusaBas("ENTER"); return; }
    if (e.key === "Backspace") { tusaBas("SİL"); return; }
    if (e.key.length === 1) {
      const h = trBuyuk(e.key);
      if (HARFLER.indexOf(h) !== -1) tusaBas(h);
    }
  });

  hizliTikla(document.getElementById("kb-yeni"), function () { kur(rastgeleKelime()); });
  kur(gununKelimesi());
})();
