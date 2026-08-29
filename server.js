const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        // Подключаемся к полностью бесплатной глобальной сети DuckDuckGo AI (Llama 3)
        // Сначала получаем обязательный сетевой токен инициализации
        const initRes = await fetch("https://duckduckgo.com", {
            headers: { "x-vqd-accept": "1" }
        });
        const vqd = initRes.headers.get("x-vqd-token");

        // Отправляем приказ Джарвису в глобальную нейросеть
        const response = await fetch("https://duckduckgo.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-vqd-token": vqd
            },
            body: JSON.stringify({
                model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", // Топовая глобальная модель
                messages: [
                    { 
                        role: "user", 
                        content: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'. Твой ответ на запрос: " + req.body.message 
                    }
                ]
            })
        });

        const textData = await response.text();
        
        // Извлекаем чистый текст ответа из потока данных нейросети
        const lines = textData.split('\n');
        let reply = "";
        for (let line of lines) {
            if (line.startsWith('data: {"message":')) {
                const json = JSON.parse(line.substring(6));
                if (json.message) reply += json.message;
            }
        }

        if (reply) {
            res.json({ reply: reply.trim() });
        } else {
            res.json({ reply: "Извините, сэр. Произошел программный сбой на спутнике связи. Повторите попытку." });
        }
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Джарвис на бесплатной Llama 3 запущен!");
});
