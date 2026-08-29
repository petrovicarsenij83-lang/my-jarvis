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
                error: "Сообщение пустое."
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENROUTER_API_KEY не найден в Render."
            });
        }

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
                            content:
                                "Ты J.A.R.V.I.S., умный и вежливый персональный ИИ-помощник. " +
                                "Отвечай на русском языке. " +
                                "Обращайся к пользователю 'сэр', когда это уместно. " +
                                "Отвечай естественно, кратко и полезно. " +
                                "Не утверждай, что ты настоящий JARVIS из Marvel."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    temperature: 0.7,
                    max_tokens: 700
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter:", data);

            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Ошибка OpenRouter."
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "ИИ не вернул ответ."
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: "Ошибка сервера JARVIS.",
            details: error.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("================================");
    console.log("       J.A.R.V.I.S. ONLINE");
    console.log("================================");
    console.log(`PORT: ${PORT}`);
});
