module.exports = {
  config: {
    name: "slot",
    version: "3.2",
    author: "SAIF",
    shortDescription: {
      en: "Premium Stylish Slot game",
    },
    longDescription: {
      en: "A premium stylish slot machine game with bold text and jackpot system.",
    },
    category: "Game",
  },
  langs: {
    en: {
      invalid_amount: "⚠️ 𝗘𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗮𝗻𝗱 𝗽𝗼𝘀𝗶𝘁𝗶𝘃𝗲 𝗮𝗺𝗼𝘂𝗻𝘁 𝘁𝗼 𝗽𝗹𝗮𝘆.",
      not_enough_money: "💰 𝗬𝗼𝘂 𝗱𝗼𝗻'𝘁 𝗵𝗮𝘃𝗲 𝗲𝗻𝗼𝘂𝗴𝗵 𝗯𝗮𝗹𝗮𝗻𝗰𝗲 𝘁𝗼 𝗯𝗲𝘁 𝘁𝗵𝗮𝘁 𝗮𝗺𝗼𝘂𝗻𝘁.",
      spin_message: "🎰 𝗦𝗽𝗶𝗻𝗻𝗶𝗻𝗴 𝘁𝗵𝗲 𝗠𝗶𝗸𝗮𝘀𝗮 𝗦𝗹𝗼𝘁 𝗦𝘆𝘀𝘁𝗲𝗺 🎀 ...",
      win_message: "✨ 𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀! 𝗬𝗼𝘂 𝘄𝗼𝗻 $%1!",
      lose_message: "😔 𝗢𝗼𝗽𝘀! 𝗬𝗼𝘂 𝗹𝗼𝘀𝘁 $%1.",
      jackpot_message: "💎 𝗝𝗔𝗖𝗞𝗣𝗢𝗧!!! 𝗬𝗼𝘂 𝘄𝗼𝗻 $%1 𝘄𝗶𝘁𝗵 𝘁𝗵𝗿𝗲𝗲 %2 𝘀𝘆𝗺𝗯𝗼𝗹𝘀!",
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);

    // Invalid bet check
    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }

    // Balance check
    if (amount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }

    // Send spinning message
    await message.reply(getLang("spin_message"));

    // Delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Slots setup
    const slots = ["💚", "💛", "💙"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    // Calculate winnings
    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    // Update balance
    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    // Final result styled
    const messageText = buildStylishMessage(slot1, slot2, slot3, winnings, getLang, amount);

    return message.reply(messageText);
  },
};

// Function to calculate winnings
function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === "💚" && slot2 === "💚" && slot3 === "💚") {
    return betAmount * 10;
  } else if (slot1 === "💛" && slot2 === "💛" && slot3 === "💛") {
    return betAmount * 5;
  } else if (slot1 === "💙" && slot2 === "💙" && slot3 === "💙") {
    return betAmount * 15; // Jackpot
  } else if (slot1 === slot2 && slot2 === slot3) {
    return betAmount * 3;
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

// Stylish bold + premium design message
function buildStylishMessage(slot1, slot2, slot3, winnings, getLang, betAmount) {
  const result = `🎰 [ ${slot1} | ${slot2} | ${slot3} ] 🎰`;
  const header = `✨ 𝗠𝗶𝗸𝗮𝘀𝗮 𝗦𝗹𝗼𝘁 𝗦𝘆𝘀𝘁𝗲𝗺 🎀\n═✦════════════✦═\n\n`;
  const betInfo = `💵 𝗕𝗲𝘁 𝗔𝗺𝗼𝘂𝗻𝘁: $${betAmount}\n`;

  let outcome;
  if (winnings > 0) {
    if (slot1 === "💙" && slot2 === "💙" && slot3 === "💙") {
      outcome = getLang("jackpot_message", winnings, "💙");
    } else if (slot1 === "💚" && slot2 === "💚" && slot3 === "💚") {
      outcome = getLang("jackpot_message", winnings, "💚");
    } else if (slot1 === "💛" && slot2 === "💛" && slot3 === "💛") {
      outcome = getLang("jackpot_message", winnings, "💛");
    } else {
      outcome = getLang("win_message", winnings);
    }
  } else {
    outcome = getLang("lose_message", -winnings);
  }

  return `${header}${result}\n\n${betInfo}📌 𝗥𝗲𝘀𝘂𝗹𝘁: ${outcome}\n\n═✦════════════✦═`;
  }
