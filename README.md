# 🤖 Otonom Dil Koçu Ajanı (LLM Language Tutor)

Bu proje, yapay zeka destekli, etkileşimli ve otonom bir **Büyük Dil Modeli (LLM)** uygulamasıdır. Kullanıcıların yabancı dil öğrenim süreçlerini kişiselleştirmek ve hızlandırmak amacıyla tasarlanmıştır.

Okuma parçaları üzerinden bilinmeyen kelimelerin çıkarılması, kelime ezberletici flashcard sistemi (aralıklı tekrara dayalı bellek), anlık gramer hataları analizi ve yapay zeka ile doğrudan etkileşim kurulabilen bir sohbet arayüzüne sahiptir.

---

## ✨ Öne Çıkan Özellikler

- **📰 Günlük Okuma Metinleri:** Yapay zeka, kullanıcının seviyesine uygun otonom İngilizce metinler üretir.
- **🔍 Otonom Kelime Analizi:** Okunan metinlerdeki zor veya önemli kelimeler yapay zeka tarafından tespit edilip Türkçe karşılıkları ve örnek cümleleriyle ayrıştırılır.
- **🃏 Flashcard (Kelime Kartları) Belleği:** Öğrenilen kelimeler sisteme kaydedilir. Öğrenci bu kelimeleri ön yüz-arka yüz mantığıyla tekrar edebilir.
- **💬 Etkileşimli AI Sohbet (Dil Koçu):** Öğrenci, yapay zeka ile doğrudan yabancı dilde pratik yapabilir, sorular sorabilir.
- **📊 Gelişim Analizi & Oyunlaştırma:** Gramer doğruluğu yüzdesi, öğrenilen günlük kelime sayısı, seviye (XP) ve giriş serisi (streak) gibi oyunlaştırma ögeleri içerir.

---

## 🛠️ Kullanılan Teknolojiler

Bu uygulama istemci-sunucu mimarisine (Client-Server Architecture) dayanmaktadır.

*   **Arka Yüz (Backend):** Python, FastAPI, Uvicorn, Pydantic
*   **Yapay Zeka (LLM):** Groq API (Hızlı çıkarım ve gelişmiş modeller için)
*   **Veritabanı:** SQLite (memory.db)
*   **Ön Yüz (Frontend):** HTML5, CSS3, JavaScript (Vanilla JS)

---

## 🚀 Kurulum ve Çalıştırma Rehberi

Projeyi kendi bilgisayarınızda (lokal ortamınızda) çalıştırmak için aşağıdaki adımları sırasıyla uygulayın.

### 1. Gereksinimler
- Bilgisayarınızda **Python 3.8+** yüklü olmalıdır.
- Kodları çalıştırmak ve düzenlemek için **Visual Studio Code (VS Code)** tavsiye edilir.

### 2. Kütüphanelerin Kurulumu
Proje klasörünü VS Code ile açın ve yeni bir terminal başlatın. Aşağıdaki komut ile gerekli Python kütüphanelerini bilgisayarınıza indirin:

```bash
pip install fastapi uvicorn groq pydantic
```

### 3. Veritabanının Hazırlanması
Sistemdeki kelimelerin ve bellek yapısının oluşturulabilmesi için aşağıdaki veritabanı komutlarını sırasıyla çalıştırın:

```bash
python database.py
python update_db.py
python fill_words_final.py
```

### 4. API Anahtarının Eklenmesi (Önemli! ⚠️)
Veri gizliliği ve güvenlik politikaları gereğince, LLM modellerinin çalışması için gereken API Key (Anahtar) projeye dahil edilmemiştir.
1. Groq Cloud (console.groq.com/keys) adresine gidin ve kendinize ücretsiz bir API Anahtarı oluşturun.
2. Projedeki LLM çağrısı yapan dosyanın (`main.py` veya ortam değişkenleri) ilgili alanına `API_KEY = "sizin_anahtariniz"` şeklinde kendi kodunuzu ekleyin.

### 5. Sunucunun (Backend) Başlatılması
Arka plandaki API sunucusunu ayağa kaldırmak için terminalde şu komutu çalıştırın:

```bash
python main.py
```
*(Eğer başarılı olduysa terminalde "Uvicorn running on http://127.0.0.1:8000" tarzı bir mesaj göreceksiniz.)*

### 6. Uygulamanın (Frontend) Çalıştırılması
Ön yüz arayüzünü görmek için `yapayzeka` klasörünün (veya projenizin kök dizininin) içindeki **`index.html`** dosyasına VS Code üzerinden sağ tıklayın ve **"Open with Live Server"** diyerek tarayıcınızda açın.

---

## 📁 Proje Yapısı

```text
llm-language-tutor/
│
├── yapayzeka/                 # Uygulama kaynak kodları
│   ├── app.js                 # Ön yüz (Frontend) mantığı
│   ├── style.css              # Tasarım ve animasyonlar
│   ├── index.html             # Ana arayüz iskeleti
│   ├── main.py                # FastAPI Sunucusu ve API uç noktaları
│   ├── database.py            # Veritabanı tablolarının oluşturulması
│   ├── update_db.py           # Veritabanı güncellemeleri
│   ├── fill_words_final.py    # Kelime verilerinin sisteme işlenmesi
│   └── memory.db              # Lokal SQLite veritabanı (otomatik oluşur)
│
├── Kurulum Rehberi.txt        # Orijinal kısa kurulum yönergeleri
├── Rapor.pdf                  # Yapay Zeka Grup 13 Proje Raporu
├── yapay zeka demo videosu.mp4# Projenin çalışır halini gösteren demo video
└── README.md                  # Bu dosya
```

---

