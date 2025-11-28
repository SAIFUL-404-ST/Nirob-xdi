module.exports = {
  config: {
    name: "vaggo",
    aliases: ["bhobisshot", "fate"],
    version: "3.0",
    author: "Chitron Bhattacharjee + Senpai Upgrade",
    role: 0,
    category: "fun",
    shortDescription: { en: "🔮 ব্যক্তিগত ভাগ্য গণনা সিস্টেম" },
    longDescription: { en: "ব্যক্তির ভবিষ্যদ্বাণী (মৃত্যু, প্রেম, সন্তান ইত্যাদি)" },
    guide: { en: "vaggo [tag/reply/random/self]" }
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      // ================= BALANCE SYSTEM =================
      const COST = 500;
      const sender = event.senderID;

      let u = await usersData.get(sender);
      let balance = u.money || 0;

      if (balance < COST) {
        return api.sendMessage(
          `❌ এই কমান্ড চালাতে ${COST} coins লাগে!\n💰 তোমার কাছে আছে: ${balance} coins`,
          event.threadID,
          event.messageID
        );
      }

      await usersData.set(sender, { money: balance - COST });
      const remaining = balance - COST;

      // ================= TARGET LOGIC =================
      let targetID = null;
      let targetName = null;

      // Tag
      if (Object.keys(event.mentions)[0]) {
        targetID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetID];
      }

      // Reply
      else if (event.type === "message_reply") {
        targetID = event.messageReply.senderID;
        let info = await api.getUserInfo(targetID);
        targetName = info[targetID].name;
      }

      // Random
      else if (["r", "rnd", "random"].includes(args[0]?.toLowerCase())) {
        const info = await api.getThreadInfo(event.threadID);
        let list = info.participantIDs.filter(id => id !== sender && id !== api.getCurrentUserID());
        targetID = list[Math.floor(Math.random() * list.length)];
        let inf = await api.getUserInfo(targetID);
        targetName = inf[targetID].name;
      }

      // Default self
      else {
        targetID = sender;
        let inf = await api.getUserInfo(targetID);
        targetName = inf[targetID].name;
      }

      // ================= ORIGINAL VAGGO LOGIC =================
      const seed = targetID.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
      const random = (min, max) => Math.floor(((seed * 999999) % (max - min + 1)) + min);

      // =========== তোমার আসল prediction text — একটুও পরিবর্তন করা হয়নি ===========

      const predictions = {
        death: [
          `⚰️ ${targetName}, তুমি মারা যাবে ${random(30, 90)} বছর বয়সে…`,
          `⚰️ ${targetName}, তোমার মৃত্যু হবে খুব নীরবে… একা…`,
          `⚰️ ${targetName}, মৃত্যুর সময় তোমার পাশে থাকবে মাত্র ১ জন মানুষ…`
        ],

        love: [
          `💖 ${targetName}, তুমি প্রেমে পড়বে ${random(15, 35)} বছর বয়সে!`,
          `💘 তোমার future partner হবে ${random(1, 12)} বছরের বড়/ছোট`,
          `💞 তোমার প্রেম খুব toxic হবে… কিন্তু তুমি ছাড়তে পারবে না।`
        ],

        children: [
          `👶 ${targetName}, তোমার ভবিষ্যতে থাকবে ${random(0, 5)} সন্তান`,
          `🍼 তোমার প্রথম সন্তান আসবে ${random(20, 40)} বছর বয়সে`,
          `👼 তোমার এক সন্তান তোমাকে খুব কষ্ট দেবে…`
        ],

        fortune: [
          `💸 ${targetName}, জীবনে তুমি আয় করবে মোট ${random(1, 200)} লাখ টাকা`,
          `💰 তোমার ভাগ্যে বড়লোক হওয়া নেই… তবে শান্তি থাকবে`,
          `📉 তুমি জীবনে একবার খুব বড় financial loss খাবে`
        ],

        health: [
          `💊 ${targetName}, তোমার future এ ${random(1, 10)} বার বড় অসুখ হবে`,
          `🤒 বিশেষ করে ${["হৃদরোগ", "লিভার", "কিডনি", "মাইগ্রেন"][random(0, 3)]} সমস্যা দেখা দেবে`,
          `🏥 হাসপাতালে ভর্তি হতে হবে মোট ${random(1, 5)} বার`
        ]
      };

      const finalMsg =
        `🔮 *${targetName} এর ভবিষ্যৎ বিশ্লেষণ:* 🔮\n\n` +
        `মৃত্যু: ${predictions.death[random(0, predictions.death.length - 1)]}\n\n` +
        `প্রেম: ${predictions.love[random(0, predictions.love.length - 1)]}\n\n` +
        `সন্তান: ${predictions.children[random(0, predictions.children.length - 1)]}\n\n` +
        `অর্থ: ${predictions.fortune[random(0, predictions.fortune.length - 1)]}\n\n` +
        `স্বাস্থ্য: ${predictions.health[random(0, predictions.health.length - 1)]}\n\n` +
        `💸 *${COST} coins deducted *\n💳 *Remaining Balance:* ${remaining} coins`;

      // ================= SEND MESSAGE =================
      return api.sendMessage(finalMsg, event.threadID);

    } catch (err) {
      console.log(err);
      return api.sendMessage("❌ Error!", event.threadID);
    }
  }
};
