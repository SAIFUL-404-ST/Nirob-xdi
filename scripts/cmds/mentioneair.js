const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "mentionpair",
    aliases:["mpair"]
    version: "1.1",
    author: "null but zeroday",
    role: 0,
    longDescription: "Pair yourself with a mentioned person only.",
    category: "𝗙𝗨𝗡",
    guide: {
      en: "{pn} @mention",
    },
  },

  onStart: async function ({ api, event, usersData }) {
    const senderID = event.senderID;
    const mentionIDs = Object.keys(event.mentions);

    if (mentionIDs.length !== 1) {
      return api.sendMessage("❗ Please mention exactly one person to pair with.", event.threadID, event.messageID);
    }

    const receiverID = mentionIDs[0];
    if (receiverID === senderID) {
      return api.sendMessage("❗ You can't pair with yourself! 😂", event.threadID, event.messageID);
    }

    const name1 = await usersData.getName(senderID);
    const name2 = await usersData.getName(receiverID);

    const timestamp = Date.now();
    const cacheDir = `${__dirname}/tmp`;
    const pathImg = `${cacheDir}/${timestamp}.png`;
    const pathAvt1 = `${cacheDir}/sender.png`;
    const pathAvt2 = `${cacheDir}/receiver.png`;

    const titles = [
      "Soulmates 💞",
      "Crush Alert 🥰",
      "Besties Forever 👯‍♀️",
      "Secret Lovers 😘",
      "Cutest Couple Ever 😍"
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const matchPercent = Math.floor(Math.random() * 40) + 60; // 60–99%

    const backgroundPath = `${__dirname}/assets/background.png`;

    try {
      await fs.ensureDir(cacheDir);

      // Fetch avatars
      const url1 = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const url2 = `https://graph.facebook.com/${receiverID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const res1 = await axios.get(url1, { responseType: "arraybuffer" });
      const res2 = await axios.get(url2, { responseType: "arraybuffer" });

      fs.writeFileSync(pathAvt1, res1.data);
      fs.writeFileSync(pathAvt2, res2.data);

      if (!fs.existsSync(backgroundPath)) {
        return api.sendMessage("❌ Background image not found!", event.threadID, event.messageID);
      }

      const bg = await loadImage(backgroundPath);
      const avt1 = await loadImage(pathAvt1);
      const avt2 = await loadImage(pathAvt2);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      // Draw
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avt1, 380, 450, 700, 700);
      ctx.drawImage(avt2, 2040, 450, 700, 700);

      ctx.font = "100px Arial";
      ctx.fillStyle = "red";
      ctx.fillText("❤️", 1450, 800);

      ctx.font = "80px Arial";
      ctx.fillStyle = "hotpink";
      ctx.fillText(`${matchPercent}% Match`, 1350, 1050);

      ctx.font = "90px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(randomTitle, 1300, 300);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(pathImg, buffer);
      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      return api.sendMessage(
        {
          body: `💘 ${name1} & ${name2} — You’re ${matchPercent}% compatible!\n✨ Relationship: ${randomTitle}`,
          mentions: [
            { tag: name1, id: senderID },
            { tag: name2, id: receiverID }
          ],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        async () => fs.unlinkSync(pathImg),
        event.messageID
      );

    } catch (err) {
      console.error("Pairing error:", err);
      return api.sendMessage("⚠️ Error occurred while pairing you up.", event.threadID, event.messageID);
    }
  }
};
