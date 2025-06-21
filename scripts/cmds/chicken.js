const fs = require("fs");
const path = __dirname + "/chicken_status.json";

// Ensure the status file exists
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({ enabled: true }, null, 2));
}

function getStatus() {
  const data = fs.readFileSync(path);
  return JSON.parse(data).enabled;
}

function setStatus(value) {
  fs.writeFileSync(path, JSON.stringify({ enabled: value }, null, 2));
}

module.exports = {
  config: {
    name: "chicken",
    version: "1.2",
    author: "SAIF + ChatGPT",
    countDown: 0,
    role: 0,
    shortDescription: {
      en: "Responds to 🐤 or 🐥 with voice"
    },
    longDescription: {
      en: "Replies to chicken emojis with text + funny voice. Can be turned on/off"
    },
    category: "fun",
    guide: {
      en: "{pn} [on/off] — to enable or disable auto-reply\nJust sending 🐤 or 🐥 triggers reply when on"
    }
  },

  onStart: async function ({ args, message }) {
    if (args[0] === "on") {
      setStatus(true);
      return message.reply("✅ Chicken auto-reply is now ON.");
    } else if (args[0] === "off") {
      setStatus(false);
      return message.reply("❌ Chicken auto-reply is now OFF.");
    } else if (args.length > 0) {
      return message.reply("⚙️ Usage: chicken [on/off]");
    }
  },

  onChat: async function ({ message, event }) {
    const content = event.body;

    if (!getStatus()) return;

    if (content && (content.includes("🐤") || content.includes("🐥"))) {
      const voiceUrl = "https://media.vocaroo.com/mp3/15GYBD2BJz1N";

      return message.send({
        body: "শাহিন মুরগির বাচ্চাটাকে ধরে ফেল 🐤",
        attachment: await global.utils.getStreamFromURL(voiceUrl)
      });
    }
  }
};
