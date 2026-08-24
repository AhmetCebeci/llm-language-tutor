import sqlite3

try:
    conn = sqlite3.connect('memory.db')
    cursor = conn.cursor()
    # Gramer puanı varsayılan 85, günlük kelime 0 olarak başlıyor
    cursor.execute("ALTER TABLE users ADD COLUMN grammar_score INTEGER DEFAULT 85")
    cursor.execute("ALTER TABLE users ADD COLUMN daily_words INTEGER DEFAULT 0")
    conn.commit()
    conn.close()
    print("✅ Veritabanına Gramer ve Günlük Kelime sütunları eklendi!")
except Exception as e:
    print(f"Hata veya zaten eklenmiş: {e}")