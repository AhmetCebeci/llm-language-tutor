# Yapay Zeka Grup 13 - LLM Projesi

Bu proje, yapay zeka dersi için geliştirilmiş bir LLM (Büyük Dil Modeli) uygulamasıdır. Projenin arka planında Python (FastAPI), veritabanı olarak SQLite, ön yüzünde ise HTML, CSS ve JavaScript kullanılmıştır.

## 🚀 Kurulum Adımları

1. **Python Kurulumu:**
   Bilgisayarınızda Python'un kurulu olduğundan emin olun (Tavsiye edilen editör: VS Code). VS Code içinde yorumlayıcı (interpreter) olarak kurduğunuz Python sürümünü seçin.

2. **Gerekli Kütüphanelerin Yüklenmesi:**
   Terminal veya PowerShell açarak gerekli Python kütüphanelerini indirin:
   ```bash
   pip install fastapi uvicorn groq pydantic
   ```

3. **Veritabanı Hazırlığı:**
   Proje dizininde (VS Code terminalinde) sırasıyla aşağıdaki komutları çalıştırarak veritabanını oluşturun ve verileri işleyin:
   ```bash
   python database.py
   python update_db.py
   python fill_words_final.py
   ```

4. **Sunucuyu Başlatma:**
   API sunucusunu başlatmak için aşağıdaki komutu çalıştırın:
   ```bash
   python main.py
   ```

5. **Uygulamayı Çalıştırma:**
   Ön yüzü görüntülemek için proje klasöründeki `yapayzeka/index.html` (veya ana dizindeki ilgili index.html) dosyasına sağ tıklayıp **"Open with Live Server"** seçeneği ile (veya tarayıcınızda çift tıklayarak) açın.

## ⚠️ Önemli Not (API Anahtarı)

Kişisel verileri koruma ve güvenlik sebebiyle projede doğrudan bir API anahtarı paylaşılmamıştır. Projenin dil modeli özelliklerinin çalışabilmesi için **Groq** üzerinden kendi API anahtarınızı (API Key) almanız gerekmektedir. İlgili API anahtarını kod içerisine eklemeyi unutmayın.
