const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.OPENROUTER_API_KEY;

// Главная страница
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Проверка сервера
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    jarvis: "online",
    apiKey: !!API_KEY
  });
});

// Чат
app.post("/api/chat", async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY не найден в Render Environment."
      });
    }

    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Пустое сообщение."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://my-jarvis-assistant-2026.onrender.com",
          "X-Title": "JARVIS Assistant"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content:
                "Ты JARVIS — персональный голосовой и текстовый помощник. " +
                "Отвечай на русском языке, понятно, дружелюбно и без лишней воды. " +
                "Обращайся к пользователю как к сэру."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    console.log("OpenRouter status:", response.status);
    console.log("OpenRouter response:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.error ||
          `OpenRouter HTTP ${response.status}`
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      "";

    if (!answer || !answer.trim()) {
      return res.status(502).json({
        error: "ИИ не вернул текстовый ответ.",
        details: data
      });
    }

    res.json({
      answer: answer.trim()
    });

  } catch (error) {
    console.error("CHAT ERROR:", error);

    res.status(500).json({
      error: error.message || "Ошибка соединения с центральным интеллектом."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("      J.A.R.V.I.S. ONLINE");
  console.log("=================================");
  console.log("PORT:", PORT);
  console.log("OpenRouter:", API_KEY ? "API KEY FOUND" : "API KEY MISSING");
  console.log("=================================");
});
