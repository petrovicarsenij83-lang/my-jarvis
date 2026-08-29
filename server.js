const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        // Подключаемся к стабильному бесплатному глобальному ИИ-зеркалу без ключей и лимитов
        const response = await fetch("https://aryahcr.cc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                prompt: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'. Твой ответ на запрос: " + req.body.message,
                model: "gpt-4" // Используем мощное бесплатное ядро GPT-4!
            })
        });

        const data = await response.json();
        
        // Извлекаем чистый текст ответа из готового JSON
        if (data && data.gpt) {
            res.json({ reply: data.gpt.trim() });
        } else {
            res.json({ reply: "Извините, сэр. Мои спутниковые цепи перегружены. Повторите приказ." });
        }
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Произошел программный сбой на спутнике связи. Повторите попытку." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Джарвис успешно запущен в глобальной сети!");
});
