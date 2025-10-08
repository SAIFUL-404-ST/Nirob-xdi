const fs = require("fs-extra");
const axios = require("axios");
const request = require("request");
const https = require("https");
const path = require("path");

module.exports = {
  config: {
    name: 'auto',
    version: '5.5',
    author: 'Gok-Gok',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto video downloader',
    category: 'media',
  },

  onStart: async function ({ api, event }) {
    return api.sendMessage("📥 Send a link with https:// to start downloading 🎥", event.threadID);
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const message = event.body?.trim();
    if (!message) return;

    // ✅ If message has https://, then run downloader
    const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
    if (!linkMatch) return;

    const videoLink = linkMatch[0];
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const isFacebook = videoLink.includes("facebook.com");

    const headers = isFacebook
      ? {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "*/*",
          "Referer": "https://www.facebook.com/"
        }
      : { "User-Agent": "Mozilla/5.0" };

    const httpsAgent = isFacebook
      ? new https.Agent({ family: 4 })
      : undefined;

    try {
      const jsonRes = await axios.get("https://raw.githubusercontent.com/MR-MAHABUB-004/MAHABUB-BOT-STORAGE/main/APIURL.json");
      const apiBaseURL = jsonRes.data.Alldl;

      const response = await axios.get(
        `${apiBaseURL}${encodeURIComponent(videoLink)}`,
        { headers, httpsAgent }
      );

      const { platform, title, hd, sd } = response.data;
      const downloadURL = hd || sd;

      if (!downloadURL) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("♥︎", threadID, event.messageID);
      }

      // ✅ Safe path: use 'cache/' folder
      const cacheDir = path.join(__dirname, "cache");
      const filePath = path.join(cacheDir, "video.mp4");

      // ✅ Ensure cache folder exists
      await fs.ensureDir(cacheDir);

      request({ url: downloadURL, headers })
        .pipe(fs.createWriteStream(filePath))
        .on("close", async () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          await api.sendMessage({
            body: `╭──────────────────◊\n\n├‣ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐃 \n\n├‣ 𝐏𝐋𝐀𝐓𝐅𝐎𝐑𝐌: ${platform || "Unknown"}\n├‣ 𝐓𝐈𝐓𝐋𝐄: ${title || "No Title"}\n├‣ 𝐐𝐔𝐀𝐋𝐈𝐓𝐘: ${hd ? "HD" : "SD"}\n\n╰──────────────────◊`,
            attachment: fs.createReadStream(filePath)
          }, threadID, () => fs.unlinkSync(filePath));
        })
        .on("error", (err) => {
          console.error("File Write Error:", err);
          api.setMessageReaction("❌", event.messageID, () => {}, true);
          api.sendMessage("♥︎", threadID, event.messageID);
        });

    } catch (err) {
      console.error("API Error:", err.response?.data || err.message || err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage("♥︎", threadID, event.messageID);
    }
  }
};
