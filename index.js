require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "kilem_bot_token_123";

const VILLAGES = {
  "1": { name: "Шаған", link: "https://chat.whatsapp.com/CW4fit1WsBaKXff3KpkVb6" },
  "2": { name: "Іңкәр", link: "https://chat.whatsapp.com/GxVycelhWIu34kbxkFUiQ3" },
  "3": { name: "Жаңадария", link: "https://chat.whatsapp.com/ELXpE07AhEP1P0YDT0pt56" },
  "4": { name: "Ақжарма", link: "https://chat.whatsapp.com/EcVGbeIUb426uWNNu7f3D6" },
  "5": { name: "Аққұм", link: "https://chat.whatsapp.com/JVnKeF4Psaw2XPadexW8WX" },
  "6": { name: "Еңбек", link: "https://chat.whatsapp.com/GZpjuakABfWDESLKl4CraE" },
  "7": { name: "Ақарық (Аламесек)", link: "https://chat.whatsapp.com/GRr1UNWmgkrC1k2N4Cqe6A" },
  "8": { name: "Бұқарбай батыр", link: "https://chat.whatsapp.com/L25WyQ8xbxHLp1Bw9zbzmm" },
  "9": { name: "Таң", link: "https://chat.whatsapp.com/K1I9xBWhrOm7rCbJBazoaE" },
  "10": { name: "Мәдениет", link: "https://chat.whatsapp.com/IraZspVfONlCtFLvfkyhs0" },
  "11": { name: "Мырзабай ахун", link: "https://chat.whatsapp.com/EtX89MUviWQHUgKsF8ddhO" },
  "12": { name: "Мақпалкөл", link: "https://chat.whatsapp.com/KuWV7ewGeiVD6BefKoglRW" },
  "13": { name: "Жаңаталап", link: "https://chat.whatsapp.com/Bm1svgu1KtfLvA4J1K59dF" }
};

async function sendWhatsAppMessage(to, text) {
  try {
    await axios({
      method: "POST",
      url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      data: {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: text }
      }
    });
  } catch (error) {
    console.error("Ошибка отправки:", error.response ? error.response.data : error.message);
  }
}

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
  res.sendStatus(400);
});

app.post('/webhook', async (req, res) => {
  const body = req.body;
  res.sendStatus(200);

  if (body.object === "whatsapp_business_account") {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === "text") {
      const from = message.from;
      const userText = message.text.body.trim();

      const dimensionMatch = userText.match(/(\d+[\.,]?\d*)\s*[*хxX]\s*(\d+[\.,]?\d*)/);

      if (dimensionMatch) {
        const length = parseFloat(dimensionMatch[1].replace(',', '.'));
        const width = parseFloat(dimensionMatch[2].replace(',', '.'));
        const sqm = length * width;
        const total = sqm * 450;

        const reply = `📐 *Есептеу нәтижесі:*\n` +
                      `• Ауданы: *${sqm} кв.м* (${length}м × ${width}м)\n` +
                      `• Тазалау құны: *${total.toLocaleString()} ₸* (1 кв.м = 450 ₸)\n\n` +
                      `Ауылыңызды таңдау үшін төмендегі сандардың бірін жіберіңіз:\n` +
                      `1. Шаған | 2. Іңкәр | 3. Жаңадария\n` +
                      `4. Ақжарма | 5. Аққұм | 6. Еңбек\n` +
                      `7. Ақарық | 8. Бұқарбай | 9. Таң\n` +
                      `10. Мәдениет | 11. Мырзабай | 12. Мақпалкөл | 13. Жаңаталап`;

        await sendWhatsAppMessage(from, reply);
      } 
      else if (VILLAGES[userText]) {
        const village = VILLAGES[userText];
        const reply = `Рақмет! Сіз *${village.name}* ауылын таңдадыңыз. 👋\n\n` +
                      `📍 Логистика мен курьерге ыңғайлы болу үшін өзіңіздің ауылдың арнайы чатына өтіңіз:\n` +
                      `🔗 ${village.link}\n\n` +
                      `📌 *Өтініш:* Чатқа өткен соң немесе осы жерге толық *мекенжайыңызды (көше, үй нөмірі)* жазбаша қалдырыңыз!`;

        await sendWhatsAppMessage(from, reply);
      } 
      else {
        const greeting = `Сәлеметсіз бе! 👋 «Кілем тазалау» орталығына кош келдіңіз!\n\n` +
                         `📋 *Қызмет бағалары:*\n` +
                         `• 🧼 Кілем жуу — *450 ₸ / кв.м*\n` +
                         `• 🛏 Көрпеше тазалау — *1 500 – 1 800 ₸*\n` +
                         `• 🛋 Жамылғы (плед) — *2 500 – 3 000 ₸*\n\n` +
                         `💡 *Кілем жуу бағасын білу үшін:* Кілеміңіздің өлшемін жазыңыз (мысалы: *3х4* немесе *2.5x3*).\n\n` +
                         `Ауылдар бойынша топқа қосылу үшін ауыл нөмірін жіберіңіз:\n` +
                         `1. Шаған | 2. Іңкәр | 3. Жаңадария | 4. Ақжарма\n` +
                         `5. Аққұм | 6. Еңбек | 7. Ақарық | 8. Бұқарбай\n` +
                         `9. Таң | 10. Мәдениет | 11. Мырзабай | 12. Мақпалкөл | 13. Жаңаталап`;

        await sendWhatsAppMessage(from, greeting);
      }
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
