module.exports = {
  config: {
    name: "spin",
    version: "4.2",
    author: "SAIF",
    countDown: 5,
    role: 0,
    description: "Premium Mikasa Spin System with bold text & jackpot!",
    category: "game",
    guide: {
      en: "{p}spin <amount>\n{p}spin top"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const senderID = event.senderID;
    const subCommand = args[0];

    // 🏆 Top Spin Winners
    if (subCommand === "top") {
      const allUsers = await usersData.getAll();
      const top = allUsers
        .filter(u => typeof u.data?.totalSpinWin === "number" && u.data.totalSpinWin > 0)
        .sort((a, b) => b.data.totalSpinWin - a.data.totalSpinWin)
        .slice(0, 10);

      if (!top.length) return message.reply("❌ No spin winners yet.");

      const result = top.map((user, i) => {
        const name = user.name || `User ${user.userID?.slice(-4) || "??"}`;
        return `✨ 𝗧𝗼𝗽 ${i + 1}. 𝗡𝗮𝗺𝗲: ${name} – 💸 ${user.data.totalSpinWin} coins`;
      }).join("\n");

      return message.reply(`🏆 𝗠𝗶𝗸𝗮𝘀𝗮 𝗦𝗽𝗶𝗻 𝗧𝗼𝗽 𝗪𝗶𝗻𝗻𝗲𝗿𝘀:\n\n${result}`);
    }

    // 💰 /spin <amount>
    const betAmount = parseInt(subCommand);
    if (isNaN(betAmount) || betAmount <= 0) return message.reply("⚠️ Usage:\n/spin <amount>\n/spin top");

    const userData = await usersData.get(senderID) || {};
    userData.money = userData.money || 0;
    userData.data = userData.data || {};
    userData.data.totalSpinWin = userData.data.totalSpinWin || 0;

    if (userData.money < betAmount) return message.reply(`💸 𝗡𝗼𝘁 𝗲𝗻𝗼𝘂𝗴𝗵 𝗯𝗮𝗹𝗮𝗻𝗰𝗲.\n💰 𝗬𝗼𝘂𝗿 𝗯𝗮𝗹𝗮𝗻𝗰𝗲: ${userData.money}`);

    // Deduct bet
    userData.money -= betAmount;

    // 🎰 Spin emojis
    const slots = ["💚", "💛", "💙"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // Calculate winnings
    const winnings = calculateWinnings(slot1, slot2, slot3, betAmount);

    // Update money & totalSpinWin
    userData.money += winnings;
    if (winnings > betAmount) userData.data.totalSpinWin += winnings - betAmount;

    await usersData.set(senderID, userData);

    // Build stylish Mikasa message
    const resultMessage = buildStylishMessage(slot1, slot2, slot3, winnings, betAmount);

    return message.reply(resultMessage);
  }
};

// 💎 Calculate winnings function
function calculateWinnings(slot1, slot2, slot3, bet) {
  if (slot1 === slot2 && slot2 === slot3) {
    if (slot1 === "💙") return bet * 10;  // Jackpot
    if (slot1 === "💚") return bet * 5;
    if (slot1 === "💛") return bet * 3;
    return bet * 2;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return bet * 1.5;
  } else {
    return -bet;
  }
}

// 🎀 Stylish Mikasa message
function buildStylishMessage(s1, s2, s3, winnings, bet) {
  const header = `✨ 𝗠𝗶𝗸𝗮𝘀𝗮 𝗦𝗽𝗶𝗻 𝗦𝘆𝘀𝘁𝗲𝗺 🎀\n═✦════════════✦═\n`;
  const slotsLine = `🎰 [ ${s1} | ${s2} | ${s3} ] 🎰\n`;
  const betInfo = `💵 𝗕𝗲𝘁: $${bet}\n💸 𝗪𝗼𝗻: ${winnings > 0 ? winnings : 0}$\n💰 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: ${winnings > 0 ? bet + winnings : 0}$\n`;

  let outcome;
  if (winnings > 0) {
    outcome = winnings >= bet * 10 ? `🎉 𝗝𝗔𝗖𝗞𝗣𝗢𝗧!!! 10x reward!` :
              winnings >= bet * 5 ? `✨ Big win!` :
              `🟢 You won!`;
  } else {
    outcome = `💥 You lost!`;
  }

  return `${header}${slotsLine}${betInfo}📌 Result: ${outcome}\n═✦════════════✦═`;
   }
