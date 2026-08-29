const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        // Подключаемся к стабильному бесплатному глобальному ИИ-зеркалу без ключей и лимитов
        const response = await fetch("https://api.airforce", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'." 
                    },
                    { role: "user", content: req.body.message }
                ],
                model: "llama-3-70b-instruct" // Мощное и быстрое глобальное ИИ-ядро
            })
        });

        const data = await response.json();
        
        // Линейное пошаговое извлечение текста, адаптированное под любые версии систем
        if (data && data.choices) {
            let replyText = "";
            for (let key in data.choices) {
                if (data.choices[key] && data.choices[key].message) {
                    replyText = data.choices[key].message.content;
                    break;
                }
            }
            if (replyText) {
                return res.json({ reply: replyText.trim() });
            }
        }
        
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи перегружены. Повторите приказ." });
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Произошел программный сбой на спутнике связи. Повторите попытку." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Бортовой компьютер успешно запущен на резервном канале");
});
