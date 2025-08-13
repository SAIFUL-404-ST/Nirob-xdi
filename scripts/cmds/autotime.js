const moment = require("moment-timezone");
const axios = require("axios");

module.exports.config = {
  name: 'autotime',
  version: "2.0.0",
  role: 0,
  author: "SAIF",
  description: "Auto send hourly message with optional media attachment",
  category: "AutoTime",
  countDown: 3
};

module.exports.onLoad = async ({ api }) => {

  const times = {
    "12:00:00 AM": {
      message: "ঘুমাও মানুষ টা তুমার না__||😊😅",
      video: "https://files.catbox.moe/lq945m.mp4"
    },
    "01:00:00 AM": {
      message: "এই শহরে এত কিছু হয় কিন্তু আমার মৃত্যু হয় না.! 🥺",
      video: "https://files.catbox.moe/dkixes.mp4"
    },
    "02:00:00 AM": {
      message: "রাত গভীর, স্বপ্নে হারিয়ে যাও 💤",
      video: "https://files.catbox.moe/2rduu3.mp4"
    },
    "03:00:00 AM": {
      message: "এই সময় শুধু শান্তি আর নিস্তব্ধতা 🌙",
      video: "https://files.catbox.moe/klief3.mp4"
    },
    "04:00:00 AM": {
      message: "ফজরের আজান হতে চলেছে ⏳🕌",
      video: "https://files.catbox.moe/dwoxxs.mp4"
    },
    "05:00:00 AM": {
      message: "শুভ সকাল 🌅",
      video: "https://files.catbox.moe/wahux7.mp4"
    },
    "06:00:00 AM": {
      message: "নতুন দিনের শুরু হোক হাসি দিয়ে 😊",
      video: "https://files.catbox.moe/84zavd.mp4"
    },
    "07:00:00 AM": {
      message: "নাশতা খেয়ে নাও 🍞☕",
      video: "https://files.catbox.moe/wb6u7i.mp4"
    },
    "08:00:00 AM": {
      message: "কাজে মন দাও 💪",
      video: "https://files.catbox.moe/8lbhqb.mp4"
    },
    "09:00:00 AM": {
      message: "সময় কারো জন্য থেমে থাকে না ⏳",
      video: "https://files.catbox.moe/jf3whz.mp4"
    },
    "10:00:00 AM": {
      message: "এক কাপ চা হলে ভালো লাগত ☕",
      video: "https://files.catbox.moe/p3sja8.mp4"
    },
    "11:00:00 AM": {
      message: "দুপুর আসছে, লাঞ্চের প্রস্তুতি নাও 🍛",
      video: "https://files.catbox.moe/vuagha.mp4"
    },
    "12:00:00 PM": {
      message: "লাঞ্চ টাইম 🍽️",
      video: "https://files.catbox.moe/zfw388.mp4"
    },
    "01:00:00 PM": {
      message: "একটু বিশ্রাম নাও 😴",
      video: "https://files.catbox.moe/v0zoib.mp4"
    },
    "02:00:00 PM": {
      message: "বিকেলের কাজ শুরু করো 💼",
      video: "https://files.catbox.moe/suqugl.mp4"
    },
    "03:00:00 PM": {
      message: "চা টাইম ☕🍪",
      video: ""
    },
    "04:00:00 PM": {
      message: "বিকেলের রোদ উপভোগ করো 🌇",
      video: "https://files.catbox.moe/r7tusd.mp4"
    },
    "05:00:00 PM": {
      message: "আস্তে আস্তে সন্ধ্যা নামছে 🌆",
      video: "https://files.catbox.moe/bujvd1.mp4"
    },
    "06:00:00 PM": {
      message: "মাগরিবের আজান 🕌",
      video: "https://files.catbox.moe/ksktn5.mp4"
    },
    "07:00:00 PM": {
      message: "রাতের খাবার খেয়ে নাও 🍲",
      video: "https://files.catbox.moe/r2h3jm.mp4"
    },
    "08:00:00 PM": {
      message: "পরিবারের সাথে সময় কাটাও 🏠",
      video: "https://files.catbox.moe/wivtg4.mp4"
    },
    "09:00:00 PM": {
      message: "ঘুমানোর প্রস্তুতি নাও 💤",
      video: "https://files.catbox.moe/uhrcnj.mp4"
    },
    "10:00:00 PM": {
      message: "শেষ রাতের নিস্তব্ধতা উপভোগ করো 🌙",
      video: "https://files.catbox.moe/5u5w5n.mp4"
    },
    "11:00:00 PM": {
      message: "ঘুমের দেশ যেতে প্রস্তুত হও 😴",
      video: "https://files.catbox.moe/lq945m.mp4"
    }
  };

  const sendLoop = async () => {
    const now = moment().tz("Asia/Dhaka").format("hh:mm:ss A");
    const data = times[now];

    if (data) {
      const allThreads = global.db.allThreadData.map(t => t.threadID);

      for (const thread of allThreads) {
        try {
          let msg = { body: data.message };

          if (data.video && data.video.trim() !== "") {
            const res = await axios.get(data.video, { responseType: "stream" });
            msg.attachment = res.data;
          }

          await api.sendMessage(msg, thread);
        } catch (err) {
          console.error(`Error sending message to ${thread}:`, err);
        }
      }
    }

    const nextMinute = moment().add(1, 'minute').startOf('minute');
    const delay = nextMinute.diff(moment());
    setTimeout(sendLoop, delay);
  };

  sendLoop();
};

module.exports.onStart = () => {};
