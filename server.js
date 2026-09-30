const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.OPENROUTER_API_KEY;
const TAVILY_KEY = process.env.TAVILY_API_KEY;

// Нужен ли поиск в интернете для этого вопроса
const SEARCH_RE = /новост|сегодня|сейчас|погод|курс|цен[аы]|стоимост|последн|свеж|недавн|кто такой|кто сейчас|когда выйд|результат|счёт|счет|матч|выбор|президент|акци|биткоин|bitcoin|news|today|latest|current|weather|price|score|recent|who is|release|stock|right now|20(2[4-9]|3\d)/i;

async function webSearch(query) {
  if (!TAVILY_KEY) return "";
  try {
    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${TAVILY_KEY}` },
      body: JSON.stringify({ query, max_results: 4, search_depth: "basic", include_answer: true }),
      signal: AbortSignal.timeout(8000)
    });
    if (!r.ok) { console.error("SEARCH HTTP", r.status); return ""; }
    const d = await r.json();
    const parts = [];
    if (d.answer) parts.push("Краткий ответ: " + d.answer);
    for (const x of (d.results || []).slice(0, 4)) {
      parts.push(`- ${x.title}: ${String(x.content || "").slice(0, 400)}`);
    }
    return parts.join("\n");
  } catch (e) {
    console.error("SEARCH ERROR:", e.message);
    return "";
  }
}

const SYSTEM_PROMPT =
  "Ты JARVIS — персональный ИИ. ВСЕГДА отвечай на том же языке, на котором написано последнее сообщение пользователя (русский, английский, украинский и т.д.). " +
  "Говори спокойно и уверенно, обращайся к пользователю «сэр» (sir) на его языке. " +
  "Не называй себя ChatGPT. Никогда не выводи технические ошибки и служебные фразы. " +
  "Отвечай кратко, если не просят подробно. Пиши простым текстом без markdown и эмодзи.";

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/api/health", (req, res) => res.json({ ok: true, openrouter: !!API_KEY, search: !!TAVILY_KEY }));

async function askAI(messages) {
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://my-jarvis-assistant-2026.onrender.com",
          "X-Title": "JARVIS Assistant"
        },
        body: JSON.stringify({ model: "openrouter/free", messages, temperature: 0.7, max_tokens: 1000 })
      });
      const data = await r.json().catch(() => ({}));
      const answer = data?.choices?.[0]?.message?.content?.trim();
      if (r.ok && answer) return answer;
      lastErr = data?.error?.message || `HTTP ${r.status}`;
    } catch (e) {
      lastErr = e.message;
    }
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  console.error("AI FAILED:", lastErr);
  throw new Error("AI_FAILED");
}

app.post("/api/chat", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Ключ OPENROUTER_API_KEY не задан в Render Environment." });
    const message = String(req.body?.message || "").trim();
    if (!message) return res.status(400).json({ error: "Пустое сообщение." });

    const history = Array.isArray(req.body?.history)
      ? req.body.history.slice(-10).filter(m => ["user", "assistant"].includes(m?.role) && typeof m.content === "string")
      : [];

    let extra = "";
    if (SEARCH_RE.test(message)) {
      const found = await webSearch(message);
      if (found) extra = "\n\nСвежие данные из интернета (используй их для ответа, не упоминай слово «поиск»):\n" + found;
    }
    const today = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

    const answer = await askAI([
      { role: "system", content: SYSTEM_PROMPT + ` Сегодня ${today}.` + extra },
      ...history,
      { role: "user", content: message }
    ]);
    res.json({ answer });
  } catch (e) {
    res.status(503).json({ error: "Связь с центральным интеллектом нестабильна. Повторите запрос, сэр." });
  }
});

let EdgeTTS = null;
try {
  EdgeTTS = require("node-edge-tts").EdgeTTS;
} catch (e) {
  console.error("TTS MODULE ERROR:", e);
}

function pickVoice(text) {
  if (/[іїєґІЇЄҐ]/.test(text)) return { voice: "uk-UA-OstapNeural", lang: "uk-UA" };
  if (/[а-яё]/i.test(text)) return { voice: "ru-RU-DmitryNeural", lang: "ru-RU" };
  return { voice: "en-US-AndrewMultilingualNeural", lang: "en-US" };
}

app.post("/api/tts", async (req, res) => {
  let tempFile = null;
  try {
    let text = String(req.body?.text || "")
      .replace(/[*_`#>~]/g, "")
      .replace(/\p{Extended_Pictographic}/gu, "")
      .trim();
    if (!text) return res.status(400).json({ error: "Пустой текст." });
    if (text.length > 1500) text = text.slice(0, 1500);
    if (!EdgeTTS) return res.status(503).json({ error: "Модуль голоса не загрузился." });

    tempFile = path.join(os.tmpdir(), `jarvis-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`);
    const v = pickVoice(text);
    const tts = new EdgeTTS({
      voice: v.voice,
      lang: v.lang,
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      timeout: 15000
    });
    await tts.ttsPromise(text, tempFile);

    const audio = fs.readFileSync(tempFile);
    res.set({ "Content-Type": "audio/mpeg", "Content-Length": audio.length, "Cache-Control": "no-store" });
    res.send(audio);
  } catch (e) {
    console.error("TTS ERROR:", e);
    res.status(500).json({ error: "Ошибка голосового синтеза." });
  } finally {
    if (tempFile) fs.unlink(tempFile, () => {});
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("JARVIS ONLINE, port:", PORT, "| key:", API_KEY ? "found" : "MISSING", "| tts:", EdgeTTS ? "ok" : "off");
});
