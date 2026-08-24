import sqlite3
from datetime import datetime

# Veritabanı bağlantısını başlatan fonksiyon
def get_db_connection():
    conn = sqlite3.connect('memory.db')
    conn.row_factory = sqlite3.Row # Sütun isimleriyle verilere erişmek için
    return conn

# Tabloları oluşturan başlangıç fonksiyonu
def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Kullanıcılar Tablosu (xp, level ve streak sütunları eklendi)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            xp INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            streak INTEGER DEFAULT 0
        )
    ''')

  # 2. Kelime Havuzu Tablosu (hint sütunu eklendi)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            english_word TEXT UNIQUE NOT NULL,
            turkish_translation TEXT NOT NULL,
            hint TEXT
        )
    ''')

    # Kullanıcıyı oluştur (Eğer yoksa)
    cursor.execute('''
        INSERT OR IGNORE INTO users (username, xp, level, streak) 
        VALUES ('ogrenci', 0, 1, 0)
    ''')

    conn.commit()
    conn.close()
    print("✅ Veritabanı şeması güncellendi ve tablolar oluşturuldu!")

# Eğer bu dosya doğrudan çalıştırılırsa kurulumu yap
if __name__ == '__main__':
    init_db()