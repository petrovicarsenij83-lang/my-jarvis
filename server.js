const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        const url = "https://googleapis.com";
        
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка. Отвечай всегда строго на русском языке, очень коротко, в 1-2 sentences, уважительно, всегда называй собеседника 'сэр'. Твой ответ: " + req.body.message }] }]
            })
        });
        
        const data = await response.json();
        
        // Код БЕЗ квадратных скобок, защищенный от сбоев копирования на iPad
        const candidate = data.candidates.at(0);
        const part = candidate.content.parts.at(0);
        const reply = part.text;
        
        res.json({ reply: reply });
        
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Сервер успешно запущен");
});
