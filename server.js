const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 10000;

const API_KEY =
    process.env.OPENROUTER_API_KEY;


/* =====================================================
   MAIN
===================================================== */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


/* =====================================================
   HEALTH
===================================================== */

app.get("/api/health", (req, res) => {

    res.json({

        ok: true,

        jarvis: "online",

        openrouter:
            Boolean(API_KEY),

        kokoro:
            kokoroReady,

        tts:
            true

    });

});


/* =====================================================
   CHAT
===================================================== */

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

                    method:
                        "POST",

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
            "OpenRouter:",
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
            !String(answer).trim()
        ) {

            return res.status(502).json({

                error:
                    "ИИ не вернул текстовый ответ."

            });

        }


        res.json({

            answer:
                String(answer).trim()

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


/* =====================================================
   KOKORO
===================================================== */

let ort = null;
let ESpeakNg = null;

let kokoroSession = null;
let kokoroConfig = null;
let kokoroVoice = null;

let kokoroReady = false;
let kokoroLoading = false;


/* =====================================================
   PATHS
===================================================== */

const MODEL_DIR =
    path.join(
        __dirname,
        "models",
        "kokoro-ru"
    );


const MODEL_PATH =
    path.join(
        MODEL_DIR,
        "onnx",
        "model_dima_quantized.onnx"
    );


const CONFIG_PATH =
    path.join(
        MODEL_DIR,
        "config.json"
    );


const VOICE_PATH =
    path.join(
        MODEL_DIR,
        "voices",
        "dima.bin"
    );


/* =====================================================
   LOAD KOKORO
===================================================== */

async function loadKokoro() {

    if (kokoroReady) {
        return true;
    }


    if (kokoroLoading) {

        while (kokoroLoading) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        300
                    )
            );

        }

        return kokoroReady;

    }


    kokoroLoading =
        true;


    try {

        console.log(
            "================================="
        );

        console.log(
            "LOADING KOKORO-RU"
        );

        console.log(
            "================================="
        );


        if (
            !fs.existsSync(
                MODEL_PATH
            )
        ) {

            throw new Error(
                "Не найден Kokoro model: " +
                MODEL_PATH
            );

        }


        if (
            !fs.existsSync(
                CONFIG_PATH
            )
        ) {

            throw new Error(
                "Не найден Kokoro config: " +
                CONFIG_PATH
            );

        }


        if (
            !fs.existsSync(
                VOICE_PATH
            )
        ) {

            throw new Error(
                "Не найден голос Dima: " +
                VOICE_PATH
            );

        }


        /*
         * Загружаем зависимости
         */

        ort =
            require(
                "onnxruntime-node"
            );


        /*
         * espeak-ng является ESM.
         * Поэтому используем dynamic import.
         */

        const espeakModule =
            await import(
                "espeak-ng"
            );


        ESpeakNg =
            espeakModule.default ||
            espeakModule;


        /*
         * Config
         */

        kokoroConfig =
            JSON.parse(
                fs.readFileSync(
                    CONFIG_PATH,
                    "utf8"
                )
            );


        /*
         * ONNX
         */

        console.log(
            "Creating ONNX session..."
        );


        kokoroSession =
            await ort.InferenceSession.create(
                MODEL_PATH,
                {
                    executionProviders:
                        ["cpu"]
                }
            );


        /*
         * Dima voice.
         *
         * ВАЖНО:
         * dima.bin = raw float32
         * [510, 256]
         */

        const voiceBuffer =
            fs.readFileSync(
                VOICE_PATH
            );


        if (
            voiceBuffer.length !==
            510 * 256 * 4
        ) {

            console.warn(
                "Dima voice size:",
                voiceBuffer.length,
                "bytes"
            );

        }


        const voiceArrayBuffer =
            voiceBuffer.buffer.slice(
                voiceBuffer.byteOffset,
                voiceBuffer.byteOffset +
                voiceBuffer.byteLength
            );


        kokoroVoice =
            new Float32Array(
                voiceArrayBuffer
            );


        if (
            kokoroVoice.length <
            510 * 256
        ) {

            throw new Error(
                "Dima voice file повреждён или имеет неправильный размер."
            );

        }


        kokoroReady =
            true;


        console.log(
            "================================="
        );

        console.log(
            "KOKORO-RU ONLINE"
        );

        console.log(
            "VOICE: DIMA"
        );

        console.log(
            "MODEL:",
            path.basename(
                MODEL_PATH
            )
        );

        console.log(
            "================================="
        );


        return true;

    }

    catch (error) {

        console.error(
            "KOKORO LOAD ERROR:",
            error
        );


        kokoroReady =
            false;


        return false;

    }

    finally {

        kokoroLoading =
            false;

    }

}


/* =====================================================
   IPA → IDS
===================================================== */

function ipaToIds(ipa) {

    const vocab =
        kokoroConfig?.vocab;


    if (!vocab) {

        throw new Error(
            "Kokoro vocabulary not found."
        );

    }


    const ids = [];


    for (
        const char of ipa
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                vocab,
                char
            )
        ) {

            ids.push(
                Number(
                    vocab[char]
                )
            );

        }

    }


    return ids;

}


/* =====================================================
   TTS
===================================================== */

app.post(
    "/api/tts",
    async (req, res) => {

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


            if (
                text.length > 1000
            ) {

                return res.status(400).json({

                    error:
                        "Текст слишком длинный."

                });

            }


            const ready =
                await loadKokoro();


            if (!ready) {

                return res.status(503).json({

                    error:
                        "Kokoro-RU не загрузился. Проверьте models/kokoro-ru."

                });

            }


            console.log(
                "TTS:",
                text
            );


            /*
             * TEXT → IPA
             */

            const espeak =
                await ESpeakNg({

                    arguments: [

                        "--phonout",
                        "ipa.txt",

                        "--ipa=3",

                        '--sep=""',

                        "-q",

                        "-v",
                        "ru",

                        text

                    ]

                });


            const ipaBuffer =
                espeak.FS.readFile(
                    "ipa.txt"
                );


            const ipa =
                new TextDecoder()
                    .decode(
                        ipaBuffer
                    )
                    .trim();


            if (!ipa) {

                throw new Error(
                    "eSpeak-NG не вернул IPA."
                );

            }


            /*
             * IPA → token IDs
             */

            const ids =
                ipaToIds(
                    ipa
                );


            if (!ids.length) {

                throw new Error(
                    "Русский текст не удалось преобразовать в токены Kokoro."
                );

            }


            /*
             * Kokoro допускает максимум
             * 510 phoneme positions.
             */

            const maxTokens =
                510;


            const trimmedIds =
                ids.slice(
                    0,
                    maxTokens
                );


            /*
             * Dima voice:
             *
             * [510,256]
             */

            const styleIndex =
                Math.min(
                    Math.max(
                        trimmedIds.length - 1,
                        0
                    ),
                    509
                );


            const styleStart =
                styleIndex * 256;


            const styleRow =
                kokoroVoice.slice(
                    styleStart,
                    styleStart + 256
                );


            if (
                styleRow.length !== 256
            ) {

                throw new Error(
                    "Не удалось получить style vector Dima."
                );

            }


            /*
             * Input IDs
             */

            const inputIds =
                BigInt64Array.from(
                    [
                        0n,

                        ...trimmedIds.map(
                            id =>
                                BigInt(id)
                        ),

                        0n
                    ]
                );


            const feeds = {

                input_ids:
                    new ort.Tensor(
                        "int64",
                        inputIds,
                        [
                            1,
                            inputIds.length
                        ]
                    ),

                style:
                    new ort.Tensor(
                        "float32",
                        Float32Array.from(
                            styleRow
                        ),
                        [
                            1,
                            256
                        ]
                    ),

                speed:
                    new ort.Tensor(
                        "float32",
                        new Float32Array([
                            0.92
                        ]),
                        [
                            1
                        ]
                    )

            };


            /*
             * INFERENCE
             */

            const output =
                await kokoroSession.run(
                    feeds
                );


            const waveform =
                output.waveform ||
                output.audio ||
                Object.values(
                    output
                )[0];


            if (!waveform) {

                throw new Error(
                    "Kokoro не вернул waveform."
                );

            }


            const samples =
                waveform.data;


            /*
             * 24 kHz WAV
             */

            const wav =
                createWav(
                    samples,
                    24000
                );


            res.setHeader(
                "Content-Type",
                "audio/wav"
            );


            res.setHeader(
                "Content-Length",
                wav.length
            );


            res.setHeader(
                "Cache-Control",
                "no-store"
            );


            res.send(
                wav
            );

        }

        catch (error) {

            console.error(
                "KOKORO TTS ERROR:",
                error
            );


            res.status(500).json({

                error:
                    error.message ||
                    "Ошибка Kokoro TTS."

            });

        }

    }
);


/* =====================================================
   WAV
===================================================== */

function createWav(
    samples,
    sampleRate
) {

    const pcmLength =
        samples.length * 2;


    const buffer =
        Buffer.alloc(
            44 + pcmLength
        );


    let offset =
        0;


    buffer.write(
        "RIFF",
        offset
    );

    offset += 4;


    buffer.writeUInt32LE(
        36 + pcmLength,
        offset
    );

    offset += 4;


    buffer.write(
        "WAVE",
        offset
    );

    offset += 4;


    buffer.write(
        "fmt ",
        offset
    );

    offset += 4;


    buffer.writeUInt32LE(
        16,
        offset
    );

    offset += 4;


    buffer.writeUInt16LE(
        1,
        offset
    );

    offset += 2;


    buffer.writeUInt16LE(
        1,
        offset
    );

    offset += 2;


    buffer.writeUInt32LE(
        sampleRate,
        offset
    );

    offset += 4;


    buffer.writeUInt32LE(
        sampleRate * 2,
        offset
    );

    offset += 4;


    buffer.writeUInt16LE(
        2,
        offset
    );

    offset += 2;


    buffer.writeUInt16LE(
        16,
        offset
    );

    offset += 2;


    buffer.write(
        "data",
        offset
    );

    offset += 4;


    buffer.writeUInt32LE(
        pcmLength,
        offset
    );

    offset += 4;


    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        let value =
            Math.max(
                -1,
                Math.min(
                    1,
                    samples[i]
                )
            );


        const pcm =
            value < 0
                ? value * 32768
                : value * 32767;


        buffer.writeInt16LE(
            Math.round(pcm),
            offset
        );


        offset += 2;

    }


    return buffer;

}


/* =====================================================
   START
===================================================== */

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
            "Kokoro:",
            "Russian Dima TTS"
        );

        console.log(
            "================================="
        );

    }
);
