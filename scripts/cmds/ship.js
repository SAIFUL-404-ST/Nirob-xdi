const { resolve } = require("path");
const fs = require("fs-extra");
const axios = require("axios");
const jimp = require("jimp");

module.exports = {
  config: {
    name: "ship",
    author: "Saif",
    version: "6.0",
    countDown: 5,
    role: 0,
    category: "love",
    shortDescription: {
      en: "Pair users with a cute anime-style ship! 💘"
    },
  },

  onLoad: async function() {
    const { downloadFile } = global.utils;
    const dirMaterial = __dirname + "/cache/canvas/";
    const pathImg = resolve(__dirname, "cache/canvas", "pairing.jpg");
    if (!fs.existsSync(dirMaterial)) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(pathImg)) {
      await downloadFile(
        "https://i.pinimg.com/736x/15/fa/9d/15fa9d71cdd07486bb6f728dae2fb264.jpg",
        pathImg
      );
    }
  },

  circle: async function(image) {
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
  },

  makeImage: async function({ one, two }) {
    const __root = resolve(__dirname, "cache", "canvas");
    let pairing_img = await jimp.read(__root + "/pairing.jpg");
    const pathImg = __root + `/pairing_${one}_${two}.png`;
    const avatarOne = __root + `/avLt_${one}.png`;
    const avatarTwo = __root + `/avLt_${two}.png`;

    let getAvatar = async (id, path) => {
      const res = await axios.get(
        `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: 'arraybuffer' }
      );
      fs.writeFileSync(path, res.data);
    };

    await getAvatar(one, avatarOne);
    await getAvatar(two, avatarTwo);

    const circleOne = await jimp.read(await this.circle(avatarOne));
    const circleTwo = await jimp.read(await this.circle(avatarTwo));

    pairing_img.composite(circleOne.resize(85, 85), 355, 100)
               .composite(circleTwo.resize(75, 75), 250, 140);

    await pairing_img.writeAsync(pathImg);

    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);

    return pathImg;
  },

  onStart: async function({ api, event, args, usersData, threadsData }) {
    try {
      const COST = 500;
      const sender = event.senderID;
      let user = await usersData.get(sender);
      let balance = user.money || 0;

      if (balance < COST) {
        return api.sendMessage(
          `🌸 Senpai… you need **${COST} coins** to use this!  
💰 Your balance: ${balance} coins`,
          event.threadID
        );
      }

      await usersData.set(sender, { ...user, money: balance - COST });
      const remaining = balance - COST;

      let target, targetName;
      const threadInfo = await api.getThreadInfo(event.threadID);

      // --- Tag mode ---
      if (Object.keys(event.mentions)[0]) {
        target = Object.keys(event.mentions)[0];
        targetName = event.mentions[target];
      }
      // --- Reply mode ---
      else if (event.type === "message_reply") {
        target = event.messageReply.senderID;
        targetName = await usersData.getName(target);
      }
      // --- Gender-based random auto pick ---
      else {
        const senderData = await api.getUserInfo(sender);
        const senderGender = senderData[sender].gender; // 1 = female, 2 = male

        let candidates = threadInfo.participantIDs.filter(id => id !== sender && id !== api.getCurrentUserID());
        let filteredCandidates = [];

        for (let id of candidates) {
          const data = await api.getUserInfo(id);
          const g = data[id].gender;
          if (senderGender === 2 && g === 1) filteredCandidates.push(id); // sender male → target female
          else if (senderGender === 1 && g === 2) filteredCandidates.push(id); // sender female → target male
        }

        if (!filteredCandidates.length) filteredCandidates = candidates;

        target = filteredCandidates[Math.floor(Math.random() * filteredCandidates.length)];
        targetName = await usersData.getName(target);
      }

      if (target === sender) return api.sendMessage("Ara ara… you can't pair with yourself! baka~ (>///<)", event.threadID);

      // ==== Get target gender ====
      const targetData = await api.getUserInfo(target);
      const sex = targetData[target].gender;
      const gender = sex == 2 ? "Male🧑" : sex == 1 ? "Female👩‍" : "Tran Duc Bo";

      // ==== Make image ====
      const pathImg = await this.makeImage({ one: sender, two: target });

      // ==== Anime-style replies with gender ====
      const senderName = await usersData.getName(sender);
      const animeReplies = [
        `Nyaa~ ${senderName}-kun paired with ${targetName} ${gender}! ✨`,
        `${targetName}-san ${gender} is now in a super cute ship with ${senderName}-chan! 💕`,
        `Baka! ${targetName} ${gender} got shippped by ${senderName}-kun 😼`,
        `Sugoiii~ ${senderName} used SHIP! ${targetName} ${gender} is blushing! ⚡`,
        `${targetName}-kun ${gender} didn’t escape… *SHIPPPP!* 💫`,
        `Ara ara~ ${senderName} and ${targetName} ${gender} are a spicy pair! 🔥`
      ];
      const chosenReply = animeReplies[Math.floor(Math.random() * animeReplies.length)];

      const arraytag = [
        { id: sender, tag: senderName },
        { id: target, tag: targetName }
      ];

      await api.sendMessage({
        body: `${chosenReply}\n\n💸 ${COST} coins deducted!\n💳 Remaining: ${remaining} coins`,
        mentions: arraytag,
        attachment: fs.createReadStream(pathImg)
      }, event.threadID, () => fs.unlinkSync(pathImg));

    } catch (err) {
      console.log(err);
      return api.sendMessage("Uwuuu~ Something went wrong (>_<)💦", event.threadID);
    }
  }
};
