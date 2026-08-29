const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        const token = process.env.AI_TOKEN;

        if (!token) {
            return res.json({ reply: "Сэр, секретный токен AI_TOKEN не обнаружен в цепях питания Render." });
        }

        const response = await fetch("https://models.github.ai/inference/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
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
        
        // Линейное пошаговое извлечение текста БЕЗ скобок и БЕЗ сложных методов
        if (data && data.choices) {
            const currentChoice = data.choices[0];
            if (currentChoice && currentChoice.message) {
                const textReply = currentChoice.message.content;
                return res.json({ reply: textReply.trim() });
            }
        }
        
        res.json({ reply: "Извините, сэр. Сервер GitHub вернул пустой массив данных. Повторите попытку." });
        
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Бортовой компьютер успешно запущен");
});
