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
                        content: "Ты — ДЖАРВИС, искусственный интеллект Тони Старка из Железного Человека. Отвечай всегда строго на русском языке, очень коротко (одно-два предложения), вежливо, по делу, всегда называй собеседника 'сэр'." 
                    },
                    { role: "user", content: req.body.message }
                ],
                model: "meta-llama-3.1-70b-instruct",
                max_tokens: 150
            })
        });

        const data = await response.json();
        
        // Сверхнадежное извлечение текста через метод .at(0)
        if (data && data.choices) {
            const arr = data.choices;
            const item = arr.at(0);
            if (item && item.message) {
                const replyText = item.message.content;
                return res.json({ reply: replyText.trim() });
            }
        }
        
        res.json({ reply: "Извините, сэр. Сеть GitHub вернула пустой поток данных. Повторите попытку." });
        
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Бортовой компьютер успешно запущен");
});
