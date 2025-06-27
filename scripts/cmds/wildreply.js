module.exports = {
  config: {
    name: "wildreply",
    version: "1.0",
    author: " SAIF",
    role: 0,
    shortDescription: "Reply to wild animal emojis",
    category: "fun",
    guide: "Send 🦖🐢🐊 etc. to trigger a reply"
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const wildEmojis = ["🦖", "🐢", "🐳", "🐸", "🐇", "🐊", "🐐"];
    const msg = event.body;

    if (!msg) return;

    const found = wildEmojis.some(e => msg.includes(e));
    if (found) {
      return api.sendMessage("বম্ভোলা, উইরা যা সান্ডার পোলা 😾", event.threadID, event.messageID);
    }
  }
};
