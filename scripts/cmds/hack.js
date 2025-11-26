const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "6.0",
    author: "Saif",
    countDown: 30,
    role: 0,
    category: "fun",
    shortDescription: " hacking with coins + give you Gmail/Pass",
  },

  wrapText: async (ctx, text, maxWidth) => {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);

      const words = text.split(" ");
      const lines = [];
      let line = "";

      while (words.length > 0) {
        let split = false;

        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
          else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }

        if (ctx.measureText(line + words[0]).width < maxWidth) {
          line += `${words.shift()} `;
        } else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }

      resolve(lines);
    });
  },

  generateFakeGmail: () => {
    const domains = ["gmail.com", "yahoo.com", "outlook.com"];
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    let name = "";
    for (let i = 0; i < 8; i++) name += chars[Math.floor(Math.random() * chars.length)];
    let domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}@${domain}`;
  },

  generateFakePass: () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const COST = 300;
      const sender = event.senderID;

      // ===== COIN SYSTEM =====
      let user = await usersData.get(sender);
      let balance = user.money || 0;

      if (balance < COST)
        return api.sendMessage(
          `🎭 𝐇𝐚𝐜𝐤 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐜𝐨𝐬𝐭𝐬 **${COST} 𝐜𝐨𝐢𝐧𝐬**\n💳 𝐘𝐨𝐮𝐫 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${balance} 𝐜𝐨𝐢𝐧𝐬`,
          event.threadID, event.messageID
        );

      await usersData.set(sender, { ...user, money: balance - COST });
      const remaining = balance - COST;

      // ===== TARGET SYSTEM =====
      let target, targetName;

      if (["r", "rnd", "random"].includes(args[0]?.toLowerCase())) {
        const info = await api.getThreadInfo(event.threadID);
        let list = info.participantIDs.filter(id => id !== sender && id !== api.getCurrentUserID());
        if (!list.length) return api.sendMessage("No one found to hack!", event.threadID);
        target = list[Math.floor(Math.random() * list.length)];
        targetName = await usersData.getName(target);
      } else if (Object.keys(event.mentions)[0]) {
        target = Object.keys(event.mentions)[0];
        targetName = event.mentions[target];
      } else if (event.type === "message_reply") {
        target = event.messageReply.senderID;
        targetName = await usersData.getName(target);
      } else {
        const messages = await api.getThreadMessages(event.threadID, 50);
        for (let m of messages) {
          if (m.senderID !== sender && m.senderID !== api.getCurrentUserID()) {
            target = m.senderID;
            targetName = await usersData.getName(target);
            break;
          }
        }
        if (!target) return api.sendMessage("Cannot find a target to hack!", event.threadID);
      }

      if (target === sender)
        return api.sendMessage("Ara ara~ You can't hack yourself, baka! 😳💻", event.threadID);

      // ===== AVATAR FETCH =====
      const avatar = (
        await axios.get(
          `https://graph.facebook.com/${target}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;

      const bgURL = "https://drive.google.com/uc?id=1RwJnJTzUmwOmP3N_mZzxtp63wbvt9bLZ";
      const bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;

      const tmp = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

      const avatarPath = path.join(tmp, `${target}_avatar.png`);
      const bgPath = path.join(tmp, `${target}_bg.png`);

      fs.writeFileSync(avatarPath, Buffer.from(avatar));
      fs.writeFileSync(bgPath, Buffer.from(bgData));

      // ===== CANVAS GENERATION =====
      const baseImage = await loadImage(bgPath);
      const baseAvt = await loadImage(avatarPath);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      ctx.font = "bold 26px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      const lines = await this.wrapText(ctx, targetName, 1160);
      ctx.fillText(lines.join("\n"), 200, 497);

      ctx.drawImage(baseAvt, 83, 437, 100, 101);

      const output = path.join(tmp, `${target}_hacked.png`);
      fs.writeFileSync(output, canvas.toBuffer());

      fs.removeSync(avatarPath);
      fs.removeSync(bgPath);

      // ===== FAKE GMAIL & PASSWORD =====
      const fakeEmail = this.generateFakeGmail();
      const fakePass = this.generateFakePass();

      // ===== ANIME STYLE REPLIES =====
      const reply = [
        `💻 𝐇𝐚𝐜𝐤 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞! ${targetName}’s account exposed!`,
        `⚡ 𝐌𝐢𝐤𝐚𝐬𝐚 𝐁𝐛𝐲 hacked ${targetName}!`,
        `🎭  login generated:\n📧 ${fakeEmail}\n🔑 ${fakePass}`
      ];

      const chosen = reply[Math.floor(Math.random() * reply.length)];

      // ===== SEND =====
      await api.sendMessage(
        {
          body: `${chosen}\n\n💸 𝟑𝟎𝟎 𝐜𝐨𝐢𝐧𝐬 𝐝𝐞𝐝𝐮𝐜𝐭𝐞𝐝!\n💳 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠: ${remaining} coins`,
          attachment: fs.createReadStream(output),
        },
        event.threadID,
        () => fs.unlinkSync(output),
        event.messageID
      );

    } catch (err) {
      console.log(err);
      return api.sendMessage("Uwuuu~ Something broke in Mikasa’s hack system (>_<)💦", event.threadID);
    }
  },
};
