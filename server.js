const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
    try {
        const message = String(req.body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Пустое сообщение"
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENROUTER_API_KEY не найден в Render"
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://my-jarvis-assistant-2026.onrender.com",
                    "X-Title": "J.A.R.V.I.S."
                },

                body: JSON.stringify({
                    model: "qwen/qwen3-32b:free",

                    messages: [
                        {
                            role: "system",
                            content:
                                "Ты J.A.R.V.I.S., персональный искусственный интеллект пользователя. " +
                                "Отвечай на русском языке. " +
                                "Используй простой и понятный язык. " +
                                "Будь дружелюбным, спокойным и умным. " +
                                "Иногда обращайся к пользователю 'сэр'. " +
                                "Не выдумывай факты. " +
                                "На обычные вопросы отвечай кратко и по существу."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ],

                    temperature: 0.7,
                    max_tokens: 500
                })
            }
        );

        const data = await response.json();

        console.log("OpenRouter status:", response.status);

        if (!response.ok) {
            console.error("OpenRouter error:", data);

            return res.status(502).json({
                error:
                    data?.error?.message ||
                    "Ошибка OpenRouter"
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            console.error("Нет ответа модели:", data);

            return res.status(502).json({
                error: "Модель не вернула ответ"
            });
        }

        console.log("JARVIS:", reply);

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error("SERVER ERROR:", error);

        res.status(500).json({
            error: "Ошибка соединения: " + error.message
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log("==============================");
    console.log("      J.A.R.V.I.S. ONLINE");
    console.log("==============================");
    console.log("PORT:", PORT);
});
