const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Ваш официальный бесплатный токен разработчика GitHub
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
                        content: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'." 
                    },
                    { role: "user", content: req.body.message }
                ],
                model: "meta-llama-3.1-70b-instruct",
                max_tokens: 150
            })
        });

        const data = await response.json();
        
        // Линейное, ультра-надежное извлечение ответа из структуры GitHub/Azure API
        const choicesList = data.choices;
        const firstChoice = choicesList[0];
        const messageObject = firstChoice.message;
        const replyText = messageObject.content;
        
        res.json({ reply: replyText.trim() });
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Джарвис успешно запущен");
});
