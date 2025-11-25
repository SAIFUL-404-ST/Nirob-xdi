const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "arrest",
		aliases: ["ar"],
		version: "1.6",
		author: "milan-says",
		countDown: 5,
		role: 0,
		shortDescription: "arrest the rapist",
		longDescription: "",
		category: "fun",
		guide:  {
			vi: "{pn} [@tag | r | rnd | random]",
			en: "{pn} [@tag | r | rnd | random]"
		}
	},

	onStart: async function ({ message, args, api , event }) {
        const mention = Object.keys(event.mentions);
        let one = event.senderID;
        let two;

        // Random user
        if (args[0] && ["r", "rnd", "rndm", "random"].includes(args[0].toLowerCase())) {
            const allUsers = await api.getThreadInfo(event.threadID).then(res => res.participantIDs.filter(id => id != one));
            const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
            two = randomUser;
        } 
        // Mentioned users
        else if (mention.length > 0) {
            two = mention[0];
        } 
        // Replied message
        else if (event.type == "message_reply" && event.messageReply) {
            two = event.messageReply.senderID;
        } 
        else {
            return message.reply("please mention someone, reply to a message, or use random (r/rnd/random)");
        }

        // Get sender name
        const senderInfo = await api.getUserInfo([one]);
        const nameOne = Object.values(senderInfo)[0].name;

        // Get target name safely
        const targetInfo = await api.getUserInfo([two]);
        const nameTwo = Object.values(targetInfo)[0].name;

        // 3 Second Countdown
        let countdownMsg = await message.reply("⏳ Arrest starting in 3 seconds...");
        for (let i = 2; i > 0; i--) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await api.editMessage(`⏳ Arrest starting in ${i} seconds...`, countdownMsg.messageID);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        await api.editMessage("🚨 Arresting now...", countdownMsg.messageID);

        // Generate arrest image
        const ptth = await bal(one, two);

        // Send final arrest message with image as NEW message
        await api.sendMessage({
            body: `👮‍♂️ ${nameOne} arrested ${nameTwo}!`,
            attachment: fs.createReadStream(path.resolve(ptth))
        }, event.threadID);
    }
};

async function bal(one, two) {
    let avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avone.circle();
    let avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avtwo.circle();

    const pth = path.join(__dirname, "fak.png");
    let img = await jimp.read("https://i.imgur.com/ep1gG3r.png");
    img.resize(500, 500)
       .composite(avone.resize(100, 100), 375, 9)
       .composite(avtwo.resize(100, 100), 160, 92);

    await img.writeAsync(pth);
    return pth;
}
