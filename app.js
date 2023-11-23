const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/send-message", async (req, res) => {
  const { message } = req.body;

  console.log("Received message", message);

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ["--no-sandbox"],
    },
  });

  client.initialize();

  console.log(process.env.CONTACT_NUMBER);

  console.log("Loading WhatsApp Client....");

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("authenticated", (session) => {
    console.log("Authenticated session");
  });

  const wait = (msec) =>
    new Promise((resolve, _) => {
      setTimeout(resolve, msec);
    });

  client.on("ready", async () => {
    try {
      await client.sendMessage(process.env.CONTACT_NUMBER, message);
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }

    await wait(4000);

    process.exit();
  });

  client.on("message_create", async () => {});

  res.json({ message: "Message sent successfully!" });
});

app.listen(port, () => {
  console.log(process.env.CONTACT_NUMBER);

  console.log(`API listening on port ${port}`);
});
