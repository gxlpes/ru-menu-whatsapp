const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const qrcode = require("qrcode-terminal");
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(bodyParser.json());

let store;
store = new MongoStore({ mongoose: mongoose });
const client = new Client({
  puppeteer: {
    headless: true,
  },
  authStrategy: new RemoteAuth({
    clientId: "123",
    store: store,
    backupSyncIntervalMs: 300000,
  }),
});

app.post("/send-message", async (req, res) => {
  const { message } = req.body;

  console.log("Received message", message);

  mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log(process.env.CONTACT_NUMBER);

    console.log("Loading WhatsApp Client....");

    client.on("ready", async () => {
      try {
        await client.sendMessage(process.env.CONTACT_NUMBER, message);
        console.log("Message sent successfully");
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }

      const wait = (msec) =>
        new Promise((resolve, _) => {
          setTimeout(resolve, msec);
        });

      await wait(4000);

      process.exit();
    });

    client.on("message_create", async () => {});

    client.initialize();
  });
});

app.listen(port, () => {
  console.log(process.env.CONTACT_NUMBER);

  console.log(`API listening on port ${port}`);
});
