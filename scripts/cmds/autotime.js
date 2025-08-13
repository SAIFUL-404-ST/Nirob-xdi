const moment = require("moment-timezone");
const axios = require("axios");

module.exports.config = {
  name: 'autotime',
  version: "2.0.0",
  role: 0,
  author: "SAIF + Modified by GPT",
  description: "Auto send hourly message with optional media attachment",
  category: "AutoTime",
  countDown: 3
};

module.exports.onLoad = async ({ api }) => {

  const times = {
    "12:00:00 AM": {
      message: " NOW ITS TIME 12:00 AM !                               ঘুমাও মানুষ টা তুমার না__||😊😅",
      video: "https://files.catbox.moe/lq945m.mp4"
    },
    "01:00:00 AM": {
      message: "  NOW ITS TIME 01:00 AM!                               এই শহরে এত কিছু হয় কিন্তু আমার মৃত্যু হয় না.! 🥺",
      video: "https://files.catbox.moe/dkixes.mp4"
    },
    "02:00:00 AM": {
      message: "  NOW ITS TIME 02:00 AM!                               রাত গভীর, স্বপ্নে হারিয়ে যাও 💤",
      video: "https://files.catbox.moe/2rduu3.mp4"
    },
    "03:00:00 AM": {
      message: "  NOW ITS TIME 3:00 AM!                               এই সময় শুধু শান্তি আর নিস্তব্ধতা 🌙",
      video: "https://files.catbox.moe/klief3.mp4"
    },
    "04:00:00 AM": {
      message: "  NOW ITS TIME 04.00 AM!                               ফজরের আজান হতে চলেছে ⏳🕌",
      video: "https://files.catbox.moe/dwoxxs.mp4"
    },
    "05:00:00 AM": {
      message: " NOW ITS TIME 05:00 AM!                     GOOD MORNING BABY 😝💝!  শুভ সকাল 🌅",
      video: "https://files.catbox.moe/wahux7.mp4"
    },
    "06:00:00 AM": {
      message: "NOW ITS TIME 05:00 AM!                                 নতুন দিনের শুরু হোক হাসি দিয়ে 😊",
      video: "https://files.catbox.moe/84zavd.mp4"
    },
    "07:00:00 AM": {
      message: " NOW ITS TIME 07:00 AM!                               নাশতা খেয়ে নাও 🍞☕",
      video: "https://files.catbox.moe/wb6u7i.mp4"
    },
    "08:00:00 AM": {
      message: " NOW ITS TIME 08:00 AM!                             কাজে মন দাও 💪",
      video: "https://files.catbox.moe/8lbhqb.mp4"
    },
    "09:00:00 AM": {
      message: " NOW ITS TIME 09:00 AM!                              সময় কারো জন্য থেমে থাকে না ⏳",
      video: "https://files.catbox.moe/jf3whz.mp4"
    },
    "10:00:00 AM": {
      message: "  NOW ITS TIME 10:00 AM!                            এক কাপ চা হলে ভালো লাগত ☕",
      video: "https://files.catbox.moe/p3sja8.mp4"
    },
    "11:00:00 AM": {
      message: " NOW ITS TIME 11:00 AM!                                দুপুর আসছে, লাঞ্চের প্রস্তুতি নাও 🍛",
      video: "https://files.catbox.moe/vuagha.mp4"
    },
    "12:00:00 PM": {
      message: " NOW ITS TIME 12:00 PM !                          একটু পর আজান দিবে।।নামাজ পড়ে নিও  🍽️",
      video: "https://files.catbox.moe/zfw388.mp4"
    },
    "01:00:00 PM": {
      message: " NOW ITS TIME 01:00 PM!                               নামাজ পরে একটু বিশ্রাম নাও 😴",
      video: "https://files.catbox.moe/v0zoib.mp4"
    },
    "02:00:00 PM": {
      message: "  NOW ITS TIME 02.00 PM!                               বিকেলের কাজ শুরু করো 💼",
      video: "https://files.catbox.moe/suqugl.mp4"
    },
    "03:00:00 PM": {
      message: " NOW ITS TIME 03:00 PM!                        বিকাল ৩ টা বাজে!! চা টাইম ☕🍪",
      video: ""
    },
    "04:00:00 PM": {
      message: "  NOW ITS TIME 04:00PM!                               বিকেলের রোদ উপভোগ করো 🌇",
      video: "https://files.catbox.moe/r7tusd.mp4"
    },
    "05:00:00 PM": {
      message: "  NOW ITS TIME 05:00 PM!                        আসরের নামাজ পরেছো তো?  🌆",
      video: "https://files.catbox.moe/bujvd1.mp4"
    },
    "06:00:00 PM": {
      message: "  NOW ITS TIME 06:00 PM!                        একটু পর মাগরিবের আজান  দিবে। নামাজ টা পড়ে নিও 🕌",
      video: "https://files.catbox.moe/ksktn5.mp4"
    },
    "07:00:00 PM": {
      message: "  NOW ITS TIME 07:00 PM!                               রাতের খাবার খেয়ে নাও 🍲",
      video: "https://files.catbox.moe/r2h3jm.mp4"
    },
    "08:00:00 PM": {
      message: "  NOW ITS TIME 08:00 PM!                               পরিবারের সাথে সময় কাটাও 🏠",
      video: "https://files.catbox.moe/wivtg4.mp4"
    },
    "09:00:00 PM": {
      message: "  NOW ITS TIME 09:00 PM!                               ঘুমানোর প্রস্তুতি নাও 💤",
      video: "https://files.catbox.moe/uhrcnj.mp4"
    },
    "10:00:00 PM": {
      message: " NOW ITS TIME 10:00 PM!                             শেষ রাতের নিস্তব্ধতা উপভোগ করো 🌙",
      video: "https://files.catbox.moe/5u5w5n.mp4"
    },
    "11:00:00 PM": {
      message: " NOW ITS TIME 11:00 PM!                               ঘুমের দেশ যেতে প্রস্তুত হও 😴",
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
