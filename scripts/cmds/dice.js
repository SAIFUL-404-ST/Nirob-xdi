module.exports = {
  config: {
    name: "dice",
    aliases: [],
    version: "1.1",
    author: "SAIF",
    countDown: 5,
    role: 0,
    shortDescription: "🎲 𝐫𝐨𝐥𝐥 𝐚 𝐝𝐢𝐜𝐞 𝐚𝐧𝐝 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭",
    longDescription: "user picks a number 1-6 and bets an amount. bot rolls a dice to see if user wins.",
    category: "game",
    guide: { en: "{pn} <dice number 1-6> <amount> - roll the dice and bet" },
  },

  onStart: async function({ api, event, args, usersData, message }) {
    const user = event.senderID;
    const userData = await usersData.get(user);

    const diceNum = parseInt(args[0]);
    const betAmount = parseInt(args[1]);

    if(isNaN(diceNum) || diceNum < 1 || diceNum > 6) {
      return message.reply(`⚠️ 𝐩𝐥𝐞𝐚𝐬𝐞 𝐜𝐡𝐨𝐨𝐬𝐞 𝐚 𝐝𝐢𝐜𝐞 𝐧𝐮𝐦𝐛𝐞𝐫 𝐛𝐞𝐭𝐰𝐞𝐞𝐧 1 𝐚𝐧𝐝 6.`);
    }

    if(isNaN(betAmount) || betAmount <= 0) {
      return message.reply(`⚠️ 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐛𝐞𝐭 𝐚𝐦𝐨𝐮𝐧𝐭.`);
    }

    if(userData.money < betAmount) {
      return message.reply(`💰 𝐲𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐭𝐨 𝐛𝐞𝐭.`);
    }

    // roll dice
    const rolledDice = Math.floor(Math.random() * 6) + 1;
    let isWin = rolledDice === diceNum;
    let winnings = isWin ? betAmount * 2 : -betAmount;

    userData.money += winnings;
    await usersData.set(user, userData);

    const resultMsg = `
👤 𝐩𝐥𝐚𝐲𝐞𝐫: ${userData.name || "𝐮𝐧𝐤𝐧𝐨𝐰𝐧"}
💵 𝐲𝐨𝐮𝐫 𝐛𝐞𝐭: ${betAmount} 𝐨𝐧 ${diceNum}
🎲 𝐫𝐨𝐥𝐥𝐞𝐝: ${rolledDice}

${isWin ? `✅ 𝐲𝐨𝐮 𝐰𝐨𝐧 $${betAmount}` : `💔 𝐲𝐨𝐮 𝐥𝐨𝐬𝐭 $${betAmount}`}
🏦 𝐛𝐚𝐥𝐚𝐧𝐜𝐞: ${userData.money}
`;

    return message.reply(resultMsg);
  }
};
