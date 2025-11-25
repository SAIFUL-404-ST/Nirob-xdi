const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "1.3",
    description: "🎀 𝐌𝐢𝐤𝐚𝐬𝐚 𝐁𝐚𝐧𝐤 🎀 deposit, withdraw, transfer, interest & richlist system",
    category: "Balance",
    author: "Saif",
    countDown: 10
  },

  onStart: async function({ args, message, event, api, usersData }) {
    const userID = event.senderID;
    const bankPath = path.join(__dirname, "bankData.json");
    if (!fs.existsSync(bankPath)) fs.writeFileSync(bankPath, "{}");
    let bankData = JSON.parse(fs.readFileSync(bankPath, "utf8"));
    let userMoney = await usersData.get(userID, "money") || 0;

    const saveBank = () => fs.writeFileSync(bankPath, JSON.stringify(bankData, null, 2));
    const reply = text => message.reply(`🎀 𝐌𝐢𝐤𝐚𝐬𝐚 𝐁𝐚𝐧𝐤 🎀\n\n${text}`);

    // Init user
    const initUser = async (id) => {
      if (!bankData[id]) bankData[id] = { bank: 0, lastInterest: Date.now(), loan: 0, loanPayed: true };
      saveBank();
    };
    await initUser(userID);

    const command = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);
    let recipientID = parseInt(args[2]);

    switch(command) {
      case "deposit":
        if (!amount || amount <= 0) return reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝐝𝐞𝐩𝐨𝐬𝐢𝐭.");
        if (userMoney < amount) return reply("❌ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐜𝐚𝐬𝐡.");
        bankData[userID].bank += amount;
        userMoney -= amount;
        await usersData.set(userID, { money: userMoney });
        saveBank();
        return reply(`✅ 𝐃𝐞𝐩𝐨𝐬𝐢𝐭𝐞𝐝 $${amount} 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐛𝐚𝐧𝐤.`);

      case "withdraw":
        if (!amount || amount <= 0) return reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐭𝐨 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰.");
        if (bankData[userID].bank < amount) return reply("❌ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐧𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");
        bankData[userID].bank -= amount;
        userMoney += amount;
        await usersData.set(userID, { money: userMoney });
        saveBank();
        return reply(`✅ 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰𝐧 $${amount}.`);

      case "balance":
        return reply(`💰 𝐁𝐚𝐧𝐤: $${bankData[userID].bank}\n💵 𝐂𝐚𝐬𝐡: $${userMoney}`);

      case "interest":
        const now = Date.now();
        const last = bankData[userID].lastInterest;
        const diff = (now - last) / 1000;
        if (diff < 86400) {
          const hours = Math.floor((86400 - diff) / 3600);
          const minutes = Math.floor(((86400 - diff) % 3600) / 60);
          return reply(`⌛ 𝐂𝐥𝐚𝐢𝐦 𝐚𝐠𝐚𝐢𝐧 𝐢𝐧 ${hours}𝐡 ${minutes}𝐦.`);
        }
        const interest = bankData[userID].bank * 0.001;
        bankData[userID].bank += interest;
        bankData[userID].lastInterest = now;
        saveBank();
        return reply(`💸 𝐘𝐨𝐮 𝐞𝐚𝐫𝐧𝐞𝐝 $${interest.toFixed(2)} 𝐢𝐧 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭.`);

      case "transfer":
        if (!amount || amount <= 0) return reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭.");
        if (!recipientID && event.messageReply) recipientID = event.messageReply.senderID;
        if (!recipientID && event.mentions) recipientID = Object.keys(event.mentions)[0];
        if (!recipientID) return reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐚𝐠 𝐨𝐫 𝐫𝐞𝐩𝐥𝐲 𝐭𝐨 𝐚 𝐮𝐬𝐞𝐫 𝐭𝐨 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫.");

        await initUser(recipientID);

        if (recipientID === userID) return reply("❌ 𝐂𝐚𝐧'𝐭 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫 𝐭𝐨 𝐲𝐨𝐮𝐫𝐬𝐞𝐥𝐟.");
        if (bankData[userID].bank < amount) return reply("❌ 𝐍𝐨𝐭 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");

        bankData[userID].bank -= amount;
        bankData[recipientID].bank += amount;
        saveBank();
        return reply(`✅ 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫𝐫𝐞𝐝 $${amount} 𝐭𝐨 ${await usersData.getName(recipientID)}!`);

      case "richlist":
      case "richest":
        // Init all users
        for (const id of Object.keys(bankData)) await initUser(id);

        const sorted = Object.entries(bankData).sort(([,a],[,b]) => b.bank - a.bank).slice(0, 10);
        let leaderboard = "👑 𝐓𝐨𝐩 10 𝐑𝐢𝐜𝐡𝐞𝐬𝐭 𝐔𝐬𝐞𝐫𝐬 👑\n━━━━━━━━━━━━━━━\n";
        for (let i = 0; i < sorted.length; i++) {
          const [id, data] = sorted[i];
          let name;
          try { name = (await usersData.getName(id)) || "Unknown User"; } 
          catch { name = "Unknown User"; }
          leaderboard += `${i+1}. ${name} — $${data.bank}\n`;
        }
        return reply(leaderboard);

      default:
        return reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬:\n• deposit\n• withdraw\n• balance\n• interest\n• transfer\n• richlist");
    }
  }
};
