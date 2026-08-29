const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.OPENROUTER_API_KEY;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ==============================
// Проверка JARVIS
// ==============================

app.get("/api/health", (req, res) => {
    res.json({
        online: true,
        apiKey: !!API_KEY,
        ai: "OpenRouter Free"
    });
});

// ==============================
// JARVIS AI
// ==============================

app.post("/api/chat", async (req, res) => {

    try {

        const message = String(
            req.body?.message || ""
        ).trim();

        if (!message) {
            return res.status(400).json({
                error: "Сообщение пустое."
            });
        }

        if (!API_KEY) {

            console.error(
                "OPENROUTER_API_KEY отсутствует."
            );

            return res.status(500).json({
                error:
                    "OPENROUTER_API_KEY не найден в Render."
            });
        }

        console.log(
            "JARVIS получил:",
            message
        );

        // ==================================
        // OPENROUTER FREE ROUTER
        // ==================================

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization":
                        `Bearer ${API_KEY}`,

                    "Content-Type":
                        "application/json",

                    "HTTP-Referer":
                        "https://my-jarvis-assistant-2026.onrender.com",

                    "X-Title":
                        "J.A.R.V.I.S. Assistant"
                },

                body: JSON.stringify({

                    // ВАЖНО:
                    // автоматически выбирает
                    // доступную БЕСПЛАТНУЮ модель
                    model: "openrouter/free",

                    messages: [

                        {
                            role: "system",

                            content:
                                `
Ты J.A.R.V.I.S. — персональный
искусственный интеллект пользователя.

Отвечай только на русском языке.

Твой стиль:
- умный;
- спокойный;
- дружелюбный;
- естественный;
- уверенный.

Иногда обращайся к пользователю
"сэр".

Отвечай по существу и не делай
ответы unnecessarily длинными.

Ты являешься центральным
интеллектом системы J.A.R.V.I.S.
`
                        },

                        {
                            role: "user",

                            content:
                                message
                        }

                    ],

                    temperature: 0.7,

                    max_tokens: 700
                })
            }
        );

        console.log(
            "OpenRouter HTTP:",
            response.status
        );

        const raw =
            await response.text();

        let data;

        try {

            data = JSON.parse(raw);

        } catch {

            console.error(
                "OpenRouter вернул:",
                raw
            );

            return res.status(502).json({
                error:
                    "OpenRouter вернул неправильный ответ."
            });
        }

        // ==============================
        // Ошибка OpenRouter
        // ==============================

        if (!response.ok) {

            console.error(
                "OpenRouter ERROR:",
                data
            );

            return res.status(502).json({

                error:
                    data?.error?.message ||
                    "Ошибка бесплатной модели OpenRouter."
            });
        }

        // ==============================
        // Получаем ответ
        // ==============================

        const answer =
            data?.choices?.[0]?.message?.content;

        if (!answer) {

            console.error(
                "Пустой ответ:",
                data
            );

            return res.status(502).json({
                error:
                    "Бесплатная модель не вернула ответ."
            });
        }

        console.log(
            "JARVIS ответил:",
            answer
        );

        return res.json({
            answer: answer.trim()
        });

    }

    catch (error) {

        console.error(
            "JARVIS SERVER ERROR:",
            error
        );

        return res.status(500).json({

            error:
                "Ошибка соединения с центральным интеллектом."
        });
    }
});

// ==============================
// Запуск
// ==============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "================================"
        );

        console.log(
            "       J.A.R.V.I.S. ONLINE"
        );

        console.log(
            "================================"
        );

        console.log(
            "PORT:",
            PORT
        );

        console.log(
            "AI:",
            "OpenRouter FREE"
        );

        console.log(
            "MODEL:",
            "openrouter/free"
        );

        console.log(
            "================================"
        );
    }
);
