const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.OPENROUTER_API_KEY;


// =====================================================
// JARVIS HOME
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "index.html")
    );
});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {

    res.json({
        ok: true,
        jarvis: "online",
        openrouter: !!API_KEY,
        tts: true,
        voice: "ru-RU-DmitryNeural"
    });

});


// =====================================================
// CHAT — OPENROUTER
// =====================================================

app.post("/api/chat", async (req, res) => {

    try {

        if (!API_KEY) {

            return res.status(500).json({
                error:
                    "OPENROUTER_API_KEY не найден в Render Environment."
            });

        }

        const message =
            String(
                req.body?.message || ""
            ).trim();


        if (!message) {

            return res.status(400).json({
                error:
                    "Пустое сообщение."
            });

        }


        const response =
            await fetch(
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
                            "JARVIS Assistant"

                    },

                    body:
                        JSON.stringify({

                            model:
                                "openrouter/free",

                            messages: [

                                {
                                    role:
                                        "system",

                                    content:
                                        "Ты JARVIS — персональный искусственный интеллект и бортовой компьютер. " +
                                        "Отвечай на русском языке. " +
                                        "Говори естественно, спокойно и уверенно. " +
                                        "Обращайся к пользователю как к сэру. " +
                                        "Не называй себя ChatGPT. " +
                                        "Не используй слишком длинные ответы без необходимости."
                                },

                                {
                                    role:
                                        "user",

                                    content:
                                        message
                                }

                            ],

                            temperature:
                                0.7,

                            max_tokens:
                                1000

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "OpenRouter status:",
            response.status
        );


        if (!response.ok) {

            return res
                .status(response.status)
                .json({

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


        if (
            !answer ||
            !answer.trim()
        ) {

            return res.status(502).json({

                error:
                    "ИИ не вернул текстовый ответ."

            });

        }


        res.json({

            answer:
                answer.trim()

        });

    }

    catch (error) {

        console.error(
            "CHAT ERROR:",
            error
        );


        res.status(500).json({

            error:
                error.message ||
                "Ошибка соединения с центральным интеллектом."

        });

    }

});


// =====================================================
// MICROSOFT EDGE TTS
// =====================================================

let EdgeTTS = null;

try {

    EdgeTTS =
        require("node-edge-tts").EdgeTTS;

    console.log(
        "Microsoft Edge TTS module loaded."
    );

}

catch (error) {

    console.error(
        "TTS MODULE ERROR:",
        error
    );

}


// =====================================================
// TTS
// =====================================================

app.post("/api/tts", async (req, res) => {

    let tempFile = null;

    try {

        const text =
            String(
                req.body?.text || ""
            ).trim();


        if (!text) {

            return res.status(400).json({
                error:
                    "Пустой текст."
            });

        }


        if (text.length > 1500) {

            return res.status(400).json({
                error:
                    "Текст слишком длинный."
            });

        }


        if (!EdgeTTS) {

            return res.status(503).json({
                error:
                    "Модуль Microsoft Edge TTS не загрузился."
            });

        }


        /*
         * Временный MP3
         */

        tempFile =
            path.join(
                os.tmpdir(),
                `jarvis-${Date.now()}.mp3`
            );


        /*
         * Русский мужской
         * нейросетевой голос Microsoft
         */

        const tts =
            new EdgeTTS({

                voice:
                    "ru-RU-DmitryNeural",

                lang:
                    "ru-RU",

                outputFormat:
                    "audio-24khz-48kbitrate-mono-mp3",

                rate:
                    "-5%",

                pitch:
                    "-8Hz",

                volume:
                    "+0%",

                timeout:
                    15000

            });


        console.log(
            "TTS:",
            text
        );


        await tts.ttsPromise(
            text,
            tempFile
        );


        if (
            !fs.existsSync(
                tempFile
            )
        ) {

            throw new Error(
                "TTS не создал аудиофайл."
            );

        }


        const audio =
            fs.readFileSync(
                tempFile
            );


        res.setHeader(
            "Content-Type",
            "audio/mpeg"
        );


        res.setHeader(
            "Content-Length",
            audio.length
        );


        res.setHeader(
            "Cache-Control",
            "no-store"
        );


        res.send(
            audio
        );

    }

    catch (error) {

        console.error(
            "TTS ERROR:",
            error
        );


        if (tempFile) {

            try {

                if (
                    fs.existsSync(
                        tempFile
                    )
                ) {

                    fs.unlinkSync(
                        tempFile
                    );

                }

            }

            catch (_) {}

        }


        res.status(500).json({

            error:
                error.message ||
                "Ошибка голосового синтеза."

        });

        return;

    }

});


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "================================="
        );

        console.log(
            "       J.A.R.V.I.S. ONLINE"
        );

        console.log(
            "================================="
        );

        console.log(
            "PORT:",
            PORT
        );

        console.log(
            "OpenRouter:",
            API_KEY
                ? "API KEY FOUND"
                : "API KEY MISSING"
        );

        console.log(
            "Voice:",
            "ru-RU-DmitryNeural"
        );

        console.log(
            "TTS:",
            EdgeTTS
                ? "ONLINE"
                : "OFFLINE"
        );

        console.log(
            "================================="
        );

    }
);
