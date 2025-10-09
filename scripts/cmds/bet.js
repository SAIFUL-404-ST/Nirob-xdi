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

const emojis = ["❤️","💙","💚","💛","🖤"];

module.exports = {
  config: {
    name: "bet",
    version: "2.3",
    author: "SAIF",
    shortDescription: { en: "One-click emoji bet with 45/55 chance" },
    longDescription: { en: "User gives amount, bot selects emoji, result is automatic." },
    category: "Game"
  },
  langs: {
    en: {
      invalid_amount: "⚠️ 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝐛𝐞𝐭.",
      not_enough_money: "💰 𝐲𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.",
      win_message: "🎉 𝐘𝐎𝐔 𝐖𝐎𝐍 $%1!",
      lose_message: "💔 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓 $%1."
    }
  },

  onStart: async function({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    const amount = parseAmount(args[0]);
    if (isNaN(amount) || amount <= 0) return message.reply(getLang("invalid_amount"));
    if (amount > userData.money) return message.reply(getLang("not_enough_money"));

    // Decide win/lose (45% win chance)
    const isWin = Math.random() < 0.45;

    // Emoji selection
    let userEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    let winningEmoji = isWin ? userEmoji : emojis.filter(e => e !== userEmoji)[Math.floor(Math.random() * (emojis.length - 1))];

    // Spinning message with bet info
    await message.reply(`
💵 𝐁𝐞𝐭𝐭𝐢𝐧𝐠 𝐨𝐧 𝐞𝐦𝐨𝐣𝐢: ${args[0]} on ${userEmoji}
🎯 𝐖𝐢𝐧𝐧𝐢𝐧𝐠 𝐄𝐦𝐨𝐣𝐢: ${winningEmoji}
🔄 𝐂𝐚𝐥𝐜𝐮𝐥𝐚𝐭𝐢𝐧𝐠 𝐫𝐞𝐬𝐮𝐥𝐭...
`);
    await new Promise(r => setTimeout(r, 1500)); // delay for effect

    // Calculate winnings
    const winnings = isWin ? amount : -amount;
    await usersData.set(senderID, { money: userData.money + winnings, data: userData.data });

    // Result message
    const resultMsg = `
✨ 𝗠𝗶𝗸𝗮𝘀𝗮 𝗕𝗲𝘁 𝗦𝘆𝘀𝘁𝗲𝗺 🎀
━━━━━━━━━━━━━━━
👤 𝐏𝐥𝐚𝐲𝐞𝐫: ${userData.name || "Unknown"}
💵 𝐁𝐞𝐭: ${args[0]} on ${userEmoji}
🎯 𝐖𝐢𝐧𝐧𝐢𝐧𝐠 𝐄𝐦𝐨𝐣𝐢: ${winningEmoji}

${isWin ? getLang("win_message", args[0]) : getLang("lose_message", args[0])}

🏦 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${userData.money + winnings}
━━━━━━━━━━━━━━━
`;
    return message.reply(resultMsg);
  }
};
