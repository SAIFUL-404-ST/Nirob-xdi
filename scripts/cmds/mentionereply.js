module.exports = {
  config: {
    name: "mentionreply",
    version: "1.4.0",
    permission: 0,
    credits: "Mim x Saif",
    description: "Auto reply when specific users are mentioned",
    prefix: false,
    category: "Utility",
    usages: "",
    cooldowns: 3
  },

  onStart: async function () {
    // Required for proper installation
  },

  onChat: async function({ api, event }) {
    const targetUIDs = ["61572249173718", "100081317798618", "100078639797619"];

    // ✨ Replies in italic small-caps bold style
    const replies = [
      "𝐛𝐨𝐬𝐬 𝐢𝐬 𝐛𝐮𝐬𝐲 — 𝐝𝐨𝐧’𝐭 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐡𝐢𝐦",
      "𝐛𝐨𝐬𝐬 𝐢𝐬 𝐬𝐥𝐞𝐞𝐩𝐢𝐧𝐠 — 𝐤𝐞𝐞𝐩 𝐪𝐮𝐢𝐞𝐭",
      " 𝐛𝐨𝐬𝐬 𝐢𝐬 𝐛𝐮𝐬𝐲",
      "𝐛𝐨𝐬𝐬 𝐝𝐨𝐞𝐬𝐧’𝐭 𝐫𝐞𝐬𝐩𝐨𝐧𝐝 𝐭𝐨 𝐥𝐨𝐰 𝐥𝐞𝐯𝐞𝐥 𝐦𝐞𝐧𝐭𝐢𝐨𝐧𝐬",
      "𝐛𝐨𝐬𝐬 𝐢𝐬 𝐨𝐧 𝐚 𝐬𝐞𝐜𝐫𝐞𝐭 𝐦𝐢𝐬𝐬𝐢𝐨𝐧 — 𝐝𝐨 𝐧𝐨𝐭 𝐝𝐢𝐬𝐭𝐮𝐫𝐛",
      "𝐝𝐨𝐧’𝐭 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐭𝐡𝐞 𝐛𝐨𝐬𝐬 𝐚𝐠𝐚𝐢𝐧 — 𝐡𝐞’𝐬 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠",
      "𝐛𝐨𝐬𝐬 𝐢𝐬 𝐭𝐡𝐢𝐧𝐤𝐢𝐧𝐠 𝐚𝐛𝐨𝐮𝐭 𝐜𝐨𝐬𝐦𝐨𝐬 — 𝐥𝐞𝐚𝐯𝐞 𝐡𝐢𝐦 𝐚𝐥𝐨𝐧𝐞"
    ];

    if (!event.mentions || Object.keys(event.mentions).length === 0) return;

    for (const uid of targetUIDs) {
      if (Object.keys(event.mentions).includes(uid)) {
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        return api.sendMessage(randomReply, event.threadID, event.messageID);
      }
    }
  }
};
