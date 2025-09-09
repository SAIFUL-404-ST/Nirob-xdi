// Format number with commas
function addCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Number formatter (K, M, B, T, Q, Qa, Sx, Sp, Oc, No, Dc ...)
function formatMoney(amount) {
  const units = [
    { value: 1e33, symbol: "Dc" },  // Decillion
    { value: 1e30, symbol: "No" },  // Nonillion
    { value: 1e27, symbol: "Oc" },  // Octillion
    { value: 1e24, symbol: "Sp" },  // Septillion
    { value: 1e21, symbol: "Sx" },  // Sextillion
    { value: 1e18, symbol: "Qa" },  // Quintillion
    { value: 1e15, symbol: "Q" },   // Quadrillion
    { value: 1e12, symbol: "T" },   // Trillion
    { value: 1e9, symbol: "B" },    // Billion
    { value: 1e6, symbol: "M" },    // Million
    { value: 1e3, symbol: "K" }     // Thousand
  ];
  for (let u of units) {
    if (amount >= u.value) {
      return (amount / u.value).toFixed(2) + u.symbol;
    }
  }
  return addCommas(amount);
}

// Bold Stylish Font
function boldFont(text) {
  const map = {
    A:"𝗔",B:"𝗕",C:"𝗖",D:"𝗗",E:"𝗘",F:"𝗙",G:"𝗚",H:"𝗛",I:"𝗜",J:"𝗝",
    K:"𝗞",L:"𝗟",M:"𝗠",N:"𝗡",O:"𝗢",P:"𝗣",Q:"𝗤",R:"𝗥",S:"𝗦",T:"𝗧",
    U:"𝗨",V:"𝗩",W:"𝗪",X:"𝗫",Y:"𝗬",Z:"𝗭",
    a:"𝗮",b:"𝗯",c:"𝗰",d:"𝗱",e:"𝗲",f:"𝗳",g:"𝗴",h:"𝗵",i:"𝗶",j:"𝗷",
    k:"𝗸",l:"𝗹",m:"𝗺",n:"𝗻",o:"𝗼",p:"𝗽",q:"𝗾",r:"𝗿",s:"𝘀",t:"𝘁",
    u:"𝘂",v:"𝘃",w:"𝘄",x:"𝘅",y:"𝘆",z:"𝘇",
    0:"𝟬",1:"𝟭",2:"𝟮",3:"𝟯",4:"𝟰",5:"𝟱",6:"𝟲",7:"𝟳",8:"𝟴",9:"𝟵"
  };
  return text.split("").map(c => map[c] || c).join("");
}

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal"],
    version: "3.1",
    author: "Saif",
    countDown: 5,
    role: 0,
    description: "View balance or transfer money in a stylish way",
    category: "economy",
    guide: {
      en: "   Reply with `.bal` to see balance\n"
        + "   `.bal transfer <amount>` to transfer (reply to user)\n"
        + "   `.bal add <amount>`: (Admin only)"
    }
  },

  onStart: async function ({ message, usersData, event, args }) {
    const adminIDs = ["100081317798618"]; // multiple admin allowed
    const targetID = event.messageReply ? event.messageReply.senderID : event.senderID;
    const targetName = event.messageReply ? (event.messageReply.senderName || "User") : "You";

    // --- ADMIN ADD ---
    if (args[0] === "add") {
      if (!adminIDs.includes(event.senderID)) return message.reply("❌ Only admin can use 'add'.");
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");

      const senderData = await usersData.get(event.senderID);
      senderData.money += amount;
      await usersData.set(event.senderID, senderData);

      return message.reply(
        `🎀\n\n${boldFont("✅ Added " + formatMoney(amount) + " to your account.")}\n${boldFont("💵 New Balance: " + formatMoney(senderData.money))}`
      );
    }

    // --- TRANSFER ---
    if (args[0] === "transfer") {
      if (!event.messageReply) return message.reply("❌ Reply to someone to transfer.");
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
      const MAX_TRANSFER = 200000000000000000000000000000000000000;
      if (amount > MAX_TRANSFER) return message.reply(`❌ Max transfer is ${MAX_TRANSFER}$.`);

      const senderData = await usersData.get(event.senderID);
      const recipientData = await usersData.get(targetID);

      if (senderData.money < amount) return message.reply("❌ You don't have enough money.");

      senderData.money -= amount;
      recipientData.money += amount;

      await usersData.set(event.senderID, senderData);
      await usersData.set(targetID, recipientData);

      return message.reply(
        `🎀\n\n${boldFont(`✅ You transferred ${formatMoney(amount)} to ${targetName}.`)}\n${boldFont("💵 Your Balance: " + formatMoney(senderData.money))}`
      );
    }

    // --- CHECK BALANCE ---
    const userData = await usersData.get(targetID);
    const name = targetID === event.senderID ? "Your" : targetName;

    message.reply(
      `🎀\n\n${boldFont(`${name} balance is ${formatMoney(userData.money)}`)}`
    );
  }
};
