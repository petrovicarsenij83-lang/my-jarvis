const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/chat', async (req, res) => {
    try {
        // Сервер будет брать ключ тайно из переменных окружения Render
        const token = process.env.AI_TOKEN;

        if (!token) {
            return res.json({ reply: "Сэр, секретный токен AI_TOKEN не обнаружен в цепях питания Render." });
        }

        const response = await fetch("https://azure.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
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
        
        if (data && data.choices && data.choices[0] && data.choices[0].message) {
            res.json({ reply: data.choices[0].message.content.trim() });
        } else {
            res.json({ reply: "Извините, сэр. Спутник вернул пустой поток данных. Повторите попытку." });
        }
    } catch (err) {
        console.error(err);
        res.json({ reply: "Извините, сэр. Мои спутниковые цепи связи обновляются. Повторите запрос через секунду." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("Джарвис онлайн"); });
