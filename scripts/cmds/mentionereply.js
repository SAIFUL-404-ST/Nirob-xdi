module.exports = {
  config: {
    name: "mentionreply",
    version: "1.0.1",
    permission: 0,
    credits: "Mim x ChatGPT",
    description: "Auto reply when specific users are mentioned",
    prefix: false,
    category: "auto",
    usages: "",
    cooldowns: 3
  },

  onStart: async function () {
    // Required for proper installation
  },

  onChat: async function({ api, event }) {
    const targetUIDs = ["61572249173718", "100081317798618", "100078639797619"];
    const replyMessage = "Dekho dekho mention dise 🐢💔";

    if (!event.mentions || Object.keys(event.mentions).length === 0) return;

    for (const uid of targetUIDs) {
      if (Object.keys(event.mentions).includes(uid)) {
        return api.sendMessage(replyMessage, event.threadID, event.messageID);
      }
    }
  }
};
