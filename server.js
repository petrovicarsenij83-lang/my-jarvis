app.post("/api/chat", async (req, res) => {
    try {
        const message = req.body.message;

        if (!message) {
            return res.status(400).json({
                error: "Пустое сообщение"
            });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "В Render НЕ найден OPENROUTER_API_KEY"
            });
        }

        console.log("Отправляю запрос в OpenRouter...");

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
                                "Ты JARVIS, персональный ИИ-помощник. " +
                                "Отвечай на русском языке. " +
                                "Будь умным, спокойным и вежливым. " +
                                "Обращайся к пользователю сэр."
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

        console.log("OpenRouter status:", response.status);
        console.log("OpenRouter response:", JSON.stringify(data));

        if (!response.ok) {
            return res.status(500).json({
                error:
                    data?.error?.message ||
                    `OpenRouter вернул HTTP ${response.status}`
            });
        }

        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(500).json({
                error: "OpenRouter не вернул текст ответа",
                raw: data
            });
        }

        res.json({
            reply: reply
        });

    } catch (error) {

        console.error("ОШИБКА:", error);

        res.status(500).json({
            error: error.message
        });
    }
});
