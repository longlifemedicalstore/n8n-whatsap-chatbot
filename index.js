const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post("/webhook", async (req, res) => {
  const incomingMsg = req.body?.messages?.[0]?.text?.body || "Hello";
  const senderId = req.body?.messages?.[0]?.from || "";

  try {
    const openaiResponse = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: incomingMsg }]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const reply = openaiResponse.data.choices[0].message.content;

    await axios.post(`https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`, {
      messaging_product: "whatsapp",
      to: senderId,
      text: { body: reply }
    }, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("Longlife WhatsApp Bot is running.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
