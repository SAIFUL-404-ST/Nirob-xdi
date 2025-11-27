const parseShorthand = (str) => {
  if (!str) return NaN;
  str = str.toLowerCase();
  const map = { k:1e3, m:1e6, b:1e9, t:1e12, qd:1e15, qt:1e18, sx:1e21, sp:1e24, oc:1e27, no:1e30, dc:1e33 };
  let suffix = Object.keys(map).sort((a,b)=>b.length-a.length).find(s=>str.endsWith(s));
  let multiplier = suffix ? map[suffix] : 1;
  if(suffix) str=str.slice(0,-suffix.length);
  const number=parseFloat(str);
  return isNaN(number)?NaN:number*multiplier;
};

const smallBoldNumbers={"0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",".":"."};
function toSmallBoldNumber(num){return num.toString().split("").map(c=>smallBoldNumbers[c]||c).join("");}
function formatMoney(num){
  const suffixes=[{value:1e33,symbol:"𝐃𝐂"},{value:1e30,symbol:"𝐍𝐎"},{value:1e27,symbol:"𝐎𝐂"},{value:1e24,symbol:"𝐒𝐏"},{value:1e21,symbol:"𝐒𝐗"},{value:1e18,symbol:"𝐐𝐍"},{value:1e15,symbol:"𝐐𝐃"},{value:1e12,symbol:"𝐓"},{value:1e9,symbol:"𝐁"},{value:1e6,symbol:"𝐌"},{value:1e3,symbol:"𝐊"}];
  for(const s of suffixes){if(num>=s.value) return toSmallBoldNumber((num/s.value).toFixed(2))+s.symbol;}
  return toSmallBoldNumber(num);
}

const DAILY_LIMIT = 20;

module.exports = {
  config: {
    name: "slot",
    version: "6.3",
    author: "SAIF",
    category: "game",
    shortDescription: {en:"Stylish bullet slot game"},
    countDown: 20 // 20 second cooldown
  },

  onStart: async ({args,message,event,usersData}) => {
    const user = event.senderID;
    let userData = await usersData.get(user);

    if(!userData.slot) userData.slot = { daily:0, lastUsed:0, date:new Date().toDateString() };
    const today = new Date().toDateString();
    if(userData.slot.date !== today){
      userData.slot.daily = 0;
      userData.slot.date = today;
    }

    // Daily limit check
    if(userData.slot.daily >= DAILY_LIMIT) 
      return message.reply("⚠️ Daily limit reached! Come back tomorrow.");

    // Cooldown check from cmd config
    const now = Date.now();
    if(userData.slot.lastUsed && now - userData.slot.lastUsed < module.exports.config.countDown*1000){
      const wait = Math.ceil((module.exports.config.countDown*1000 - (now - userData.slot.lastUsed))/1000);
      return message.reply(`⏱ Please wait ${wait}s before playing again!`);
    }

    const betAmount = parseShorthand(args[0]);
    if(isNaN(betAmount)||betAmount<=0) return message.reply("⚠️ 𝗘𝗡𝗧𝗘𝗥 𝗔 𝗩𝗔𝗟𝗜𝗗 𝗕𝗘𝗧 𝗔𝗠𝗢𝗨𝗡𝗧.");
    if(betAmount>userData.money) return message.reply("💰 𝗡𝗢𝗧 𝗘𝗡𝗢𝗨𝗚𝗛 𝗕𝗔𝗟𝗔𝗡𝗖𝗘.");

    const slots = ["❤️","💛","💙","💚"];
    const slot1 = slots[Math.floor(Math.random()*slots.length)];
    const slot2 = slots[Math.floor(Math.random()*slots.length)];
    const slot3 = slots[Math.floor(Math.random()*slots.length)];

    const winnings = calculateWinnings(slot1,slot2,slot3,betAmount);
    userData.money += winnings;

    // Update slot info
    userData.slot.daily += 1;
    userData.slot.lastUsed = now;

    await usersData.set(user,userData);

    const resultMsg = `🎀
• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 ${winnings>0?"𝐖𝐨𝐧":"𝐋𝐨𝐬𝐭"} ${formatMoney(Math.abs(winnings))}!
• 𝐑𝐞𝐬𝐮𝐥𝐭: [ ${slot1} | ${slot2} | ${slot3} ]
• 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(userData.money)}`;

    return message.reply(resultMsg);
  }
};

function calculateWinnings(s1,s2,s3,bet){
  if(s1===s2&&s2===s3){
    if(s1==="💙") return bet*15;
    if(s1==="💚") return bet*10;
    if(s1==="💛") return bet*5;
    return bet*3;
  }
  if(s1===s2||s1===s3||s2===s3) return bet*2;
  return -bet;
}
