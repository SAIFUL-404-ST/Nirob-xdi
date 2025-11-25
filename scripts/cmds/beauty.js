module.exports = {
  config: {
    name: "beauty",
    version: "2.2",
    author: "SAIF",
    role: 0,
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ event, message, usersData }) {
    const userId = event.senderID;
    const cost = 500;

    // fetch main balance correctly
    let userData = await usersData.get(userId);
    if (!userData || typeof userData.money !== "number") {
      userData = { money: 0 }; // default
    }

    if (userData.money < cost) {
      return message.reply(`⚠️ Baka! You need ${cost} coins to use this command~ 💸\n💰 Your balance: ${userData.money}`);
    }

    // deduct money from main balance
    userData.money -= cost;
    await usersData.set(userId, userData);

    // optional cooldown
    if (!global.beautyCooldowns) global.beautyCooldowns = new Map();
    const now = Date.now();
    if (global.beautyCooldowns.has(userId)) {
      const lastTime = global.beautyCooldowns.get(userId);
      const diff = (now - lastTime) / 1000;
      if (diff < 15) {
        return message.reply(`Baka! Chill for ${Math.ceil(15 - diff)} more seconds before using this again~ 🫠`);
      }
    }
    global.beautyCooldowns.set(userId, now);

    // beautiness data
    const data = [
      "You are 77% beautiful🫠","You are 2% beautiful🫠","You are 60% beautiful🫠",
      "You are 90% beautiful🫠","You are 40% beautiful🫠","You are 33% beautiful🫠","You are 95% beautiful🫠","You are 50% beautiful🫠","You are 30% beautiful🫠","You are 45% beautiful🫠","You are 00% beautiful🫠","You are 70% beautiful🫠","You are 88% beautiful🫠","You are 90% beautiful🫠","You are 67% beautiful🫠","You are 660% beautiful🫠","You are 33% beautiful🫠","You are 6% beautiful🫠","You are 54% beautiful🫠","You are 20% beautiful🫠","You are 63% beautiful🫠","You are 60% beautiful🫠","You are 77% beautiful🫠","You are 65% beautiful🫠"," apni akjon nigro,apni beauty diye ki korben? "," tor janu ache nki je beauty lagbe "," mara kha "," nigroness overloaded, my system is crushing........."
      "Oh Oh O My God 😲 Cuteness Overload... My System Is Gonna To Crash Out 🤯 !!"
    ];

    const result = data[Math.floor(Math.random() * data.length)];

    // reply final result with correct main balance
    return message.reply(`✅ ${result}\n💰 -${cost} coins (Remaining: ${userData.money})`);
  }
};
