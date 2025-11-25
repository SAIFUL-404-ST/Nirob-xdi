const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "kiss",
    version: "6.0",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: "Send a kiss image 💋",
    longDescription: "Random, reply or mention kiss with correct gender orientation",
    category: "love",
    guide: "{pn} [@tag/reply/rnd]"
  },

  onStart: async function ({ api, message, event, args, usersData }) {
    const tmpDir = path.join(__dirname, "tmp");
    try {
      // ensure tmp folder
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const senderID = event.senderID;
      const mention = Object.keys(event.mentions || {});
      let receiverID;

      // 1️⃣ Determine receiver
      if (args[0] && ["rnd", "random", "r"].includes(args[0].toLowerCase())) {
        // get thread members
        const threadInfo = await api.getThreadInfo(event.threadID);
        let allMembers = (threadInfo.userInfo || []).filter(u => u.id != senderID);

        if (!allMembers.length) return message.reply("No one found to kiss 😅");

        // get sender gender safely
        const senderData = await safeGet(usersData, senderID);
        const senderGender = String(senderData.gender || "male").toLowerCase();
        const oppositeGender = senderGender === "male" ? "female" : "male";

        // filter opposite gender first
        let candidates = allMembers.filter(m => String(m.gender || "").toLowerCase() === oppositeGender);
        if (!candidates.length) candidates = allMembers;

        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        receiverID = pick.id;
      }
      else if (event.type === "message_reply") {
        receiverID = event.messageReply.senderID;
      }
      else if (mention.length === 1) {
        receiverID = mention[0];
      }
      else {
        return message.reply("Please reply, mention or use 'rnd' to kiss someone 😘");
      }

      // 2️⃣ Get user data safely
      const senderData = await safeGet(usersData, senderID);
      const receiverData = await safeGet(usersData, receiverID);

      const senderName = (await safeGetName(usersData, senderID)) || "Someone";
      const receiverName = (await safeGetName(usersData, receiverID)) || "Someone";

      const senderGender = String(senderData.gender || "male").toLowerCase();
      const receiverGender = String(receiverData.gender || "female").toLowerCase();

      // 3️⃣ Get avatars safely
      const fallbackAvatar = "https://i.imgur.com/AfFp7pu.png";
      const avatarSender = (await safeGetAvatarUrl(usersData, senderID)) || fallbackAvatar;
      const avatarReceiver = (await safeGetAvatarUrl(usersData, receiverID)) || fallbackAvatar;

      // 4️⃣ Determine DIG orientation
      let imgBuffer;
      if (senderGender === "male") {
        // male sender = right side (giver)
        imgBuffer = await new DIG.Kiss().getImage(avatarSender, avatarReceiver);
      } else {
        // female sender = left side (giver)
        imgBuffer = await new DIG.Kiss().getImage(avatarReceiver, avatarSender);
      }

      if (!imgBuffer) throw new Error("DIG returned empty image buffer");

      // 5️⃣ Save & send
      const filePath = path.join(tmpDir, `kiss_${senderID}_${receiverID}.png`);
      fs.writeFileSync(filePath, Buffer.from(imgBuffer));

      const replyMsg = `💋 **@${senderName} kissed @${receiverName}** 😘`;
      message.reply(
        {
          body: replyMsg,
          mentions: [
            { tag: `@${senderName}`, id: senderID },
            { tag: `@${receiverName}`, id: receiverID }
          ],
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("KISS CMD ERROR:", err && (err.stack || err.message || err));
      message.reply("Something went wrong while generating the kiss 😅");
    }
  }
};

/* ---------- Helper functions ---------- */
async function safeGet(usersData, userId) {
  try {
    if (!usersData || typeof usersData.get !== "function") return {};
    return await usersData.get(userId) || {};
  } catch { return {}; }
}
async function safeGetName(usersData, userId) {
  try {
    if (!usersData || typeof usersData.getName !== "function") return null;
    return await usersData.getName(userId);
  } catch { return null; }
}
async function safeGetAvatarUrl(usersData, userId) {
  try {
    if (!usersData || typeof usersData.getAvatarUrl !== "function") return null;
    return await usersData.getAvatarUrl(userId);
  } catch { return null; }
}
