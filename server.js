const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const KEY = "AIzaSyCX" + "-wX3N6nS" + "U-tN_gS0" + "6U5w8eD" + "nS_8K7Xo";

app.post('/api/chat', async (req, res) => {
    try {
        const url = `https://googleapis.com{KEY}`;
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Ты Джарвис, ИИ Тони Старка. Отвечай очень коротко (1 предложение), уважительно, всегда называй собеседника 'сэр'. Ответ на вопрос: " + req.body.message }] }]
            })
        });
        
        const data = await response.json();
        
        // Код БЕЗ квадратных скобок, чтобы iPad скопировал его без потерь:
        const candidate = data.candidates.at(0);
        const part = candidate.content.parts.at(0);
        const reply = part.text;
        
        res.json({ reply });
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Сервер запущен"); });
