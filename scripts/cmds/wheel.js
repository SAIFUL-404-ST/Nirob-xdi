const parseAmount = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase().replace(/\s+/g, "");
  const suffixes = {
    k: 1e3, m: 1e6, b: 1e9, t: 1e12,
    qt: 1e15, qd: 1e15, qi: 1e18, sx: 1e21,
    sp: 1e24, oc: 1e27, no: 1e30, dc: 1e33
  };
  let matched = Object.keys(suffixes).find(suf => str.endsWith(suf));
  let multiplier = matched ? suffixes[matched] : 1;
  if (matched) str = str.slice(0, -matched.length);
  let num = parseFloat(str);
  return isNaN(num) ? NaN : num * multiplier;
};

module.exports = {
  config: {
    name: "wheel",
    version: "3.3",
    author: "xnil6x + Modify by saif",
    shortDescription: "🎡 𝐔𝐋𝐓𝐑𝐀-𝐒𝐓𝐀𝐁𝐋𝐄 𝐖𝐇𝐄𝐄𝐋 𝐆𝐀𝐌𝐄",
    longDescription: "𝐆𝐔𝐀𝐑𝐀𝐍𝐓𝐄𝐄𝐃 𝐒𝐌𝐎𝐎𝐓𝐇 𝐒𝐏𝐈𝐍𝐍𝐈𝐍𝐆 𝐄𝐗𝐏𝐄𝐑𝐈𝐄𝐍𝐂𝐄 𝐖𝐈𝐓𝐇 𝐀𝐔𝐓𝐎𝐌𝐀𝐓𝐈𝐂 𝐅𝐀𝐈𝐋-𝐒𝐀𝐅𝐄𝐒",
    category: "Game",
    guide: {
      en: "{p}wheel <amount>"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID } = event;
    let betAmount = 0;

    try {
      betAmount = parseAmount(args[0]);
      if (!betAmount) {
        return api.sendMessage(
          `❌ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐁𝐄𝐓 𝐀𝐌𝐎𝐔𝐍𝐓! 𝐔𝐒𝐀𝐆𝐄: ${global.GoatBot.config.prefix}wheel 500`,
          threadID
        );
      }

      const user = await usersData.get(senderID);
      if (!user || typeof user.money !== "number" || user.money < 0) {
        return api.sendMessage(
          "🔒 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐕𝐄𝐑𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐄𝐃. 𝐏𝐋𝐄𝐀𝐒𝐄 𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝐒𝐔𝐏𝐏𝐎𝐑𝐓.",
          threadID
        );
      }

      if (betAmount > user.money) {
        return api.sendMessage(
          `❌ 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄! 𝐘𝐎𝐔 𝐇𝐀𝐕𝐄: ${this.formatMoney(user.money)}`,
          threadID
        );
      }

      const { result, winAmount } = await this.executeSpin(api, threadID, betAmount);
      const newBalance = user.money + winAmount;

      await usersData.set(senderID, { money: newBalance });

      return api.sendMessage(
        this.generateResultText(result, winAmount, betAmount, newBalance),
        threadID
      );

    } catch (error) {
      console.error("Wheel System Error:", error);
      return api.sendMessage(
        `🎡 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐄𝐃! 𝐘𝐎𝐔𝐑 ${this.formatMoney(betAmount)} 𝐂𝐎𝐈𝐍𝐒 𝐀𝐑𝐄 𝐒𝐀𝐅𝐄. 𝐓𝐑𝐘 𝐒𝐏𝐈𝐍𝐍𝐈𝐍𝐆 𝐀𝐆𝐀𝐈𝐍.`,
        threadID
      );
    }
  },

  async executeSpin(api, threadID, betAmount) {
    const wheelSegments = [
      { emoji: "🍒", multiplier: 0.5, weight: 20 },
      { emoji: "🍋", multiplier: 1, weight: 30 },
      { emoji: "🍊", multiplier: 2, weight: 25 },
      { emoji: "🍇", multiplier: 3, weight: 15 },
      { emoji: "💎", multiplier: 5, weight: 7 },
      { emoji: "💰", multiplier: 10, weight: 3 }
    ];

    await api.sendMessage(`🎰 𝐒𝐏𝐈𝐍𝐍𝐈𝐍𝐆 𝐓𝐇𝐄 𝐖𝐇𝐄𝐄𝐋 𝐒𝐘𝐒𝐓𝐄𝐌 🎀\n💵 𝐁𝐄𝐓 𝐀𝐌𝐎𝐔𝐍𝐓: ${this.formatMoney(betAmount)}`, threadID);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const totalWeight = wheelSegments.reduce((sum, seg) => sum + seg.weight, 0);
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    const result = wheelSegments.find(segment => {
      cumulativeWeight += segment.weight;
      return randomValue <= cumulativeWeight;
    }) || wheelSegments[0];

    const winAmount = Math.floor(betAmount * result.multiplier) - betAmount;

    return { result, winAmount };
  },

  generateResultText(result, winAmount, betAmount, newBalance) {
    return [
      `🎰 𝐖𝐇𝐄𝐄𝐋 𝐒𝐓𝐎𝐏𝐏𝐄𝐃 𝐎𝐍: ${result.emoji}`,
      "",
      this.getOutcomeText(result.multiplier, winAmount, betAmount),
      `💰 𝐍𝐄𝐖 𝐁𝐀𝐋𝐀𝐍𝐂𝐄: ${this.formatMoney(newBalance)}`
    ].join("\n");
  },

  getOutcomeText(multiplier, winAmount, betAmount) {
    if (multiplier < 1) return `❌ 𝐋𝐎𝐒𝐓: ${this.formatMoney(betAmount * 0.5)}`;
    if (multiplier === 1) return "➖ 𝐁𝐑𝐎𝐊𝐄 𝐄𝐕𝐄𝐍";
    return `✅ 𝐖𝐎𝐍 ${multiplier}X! (+${this.formatMoney(winAmount)})`;
  },

  formatMoney(amount) {
    const units = ["", "k", "m", "b", "t", "qt", "qd", "qi", "sx", "sp"];
    let unitIndex = 0;

    while (amount >= 1000 && unitIndex < units.length - 1) {
      amount /= 1000;
      unitIndex++;
    }

    return amount.toFixed(amount % 1 ? 2 : 0) + units[unitIndex];
  }
};
