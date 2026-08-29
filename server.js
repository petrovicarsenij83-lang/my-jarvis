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

        console.log("JARVIS → запрос:", message);

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://my-jarvis-assistant-2026.onrender.com",
                    "X-Title": "J.A.R.V.I.S. Assistant"
                },

                body: JSON.stringify({
                    // Qwen3 32B
                    model: "qwen/qwen3-32b",

                    messages: [
                        {
                            role: "system",
                            content:
                                "Ты J.A.R.V.I.S., персональный ИИ-помощник. " +
                                "Отвечай на русском языке простыми и понятными словами. " +
                                "Будь дружелюбным, умным и спокойным. " +
                                "Иногда обращайся к пользователю 'сэр'. " +
                                "Не говори, что ты настоящий человек. " +
                                "Если пользователь задаёт обычный вопрос, отвечай кратко и по существу."
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

        const text = await response.text();

        console.log(
            "OpenRouter HTTP:",
            response.status
        );

        console.log(
            "OpenRouter response:",
            text.substring(0, 2000)
        );

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "OpenRouter вернул некорректный ответ"
            });
        }

        if (!response.ok) {

            const errorMessage =
                data?.error?.message ||
                `OpenRouter HTTP ${response.status}`;

            return res.status(502).json({
                error: errorMessage
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {

            return res.status(502).json({
                error: "Модель не вернула текст ответа"
            });
        }

        console.log("JARVIS ← ответ получен");

        return res.json({
            reply: reply
        });

    } catch (error) {

        console.error(
            "SERVER ERROR:",
            error
        );

        return res.status(500).json({
            error:
                "Ошибка сервера: " +
                error.message
        });
    }
});


app.listen(PORT, "0.0.0.0", () => {

    console.log("==============================");
    console.log("       J.A.R.V.I.S. ONLINE");
    console.log("==============================");
    console.log("PORT:", PORT);

});
