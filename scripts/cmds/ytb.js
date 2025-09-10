const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

async function getYtbApi() {
  try {
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/romeoislamrasel/romeobot/refs/heads/main/api.json"
    );
    return data.ytb;
  } catch (error) {
    console.error("Error fetching API URL:", error);
    return null;
  }
}

module.exports = {
  config: {
    name: "ytb",
    aliases: ["yt"],
    version: "2.3",
    author: "Rômeo",
    role: 0,
    countDown: 5,
    shortDescription: "Search or download YouTube",
    longDescription: "Search and download YouTube audio/video using API",
    category: "media",
    guide: {
      en: "{pn} [-a/-v] <query or YouTube URL>",
    },
  },

  onStart: async ({ api, args, event }) => {
    if (args.length < 2) {
      return api.sendMessage(
        "❌ Usage: /ytb [-a|-v] <search or YouTube URL>",
        event.threadID,
        event.messageID
      );
    }

    const isAudio = args[0] === "-a";
    const isVideo = args[0] === "-v";
    const input = (isAudio || isVideo) ? args.slice(1).join(" ") : args.join(" ");

    if (!isAudio && !isVideo) {
      return api.sendMessage(
        "❌ Please specify `-a` for audio or `-v` for video.",
        event.threadID,
        event.messageID
      );
    }

    const apiBaseUrl = await getYtbApi();
    if (!apiBaseUrl) {
      return api.sendMessage("❌ Failed to fetch API URL.", event.threadID, event.messageID);
    }

    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i;

    if (ytRegex.test(input)) {
      return await handleDownload(api, event, apiBaseUrl, input, isAudio);
    }

    try {
      const search = await yts(input);
      const results = search.videos.slice(0, 6);

      if (results.length === 0) {
        return api.sendMessage("❌ No results found.", event.threadID, event.messageID);
      }

      let msg = "🔎 YouTube Search Results:\n\n";
      results.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp} | 👤 ${v.author.name}\n\n`;
      });
      msg += "👉 Reply with a number to download.";

      const attachments = [];
      const tempThumbs = [];
      for (let i = 0; i < results.length; i++) {
        const thumbPath = path.join(__dirname, "cache", `ytb_thumb_${Date.now()}_${i}.jpg`);
        try {
          const img = await axios.get(results[i].thumbnail, { responseType: "arraybuffer" });
          fs.writeFileSync(thumbPath, img.data);
          attachments.push(fs.createReadStream(thumbPath));
          tempThumbs.push(thumbPath);
        } catch (e) {
          console.error("Thumb error:", e);
        }
      }

      api.sendMessage(
        { body: msg, attachment: attachments },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "ytb",
            messageID: info.messageID,
            author: event.senderID,
            results,
            isAudio,
            isVideo,
            tempThumbs,
          });
        },
        event.messageID
      );
    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ YouTube search failed.", event.threadID, event.messageID);
    }
  },

  onReply: async ({ event, api, Reply }) => {
    const { results, isAudio, isVideo, messageID, tempThumbs } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) || choice < 1 || choice > results.length) {
      return api.sendMessage("❌ Invalid choice.", event.threadID, event.messageID);
    }

    const selected = results[choice - 1];

    if (messageID) api.unsendMessage(messageID);
    if (tempThumbs && Array.isArray(tempThumbs)) {
      for (const file of tempThumbs) {
        try { fs.unlinkSync(file); } catch {}
      }
    }

    const apiBaseUrl = await getYtbApi();
    if (!apiBaseUrl) {
      return api.sendMessage("❌ Failed to fetch API URL.", event.threadID, event.messageID);
    }

    return await handleDownload(api, event, apiBaseUrl, selected.url, isAudio);
  },
};

async function handleDownload(api, event, apiBaseUrl, videoUrl, isAudio) {
  try {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    const { data } = await axios.get(`${apiBaseUrl}/ytb?url=${encodeURIComponent(videoUrl)}`);
    const link = isAudio ? data.mp3 : data.mp4;
    const ext = isAudio ? "mp3" : "mp4";
    const filePath = path.join(__dirname, "cache", `ytb_${Date.now()}.${ext}`);

    const response = await axios.get(link, { responseType: "stream" });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      api.sendMessage(
        {
          body: `🎬 ${data.title}\n👤 ${data.author}`,
          attachment: fs.createReadStream(filePath),
        },
        event.threadID,
        () => {
          try { fs.unlinkSync(filePath); } catch {}
        },
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ Failed to save file.", event.threadID, event.messageID);
    });
  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Download failed.", event.threadID, event.messageID);
  }
}
