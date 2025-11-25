const axios = require('axios');

module.exports = {
 config: {
 name: "nagad",
 aliases: ["nagad-info"],
 version: "1.0",
 author: "Chitron Bhattacharjee",
 description: {
 vi: "Lấy thông tin tài khoản Nagad dựa trên số điện thoại.",
 en: "Get Nagad account half-information based on the phone number."
 },
 category: "tools",
 guide: {
 vi: "{pn} <số điện thoại>",
 en: "{pn} <phone number>"
 }
 },

 onStart: async function ({ api, args, event }) {
 if (args.length === 0) {
 await api.sendMessage("📵 𝓨𝓸𝓾 𝓷𝓮𝓮𝓭 𝓽𝓸 𝓮𝓷𝓽𝓮𝓻 𝓪 𝓝𝓪𝓰𝓪𝓭 𝓷𝓾𝓶𝓫𝓮𝓻!", event.threadID, event.messageID);
 return;
 }

 const phoneNumber = args[0];

 try {
 const response = await axios.get(`https://rubish-apihub.onrender.com/rubish/ngd-half?number=${phoneNumber}&apikey=rubish69`);
 const data = response.data.data;

 if (typeof data === 'string' && data.includes("PLEASE ENTER A VALID NAGAD NUMBER")) {
 await api.sendMessage("❌ 𝓘𝓷𝓿𝓪𝓵𝓲𝓭 𝓝𝓪𝓰𝓪𝓭 𝓷𝓾𝓶𝓫𝓮𝓻! 𝓣𝓻𝔂 𝓪𝓰𝓪𝓲𝓷!", event.threadID, event.messageID);
 return;
 }

 const formattedResponse = `
╔═══════════════╗
🎌 𝙉𝘼𝙂𝘼𝘿 𝙄𝙉𝙁𝙊 🤖✨
╚═══════════════╝

📞 𝙋𝙝𝙤𝙣𝙚: ${data.number}
👤 𝙉𝙖𝙢𝙚: ${data.name}
🆔 𝙐𝙨𝙚𝙧 ID: ${data.userId}
🔋 𝙎𝙩𝙖𝙩𝙪𝙨: ${data.status}
🔒 𝙑𝙚𝙧𝙞𝙛𝙞𝙘𝙖𝙩𝙞𝙤𝙣: ${data.verificationStatus}
👥 𝙐𝙨𝙚𝙧 𝙏𝙮𝙥𝙚: ${data.userType}
🛡 𝙍𝘽 𝘽𝙖𝙨𝙚: ${data.rbBase}
🧩 𝘼𝙪𝙩𝙝 𝙏𝙤𝙠𝙚𝙣: ${data.authTokenInfo}
🔄 𝙀𝙭𝙚𝙘𝙪𝙩𝙞𝙤𝙣: ${data.executionStatus}
`;

 await api.sendMessage(formattedResponse, event.threadID, event.messageID);

 } catch (error) {
 console.error('Error fetching Nagad account data:', error);
 if (
 error.response &&
 error.response.data &&
 typeof error.response.data === 'string' &&
 error.response.data.includes("PLEASE ENTER A VALID NAGAD NUMBER")
 ) {
 await api.sendMessage("❗ 𝓟𝓵𝓮𝓪𝓼𝓮 𝓮𝓷𝓽𝓮𝓻 𝓪 𝓿𝓪𝓵𝓲𝓭 𝓝𝓪𝓰𝓪𝓭 𝓷𝓾𝓶𝓫𝓮𝓻.", event.threadID, event.messageID);
 } else {
 await api.sendMessage("⚠️ 𝓢𝓸𝓶𝓮𝓽𝓱𝓲𝓷𝓰 𝓰𝓸𝓽 𝓼𝓽𝓾𝓬𝓴... 𝓣𝓻𝔂 𝓪𝓰𝓪𝓲𝓷 𝓵𝓪𝓽𝓮𝓻!", event.threadID, event.messageID);
 }
 }
 }
};
