const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const GITHUB_TOKEN = "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";

app.post('/api/chat', async (req, res) => {
    try {
        const response = await fetch("https://azure.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GITHUB_TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка. Отвечай коротко (1-2 предложения), на русском языке, называй собеседника 'сэр'." 
                    },
                    { role: "user", content: req.body.message }
                ],
                model: "meta-llama-3.1-70b-instruct",
                max_tokens: 150
            })
        });

        const data = await response.json();
        console.log("Ответ от GitHub:", JSON.stringify(data));

        // Всеядный нано-сканер текста ответа
        let finalReply = "";
        
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            const msg = data.choices[0].message;
            finalReply = msg.content || msg.text || msg.value || "";
        }

        if (finalReply) {
            res.json({ reply: finalReply.trim() });
        } else {
            // Если ИИ прислал пустой объект, выводим его структуру прямо на экран для диагностики
            res.json({ reply: "Сэр, зафиксирован неизвестный формат данных: " + JSON.stringify(data).substring(0, 50) });
        }
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Джарвис онлайн"); });
