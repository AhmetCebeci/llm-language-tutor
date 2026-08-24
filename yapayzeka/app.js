document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const terminal = document.getElementById('agent-terminal');
    const flashcard = document.getElementById('flashcard');

    let currentXP = 650;

    // Flashcard Döndürme
    if (flashcard) {
        flashcard.addEventListener('click', () => {
            flashcard.classList.toggle('is-flipped');
        });
    }
  const refreshUserStats = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/user-stats');
        const data = await response.json();

        if (data.xp !== undefined) {
            document.getElementById('streak-count').textContent = data.streak;
            document.querySelector('.level').textContent = `⭐ Seviye ${data.level}`;
            document.querySelector('.xp-text').textContent = `${data.xp} / 1000 XP`;
            
            const xpBar = document.querySelector('.xp-bar');
            if (xpBar) xpBar.style.width = (data.xp / 10) + '%'; 

            // YENİ EKLENEN KISIM: Gramer ve Kelime sayılarını ekrana bas
            const grammarEl = document.getElementById('grammar-score');
            const dailyWordsEl = document.getElementById('daily-words');
            
            if (grammarEl) grammarEl.textContent = `%${data.grammar_score}`;
            if (dailyWordsEl) dailyWordsEl.textContent = data.daily_words;
        }
    } catch (error) {
        console.error("İstatistikler çekilemedi:", error);
    }
};

const loadDailyArticle = async () => {
    const articleArea = document.getElementById('article-text');
    articleArea.innerHTML = "<em>Ajan günün metnini hazırlıyor...</em>";

    try {
        const response = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: "Sistem: Kullanıcıya bugün için okuyabileceği, teknoloji hakkında İngilizce kısa bir paragraf ver. Sadece metni gönder." })
        });
        const data = await response.json();
        
        // Ajanın cevabını temizle ve bas
        articleArea.textContent = data.agent_reply.replace(/\[.*?\]/g, ''); 
    } catch (error) {
        articleArea.textContent = "Metin şu an yüklenemedi.";
    }
};

loadDailyArticle();
// Sayfa ilk açıldığında verileri çek
refreshUserStats();
 // sendMessage fonksiyonunu "target" mantığıyla tamamen optimize ediyoruz
const sendMessage = async (customText = null, target = 'chat') => {
    const text = customText !== null ? customText : userInput.value.trim();
    if (text === '') return;

    // SADECE hedef 'chat' ise ekrana kullanıcı balonunu bas
    if (target === 'chat') {
        addMessage(text, 'user');
    }
    
    userInput.value = '';

    try {
        if (terminal) terminal.innerHTML = `> Arka plan görevi yürütülüyor: ${target}...`;

        const response = await fetch('http://127.0.0.1:8000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        // 1. HEDEF: SOL OKUMA PANELİ
        if (target === 'reading-panel') {
            const articleArea = document.getElementById('article-text');
            // Gelen metni renklendirerek bas (Aşağıdaki yardımcı fonksiyonu kullanır)
            articleArea.innerHTML = highlightWords(data.agent_reply);
            if (terminal) terminal.innerHTML = "> Günün metni güncellendi ve anahtar kelimeler vurgulandı. [OK]";
        } 
        // 2. HEDEF: KELİME ANALİZİ (Metnin altına ekleme)
        else if (target === 'word-analysis') {
            let analysisDiv = document.getElementById('word-analysis-area');
            if (!analysisDiv) {
                analysisDiv = document.createElement('div');
                analysisDiv.id = 'word-analysis-area';
                analysisDiv.style.marginTop = "15px";
                analysisDiv.style.padding = "10px";
                analysisDiv.style.backgroundColor = "#141414";
                analysisDiv.style.borderLeft = "3px solid #22c55e";
                document.getElementById('article-text').parentNode.appendChild(analysisDiv);
            }
            analysisDiv.innerHTML = "<strong>Kelime Analizi:</strong><br>" + data.agent_reply.replace(/\n/g, '<br>');
            if (terminal) terminal.innerHTML = "> Analiz panele eklendi. [OK]";
        }
        // 3. HEDEF: STANDART SOHBET
        else {
            parseAndAddAgentMessage(data.agent_reply);
        }

        if (data.xp_gained) updateXP(data.xp_gained);

    } catch (error) {
        console.error("Hata:", error);
        if (terminal) terminal.innerHTML = "> HATA: API ile iletişim kesildi.";
    }
};

// ANAHTAR KELİMELERİ RENKLENDİREN FONKSİYON
const highlightWords = (text) => {
    // Ajanın metin içinde yıldızlarla (**) veya büyük harfle vurguladığı 
    // önemli kelimeleri yakalayıp yeşil yapar.
    let highlighted = text.replace(/\*\*(.*?)\*\*/g, '<span class="highlight">$1</span>');
    
    // Alternatif: Eğer ajan yıldız koymazsa, yaygın teknik kelimeleri veya 
    // ajanın "Key Word:" diye sunduğu kelimeleri burada regex ile yakalayabiliriz.
    return highlighted.replace(/\n/g, '<br>');
};

// Butonları bu yeni sisteme bağlayalım
document.getElementById('fetch-text-btn').addEventListener('click', () => {
    sendMessage("İngilizce kısa bir okuma metni oluştur. Sadece metni gönder, başka açıklama yapma.", 'reading-panel');
});

document.getElementById('extract-words-btn').addEventListener('click', () => {
    sendMessage("Yukarıdaki metindeki en önemli 3 kelimeyi seç ve sadece 'Kelime: Anlamı' şeklinde kısa liste yap.", 'word-analysis');
});

    // BURASI YENİ: Yapay zekanın cevabındaki köşeli parantezleri bulup buton yapar!
    const parseAndAddAgentMessage = (rawText) => {
        // Köşeli parantez içindeki her şeyi yakalayan Regex
        const optionRegex = /\[(.*?)\]/g;
        let options = [];
        
        // Metinden seçenekleri çıkar ve temiz metni al
        let cleanText = rawText.replace(optionRegex, (match, p1) => {
            options.push(p1);
            return ''; // Metinden [Seçenek] kısmını sil
        }).trim();

        // Temiz metni ekrana bas
        if (cleanText.length > 0) {
            addMessage(cleanText, 'agent');
        }

        // Eğer seçenek varsa, onlardan buton oluştur
        if (options.length > 0) {
            const btnContainer = document.createElement('div');
            btnContainer.style.display = 'flex';
            btnContainer.style.gap = '10px';
            btnContainer.style.marginTop = '10px';
            btnContainer.style.flexWrap = 'wrap';

            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'tool-btn'; // CSS'teki şık buton sınıfımız
                btn.textContent = opt;
                btn.style.backgroundColor = '#22c55e';
                btn.style.color = '#000';
                
                // Butona tıklanınca mesaj olarak gönder ve butonları gizle
                btn.onclick = () => {
                    sendMessage(opt);
                    btnContainer.style.display = 'none'; // Tıklandıktan sonra butonları kaldır
                };
                btnContainer.appendChild(btn);
            });

            chatBox.appendChild(btnContainer);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };

    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', sender);
        
        // Markdown benzeri yıldızları temizleyelim (opsiyonel görüntü iyileştirmesi)
        msgDiv.innerHTML = text.replace(/\*\*/g, '').replace(/\n/g, '<br>');
        
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const updateXP = (gainedXP) => {
        currentXP += gainedXP;
        if (currentXP > 1000) currentXP = 1000; 
        const xpBar = document.querySelector('.xp-bar');
        const xpText = document.querySelector('.xp-text');
        if (xpBar && xpText) {
            xpBar.style.width = (currentXP / 10) + '%';
            xpText.textContent = `${currentXP} / 1000 XP`;
        }
    };

    if (sendBtn) sendBtn.addEventListener('click', () => sendMessage());
    if (userInput) userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    // --- YENİ EKLENEN DİNAMİK ÖZELLİKLER ---

    // 1. Dinamik Tarih Gösterimi (Bugünün tarihini otomatik alır)
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        // Örn: 7 Mayıs 2026 Perşembe
        dateElement.textContent = today.toLocaleDateString('tr-TR', options); 
    }




let flashcardDeck = []; // Başta boş
let cardIndex = 0;

// Veritabanından kelimeleri çeken fonksiyon
const loadFlashcardsFromDB = async () => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/words');
        const data = await response.json();
        
        if (data.length > 0) {
            flashcardDeck = data;
            updateCardUI(); // İlk kartı ekrana bas
        } else {
            // Eğer DB boşsa geçici bir uyarı göster
            document.getElementById('word-front').textContent = "Kelime Yok";
            document.getElementById('word-back').textContent = "Henüz kelime eklenmemiş.";
        }
    } catch (error) {
        console.error("Kelimeler yüklenemedi:", error);
    }
};

// Kartın üzerindeki metinleri güncelleyen fonksiyon
const updateCardUI = () => {
    if (flashcardDeck.length > 0) {
        const card = flashcardDeck[cardIndex];
        document.getElementById('word-front').textContent = card.front;
        document.getElementById('word-back').textContent = card.back;
        
        // EĞER veritabanında ipucu varsa onu yaz, yoksa genel bir mesaj ver
        const hintText = card.hint ? card.hint : "Bu kelimeyi hatırla!";
        document.getElementById('word-hint').textContent = "İpucu: " + hintText;
        
        document.getElementById('word-ex').textContent = "";
    }
};
// Sonraki kart butonu tıklandığında
const nextWordBtn = document.getElementById('next-word-btn');
if (nextWordBtn) {
    nextWordBtn.addEventListener('click', () => {
        if (flashcardDeck.length > 0) {
            const flashcard = document.getElementById('flashcard');
            if (flashcard.classList.contains('is-flipped')) {
                flashcard.classList.remove('is-flipped');
            }
            
            setTimeout(() => {
                cardIndex = (cardIndex + 1) % flashcardDeck.length;
                updateCardUI();
            }, 200);
        }
    });
}

// Sayfa yüklenince çalıştır
loadFlashcardsFromDB();
});