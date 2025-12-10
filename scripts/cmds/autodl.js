const axios = require("axios");
const fs = require("fs-extra");
const tinyurl = require("tinyurl");

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/xnil6x404/Api-Zone/refs/heads/main/Api.json");
  return base.data.xnil2;
};

const config = {
  name: "autodl",
  version: "3.1",
  author: "Saif",
  credits: "Saif",
  description: "𝐀𝐮𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐯𝐢𝐝𝐞𝐨𝐬/𝐢𝐦𝐚𝐠𝐞𝐬 𝐟𝐫𝐨𝐦 𝐓𝐢𝐤𝐓𝐨𝐤, 𝐘𝐨𝐮𝐓𝐮𝐛𝐞, 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤, 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 and more.",
  category: "media",
  commandCategory: "media",
  usePrefix: true,
  prefix: true,
  dependencies: {
    "tinyurl": "",
    "fs-extra": ""
  }
};

const onStart = () => {};

const onChat = async ({ api, event }) => {
  const body = event.body?.trim();
  if (!body) return;

  const supportedSites = [
    "https://vt.tiktok.com", "https://www.tiktok.com/", "https://vm.tiktok.com",
    "https://www.facebook.com", "https://fb.watch",
    "https://www.instagram.com/", "https://www.instagram.com/p/",
    "https://youtu.be/", "https://www.youtube.com/", "https://youtube.com/watch",
    "https://x.com/", "https://twitter.com/", "https://pin.it/"
  ];

  if (!supportedSites.some(site => body.includes(site))) return;

  const startTime = Date.now();
  const waitMsg = await api.sendMessage("🎰 𝐅𝐄𝐓𝐂𝐇𝐈𝐍𝐆 𝐘𝐎𝐔𝐑 𝐌𝐄𝐃𝐈𝐀... 𝐏𝐋𝐄𝐀𝐒𝐄 𝐖𝐀𝐈𝐓 🎀", event.threadID);

  try {
    const apiUrl = `${await baseApiUrl()}/alldl?url=${encodeURIComponent(body)}`;
    const { data } = await axios.get(apiUrl);
    const content = data?.content;

    const mediaLink = content?.result || content?.url;
    if (!mediaLink) {
      api.unsendMessage(waitMsg.messageID); // Remove wait message
      return; // Just exit silently without showing error
    }

    let extension = ".mp4";
    let mediaIcon = "🎬";
    let mediaLabel = "𝐕𝐈𝐃𝐄𝐎";

    if (mediaLink.match(/\.(jpg|jpeg)$/i)) {
      extension = ".jpg";
      mediaIcon = "🖼️";
      mediaLabel = "𝐏𝐇𝐎𝐓𝐎";
    } else if (mediaLink.endsWith(".png")) {
      extension = ".png";
      mediaIcon = "🖼️";
      mediaLabel = "𝐏𝐇𝐎𝐓𝐎";
    }

    const fileName = `media-${event.senderID}-${Date.now()}${extension}`;
    const filePath = `${__dirname}/cache/${fileName}`;
    fs.ensureDirSync(`${__dirname}/cache`);

    const buffer = await axios.get(mediaLink, { responseType: "arraybuffer" }).then(res => res.data);
    fs.writeFileSync(filePath, Buffer.from(buffer, "binary"));

    const shortUrl = await tinyurl.shorten(mediaLink);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    api.unsendMessage(waitMsg.messageID);

    const stylishMessage = `
╔═══✦═══『 𝐌𝐄𝐃𝐈𝐀 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 』══✦═══╗
║ ${mediaIcon} 𝐓𝐘𝐏𝐄: ${mediaLabel}
║ ⚡ 𝐒𝐏𝐄𝐄𝐃: ${duration}s
║ 🔗 𝐋𝐈𝐍𝐊: ${shortUrl}
║ 💾 𝐒𝐓𝐀𝐓𝐔𝐒: 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 ✅
╚══════════════════════════════╝
✨ 𝐄𝐍𝐉𝐎𝐘 𝐘𝐎𝐔𝐑 ${mediaLabel}!
💖 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐌𝐈𝐊𝐀𝐒𝐀`;

    await api.sendMessage(
      {
        body: stylishMessage,
        attachment: fs.createReadStream(filePath)
      },
      event.threadID,
      () => fs.unlinkSync(filePath),
      event.messageID
    );

  } catch (err) {
    console.error("[autodl] error:", err);
    api.unsendMessage(waitMsg.messageID); // Remove wait message
    // Do not show download fail feedback
  }
};

module.exports = {
  config,
  onStart,
  onChat,
  run: onStart,
  handleEvent: onChat
};
