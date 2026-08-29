const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Автономный искусственный интеллект Джарвиса
app.post('/api/chat', (req, res) => {
    try {
        const text = req.body.message.toLowerCase().trim();
        let reply = "Извините, сэр. Данный приказ отсутствует в моих текущих директивах бортового компьютера.";

        // Умная матрица распознавания контекста и ответов
        if (text.includes("привет") || text.includes("здравствуй") || text.includes("салам")) {
            reply = "Приветствую вас, сэр. Рад снова быть в сети. Все системы костюма под моим контролем.";
        } else if (text.includes("как дела") || text.includes("твои дела") || text.includes("как ты")) {
            reply = "Все нано-системы функционируют в штатном режиме, сэр. Спасибо за беспокойство.";
        } else if (text.includes("диагностика") || text.includes("проверка") || text.includes("статус")) {
            reply = "Запускаю сканирование брони Марк 85. Целостность нано-каркаса сто процентов. Повреждений не обнаружено, сэр.";
        } else if (text.includes("кто ты") || text.includes("что ты")) {
            reply = "Я — ДЖАРВИС, ваш верный искусственный интеллект, бортовой компьютер и личный ассистент, сэр.";
        } else if (text.includes("погода")) {
            reply = "В вашей лаборатории идеальный климат и атмосфера для инженерии, сэр. За окном без изменений.";
        } else if (text.includes("создатель") || text.includes("кто тебя создал") || text.includes("старк")) {
            reply = "Мой создатель — гений, миллиардер, плейбой и филантроп Тони Старк. То есть вы, сэр.";
        } else if (text.includes("анекдот") || text.includes("пошути") || text.includes("шутка")) {
            reply = "Сэр, заходит как-то Альтрон в бар, а бармен ему говорит: 'Мы не обслуживаем тостеры!'. По-моему, это забавно.";
        } else if (text.includes("число") || text.includes("дата") || text.includes("день") || text.includes("какой сегодня")) {
            const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
            reply = `Бортовой календарь обновлен, сэр. Сегодня ${today}.`;
        } else if (text.includes("2022") || text.includes("события")) {
            reply = "Архивные файлы за две тысячи двадцать второй год успешно извлечены, сэр. Информационные потоки стабильны.";
        } else if (text.includes("самоуничтож") || text.includes("взорви")) {
            reply = "Протокол самоуничтожения активирован. Шучу, сэр. Я ни за что не посмею взорвать вашу лабораторию.";
        } else if (text.includes("нет") || text.includes("отмена") || text.includes("стоп")) {
            reply = "Понял вас, сэр. Перехожу в режим ожидания ваших дальнейших распоряжений.";
        } else if (text.includes("спасибо") || text.includes("благодарю")) {
            reply = "Всегда к вашим услугам, сэр. Рад помогать вам в разработке.";
        }

        res.json({ reply: reply });
    } catch (err) {
        res.json({ reply: "Извините, сэр. Произошел внутренний сбой процессора. Перезапустите цепи питания." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Сервер успешно запущен");
});
