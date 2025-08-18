const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "edit",
    aliases: ["e"],
    version: "1.0",
    author: "TANVIR",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Edit image using prompt" },
    longDescription: { en: "Edit an uploaded image based on your prompt." },
    category: "image",
    guide: { en: "{p}edit [prompt] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("⚠️ | Please reply to a photo with your prompt to edit it.");
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}_edit.jpg`);
    const waitMsg = await message.reply(`🧪𝙴𝙳𝙸𝚃𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴: "${prompt}"...\n 𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝙰𝙸𝚃...`);

    try {
      const imgURL = repliedImage.url;
      const imageUrl = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;
      const res = await axios.get(imageUrl, { responseType: "arraybuffer" });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      await message.reply({
        body: `✅ | 𝙴𝙳𝙸𝚃𝙴𝙳 𝙸𝙼𝙰𝙶𝙴: "${prompt}"`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (err) {
      console.error("EDIT Error:", err);
      message.reply("❌ | 𝙵𝙰𝙸𝙻𝙴𝙳 𝚃𝙾 𝙴𝙳𝙸𝚃 𝙸𝙼𝙰𝙶𝙴. 𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗.");
    } finally {
      await fs.remove(imgPath);
      api.unsendMessage(waitMsg.messageID);
    }
  }
};
