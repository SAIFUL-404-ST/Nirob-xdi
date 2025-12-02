const fs = require("fs-extra");
const path = require("path");

const DATA_FILE = path.join(__dirname, "autopropose_data.json");

module.exports = {
  config: {
    name: "autopropose",
    aliases: ["pw", "loveauto"],
    version: "3.0",
    author: "Saif (for Senpai)",
    countDown: 3,
    role: 2,
    shortDescription: "Auto love-react + Bangla propose",
    longDescription: "Target user message korlei react + propose.",
    category: "love",
    guide: "{pn} on/off\n{pn} on @tag\nReply diye {pn} on"
  },

  loadData() {
    if (!fs.existsSync(DATA_FILE)) fs.writeJsonSync(DATA_FILE, {});
    return fs.readJsonSync(DATA_FILE);
  },

  saveData(data) {
    fs.writeJsonSync(DATA_FILE, data, { spaces: 2 });
  },

  reactions: ["❤️", "❤️‍🩹", "🧡", "💛", "🖤", "🤎", "💜", "💚", "💖", "💝"],

  captions: [
    "তোমার একটা হাসি আমার পুরো দিনটাই বদলে দেয়… তুমি কি আমার হয়ে হাসবে?",
    "তোমার নামটা আজকাল দোয়ার আগেই মনে আসে… তুমি কি আমার হবে?",
    "তোমাকে চাই নিজের মতো, নিজের জন্য—চিরদিন। হবে?",
    "তোমায় না পেলে মনে হয় জীবনটা ঠিকমতো বাঁচিনি… প্লিজ, আমার হও?",
    "হৃদয়টা আজকাল বড় অস্থির… কারণ তুমি ওখানে জায়গা করে নিয়েছো।",
    "তুমি না থাকলে বাঁচার মজা অর্ধেক কমে যায়… তুমি কি আমার পাশে থাকবে?",
    "তোমার সাথে কথা বললেই মনটা শান্ত হয়ে যায়—তুমি কি এই শান্তিটাকে চিরদিনের করতে দিবে?",
    "হাজার মানুষের ভিড়ে চোখ শুধু তোমাকেই খোঁজে… তুমি কি আমার সেই একজন হবে?",
    "তোমাকে ছাড়া ভবিষ্যৎ চিন্তাই করতে পারি না… তুমি কি আমার আগামী হবে?",
    "আমি প্রপোজ করছি না… আমার ভবিষ্যৎ তোমার হাতে তুলে দিচ্ছি। ধরবে?"
  ],

  // ===========================
  // ►► ON / OFF / STATUS
  // ===========================
  onStart({ api, event, args }) {
    const threadID = event.threadID;
    const data = this.loadData();
    if (!data[threadID]) data[threadID] = { enabled: false, target: null };

    const cmd = (args[0] || "").toLowerCase();

    // OFF
    if (cmd === "off") {
      data[threadID].enabled = false;
      data[threadID].target = null;
      this.saveData(data);
      return api.sendMessage("⛔ Auto-Propose বন্ধ করা হলো।", threadID);
    }

    // STATUS
    if (cmd === "status") {
      const t = data[threadID].target;
      return api.sendMessage(
        `Status: ${data[threadID].enabled ? "ON ❤️" : "OFF ❌"}\nTarget: ${t ? t : "❌ Set না"}`,
        threadID
      );
    }

    // ON (reply / tag / manual)
    if (cmd === "on") {
      let targetUID = null;

      // If reply
      if (event.messageReply) {
        targetUID = event.messageReply.senderID;
      }

      // If tag
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
      }

      // If neither reply nor tag → keep last target
      if (!targetUID) {
        if (!data[threadID].target)
          return api.sendMessage("❗ Please reply/tag someone অথবা আগের target নেই।", threadID);
        targetUID = data[threadID].target;
      }

      data[threadID].enabled = true;
      data[threadID].target = targetUID;
      this.saveData(data);

      return api.sendMessage(
        `❤️ Auto-Propose চালু!\n🎯 Target UID: ${targetUID}`,
        threadID
      );
    }

    return api.sendMessage("Use: {pn} on/off/status", threadID);
  },

  // ===========================
  // ►► AUTO TRIGGER
  // ===========================
  async onChat({ api, event }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    const data = this.loadData();
    if (!data[threadID] || !data[threadID].enabled) return;

    const target = data[threadID].target;
    if (!target || String(senderID) !== String(target)) return;

    // Reaction
    const r = this.reactions[Math.floor(Math.random() * this.reactions.length)];
    api.setMessageReaction(r, event.messageID, () => {}, true);

    // Caption
    const c = this.captions[Math.floor(Math.random() * this.captions.length)];
    api.sendMessage(c, threadID, undefined, event.messageID);
  }
};
