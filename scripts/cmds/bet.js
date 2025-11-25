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

const smallBoldNumbers = {
  "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒",
  "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗", ".": "."
};

function toSmallBoldNumber(num) {
  return num.toString().split("").map(c => smallBoldNumbers[c] || c).join("");
}

function formatMoney(num) {
  const suffixes = [
    { value: 1e33, symbol: "𝐃𝐂" },
    { value: 1e30, symbol: "𝐍𝐎" },
    { value: 1e27, symbol: "𝐎𝐂" },
    { value: 1e24, symbol: "𝐒𝐏" },
    { value: 1e21, symbol: "𝐒𝐗" },
    { value: 1e18, symbol: "𝐐𝐍" },
    { value: 1e15, symbol: "𝐐𝐃" },
    { value: 1e12, symbol: "𝐓" },
    { value: 1e9, symbol: "𝐁" },
    { value: 1e6, symbol: "𝐌" },
    { value: 1e3, symbol: "𝐊" }
  ];
  for (const s of suffixes) {
    if (num >= s.value) {
      return toSmallBoldNumber((num / s.value).toFixed(2)) + s.symbol;
    }
  }
  return toSmallBoldNumber(num);
}

// ❤️💙💚💛 user emoji pool
const emojis = ["❤️", "💙", "💚", "💛"];

module.exports = {
  config: {
    name: "bet",
    version: "5.2",
    author: "Saif",
    category: "game"
  },

  onStart: async function ({ args, message, event, usersData }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);

    const amount = parseAmount(args[0]);
    if (isNaN(amount) || amount <= 0)
      return message.reply("⚠️ 𝐄𝐍𝐓𝐄𝐑 𝐀 𝐕𝐀𝐋𝐈𝐃 𝐀𝐌𝐎𝐔𝐍𝐓.");
    if (amount > userData.money)
      return message.reply("💰 𝐍𝐎𝐓 𝐄𝐍𝐎𝐔𝐆𝐇 𝐁𝐀𝐋𝐀𝐍𝐂𝐄.");

    // Decide win/lose (55% win chance)
    const isWin = Math.random() < 0.55;

    // Select user emoji randomly
    const userEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Bot emoji fixed 🖤 if lose
    const winEmoji = isWin ? userEmoji : "🖤";

    await message.reply(`🎰 𝐁𝐄𝐓𝐓𝐈𝐍𝐆 𝐎𝐍 ${userEmoji}...`);
    await new Promise(r => setTimeout(r, 1500));

    const change = isWin ? amount : -amount;
    const newBalance = userData.money + change;
    await usersData.set(senderID, { money: newBalance, data: userData.data });

    const result = isWin
      ? ` 𝐘𝐎𝐔 𝐖𝐎𝐍 ${formatMoney(amount)}!`
      : ` 𝐘𝐎𝐔 𝐋𝐎𝐒𝐓 ${formatMoney(amount)}.`;

    const output = `
𝐘𝐎𝐔𝐑 𝐄𝐌𝐎𝐉𝐈: ${userEmoji}
𝐖𝐈𝐍𝐍𝐈𝐍𝐆 𝐄𝐌𝐎𝐉𝐈: ${winEmoji}

${result}

𝐁𝐀𝐋𝐀𝐍𝐂𝐄: ${formatMoney(newBalance)}
`;

    return message.reply(output.trim());
  }
};
