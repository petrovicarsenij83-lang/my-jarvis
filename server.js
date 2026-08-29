<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>J.A.R.V.I.S. OS</title>
    <style>
        :root { --bg: #060d1a; --main: #00e5ff; --glow: rgba(0,229,255,0.4); --panel: rgba(0,15,30,0.6); --border: #00e5ff; }
        .theme-mark1 { --bg: #15181c; --main: #e0e0e0; --glow: rgba(255,255,255,0.2); --panel: rgba(40,45,50,0.6); --border: #555; }
        .theme-mark2 { --bg: #0f141d; --main: #a4c2f4; --glow: rgba(164,194,244,0.5); --panel: rgba(20,30,45,0.6); --border: #a4c2f4; }
        .theme-mark3 { --bg: #220505; --main: #ffcc00; --glow: rgba(255,204,0,0.4); --panel: rgba(80,10,10,0.6); --border: #ff3333; }
        .theme-mark50 { --bg: #1a020d; --main: #00ffcc; --glow: rgba(0,255,204,0.5); --panel: rgba(60,5,25,0.6); --border: #ff0055; }
        body { background: var(--bg); color: var(--main); font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; margin: 0; overflow: hidden; transition: all 0.4s; }
        .control-panel { position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 8px; background: rgba(0,15,30,0.7); padding: 12px; border-radius: 8px; border: 1px solid var(--main); }
        .control-panel label { font-size: 10px; font-weight: bold; letter-spacing: 1px; }
        select { background: #000; border: 1px solid var(--main); color: var(--main); padding: 6px; border-radius: 4px; font-size: 12px; font-weight: bold; outline: none; cursor: pointer; }
        .custom-color-row { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        input[type="color"] { -webkit-appearance: none; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer; background: transparent; }
        input[type="color"]::-webkit-color-swatch { border: 2px solid #fff; border-radius: 50%; }
        .core { width: 130px; height: 130px; border: 3px solid var(--main); border-radius: 50%; box-shadow: 0 0 30px var(--glow); display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: pointer; text-shadow: 0 0 10px var(--main); background: rgba(255,255,255,0.01); margin-bottom: 5px; transition: all 0.4s; letter-spacing: 2px; }
        .listening { animation: pulse 1.5s infinite alternate; border-color: #ff0055 !important; box-shadow: 0 0 40px #ff0055 !important; text-shadow: 0 0 10px #ff0055 !important; color: #ff0055 !important; }
        @keyframes pulse { 0% { transform: scale(1); } 100% { transform: scale(1.05); } }
        .status { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 15px; }
        #log { width: 85%; max-width: 500px; height: 180px; border: 1px solid rgba(255,255,255,0.1); background: var(--panel); padding: 15px; overflow-y: auto; font-size: 14px; border-radius: 6px; margin-bottom: 15px; transition: all 0.4s; }
        .u-line { color: #fff; margin-bottom: 6px; }
        .j-line { color: var(--main); margin-bottom: 12px; font-weight: bold; }
        .input-area { display: flex; width: 85%; max-width: 500px; gap: 10px; }
        input[type="text"] { flex: 1; background: rgba(0,0,0,0.4); border: 1px solid var(--border); color: #fff; padding: 10px; border-radius: 4px; font-size: 14px; outline: none; transition: all 0.4s; }
        button.send-btn { background: var(--main); border: none; color: #060d1a; padding: 10px 15px; border-radius: 4px; font-weight: bold; cursor: pointer; transition: all 0.4s; }
    </style>
</head>
<body>

    <div class="control-panel">
        <label>ГОТОВАЯ БРОНЯ:</label>
        <select id="armor-select">
            <option value="default">J.A.R.V.I.S. СТАНДАРТ</option>
            <option value="mark1">MARK I (ПЕЩЕРА)</option>
            <option value="mark2">MARK II (ХРОМ)</option>
            <option value="mark3">MARK III (КЛАССИКА)</option>
            <option value="mark50">MARK L (НАНО)</option>
        </select>
        <div class="custom-color-row">
            <label>СВОЙ ЦВЕТ:</label>
            <input type="color" id="color-picker" value="#00e5ff">
        </div>
    </div>

    <div class="core" id="voice-btn">JARVIS</div>
    <div class="status" id="status">НАЖМИТЕ НА КРУГ ДЛЯ ГОЛОСА ИЛИ НАПИШИТЕ ТЕКСТ</div>
    <div id="log"></div>
    
    <div class="input-area">
        <input type="text" id="user-input" placeholder="Написать Джарвису..." autocomplete="off">
        <button class="send-btn" id="send-btn">ВВОД</button>
    </div>

    <script>
        const status = document.getElementById('status'); const log = document.getElementById('log'); const userInput = document.getElementById('user-input'); const sendBtn = document.getElementById('send-btn'); const voiceBtn = document.getElementById('voice-btn'); const armorSelect = document.getElementById('armor-select'); const colorPicker = document.getElementById('color-picker');

        armorSelect.addEventListener('change', (e) => {
            document.body.className = ''; const selected = e.target.value;
            if (selected !== 'default') { document.body.classList.add('theme-' + selected); const styles = getComputedStyle(document.body); colorPicker.value = styles.getPropertyValue('--main-color').trim(); }
            else { document.documentElement.style.setProperty('--main-color', '#00e5ff'); document.documentElement.style.setProperty('--main-glow', 'rgba(0,229,255,0.4)'); colorPicker.value = '#00e5ff'; }
        });

        colorPicker.addEventListener('input', (e) => {
            armorSelect.value = 'default'; document.body.className = ''; const hex = e.target.value; document.documentElement.style.setProperty('--main-color', hex);
            const r = parseInt(hex.substr(1,2), 16); const g = parseInt(hex.substr(3,2), 16); const b = parseInt(hex.substr(5,2), 16);
            document.documentElement.style.setProperty('--main-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
        });

        function unlockAudioiOS() { window.speechSynthesis.speak(new SpeechSynthesisUtterance("")); }
        function audioVoice(text) { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(text); speech.lang = 'ru-RU'; window.speechSynthesis.speak(speech); }

        async function askJarvis(text) {
            log.innerHTML += `<div class="u-line">Вы: ${text}</div>`; log.scrollTop = log.scrollHeight; status.innerText = "ПОДКЛЮЧЕНИЕ К СПУТНИКОВОЙ СЕТИ...";
            try {
                const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
                const data = await response.json();
                log.innerHTML += `<div class="j-line">Джарвис: ${data.reply}</div>`; log.scrollTop = log.scrollHeight; status.innerText = "СИСТЕМА СВЯЗИ ГОТОВА"; audioVoice(data.reply);
            } catch (err) { status.innerText = "ОШИБКА СЕРВЕРА."; console.error(err); }
        }

        function handleTextInput() { unlockAudioiOS(); const text = userInput.value.trim(); if (!text) return; userInput.value = ''; askJarvis(text); }
        sendBtn.addEventListener('click', handleTextInput); userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleTextInput(); });

        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (Speech) {
            const rec = new Speech(); rec.lang = 'ru-RU';
            voiceBtn.addEventListener('click', () => { unlockAudioiOS(); try { rec.start(); status.innerText = "СЛУШАЮ ВАС, СЭР..."; voiceBtn.classList.add('listening'); } catch(e) { rec.stop(); } });
            rec.onresult = (e) => { const r = e.results.transcript; if (r) askJarvis(r); };
            rec.onerror = () => { status.innerText = "ГОЛОС НЕ РАСПОЗНАН"; };
            rec.onend = () => { voiceBtn.classList.remove('listening'); if(status.innerText === "СЛУШАЮ ВАС, СЭР...") status.innerText = "СИСТЕМА СВЯЗИ ГОТОВА"; };
        } else { status.innerText = "МИКРОФОН НЕ ПОДДЕРЖИВАЕТСЯ."; }
    </script>
</body>
</html>
