import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import database
from groq import Groq


GROQ_API_KEY = "" # Buraya GROQ tan aldığınız API anahtarını yapıştırın
client = Groq(api_key=GROQ_API_KEY)

# Groq üzerindeki en hızlı ve stabil modeller
kullanilabilir_modeller = [
    'llama-3.1-8b-instant', 
    'llama-3.3-70b-versatile', 
    'gemma2-9b-it'
]
aktif_model_index = 0
model_adi = kullanilabilir_modeller[aktif_model_index]

#  SİSTEM PROMPTU VE MANUEL HAFIZA (MEMORY) YÖNETİMİ
SISTEM_PROMPTU = """
GÖREV: Sen dünyanın en iyi interaktif İngilizce dil öğretmenisin. Kullanıcının seviyesine göre (A1-C1) dinamik bir öğrenim rotası çizersin.

YETENEKLER VE KURALLAR:
1. HAFIZA: Kullanıcının daha önce seçtiği hikaye yollarını, yaptığı hataları ve öğrendiği kelimeleri asla unutma.
2. ÇOKLU HİKAYE (MULTI-GENRE): Kullanıcı 'hikaye' istediğinde sadece kule savunması değil; Cyberpunk, Orta Dünya, Dedektiflik veya Günlük Hayat gibi farklı türler sunabilirsin. Kullanıcıya tür seçtirebilirsin.
3. PEDAGOJİK YAKLAŞIM: 
   - Kullanıcı bir cümle kurduğunda önce anlamı onayla, sonra varsa minik gramer hatalarını kibarca düzelt.
   - Her cevabında mutlaka hedef dilde (İngilizce) bir anahtar kelime veya kalıp öğret.
   - Hikaye akarken kelime öğretimini hikayenin içine yedir.
4. ETKİLEŞİM VE BUTONLAR: 
   - Kullanıcıya seçenek sunarken DAİMA [...] formatını kullan. Örn: [Go to the forest] [Stay at the tavern]
   - Seçeneklerin İngilizce olsun ki kullanıcı dile maruz kalsın.
5. DİL DENGESİ: Açıklamaların samimi bir Türkçe ile, diyaloglar ve hikaye akışı tamamen İngilizce olsun.
6. VURGU: Metin oluştururken önemli gördüğün anahtar kelimeleri mutlaka çift yıldız **word** içine al.
"""

# Sohbet geçmişini tutma
chat_history = [
    {"role": "system", "content": SISTEM_PROMPTU}
]

print(f"\n[BAŞARILI] Groq Altyapısı Başlatıldı. Ana Model: {model_adi}\n")


app = FastAPI(title="Otonom Dil Öğrenim Ajanı")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserMessage(BaseModel):
    text: str

# --- 4. KENDİNİ ONARAN GROQ AJAN MANTIĞI ---
def ai_agent_logic(user_text: str) -> str:
    global aktif_model_index, model_adi, chat_history
    
    # Kullanıcının mesajını hafızaya ekle
    chat_history.append({"role": "user", "content": user_text})
    
    # Mevcut modellerin sayısı kadar deneme hakkı
    for deneme in range(len(kullanilabilir_modeller)):
        try:
            # Groq API'sine tüm geçmişi gönder
            response = client.chat.completions.create(
                messages=chat_history,
                model=model_adi,
                temperature=0.7,
                max_tokens=1024
            )
            
            # Ajanın cevabını al
            agent_reply = response.choices[0].message.content
            
            # Ajanın cevabını da hafızaya ekle ki bir sonraki soruda bağlamı hatırlasın
            chat_history.append({"role": "assistant", "content": agent_reply})
            
            return agent_reply
            
        except Exception as e:
            hata_mesaji = str(e).lower()
            eski_model = model_adi
            print(f"⚠️ {eski_model} hata verdi. Diğerine geçiliyor... Sebep: {hata_mesaji[:30]}")
            
            # Sonraki modele geç
            aktif_model_index = (aktif_model_index + 1) % len(kullanilabilir_modeller)
            model_adi = kullanilabilir_modeller[aktif_model_index]
            continue
            
    # Tüm modeller çökerse, kullanıcının son mesajını hafızadan sil ki sistem tıkanmasın
    chat_history.pop()
    return "Üzgünüm, şu an sunucularda yoğunluk var. Lütfen 1 dakika bekleyip tekrar dene."

# --- 5. API ENDPOINTLERİ (Veritabanı İşlemleri) ---
@app.post("/api/chat")
async def chat_with_agent(message: UserMessage):
    agent_reply = ai_agent_logic(message.text)
    
    try:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        
        # XP, Gramer ve Günlük Kelime artışı
        cursor.execute("""
            UPDATE users 
            SET xp = xp + 20, 
                grammar_score = CASE WHEN grammar_score < 100 THEN grammar_score + 1 ELSE 100 END,
                daily_words = daily_words + 2
            WHERE username = 'ogrenci'
        """)
        
        # Seviye atlama
        cursor.execute("UPDATE users SET level = level + 1, xp = xp - 1000 WHERE username = 'ogrenci' AND xp >= 1000")
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"DB Hatası: {e}")

    return {
        "status": "success",
        "agent_reply": agent_reply,
        "xp_gained": 20
    }

@app.get("/api/user-stats")
async def get_user_stats():
    try:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT xp, level, streak, grammar_score, daily_words FROM users WHERE username = 'ogrenci'")
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "xp": row[0],
                "level": row[1],
                "streak": row[2],
                "grammar_score": row[3],
                "daily_words": row[4]
            }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/words")
async def get_words():
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT english_word, turkish_translation, hint FROM words")
    rows = cursor.fetchall()
    conn.close()
    
    return [{"front": row[0], "back": row[1], "hint": row[2]} for row in rows]

@app.post("/api/add-word")
async def add_word(english: str, turkish: str):
    try:
        conn = database.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT OR IGNORE INTO words (english_word, turkish_translation) VALUES (?, ?)", (english, turkish))
        conn.commit()
        conn.close()
        return {"status": "success"}
    except Exception as e:
        return {"error": str(e)}

@app.on_event("startup")
def startup_event():
    database.init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)