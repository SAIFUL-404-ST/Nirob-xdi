module.exports = {
  config: {
    name: "bet",
    version: "1.1",
    author: "SAIF",
    shortDescription: {
      en: "Bet your money with 60% win chance",
    },
    longDescription: {
      en: "Gamble your balance. You have a 60% chance to win double, 40% chance to lose your bet.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "⚠️ Enter a valid and positive amount to bet.",
      not_enough_money: "💰 You don't have enough balance.",
      spin_message: "🎲 Betting...",
      win_message: "🎉 You WON $%1!",
      lose_message: "💔 You LOST $%1.",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Send spinning message
    await message.reply(getLang("spin_message"));

    // Delay to make it look real
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 60% chance win, 40% chance lose
    const isWin = Math.random() < 0.6;

    let winnings;
    if (isWin) {
      winnings = amount; // double = profit equal to bet
    } else {
      winnings = -amount; // lost full bet
    }

    // Update balance
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    // Build fancy result
    const resultMsg = `
✨ 𝗠𝗶𝗸𝗮𝘀𝗮 𝗕𝗲𝘁 𝗦𝘆𝘀𝘁𝗲𝗺 🎀
━━━━━━━━━━━━━━━
👤 Player: ${userData.name || "Unknown"}
💵 Bet: ${amount}

${isWin ? `✅ ${getLang("win_message", amount)}` : `❌ ${getLang("lose_message", amount)}`}

🏦 Balance: ${userData.money + winnings}
━━━━━━━━━━━━━━━
    `;

    return message.reply(resultMsg);
  },
};
