const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  config: {
    name: "edit",
    aliases: ["e"],
    version: "2.0",
    author: "TANVIR + Modified By Saif",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Edit image using prompt (1000 coins per use)" },
    longDescription: { en: "Edit an uploaded image based on your prompt. Cost: 1000 coins" },
    category: "image",
    guide: { en: "{p}edit [prompt] (reply to image)" }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const prompt = args.join(" ");
    const repliedImage = event.messageReply?.attachments?.[0];
    const userId = event.senderID;
    const cost = 1000;

    // check user balance
    let userData = await usersData.get(userId);
    if (!userData || typeof userData.money !== "number") {
      userData = { money: 0 };
    }

    if (userData.money < cost) {
      return message.reply(`⚠️ | You do not have enough money!\n💰 Your balance: ${userData.money} coins\n❌ Required: ${cost} coins`);
    }

    if (!prompt || !repliedImage || repliedImage.type !== "photo") {
      return message.reply("⚠️ | Please reply to a photo with your prompt to edit it.");
    }

    const imgPath = path.join(__dirname, "cache", `${uuidv4()}_edit.jpg`);
    const waitMsg = await message.reply(`🧪 Editing your image...\nPrompt: "${prompt}"\n⏳ Please wait...`);

    try {
      const imgURL = repliedImage.url;
      const apiUrl = `https://edit-and-gen.onrender.com/gen?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imgURL)}`;

      const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 60000 });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data, "binary"));

      // deduct money
      userData.money -= cost;
      await usersData.set(userId, userData);

      await message.reply({
        body: `✅ Edited Image:\n"${prompt}"\n💰 -${cost} coins (Remaining: ${userData.money})`,
        attachment: fs.createReadStream(imgPath)
      });

      await api.unsendMessage(waitMsg.messageID);

    } catch (err) {
      console.error("EDIT Error:", err.message || err);
      await message.reply("❌ Failed to edit image.\nPlease try again later.");
      await api.editMessage("❌ Editing failed!", waitMsg.messageID).catch(() => {});
    } finally {
      await fs.remove(imgPath).catch(() => {});
    }
  }
};
