```js
const express = require("express");
const path = require("path");
const app = express();
// Render сам передаёт PORT
const PORT = process.env.PORT || 3000;
// Разрешаем JSON
app.use(express.json());
// Отдаём index.html и остальные файлы
app.use(express.static(__dirname));
// Главная страница
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
// ===============================
// JARVIS AI
// ===============================
app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({
                error: "Сообщение пустое."
            });
        }
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: "OPENROUTER_API_KEY не настроен в Render."
            });
        }
        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer":
                        process.env.SITE_URL || "https://your-render-app.onrender.com",
                    "X-Title": "J.A.R.V.I.S. Control Panel"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        {
                            role: "system",
                            content: `
Ты — J.A.R.V.I.S., персональный искусственный интеллект пользователя.
Отвечай на русском языке.
Твой стиль:
- умный
- спокойный
- вежливый
- немного в стиле Джарвиса из Iron Man
- обращайся к пользователю "сэр", когда это уместно
- не говори слишком длинно без необходимости
- отвечай естественно, как настоящий голосовой помощник
Ты не должен утверждать, что ты настоящий J.A.R.V.I.S. из Marvel.
Ты являешься ИИ-помощником проекта пользователя.
Если пользователь просит выполнить действие, которое невозможно выполнить через этот сайт,
честно сообщи об этом и предложи возможный вариант.
`
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
            console.error("OpenRouter error:", data);
            return res.status(response.status).json({
                error:
                    data?.error?.message ||
                    "Ошибка OpenRouter."
            });
        }
        const answer =
            data?.choices?.[0]?.message?.content;
        if (!answer) {
            return res.status(500).json({
                error: "ИИ не вернул ответ."
            });
        }
        res.json({
            reply: answer
        });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({
            error: "Ошибка сервера JARVIS.",
            details: error.message
        });
    }
});
// ===============================
// Запуск
// ===============================
app.listen(PORT, "0.0.0.0", () => {
    console.log("=================================");
    console.log("       J.A.R.V.I.S. ONLINE");
    console.log("=================================");
    console.log(`PORT: ${PORT}`);
});
```
