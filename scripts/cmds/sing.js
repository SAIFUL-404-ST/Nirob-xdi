const axios = require('axios');
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const { performance } = require('perf_hooks');

function getVideoID(url) {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const match = url.match(checkurl);
  return match ? match[1] : null;
}

module.exports = {
  config: {
    name: "sing",
    version: "1.0.2",
    author: "bayjid+saif",
    category: "music",
    shortDescription: "🎧 Download or play YouTube song.",
    longDescription: "Play or download YouTube music by typing the song name or link.",
    guide: "{pn} <song name or YouTube link>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      if (!args[0]) return api.sendMessage("❌ Please type a song name or YouTube link!", event.threadID, event.messageID);

      let videoID;
      if (args[0].includes("youtube.com") || args[0].includes("youtu.be")) {
        videoID = getVideoID(args[0]);
        if (!videoID) return api.sendMessage("❌ Invalid YouTube link.", event.threadID, event.messageID);
      } else {
        const search = await yts(args.join(" "));
        if (!search.videos.length) return api.sendMessage("❌ Song not found.", event.threadID, event.messageID);
        videoID = search.videos[0].videoId;
      }

      const start = performance.now();
      const tempFilePath = path.join(__dirname, "temp_audio.mp3");

      const { data } = await axios.get(`https://www.noobs-api.top/dipto/ytDl3?link=${videoID}&format=mp3`);
      if (!data.downloadLink) return api.sendMessage("❌ Failed to get download link.", event.threadID, event.messageID);

      const writer = fs.createWriteStream(tempFilePath);
      const audioResponse = await axios({ url: data.downloadLink, method: "GET", responseType: "stream" });
      audioResponse.data.pipe(writer);
      await new Promise((res, rej) => { writer.on("finish", res); writer.on("error", rej); });

      const timeTaken = ((performance.now() - start) / 1000).toFixed(2);

      const styledMsg = `
╔════════════════╗
   🎶 𝐍𝐎𝐖 𝐏𝐋𝐀𝐘𝐈𝐍𝐆 🎶
╚════════════════╝

🎧 𝐓𝐢𝐭𝐥𝐞   : ${data.title}
💽 𝐐𝐮𝐚𝐥𝐢𝐭𝐲 : ${data.quality}
⏱ 𝐓𝐢𝐦𝐞    : ${timeTaken}s

🪶 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐁𝐲 — 𝐌𝐈𝐊𝐀𝐒𝐀 🎀


`;

      api.sendMessage({ body: styledMsg, attachment: fs.createReadStream(tempFilePath) }, event.threadID, () => fs.unlinkSync(tempFilePath), event.messageID);
    } catch (e) {
      api.sendMessage(`❌ Error: ${e.message}`, event.threadID, event.messageID);
    }
  }
};
