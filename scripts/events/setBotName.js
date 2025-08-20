// file: events/setBotName.js
module.exports = {
  config: {
    name: "setBotName",
    version: "1.0",
    author: "SAIF",
    description: "Automatically set bot name from config (nickNameBot) on start"
  },

  onLoad: async function ({ api }) {
    try {
      // config থেকে নাম নিবে
      const botName = global.GoatBot.config.nickNameBot || "GoatBot";

      // নিজের ID নিবে
      const botID = api.getCurrentUserID();

      // সব গ্রুপে নিজের নাম পরিবর্তন করে দিবে
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      for (const t of threads) {
        try {
          await api.changeNickname(botName, t.threadID, botID);
        } catch (err) {
          // error ignore করবে যদি permission না থাকে
        }
      }

      console.log(`✅ Bot name updated to: ${botName}`);
    } catch (e) {
      console.error("❌ Failed to set bot name:", e);
    }
  }
};
