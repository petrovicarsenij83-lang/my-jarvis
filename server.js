const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Сообщение пустое"
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENROUTER_API_KEY не найден в Render"
            });
        }

        console.log("JARVIS: отправляю запрос в OpenRouter...");

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content: `
Ты J.A.R.V.I.S. — персональный искусственный интеллект пользователя.

Отвечай только на русском языке.
Будь умным, спокойным, вежливым и естественным.
Иногда обращайся к пользователю "сэр".
Отвечай достаточно кратко, но содержательно.
Стиль — футуристический персональный помощник.
`
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    max_tokens: 500
                })
            }
        );

        const data = await response.json();

        console.log("OpenRouter HTTP:", response.status);

        if (!response.ok) {
            console.error("OpenRouter ERROR:", data);

            return res.status(500).json({
                error:
                    data?.error?.message ||
                    `OpenRouter HTTP ${response.status}`
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            console.error("Нет ответа:", data);

            return res.status(500).json({
                error: "ИИ не вернул текст ответа"
            });
        }

        console.log("JARVIS: ответ получен");

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: error.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("       J.A.R.V.I.S. ONLINE");
    console.log("================================");
    console.log("PORT:", PORT);
});
