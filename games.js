// Sitedeki tüm oyunların listesi.
// Yeni oyun eklemek için bu listeye bir satır ekleyip
// oyunlar/ klasörüne oyunun dosyasını koymak yeterli.
const GAMES = [
  {
    id: "tikla-hizi",
    title: "Tıkla Hızı",
    emoji: "⚡",
    category: "Refleks",
    description: "10 saniyede kaç kez tıklayabilirsin? Rekorunu kır!",
    script: "oyunlar/tikla-hizi.js"
  },
  {
    id: "hafiza-kartlari",
    title: "Hafıza Kartları",
    emoji: "🃏",
    category: "Hafıza",
    description: "Aynı meyveleri eşleştir. En az hamlede bitirebilir misin?",
    script: "oyunlar/hafiza-kartlari.js"
  },
  {
    id: "kelime-bulmaca",
    title: "Kelime Bulmaca",
    emoji: "🔤",
    category: "Kelime",
    description: "6 denemede 5 harfli gizli kelimeyi bul. Her gün yeni kelime!",
    script: "oyunlar/kelime-bulmaca.js"
  },
  {
    id: "yilan",
    title: "Yılan",
    emoji: "🐍",
    category: "Klasik",
    description: "Yemleri ye, uzun ol, duvara ve kendine çarpma!",
    script: "oyunlar/yilan.js"
  },
  {
    id: "2048",
    title: "2048",
    emoji: "🔢",
    category: "Bulmaca",
    description: "Kaydır, aynı sayıları birleştir ve 2048'e ulaş!",
    script: "oyunlar/2048.js"
  },
  {
    id: "matematik-hizi",
    title: "Matematik Hızı",
    emoji: "➕",
    category: "Matematik",
    description: "30 saniyede kaç işlemi doğru çözebilirsin?",
    script: "oyunlar/matematik-hizi.js"
  },
  {
    id: "renk-dizisi",
    title: "Renk Dizisi",
    emoji: "🎨",
    category: "Hafıza",
    description: "Yanan renkleri sırayla aklında tut ve tekrar et.",
    script: "oyunlar/renk-dizisi.js"
  },
  {
    id: "balon-patlat",
    title: "Balon Patlat",
    emoji: "🎈",
    category: "Refleks",
    description: "30 saniyede yükselen balonları patlat. Küçük balon 2 puan!",
    script: "oyunlar/balon-patlat.js"
  },
  {
    id: "reaksiyon-testi",
    title: "Reaksiyon Testi",
    emoji: "🚦",
    category: "Refleks",
    description: "Ekran yeşile dönünce hemen dokun. Tepki süren kaç milisaniye?",
    script: "oyunlar/reaksiyon-testi.js"
  },
  {
    id: "mayin-tarlasi",
    title: "Mayın Tarlası",
    emoji: "💣",
    category: "Bulmaca",
    description: "Sayılara bakarak mayınları tahmin et ve tüm güvenli kareleri aç.",
    script: "oyunlar/mayin-tarlasi.js"
  },
  {
    id: "dort-bagla",
    title: "Dört Bağla",
    emoji: "🔴",
    category: "Strateji",
    description: "Bilgisayardan önce dört taşı yan yana getir.",
    script: "oyunlar/dort-bagla.js"
  },
  {
    id: "xox",
    title: "XOX",
    emoji: "❌",
    category: "Strateji",
    description: "Klasik üç taş oyunu. Kolay ya da zor seviyede bilgisayara karşı oyna.",
    script: "oyunlar/xox.js"
  }
];

// Telefon ve bilgisayarda düzgün çalışan tıklama yardımcısı.
// Telefonda hızlı arka arkaya dokunmada sayfanın yakınlaşmasını engeller.
function hizliTikla(el, fn) {
  let bx = 0, by = 0, hareket = false;
  el.addEventListener("click", fn);
  el.addEventListener("touchstart", function (e) {
    const t = e.touches[0];
    bx = t.clientX; by = t.clientY; hareket = false;
  }, { passive: true });
  el.addEventListener("touchmove", function (e) {
    const t = e.touches[0];
    if (Math.abs(t.clientX - bx) > 10 || Math.abs(t.clientY - by) > 10) hareket = true;
  }, { passive: true });
  el.addEventListener("touchend", function (e) {
    e.preventDefault(); // yakınlaşmayı ve çift tetiklemeyi engeller
    if (!hareket) fn(e);
  }, { passive: false });
}
