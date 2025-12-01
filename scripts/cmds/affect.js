const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "affect",
    version: "1.5",
    author: "Saif",
    countDown: 20,
    role: 0,
    shortDescription: "Affect image with anime style",
    longDescription: "Affect image with coins and anime flavor",
    category: "fun",
    guide: {
      vi: "{pn} [@tag | r | rnd | random]",
      en: "{pn} [@tag | r | rnd | random]"
    }
  },

  onStart: async function({ event, message, usersData, api, args }) {
    const COST = 500;
    const senderID = event.senderID;

    // ---- Check balance ----
    let user = await usersData.get(senderID);
    let balance = user.money || 0;
    if (balance < COST) return message.reply(`🌸 ꜱᴇɴᴘᴀɪ… ʏᴏᴜ ɴᴇᴇᴅ ${COST} ᴄᴏɪɴꜱ!\n💰 ʏᴏᴜʀ ʙᴀʟᴀɴᴄᴇ: ${balance} ᴄᴏɪɴꜱ!`);

    // Deduct coins
    await usersData.set(senderID, { ...user, money: balance - COST });
    const remaining = balance - COST;

    // ---- Determine target ----
    const mention = Object.keys(event.mentions);
    let targetID;

    if (args[0] && ["r", "rnd", "random"].includes(args[0].toLowerCase())) {
      const allUsers = await api.getThreadInfo(event.threadID)
        .then(res => res.participantIDs.filter(id => id != senderID && id != api.getCurrentUserID()));
      if (!allUsers.length) return message.reply("ɴʏᴀᴀ~ ɴᴏ ᴏɴᴇ ᴛᴏ ᴀꜰꜰᴇᴄᴛ!");
      targetID = allUsers[Math.floor(Math.random() * allUsers.length)];
    } else if (mention.length > 0) {
      targetID = mention[0];
    } else if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    } else {
      return message.reply("🌸 ᴛᴀɢ, ʀᴇᴘʟʏ, ᴏʀ ᴜꜱᴇ ʀ/ʀɴᴅ/ʀᴀɴᴅᴏᴍ!");
    }

    if (targetID === senderID) return message.reply("ᴀʀᴀ ᴀʀᴀ~ ʏᴏᴜ ᴄᴀɴ'ᴛ ᴀꜰꜰᴇᴄᴛ ʏᴏᴜʀꜱᴇʟꜰ ʙᴀᴋᴀ (>///<)");

    // ---- Names ----
    const senderInfo = await api.getUserInfo([senderID]);
    const nameSender = Object.values(senderInfo)[0].name;

    const targetInfo = await api.getUserInfo([targetID]);
    const nameTarget = Object.values(targetInfo)[0].name;

    // ---- Countdown ----
    let countdownMsg = await message.reply(`⏳ ᴀꜰꜰᴇᴄᴛɪɴɢ ${nameTarget} ɪɴ 𝟥 ꜱᴇᴄᴏɴᴅ ɴʏᴀᴀ`);
    for (let i = 2; i > 0; i--) {
      await new Promise(res => setTimeout(res, 1000));
      await api.editMessage(`⏳ ᴀꜰꜰᴇᴄᴛɪɴɢ ${nameTarget} ɪɴ ${i} seconds…ntdownMsg.messageID);
    }
    await new Promise(res => setTimeout(res, 1000));
    await api.editMessage("ʙʙʏ ᴜ ᴀʀᴇ ᴀꜰꜰᴇᴄᴛᴇᴅ ɴᴏᴡ… ꜱᴇɴᴘᴀɪ ɴᴏᴛɪᴄᴇᴅ! ✨", countdownMsg.messageID);

    // ---- Generate image ----
    const avatarURL = await usersData.getAvatarUrl(targetID);
    const img = await new DIG.Affect().getImage(avatarURL);
    const tmpDir = path.join(__dirname, "tmp");
    fs.ensureDirSync(tmpDir);
    const pathSave = path.join(tmpDir, `${targetID}_Affect.png`);
    fs.writeFileSync(pathSave, Buffer.from(img));

    // ---- Anime-style final message ----
    const animeReplies = [
      `ɴʏᴀᴀ~ ${nameSender} ᴀꜰꜰᴇᴄᴛᴇᴅ ${nameTarget}! `,
      `ʙᴀᴋᴀ! ${nameTarget}-ꜱᴀɴ ɢᴏᴛ ᴀꜰꜰᴇᴄᴛᴇᴅ ʙʏ ${nameSender}-ᴄʜᴀɴ 💥`,
      `${nameTarget}-ᴋᴜɴ ɪꜱ ɴᴏᴡ ᴜɴᴅᴇʀ ${nameSender}-ꜱᴇɴᴘᴀɪ's ᴍᴀɢɪᴄ 😼`,
      `ꜱᴜɢᴏɪ ${nameSender} ᴍᴀᴅᴇ ${nameTarget}-ꜱᴀɴ ᴀꜰꜰᴇᴄᴛᴇᴅ! ⚡`,
      `ᴀʀᴀ ᴀʀᴀ… ${nameSender} ᴅɪᴅ ᴀ ꜱᴜᴘᴇʀ ᴀꜰꜰᴇᴄᴛ ᴏɴ ${nameTarget}-ᴋᴜɴ 💫`
    ];
    const chosenReply = animeReplies[Math.floor(Math.random() * animeReplies.length)];

    // ---- Send final message ----
    await api.sendMessage({
      body: `${chosenReply}\n\n💸 ᴅᴇᴅᴜᴄᴛᴇᴅ: ${COST} ᴄᴏɪɴꜱ!\n💳 ʀᴇᴍᴀɪɴɪɴɢ: ${remaining}`,
      attachment: fs.createReadStream(pathSave)
    }, event.threadID, () => fs.unlinkSync(pathSave));
  }
};
