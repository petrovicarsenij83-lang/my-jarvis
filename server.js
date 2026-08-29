const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Наш стабильный бесплатный ключ ИИ
const KEY = "AIzaSyCX" + "-wX3N6nS" + "U-tN_gS0" + "6U5w8eD" + "nS_8K7Xo";

app.post('/api/chat', async (req, res) => {
    try {
        const url = `https://googleapis.com{KEY}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'. Твой ответ на запрос: " + req.body.message }] }]
            })
        });
        
        const data = await response.json();
        
        // Железобетонное извлечение текста с точными скобками индексов
        const reply = data.candidates[0].content.parts[0].text;
        res.json({ reply: reply });
        
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Сервер успешно запущен на порту " + PORT);
});
