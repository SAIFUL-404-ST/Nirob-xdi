const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "affect",
		version: "1.4",
		author: "Saif",
		countDown: 5,
		role: 0,
		shortDescription: "Affect image",
		longDescription: "Affect image",
		category: "fun",
		guide: {
			vi: "{pn} [@tag | r | rnd | random]",
			en: "{pn} [@tag | r | rnd | random]"
		}
	},

	onStart: async function ({ event, message, usersData, api, args }) {
		const mention = Object.keys(event.mentions);
		const senderID = event.senderID;
		let target;

		// Random user
		if (args[0] && ["r", "rnd", "rndm", "random"].includes(args[0].toLowerCase())) {
			const allUsers = await api.getThreadInfo(event.threadID).then(res => res.participantIDs.filter(id => id != senderID));
			target = allUsers[Math.floor(Math.random() * allUsers.length)];
		} 
		// Mentioned user
		else if (mention.length > 0) {
			target = mention[0];
		} 
		// Replied message
		else if (event.type == "message_reply" && event.messageReply) {
			target = event.messageReply.senderID;
		} 
		else {
			return message.reply("Please mention someone, reply to a message, or use random (r/rnd/random)");
		}

		// Fetch sender & target names
		const senderInfo = await api.getUserInfo([senderID]);
		const targetInfo = await api.getUserInfo([target]);
		const nameSender = Object.values(senderInfo)[0].name;
		const nameTarget = Object.values(targetInfo)[0].name;

		// Get target avatar
		const avatarURL = await usersData.getAvatarUrl(target);

		// Countdown
		let countdownMsg = await message.reply(` affecting image for ${nameTarget} in 3 seconds...`);
		for (let i = 2; i > 0; i--) {
			await new Promise(resolve => setTimeout(resolve, 1000));
			await api.editMessage(` affecting image for ${nameTarget} in ${i} seconds...`, countdownMsg.messageID);
		}
		await new Promise(resolve => setTimeout(resolve, 1000));
		await api.editMessage("🙏 bby affected  now...", countdownMsg.messageID);

		// Generate image
		const img = await new DIG.Affect().getImage(avatarURL);
		const pathSave = path.join(__dirname, `tmp/${target}_Affect.png`);
		fs.ensureDirSync(path.join(__dirname, "tmp"));
		fs.writeFileSync(pathSave, Buffer.from(img));

		// Send final image as NEW message
		await api.sendMessage({
			body: ` ${nameSender} baby  affected image for ${nameTarget}!`,
			attachment: fs.createReadStream(pathSave)
		}, event.threadID);

		// Delete temp file
		fs.unlinkSync(pathSave);
	}
};
