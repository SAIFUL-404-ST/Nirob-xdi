const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "saifreply",
    version: "1.0.0",
    author: "SAIF",
    countDown: 1,
    role: 0,
    shortDescription: "Auto reply to specific words",
    longDescription: "Automatically replies when someone says 'saif' or 'saiful'",
    category: "fun",
    guide: {
      en: "This command automatically responds when it detects 'saif' or 'saiful' in a message."
    }
  },

  onStart: async function () {},

  onChat: async function ({ message, event }) {
    const content = event.body?.toLowerCase();
    if (!content) return;

    if (content.includes("saif") || content.includes("saiful")) {
      const videoUrl = "https://files.catbox.moe/ahydvf.mp4";
      const videoPath = path.join(__dirname, "saif_temp.mp4");

      try {
        const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(videoPath, Buffer.from(response.data, "binary"));

        return message.reply({
          body: "⛔ এই নেও বসের আইডির লিংক |👇= https://www.facebook.com/share/1LBhgrKVPD/ মেসেজ দেও 😚",
          attachment: fs.createReadStream(videoPath)
        }, () => fs.unlinkSync(videoPath)); // পাঠানোর পর temp ভিডিও ডিলিট
      } catch (err) {
        console.error("Video fetch failed:", err);
        return message.reply("😓 ভিডিও পাঠানো যায়নি, পরে আবার চেষ্টা করো।");
      }
    }
  }
};
