const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "art",
    version: "1.1",
    author: "NTKhang + Modified by SAIF",
    countDown: 7,
    role: 0,
    shortDescription: "AI Anime art",
    longDescription: "Reply to a photo or give a link, and get anime-styled AI art.",
    category: "image",
    guide: {
      en: "{pn} (reply to photo or give URL)"
    }
  },

  onStart: async function ({ message, event, args }) {
    try {
      // STEP 1: Input image from reply or args
      let imageUrlInput;
      let type;

      if (["photo", "sticker"].includes(event.messageReply?.attachments[0]?.type)) {
        imageUrlInput = event.messageReply.attachments[0].url;
        type = isNaN(args[0]) ? 1 : Number(args[0]);
      } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
        imageUrlInput = args[0];
        type = isNaN(args[1]) ? 1 : Number(args[1]);
      } else {
        return message.reply("⚠️ Please reply to an image or provide a valid image URL (.jpg/.png)");
      }

      // STEP 2: Call AI art API
      const res = await axios.get("https://goatbotserver.onrender.com/taoanhdep/art", {
        params: {
          image: imageUrlInput,
          type
        }
      });

      if (!res.data?.data?.effect_img) {
        return message.reply("❌ Failed to get image from server.");
      }

      // STEP 3: Load AI result + watermark
      const aiImageBuffer = (await axios.get(res.data.data.effect_img, { responseType: "arraybuffer" })).data;
      const watermarkBuffer = (await axios.get("https://i.ibb.co/4SWk7F2/Picsart-23-05-14-22-56-04-275.png", { responseType: "arraybuffer" })).data;

      const canvas = createCanvas();
      const ctx = canvas.getContext("2d");

      const originalImage = await loadImage(aiImageBuffer);
      const watermarkImage = await loadImage(watermarkBuffer);

      canvas.width = originalImage.width;
      canvas.height = originalImage.height;

      ctx.drawImage(originalImage, 0, 0);

      // Watermark bottom-right corner
      const wmWidth = Math.floor(originalImage.width / 4);
      const wmHeight = Math.floor(watermarkImage.height * (wmWidth / watermarkImage.width));
      ctx.globalAlpha = 0.7;
      ctx.drawImage(watermarkImage, canvas.width - wmWidth, canvas.height - wmHeight, wmWidth, wmHeight);
      ctx.globalAlpha = 1;

      const finalImage = canvas.toBuffer("image/png");

      const filePath = `${__dirname}/cache/anime_art_${Date.now()}.png`;
      await fs.outputFile(filePath, finalImage);

      // STEP 4: Send result
      await message.reply({
        body: "✨ Anime AI Art generated!\n\n💡 Tip: Use FB Lite or long-press to save.",
        attachment: fs.createReadStream(filePath)
      });

      // Delete image from disk
      await fs.remove(filePath);
    } catch (error) {
      console.error("Art command error:", error.message);
      return message.reply("❌ Something went wrong while generating the AI art.");
    }
  }
};
