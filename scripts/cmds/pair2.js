const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair2",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Find your destiny partner in anime style!",
    },
    longDescription: {
      en: "Automatically matches sender with someone of opposite gender, or uses reply/tag user.",
    },
    category: "love",
    guide: {
      en: "{pn} [reply or tag someone]",
    },
  },

  onStart: async function ({ api, event, usersData, message, args }) {
    const { loadImage, createCanvas } = require("canvas");

    const COST = 500;
    const senderID = event.senderID;

    // --- Balance check ---
    let senderData = await usersData.get(senderID);
    let balance = senderData?.money || 0;
    if (balance < COST) return message.reply(`🌸 Senpai… You need **${COST} coins**! Your balance: ${balance}`);

    // Deduct coins
    await usersData.set(senderID, { ...senderData, money: balance - COST });
    const remaining = balance - COST;

    // --- Determine target ---
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;
    const botID = api.getCurrentUserID();

    let targetID;
    let isReplyOrTag = false;

    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      isReplyOrTag = true;
    } else if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
      isReplyOrTag = true;
    } else {
      // Auto gender match
      let senderGender;
      for (let u of all) if (u.id == senderID) senderGender = u.gender;

      let candidates = [];
      for (let u of all) {
        if (u.id !== senderID && u.id !== botID) {
          if (senderGender === "MALE" && u.gender === "FEMALE") candidates.push(u.id);
          else if (senderGender === "FEMALE" && u.gender === "MALE") candidates.push(u.id);
          else if (!senderGender) candidates.push(u.id);
        }
      }
      if (candidates.length === 0) return message.reply("❌ No suitable partner found.");
      targetID = candidates[Math.floor(Math.random() * candidates.length)];
    }

    if (targetID === senderID) return message.reply("Ara ara~ You can't pair with yourself baka!");

    // --- Get Names ---
    const senderName = (await usersData.getName(senderID)) || (await api.getUserInfo([senderID]))[senderID].name || "Unknown";
    const targetName = (await usersData.getName(targetID)) || (await api.getUserInfo([targetID]))[targetID].name || "Unknown";

    // --- Pair percentage ---
    const rand1 = Math.floor(Math.random() * 100) + 1;
    const crazyValues = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    const rand2 = crazyValues[Math.floor(Math.random() * crazyValues.length)];
    const resultPool = [rand1, rand1, rand1, rand2, rand1, rand1, rand1, rand1, rand1];
    const percentage = resultPool[Math.floor(Math.random() * resultPool.length)];

    // --- Random anime note ---
    const loveNotes = [
      "𝐘𝐨𝐮𝐫 𝐥𝐨𝐯𝐞 𝐬𝐭𝐨𝐫𝐲 𝐣𝐮𝐬𝐭 𝐛𝐞𝐠𝐚𝐧, 𝐚𝐧𝐝 𝐢𝐭'𝐬 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥. 🌹",
      "𝐃𝐞𝐬𝐭𝐢𝐧𝐲 𝐜𝐡𝐨𝐬𝐞 𝐲𝐨𝐮 𝐭𝐰𝐨 𝐭𝐨 𝐛𝐞 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫. 💞",
      "𝐘𝐨𝐮𝐫 𝐡𝐞𝐚𝐫𝐭𝐬 𝐟𝐨𝐮𝐧𝐝 𝐭𝐡𝐞𝐢𝐫 𝐦𝐢𝐫𝐫𝐨𝐫 𝐢𝐧 𝐞𝐚𝐜𝐡 𝐨𝐭𝐡𝐞𝐫. 💖",
      "𝐓𝐰𝐨 𝐬𝐨𝐮𝐥𝐬, 𝐨𝐧𝐞 𝐩𝐚𝐭𝐡. ✨",
      "𝐋𝐨𝐯𝐞 𝐟𝐢𝐧𝐝𝐬 𝐢𝐭𝐬 𝐰𝐚𝐲—𝐚𝐧𝐝 𝐢𝐭 𝐣𝐮𝐬𝐭 𝐝𝐢𝐝. 🔗",
      "𝐘𝐨𝐮𝐫 𝐥𝐨𝐯𝐞 𝐬𝐩𝐚𝐫𝐤𝐬 𝐥𝐢𝐤𝐞 𝐬𝐭𝐚𝐫𝐬 𝐢𝐧 𝐭𝐡𝐞 𝐧𝐢𝐠𝐡𝐭. 🌟",
      "𝐓𝐡𝐞 𝐮𝐧𝐢𝐯𝐞𝐫𝐬𝐞 𝐜𝐨𝐧𝐬𝐩𝐢𝐫𝐞𝐝 𝐭𝐨 𝐛𝐫𝐢𝐧𝐠 𝐲𝐨𝐮 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫. 🌌",
      "𝐋𝐨𝐯𝐞 𝐢𝐬 𝐧𝐨𝐭 𝐫𝐚𝐧𝐝𝐨𝐦—𝐢𝐭'𝐬 𝐲𝐨𝐮. 💘",
      "𝐓𝐰𝐨 𝐡𝐞𝐚𝐫𝐭𝐛𝐞𝐚𝐭𝐬, 𝐨𝐧𝐞 𝐫𝐡𝐲𝐭𝐡𝐦. 🫀",
      "𝐓𝐨𝐠𝐞𝐭𝐡𝐞𝐫, 𝐲𝐨𝐮 𝐦𝐚𝐤𝐞 𝐚 𝐦𝐚𝐠𝐢𝐜𝐚𝐥 𝐰𝐡𝐨𝐥𝐞. ✨"
    ];
    const note = loveNotes[Math.floor(Math.random() * loveNotes.length)];

    // --- Download avatars ---
    const pathAvt1 = path.join(__dirname, "assets/any.png");
    const pathAvt2 = path.join(__dirname, "assets/avatar.png");
    const pathImg = path.join(__dirname, "assets/background.png");

    const avt1 = (await axios.get(`https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt1, Buffer.from(avt1));

    const avt2 = (await axios.get(`https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathAvt2, Buffer.from(avt2));

    // --- Background ---
    const backgrounds = [
      "https://i.ibb.co/RBRLmRt/Pics-Art-05-14-10-47-00.jpg",
      "https://i.ibb.co/lfVEjdH.jpeg",
      "https://i.ibb.co/vScJzGt.jpeg"
    ];
    const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const bgBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgBuffer));

    // --- Create canvas ---
    const bgImage = await loadImage(pathImg);
    const canvas = createCanvas(bgImage.width, bgImage.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
    ctx.drawImage(await loadImage(pathAvt1), 111, 175, 330, 330);
    ctx.drawImage(await loadImage(pathAvt2), 1018, 173, 330, 330);
    fs.writeFileSync(pathImg, canvas.toBuffer());

    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // --- Send message ---
    const mention1 = { tag: `@${senderName}`, id: senderID };
    const mention2 = { tag: `@${targetName}`, id: targetID };
    const bodyText =
      `💞 𝐋𝐨𝐯𝐞 𝐏𝐚𝐢𝐫 💞\n\n` +
      `💑 Congratulations ${mention1.tag} & ${mention2.tag}\n` +
      `💌 ${note}\n` +
      `🔗 Love Connection: ${percentage}% 💖\n` +
      `💸 Deducted: ${COST} coins | 💳 Remaining: ${remaining}`;

    return api.sendMessage(
      { body: bodyText, mentions: [mention1, mention2], attachment: fs.createReadStream(pathImg) },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
