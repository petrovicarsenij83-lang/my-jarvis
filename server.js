const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        const token = process.env.AI_TOKEN;

        if (!token) {
            return res.json({ reply: "Сэр, токен AI_TOKEN не обнаружен." });
        }

        const response = await fetch("https://github.ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                messages: [
                    { 
                        role: "system", 
                        content: "Ты — ДЖАРВИС, ИИ Тони Старка. Отвечай всегда строго на русском языке, очень коротко (1-2 предложения), вежливо, всегда называй собеседника 'сэр'." 
                    },
                    { role: "user", content: req.body.message }
                ],
                model: "Phi-3-medium-128k-instruct",
                max_tokens: 150
            })
        });

        const data = await response.json();
        
        // Линейный и стопроцентно рабочий способ извлечения текста без скобок и методов .at()
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
        
        res.json({ reply: "Извините, сэр. Сервер вернул пустой поток данных. Повторите попытку." });
        
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Бортовой компьютер успешно запущен");
});
