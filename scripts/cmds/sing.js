const axios = require("axios");
const qs = require("qs");

module.exports = {
  config: {
    name: "sing",
    aliases: ["music", "song"],
    version: "3.0",
    author: "Saif",
    countDown: 10,
    role: 0,
    category: "music",
    guide: "{p}sing [YouTube link or song name]"
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args.length) {
      return message.reply("❌ | Please provide a YouTube link or song name\n\nExample: /sing https://youtu.be/NeXbmEnpSz0\nOr: /sing night changes");
    }

    let ytUrl;

    // ✅ check if user provided a YouTube link
    if (args[0].startsWith("http") || args[0].includes("youtu")) {
      ytUrl = args[0];
    } else {
      // 🔍 treat as search term, call x-noobs search API
      const query = encodeURIComponent(args.join(" "));
      try {
        const searchRes = await axios.get(`https://www.x-noobs-apis.42web.io/m/search?query=${query}`);
        if (!searchRes.data || !searchRes.data.url) {
          return message.reply("⚠️ | Could not find any results for that song.");
        }
        ytUrl = searchRes.data.url; // first video URL from search
      } catch (err) {
        console.error(err.message);
        return message.reply("⚠️ | Failed to search the song. Try again later.");
      }
    }

    // ✅ call the sing API with the YouTube URL
    const apiUrl = `https://www.x-noobs-apis.42web.io/m/sing?url=${ytUrl}`;
    try {
      const response = await axios.get(apiUrl, { responseType: "stream" });

      message.reply({
        body: `✅ | 𝐇𝐞𝐫𝐞'𝐬 your song 🎧`,
        attachment: response.data
      });

    } catch (error) {
      console.error("Error:", error.message);
      message.reply("⚠️ | Failed to get the song. Please check the link or try again later.");
    }
  }
};
