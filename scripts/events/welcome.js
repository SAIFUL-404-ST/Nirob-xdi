const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.8",
		author: "SAIF",
		category: "events"
	},

	langs: {
		vi: {
			session1: "𝐒𝐀𝐍𝐆",
			session2: "𝐓𝐑𝐔̛𝐀",
			session3: "𝐂𝐇𝐈𝐄̂̀𝐔",
			session4: "𝐓𝐎̂́𝐈",
			welcomeMessage: "✨ 𝐂𝐚̉𝐦 𝐨̛𝐧 𝐛𝐚̣𝐧 𝐯𝐢̀ 𝐝𝐚̃ 𝐦𝐨̛̀𝐢 𝐭𝐨̂𝐢 𝐯𝐚̀𝐨 𝐧𝐡𝐨́𝐦! \n📌 𝐏𝐫𝐞𝐟𝐢𝐱 𝐛𝐨𝐭: %1\n📜 𝐗𝐞𝐦 𝐝𝐚𝐧𝐡 𝐬𝐚́𝐜𝐡 𝐥𝐞̣̂𝐧𝐡: %1help",
			multiple1: "𝐛𝐚̣𝐧",
			multiple2: "𝐜𝐚́𝐜 𝐛𝐚̣𝐧",
			defaultWelcomeMessage: "🌸 𝐗𝐢𝐧 𝐜𝐡𝐚̀𝐨 {userName}.\n🌟 𝐂𝐡𝐚̀𝐨 𝐦𝐮̛̀𝐧𝐠 𝐛𝐚̣𝐧 đ𝐞̂́n 𝐯𝐨̛́𝐢 {boxName}.\n💫 𝐂𝐡𝐮́𝐜 𝐛𝐚̣𝐧 có bư𝐨̛̉𝐢 {session} 𝐯𝐮𝐢 vẻ!"
		},
		en: {
			session1: "𝑴𝒐𝒓𝑵𝒊𝒏𝑮",
			session2: "𝑵𝒐𝒐𝑵",
			session3: "𝑨𝒇𝒕𝒆𝑹𝒏𝒐𝒐𝑵",
			session4: "𝑬𝒗𝒆𝑵𝒊𝒏𝑮",
			session5: "𝑵𝒊𝒈𝑯𝒕",
			welcomeMessage: `🫧 𝐀𝐒𝐀𝐋𝐀𝐌𝐔𝐖𝐀𝐋𝐈𝐊𝐔𝐌 🫧`
				+ `\n💠 𝐓𝐡𝐞 𝐁𝐨𝐭 𝐇𝐚𝐬 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝 𝐭𝐨 𝐭𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 ⚜`
				+ `\n🌀 𝐏𝐫𝐞𝐟𝐢𝐱: %1`
				+ `\n__________________________`
				+ `\n👑 𝐎𝐰𝐧𝐞𝐫: https://www.facebook.com/profile.php?id=100081317798618`
				+ `\n__________________________`
				+ `\n✨ 𝐓𝐨 𝐯𝐢𝐞𝐰 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬: %1help`,
			multiple1: "𝐭𝐨 𝐭𝐡𝐞",
			multiple2: "𝐭𝐨 𝐨𝐮𝐫",
			defaultWelcomeMessage: `🌟 𝐇𝐞𝐥𝐥𝐨 {userName}!\n💫 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 {multiple} 𝐭𝐨 𝐭𝐡𝐞 𝐆𝐫𝐨𝐮𝐩: {boxName}\n🎉 𝐇𝐚𝐯𝐞 𝐚  𝐟𝐚𝐧𝐭𝐚𝐬𝐭𝐢𝐜 {session}! 😎`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType !== "log:subscribe") return;

		const hours = getTime("HH");
		const { threadID } = event;
		const { nickNameBot } = global.GoatBot.config;
		const prefix = global.utils.getPrefix(threadID);
		const dataAddedParticipants = event.logMessageData.addedParticipants;

		// Bot added
		if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
			if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
			return message.send(getLang("welcomeMessage", prefix));
		}

		if (!global.temp.welcomeEvent[threadID]) {
			global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
		}

		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			const threadData = await threadsData.get(threadID);
			if (threadData.settings.sendWelcomeMessage == false) return;

			const dataAdded = global.temp.welcomeEvent[threadID].dataAddedParticipants;
			const dataBanned = threadData.data.banned_ban || [];
			const threadName = threadData.threadName;
			const userName = [], mentions = [];
			let multiple = dataAdded.length > 1;

			for (const user of dataAdded) {
				if (dataBanned.some((item) => item.id == user.userFbId)) continue;
				userName.push(user.fullName);
				mentions.push({ tag: user.fullName, id: user.userFbId });
			}
			if (!userName.length) return;

			let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;
			const form = { mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null };

			welcomeMessage = welcomeMessage
				.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
				.replace(/\{boxName\}|\{threadName\}/g, threadName)
				.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
				.replace(
					/\{session\}/g,
					hours <= 10 ? getLang("session1") :
					hours <= 12 ? getLang("session2") :
					hours <= 18 ? getLang("session3") :
					getLang("session4")
				);

			form.body = welcomeMessage;

			if (threadData.data.welcomeAttachment) {
				const files = threadData.data.welcomeAttachment;
				const attachments = files.map(file => drive.getFile(file, "stream"));
				form.attachment = (await Promise.allSettled(attachments))
					.filter(({ status }) => status == "fulfilled")
					.map(({ value }) => value);
			}
			message.send(form);
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
