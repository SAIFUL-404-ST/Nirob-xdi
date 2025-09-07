const axios = require("axios");
const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "art",
    version: "1.2",
    author: "SAIF (improved from NTKhang)",
    countDown: 7,
    role: 0,
    shortDescription: "AI Anime art",
    longDescription: "Generate Anime style art from an image using AI",
    category: "BOX CHAT",
    guide: {
      en: "{pn} (reply with image) | {pn} <image_url> [style_number]"
    }
  },

  onStart: async function ({ message, event, args }) {
    // ====== Approval / Bypass system ======
    const approvedPath = path.join(__dirname, "assist_json", "approved_main.json");
    const bypassPath = path.join(__dirname, "assist_json", "bypass_id.json");

    const approvedIds = fs.existsSync(approvedPath)
      ? JSON.parse(fs.readFileSync(approvedPath))
      : [];
    const bypassIds = fs.existsSync(bypassPath)
      ? JSON.parse(fs.readFileSync(bypassPath))
      : [];

    const bypassUid = event.senderID;
    if (!bypassIds.includes(bypassUid)) {
      if (!approvedIds.includes(event.threadID)) {
        return message.reply(
          "⚠️ Command 'art' is locked 🔒\nReason: Main command restricted.\n\nAsk admin with {p}requestMain to get access."
        );
      }
    }

    // ====== Get image input ======
    let imageUrlInput, type;

    if (event.messageReply?.attachments?.[0]?.url) {
      imageUrlInput = event.messageReply.attachments[0].url;
      type = isNaN(args[0]) ? 1 : Number(args[0]);
    } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/i)) {
      imageUrlInput = args[0];
      type = isNaN(args[1]) ? 1 : Number(args[1]);
    } else {
      return message.reply("⚠️ Invalid image input.\nReply with an image or provide a valid image URL.");
    }

    try {
      // ====== Request AI Art ======
      const res = await axios.get("https://goatbotserver.onrender.com/taoanhdep/art", {
        params: { image: imageUrlInput, type }
      });

      if (!res.data?.data?.effect_img) {
        throw new Error("No effect_img returned from API");
      }

      const imageBuffer = await axios.get(res.data.data.effect_img, { responseType: "arraybuffer" });
      const watermarkBuffer = await axios.get(
        "https://i.ibb.co/4SWk7F2/Picsart-23-05-14-22-56-04-275.png",
        { responseType: "arraybuffer" }
      );

      const originalImage = await loadImage(imageBuffer.data);
      const watermarkImage = await loadImage(watermarkBuffer.data);

      // ====== Draw canvas ======
      const canvas = createCanvas(originalImage.width, originalImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(originalImage, 0, 0);

      // Add watermark
      const wmWidth = Math.floor(originalImage.width / 4);
      const wmHeight = Math.floor(watermarkImage.height * (wmWidth / watermarkImage.width));
      ctx.globalAlpha = 0.5;
      ctx.drawImage(watermarkImage, canvas.width - wmWidth, canvas.height - wmHeight, wmWidth, wmHeight);
      ctx.globalAlpha = 1;

      const buffer = canvas.toBuffer();

      // Send result (no temp file needed)
      await message.reply({
        body: "✨ Anime AI Art generated successfully!\n💡 Tip: Use FB Lite to save the image easily ✅",
        attachment: buffer
      });

    } catch (err) {
      console.error("❌ Art command error:", err.message || err);
      message.reply("❌ An error occurred while generating the art. Please try again later.");
    }
  }
};
