const { DisconnectReason } = require("@whiskeysockets/baileys");
const useMongoDBAuthState = require("./mongoAuthState");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { MongoClient } = require("mongodb");
const { formatMeals } = require("./helpers");
require("dotenv").config();

const mongoURL = process.env.MONGO_URI;

exports.handler = async (event) => {
  console.log("EVENT HERE", event);
  try {
    // MongoDB connection
    const mongoClient = new MongoClient(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    try {
      await mongoClient.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }

    // Internet access test - HTTP GET request

    // Use MongoDB connection and other existing code...

    const collection = mongoClient.db("whatsapp_api").collection("auth_info_baileys");
    const { state, saveCreds } = await useMongoDBAuthState(collection);
    const sock = makeWASocket({
      printQRInTerminal: true,
      auth: state,
    });

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update || {};

      if (qr) {
        console.log(qr);
      }

      if (connection === "close") {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          connectionLogic();
        } else {
          process.exit();
        }
      }
    });

    await sock.waitForConnectionUpdate(({ connection }) => connection === "open");

    sock.ev.on("creds.update", saveCreds);

    const { menuId, sortId, date, meals, ruCode, served } = event;
    if (!menuId || !sortId || !date || !meals || !ruCode || !served) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request. Required fields are missing." }),
      };
    }

    const message = formatMeals(event);
    const msg = await sock.sendMessage("number", { text: message });

    if (msg.status === 1) {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: "Message sent successfully." }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal server error." }),
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error." }),
    };
  }
};
