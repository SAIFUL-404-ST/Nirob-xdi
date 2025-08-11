const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "autotime",
    version: "2.0.0",
    role: 0,
    author: "SAIF",
    description: "AutoTime with video attachment support and separate video URLs",
    category: "autotime",
    countDown: 3,
  },

  onLoad: async ({ api }) => {
    const videoUrls = {
      "12:00:00 PM": "https://files.catbox.moe/lq945m.mp4",
      "01:00:00 AM": "https://files.catbox.moe/dkixes.mp4",
      "02:00:00 AM": "https://files.catbox.moe/2rduu3.mp4",
      "03:00:00 AM": "https://files.catbox.moe/klief3.mp4",
      "04:00:00 AM": "https://files.catbox.moe/dwoxxs.mp4",
      "05:00:00 AM": "https://files.catbox.moe/wahux7.mp4",
      "06:00:00 AM": "https://files.catbox.moe/84zavd.mp4",
      "07:00:00 AM": "https://files.catbox.moe/8kn1q5.mp4",
      "08:00:00 AM": "https://files.catbox.moe/i4g4qe.mp4",
      "09:00:00 AM": "https://files.catbox.moe/wb6u7i.mp4",
      "10:00:00 AM": "https://files.catbox.moe/8lbhqb.mp4",
      "11:00:00 AM": "https://files.catbox.moe/jf3whz.mp4",
      "12:00:00 AM": "https://files.catbox.moe/p3sja8.mp4",
      "01:00:00 PM": "https://files.catbox.moe/vuagha.mp4",
      "02:00:00 PM": "https://files.catbox.moe/zfw388.mp4",
      "03:00:00 PM": "https://files.catbox.moe/v0zoib.mp4",
      "04:00:00 PM": "https://files.catbox.moe/suqugl.mp4",
      "05:00:00 PM": "https://files.catbox.moe/r7tusd.mp4",
      "06:00:00 PM": "https://files.catbox.moe/bujvd1.mp4",
      "07:00:00 PM": "https://files.catbox.moe/ksktn5.mp4",
      "08:00:00 PM": "https://files.catbox.moe/r2h3jm.mp4",
      "09:00:00 PM": "https://files.catbox.moe/wivtg4.mp4",
      "10:00:00 PM": "https://files.catbox.moe/uhrcnj.mp4",
      "11:00:00 PM": "https://files.catbox.moe/5u5w5n.mp4",
    };

    const messages = {
      "12:00:00 PM": `──── •💜• ────
Now its time 12:00 PM ⏳

~এখন রাত ১২.০০ টা  বাজে😘
──── •💜• ────

CEO_SAIF`,
      "01:00:00 AM": `──── •💜• ────
Now its time 1:00 AM ⏳

এখন রাত ১টা বাজে প্রেম না কয়রা যাইয়া ঘুমা বেক্কল😘
──── •💜• ────

CEO_SAIF`,
      "02:00:00 AM": `──── •💜• ────
Now its time 2:00 AM ⏳

এখন রাত ২টা বাজে যারা ছ্যাকা খাইছে তারা জেগে আছে 😳
──── •💜• ────

CEO_SAIF`,
      "03:00:00 AM": `──── •💜• ────
Now its time 3:00 AM ⏳

এখন রাত ৩টা বাজে সবাই মনে হয় ঘুম🥹 আমার ভাই ঘুম আসে না🌃 
──── •💜• ────

CEO_SAIF`,
      "04:00:00 AM": `──── •💜• ────
Now its time 4:00 AM ⏳

এখন রাত ৪টা বাজে একটু পর ফজরের আযান দিলে নামাজ পড়ে নিও সবাই 🌃 
──── •💜• ────

CEO_SAIF`,
      "05:00:00 AM": `──── •💜• ────
Now its time 5:00 AM ⏳

এখন ভোর ৫টা বাজে সবাই নামাজ পড়ছো তো?❤️ 
──── •💜• ────

CEO_SAIF`,
      "06:00:00 AM": `──── •💜• ────
Now its time 6:00 AM ⏳

এখন সকাল ৬টা বাজে ঘুম থেকে উঠো সবাই❤️🥀💖
──── •💜• ────

CEO_SAIF`,
      "07:00:00 AM": `──── •💜• ────
Now its time 7:00 AM ⏳

এখন সকাল ৭টা বাজে সবাই ব্রেকফাস্ট করে নাও🥰 
──── •💜• ────

CEO_SAIF`,
      "08:00:00 AM": `──── •💜• ────
Now its time 8:00 AM ⏳

এখন সকাল ৮টা বাজে সবাই মনে হয় কাজে ব্যস্ত হয়ে গেছো😵 
──── •💜• ────

CEO_SAIF`,
      "09:00:00 AM": `──── •💜• ────
Now its time 9:00 AM ⏳

এখন সকাল ৯টা বাজে মন দিয়ে কাজ করো সবাই❤️🙈 
──── •💜• ────

CEO_SAIF`,
      "10:00:00 AM": `──── •💜• ────
Now its time 10:00 AM ⏳

এখন সকাল ১০টা বাজে মিস করছি তোমাদের🙀
──── •💜• ────

CEO_SAIF`,
      "11:00:00 AM": `──── •💜• ────
Now its time 11:00 AM ⏳

এখন সকাল ১১টা বাজে😻 
──── •💜• ────

CEO_SAIF`,
      "12:00:00 AM": `──── •💜• ────
Now its time 12:00 AM ⏳

এখন রাত ১২টা বেজে গেলো সবাই শুয়ে পড়ো 🥀
──── •💜• ────

CEO_SAIF`,
      "01:00:00 PM": `──── •💜• ────
Now its time 1:00 PM ⏳

এখন দুপুর ১টা বাজে সবাই কাজ বন্ধ করে জোহরের নামাজ পড়ো নাও😻😇 
──── •💜• ────

CEO_SAIF`,
      "02:00:00 PM": `──── •💜• ────
Now its time 2:00 PM ⏳

এখন দুপুর ২টা বাজে গোসল করে সবাই দুপুরের খাবার খেয়ে নাও 💖😇 
──── •💜• ────

CEO_SAIF`,
      "03:00:00 PM": `──── •💜• ────
Now its time 3:00 PM ⏳

~এখন দুপুর ৩টা বাজে😘
──── •💜• ────

CEO_SAIF`,
      "04:00:00 PM": `──── •💜• ────
Now its time 4:00 PM ⏳

এখন বিকাল ৪টা বাজে আসরের আযান দিলে সবাই নামাজ পড়ে নাও🐱 
──── •💜• ────

CEO_SAIF`,
      "05:00:00 PM": `──── •💜• ────
Now its time 5:00 PM ⏳

এখন বিকাল ৫টা বাজে একটু পর মাগরিবের আযান দিবে সবাই নামাজ পড়ে নিও 😻😇
──── •💜• ────

CEO_SAIF`,
      "06:00:00 PM": `──── •💜• ────
Now its time 6:00 PM ⏳

এখন সন্ধ্যা ৬টা বাজে সবাই হাতমুখ ধুয়ে কিছু খেয়ে নাও এবং পরিবারের সাথে সময় কাটাও 💖
──── •💜• ────

CEO_SAIF`,
      "07:00:00 PM": `──── •💜• ────
Now its time 7:00 PM ⏳

এখন সন্ধ্যা ৭টা বাজে কি করছো সবাই এখন এশার আযান দিবে সবাই নামাজ পড়ে নাও💞
──── •💜• ────

CEO_SAIF`,
      "08:00:00 PM": `──── •💜• ────
Now its time 8:00 PM ⏳

এখন রাত ৮টা বাজে 😋
──── •💜• ────

CEO_SAIF`,
      "09:00:00 PM": `──── •💜• ────
Now its time 9:00 PM ⏳

এখন রাত ৯টা বাজে সবাই কি শুয়ে পড়লা 💞
──── •💜• ────

CEO_SAIF`,
      "10:00:00 PM": `──── •💜• ────
Now its time 10:00 PM ⏳

এখন রাত ১০টা বাজে সবাই ঘুমায় পড়ো আমার বউ নাই ভাই ঘুম ও আসে না ☺️
──── •💜• ────

CEO_SAIF`,
      "11:00:00 PM": `──── •💜• ────
Now its time 11:00 PM ⏳

এখন রাত ১১টা বাজে খাউয়া দাউয়া করে নেউ😙
──── •💜• ────

CEO_SAIF`,
    };

    async function downloadFile(url, filepath) {
      const writer = fs.createWriteStream(filepath);
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
    }

    const sendMessages = async () => {
      const timeZone = "Asia/Dhaka";
      const now = moment().tz(timeZone);
      const currentTime = now.format("hh:mm:ss A");

      const messageText = messages[currentTime];
      const videoUrl = videoUrls[currentTime];

      if (messageText && videoUrl) {
        const activeThreads = Object.keys(global.db.allThreadData).filter(
          (id) => global.db.allThreadData[id].threadID
        );

        for (const threadID of activeThreads) {
          try {
            let msg = { body: messageText };

            if (videoUrl.trim() !== "") {
              const filepath = path.join(__dirname, `temp_${threadID}.mp4`);
              await downloadFile(videoUrl, filepath);
              msg.attachment = fs.createReadStream(filepath);
              await api.sendMessage(msg, threadID);
              fs.unlink(filepath, (err) => {
                if (err) console.error("Failed to delete temp file:", err);
              });
            } else {
              await api.sendMessage(msg, threadID);
            }
          } catch (err) {
            console.error("Send message error:", err);
          }
        }
      }

      const nextCheckIn = moment()
        .add(1, "minute")
        .startOf("minute")
        .diff(moment());
      setTimeout(sendMessages, nextCheckIn);
    };

    sendMessages();
  },

  onStart: () => {},
};
