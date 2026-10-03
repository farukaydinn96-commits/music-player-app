# Pulse — Modern Music Player

Apple Music Kırmızısı (`#FA243C`) ve Karbon (`#0A0A0C`) renk paletiyle tasarlanmış, Glassmorphism tabanlı, tam ekran (`100vh`) responsive web müzik çalar uygulaması.

## Öne Çıkan Mühendislik Özellikleri

- **Dinamik Parça Yönetimi (LocalStorage CRUD):** Regex tabanlı YouTube URL/ID ayrıştırıcı ile yeni parça ekleme, silme ve varsayılan verilere sıfırlama
- **Akıllı Video Önizleme Katmanı (Smart Poster Overlay):** Parça seçildiğinde yüksek çözünürlüklü YouTube kapak görseli gösteren ve oynatma başladığında pürüzsüzce videoya geçen özel katman
- **Çoklu Filtreleme ve Sıralama (Sorting):** Türlere, `localStorage` destekli favorilere ve arama sorgusuna göre anlık filtreleme; parça adına (A-Z) veya süreye göre çift yönlü sıralama
- **Gelişmiş Medya Kontrolleri:** Karışık Çal (Shuffle), Tekrarla (Repeat), Ses Seviyesi / Sessize Alma (Mute) ve senkronize İlerleme Çubuğu (Seek Bar)
- **Canlı Bildirim Sistemi (Toast Notifications):** Kullanıcı etkileşimlerinde (favori, ekleme, silme, mod değişimi) anlık geri bildirim
- **Klavye Kısayolları:** `Space` (Oynat/Duraklat), `→` / `←` (Sonraki/Önceki), `/` (Arama), `M` (Sessiz), `N` (Yeni Parça Ekle)

## Teknolojiler

- **HTML5:** Semantik mimari, WAI-ARIA erişilebilirlik standartları ve modal diyalog yapıları
- **CSS3:** Custom Properties, Flexbox, CSS Grid, Glassmorphism (`backdrop-filter`) ve mikro etkileşimler
- **Vanilla JavaScript (ES6+):** State-driven UI mimarisi, YouTube IFrame API entegrasyonu, Regex URL Parser ve `localStorage` kalıcılığı

## Dosya Yapısı

```text
├── index.html
├── style.css
├── app.js
├── manifest.json
├── netlify.toml
├── .gitignore
└── README.md
```
