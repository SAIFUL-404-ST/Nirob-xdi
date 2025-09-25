const axios = require("axios");
const sessions = {};
const stats = {};
const cooldowns = {};

const QUIZ_URL = "https://raw.githubusercontent.com/SAIFUL-404-ST/quiz-api/main/quizzes.json";

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz", "quizlist", "qzlist"],
    version: "3.2",
    author: "Saif",
    countDown: 10,
    role: 0,
    category: "game",
    guide: {
      en: "{pn} quiz/qz → start quiz\n{pn} quizlist/qzlist → show stats"
    }
  },

  // 📌 Helper: Load quizzes from raw
  loadQuizzes: async function () {
    try {
      const res = await axios.get(QUIZ_URL);
      return res.data;
    } catch (e) {
      console.error("❌ Failed to fetch quizzes:", e.message);
      return [];
    }
  },

  onStart: async function ({ api, event, usersData, args }) {
    const userId = event.senderID;
    const now = Date.now();
    const input = args[0]?.toLowerCase() || "quiz";

    // Stats list
    if (input === "quizlist" || input === "qzlist") {
      if (Object.keys(stats).length === 0)
        return api.sendMessage("কেউ এখনও quiz খেলেনি।", event.threadID, event.messageID);

      let txt = "📊 Quiz Stats:\n";
      for (const uid in stats) {
        const name = (await usersData.getName(uid)) || uid; // 🔹 UID এর বদলে নাম
        txt += `• ${name}: Won ${stats[uid].won || 0}, Played ${stats[uid].played || 0}\n`;
      }
      return api.sendMessage(txt, event.threadID, event.messageID);
    }

    // Cooldown 5 sec
    if (cooldowns[userId] && now - cooldowns[userId] < 5000)
      return api.sendMessage("⏱ 5 সেকেন্ড cooldown আছে।", event.threadID, event.messageID);
    cooldowns[userId] = now;

    // User stats init
    if (!stats[userId]) stats[userId] = { played: 0, won: 0, lastReset: now };
    const userStats = stats[userId];

    // Reset 12 hours
    if (now - userStats.lastReset >= 12 * 60 * 60 * 1000) {
      userStats.played = 0;
      userStats.won = 0;
      userStats.lastReset = now;
    }

    if (userStats.played >= 15)
      return api.sendMessage("❌ আজকের limit শেষ, 12 ঘন্টা পরে আবার চেষ্টা করো।", event.threadID, event.messageID);

    // 🔽 Load quizzes directly from raw
    const quizzes = await this.loadQuizzes();
    if (quizzes.length === 0) return api.sendMessage("❌ কোন quiz data লোড হয়নি।", event.threadID, event.messageID);

    // Random quiz & question
    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    const question = randomQuiz.questions[Math.floor(Math.random() * randomQuiz.questions.length)];

    sessions[userId] = { quizId: randomQuiz.id, question, startTime: now };
    userStats.played += 1;

    let msg = `🎯 Quiz: ${randomQuiz.title}\n\n${question.text}\n`;
    ["a", "b", "c", "d"].forEach((l) => {
      if (question.options[l]) msg += `\n${l}. ${question.options[l]}`;
    });
    msg += `\n\nReply with: answer <a|b|c|d>`;

    api.sendMessage(
      msg,
      event.threadID,
      (error, info) => {
        if (error) return console.error(error);
        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: this.config.name,
          author: userId,
          messageID: info.messageID,
          correctAnswer: question.answer
        });

        // Auto delete 60 sec
        setTimeout(() => {
          if (sessions[userId] && sessions[userId].quizId === randomQuiz.id) {
            delete sessions[userId];
            api.sendMessage("⏰ Quiz সময় শেষ, session auto delete হয়েছে।", event.threadID);
          }
        }, 60000);
      },
      event.messageID
    );
  },

  onReply: async function ({ event, api, Reply, usersData }) {
    const { correctAnswer, author } = Reply;
    if (event.senderID !== author)
      return api.sendMessage("❌ This is not your quiz!", event.threadID, event.messageID);

    const userId = author;
    const userReply = event.body.trim().toLowerCase();

    if (!sessions[userId])
      return api.sendMessage("❌ Quiz session expired!", event.threadID, event.messageID);

    api.unsendMessage(Reply.messageID);
    delete sessions[userId];

    if (userReply === correctAnswer.toLowerCase()) {
      const rewardCoins = 500;
      const rewardExp = 121;

      const userData = await usersData.get(userId);
      await usersData.set(userId, {
        money: (userData.money || 0) + rewardCoins,
        exp: (userData.exp || 0) + rewardExp,
        data: userData.data || {}
      });

      if (!stats[userId]) stats[userId] = { played: 1, won: 1, lastReset: Date.now() };
      else stats[userId].won += 1;

      return api.sendMessage(
        `✅ Correct answer!\nYou earned ${rewardCoins} coins & ${rewardExp} exp.`,
        event.threadID,
        event.messageID
      );
    } else {
      return api.sendMessage(
        `❌ Wrong answer!\nCorrect answer was: ${correctAnswer}`,
        event.threadID,
        event.messageID
      );
    }
  }
};
