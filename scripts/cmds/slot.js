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
  const suffixes=[
    {value:1e33,symbol:"𝐃𝐂"},{value:1e30,symbol:"𝐍𝐎"},{value:1e27,symbol:"𝐎𝐂"},{value:1e24,symbol:"𝐒𝐏"},
    {value:1e21,symbol:"𝐒𝐗"},{value:1e18,symbol:"𝐐𝐓"},{value:1e15,symbol:"𝐐𝐃"},{value:1e12,symbol:"𝐓"},
    {value:1e9,symbol:"𝐁"},{value:1e6,symbol:"𝐌"},{value:1e3,symbol:"𝐊"}
  ];
  for(const s of suffixes){if(num>=s.value) return toSmallBoldNumber((num/s.value).toFixed(2))+s.symbol;}
  return toSmallBoldNumber(num.toFixed(2));
}

// Cooldowns & daily usage
const cooldowns = new Map();
const dailyUsage = new Map();

module.exports={
  config:{
    name:"slot",
    version:"6.0",
    author:"SAIF",
    category:"game",
    shortDescription:{en:"Love emoji slot game with shorthand money"},
    countDown:10 // 20 sec cooldown
  },

  onStart: async({args,message,event,usersData})=>{
    const user=event.senderID;

    // Daily reset
    const today=new Date().toDateString();
    if(!dailyUsage.has(user) || dailyUsage.get(user).date!==today){
      dailyUsage.set(user,{count:0,date:today});
    }
    const userDaily = dailyUsage.get(user);
    if(userDaily.count>=20) return message.reply("⚠️ You have reached your daily limit of 20 spins!");

    // Cooldown check
    const now=Date.now();
    if(cooldowns.has(user) && now - cooldowns.get(user) < 20000){
      const remaining = Math.ceil((20000-(now - cooldowns.get(user)))/1000);
      return message.reply(`⏳ Please wait ${remaining} more seconds before spinning again.`);
    }

    // User data
    let userData = await usersData.get(user);
    if(!userData.money) userData.money=1000;

    // Bet amount
    const betAmount = parseShorthand(args[0]);
    if(isNaN(betAmount) || betAmount<=0) return message.reply("⚠️ ENTER A VALID BET AMOUNT.");
    if(betAmount>userData.money) return message.reply("💰 NOT ENOUGH BALANCE.");

    // Slot emojis
    const slots=["❤️","💛","💚","💙"];
    const slot1=slots[Math.floor(Math.random()*slots.length)];
    const slot2=slots[Math.floor(Math.random()*slots.length)];
    const slot3=slots[Math.floor(Math.random()*slots.length)];

    // Winnings
    const winnings = calculateWinnings(slot1,slot2,slot3,betAmount);
    userData.money += winnings;

    // Save user data
    await usersData.set(user,userData);

    // Update cooldown & daily
    cooldowns.set(user,now);
    userDaily.count +=1;
    dailyUsage.set(user,userDaily);

    const resultMsg=`🎀
• 𝐁𝐚𝐛𝐲, 𝐘𝐨𝐮 ${winnings>0?"𝐖𝐨𝐧":"𝐋𝐨𝐬𝐭"} ${formatMoney(Math.abs(winnings))}!
• 𝐆𝐚𝐦𝐞 𝐑𝐞𝐬𝐮𝐥𝐭𝐬: [ ${slot1} | ${slot2} | ${slot3} ]
• 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${formatMoney(userData.money)}
• 𝐃𝐚𝐢𝐥𝐲 𝐔𝐬𝐞: ${userDaily.count}/20`;

    return message.reply(resultMsg);
  }
};

function calculateWinnings(s1,s2,s3,bet){
  if(s1===s2 && s2===s3){
    if(s1==="💙") return bet*15;
    if(s1==="💚") return bet*10;
    if(s1==="💛") return bet*5;
    return bet*3; // ❤️
  }
  if(s1===s2 || s1===s3 || s2===s3) return bet*2;
  return -bet;
}
