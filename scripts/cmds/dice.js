module.exports = {
  config: {
    name: "dice",
    aliases: [],
    version: "1.3",
    author: "SAIF",
    countDown: 5,
    role: 0,
    shortDescription: "🎲 roll a dice and bet amount",
    longDescription: "user picks a number 1-6 and bets an amount. bot rolls a dice to see if user wins.",
    category: "game",
    guide: { en: "{pn} <dice number 1-6> <amount> - roll the dice and bet" },
  },

  onStart: async function({ api, event, args, usersData, message }) {
    const user = event.senderID;
    const userData = await usersData.get(user);

    const diceNum = parseInt(args[0]);
    let betInput = args[1];

    // parse shorthand like 1k, 2m, 5qt, 3sx etc.
    const parseShorthand = (str) => {
      if (!str) return NaN;
      str = str.toLowerCase();

      const map = {
        k: 1e3,
        m: 1e6,
        b: 1e9,
        t: 1e12,
        qd: 1e15,
        qt: 1e18,
        sx: 1e21,
        sp: 1e24,
        oc: 1e27,
        no: 1e30,
        dc: 1e33,
        udc: 1e36,
        dcd: 1e39,
        tdc: 1e42
      };

      // match longest suffix first
      let suffix = Object.keys(map).sort((a,b) => b.length - a.length).find(s => str.endsWith(s));
      let multiplier = suffix ? map[suffix] : 1;

      if (suffix) str = str.slice(0, -suffix.length);
      const number = parseFloat(str);

      return isNaN(number) ? NaN : number * multiplier;
    };

    const betAmount = parseShorthand(betInput);

    if (isNaN(diceNum) || diceNum < 1 || diceNum > 6) {
      return message.reply(`⚠️ please choose a dice number between 1 and 6.`);
    }

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(`⚠️ please enter a valid bet amount.`);
    }

    if (userData.money < betAmount) {
      return message.reply(`💰 you don't have enough balance to bet.`);
    }

    // roll dice
    const rolledDice = Math.floor(Math.random() * 6) + 1;
    const isWin = rolledDice === diceNum;
    const winnings = isWin ? betAmount * 2 : -betAmount;

    userData.money += winnings;
    await usersData.set(user, userData);

    const resultMsg = `
👤 player: ${userData.name || "unknown"}
💵 your bet: ${betAmount} on ${diceNum}
🎲 rolled: ${rolledDice}

${isWin ? `✅ you won $${betAmount}` : `💔 you lost $${betAmount}`}
🏦 balance: ${userData.money}
`;

    return message.reply(resultMsg);
  }
};
