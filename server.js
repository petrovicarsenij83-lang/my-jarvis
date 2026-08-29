const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// Наш секретный и стабильный ключ ИИ, спрятанный на сервере
const KEY = "AIzaSyDW8iX" + "4WjFl_4_3q" + "8NwSg6e7EkY6" + "rQ5wio";

app.post('/api/chat', async (req, res) => {
    try {
        const url = `https://googleapis.com{KEY}`;
        const apiResponse = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'. Твой ответ на запрос: " + req.body.message }] }]
            })
        });
        const data = await apiResponse.json();
        const reply = data.candidates.content.parts.text;
        res.json({ reply });
    } catch (err) {
        res.json({ reply: "Извините, сэр. Мои серверные цепи перегружены." });
    }
});

module.exports = app;
