const axios = require("axios");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "gemini",
    version: "1.8",
    author: "Saif",
    countDown: 5,
    role: 0,
    category: "ai",
    guide: {
      en: "{pn} message | reply with an image",
    },
  },

  onStart: async function ({ api, args, event, usersData }) {
    try {
      const COST = 500;
      const sender = event.senderID;

      // ==== Check balance ====
      let user = await usersData.get(sender);
      let balance = user.money || 0;
      if (balance < COST) {
        return api.sendMessage(
          `🌸 Senpai… you need **${COST} coins** to use Gemini!  \n💰 Your balance: ${balance} coins`,
          event.threadID, event.messageID
        );
      }

      // Deduct coins
      await usersData.set(sender, { ...user, money: balance - COST });
      const remaining = balance - COST;

      const apiUrl = `${await baseApiUrl()}/api/gemini`;
      const prompt = args.join(" ");

      if (!prompt) {
        return api.sendMessage(
          "Please provide a question to answer.\n\nExample:\n{pn} What is AI?",
          event.threadID,
          event.messageID
        );
      }

      let requestBody = { prompt };

      if (event.type === "message_reply" && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];
        if (attachment.type === "photo") {
          requestBody.imageUrl = attachment.url;
        }
      }

      const response = await axios.post(apiUrl, requestBody, {
        headers: { 
          "Content-Type": "application/json",
          "author": module.exports.config.author
        }
      });

      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      const replyText = response.data.response || "No response received.";

      api.sendMessage({
        body: `${replyText}\n\n💸 ${COST} coins deducted!\n💳 Remaining: ${remaining} coins`
      }, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            link: replyText,
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("Uwuuu~ Something went wrong (>_<)💦", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, args, event, Reply, usersData }) {
    if (Reply.author !== event.senderID) return;

    try {
      const COST = 500;
      const sender = event.senderID;

      // ==== Check balance ====
      let user = await usersData.get(sender);
      let balance = user.money || 0;
      if (balance < COST) {
        return api.sendMessage(
          `🌸 Senpai… you need **${COST} coins** to use Gemini!  \n💰 Your balance: ${balance} coins`,
          event.threadID, event.messageID
        );
      }

      // Deduct coins
      await usersData.set(sender, { ...user, money: balance - COST });
      const remaining = balance - COST;

      const apiUrl = `${await baseApiUrl()}/api/gemini`;
      const prompt = args.join(" ");
      if (!prompt) return;

      const response = await axios.post(apiUrl, { prompt }, {
        headers: { 
          "Content-Type": "application/json",
          "author": module.exports.config.author
        }
      });

      if (response.data.error) {
        return api.sendMessage(response.data.error, event.threadID, event.messageID);
      }

      const replyText = response.data.response || "No response received.";

      api.sendMessage({
        body: `${replyText}\n\n💸 ${COST} coins deducted!\n💳 Remaining: ${remaining} coins`
      }, event.threadID, (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            link: replyText,
          });
        }
      }, event.messageID);

    } catch (error) {
      console.error("Error:", error);
      api.sendMessage("Uwuuu~ Something went wrong (>_<)💦", event.threadID, event.messageID);
    }
  }
};
