const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "train",
    version: "3.0",
    author: "milan-says",
    countDown: 5,
    role: 0,
    shortDescription: "Send someone on the Thomas train",
    longDescription: "Supports tag, reply, random mode & balance deduct",
    category: "fun",
    guide: {
      en: "{pn} @tag | reply | r/random"
    }
  },

  onStart: async function ({ event, message, usersData, threadsData }) {

    const args = event.body.split(/\s+/);
    let targetUID = null;

    // 1️⃣ REPLY MODE (Highest priority)
    if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    }

    // 2️⃣ TAG MODE
    if (!targetUID) {
      const tag = Object.keys(event.mentions)[0];
      if (tag) targetUID = tag;
    }

    // 3️⃣ RANDOM MODE
    if (!targetUID && ["r", "rnd", "random"].includes(args[1]?.toLowerCase())) {
      const info = await threadsData.get(event.threadID);
      const members = info.members.map(m => m.userID);

      const filtered = members.filter(id => id !== message.senderID);
      targetUID = filtered[Math.floor(Math.random() * filtered.length)];
    }

    // 4️⃣ NO TARGET FOUND
    if (!targetUID) {
      return message.reply("baka! 😾\nTag someone, reply to someone or use r/random mode.");
    }

    // 💰 BALANCE CHECK
    const cost = 500;
    const userData = await usersData.get(event.senderID);

    if (!userData.money || userData.money < cost) {
      return message.reply(
        `Ayy senpai… 😿 You need ${cost} coins to send someone on the train!`
      );
    }

    // Deduct money
    await usersData.set(event.senderID, { 
      money: userData.money - cost 
    });
    const remaining = userData.money - cost;

    // 🖼 Create Image
    const avatar = await usersData.getAvatarUrl(targetUID);
    const img = await new DIG.Thomas().getImage(avatar);

    const pathSave = `${__dirname}/tmp/train_${targetUID}.png`;
    fs.writeFileSync(pathSave, img);

    // ✨ Anime styled message
    const text = 
`🚂💨 Mikasa Express Departure!

Senpai just sent <@${targetUID}> flying on the train~  
Hold tight, baka! 😼💗

💸 500 coins deducted  
💳 Remaining: ${remaining}`;

    await message.reply({
      body: text,
      attachment: fs.createReadStream(pathSave)
    });

    fs.unlinkSync(pathSave);
  }
};
