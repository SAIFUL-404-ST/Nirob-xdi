const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "Saif",
		category: "events"
	},

	langs: {
		en: {
			session1: "𝐌𝐨𝐫𝐧𝐢𝐧𝐠",
			session2: "𝐍𝐨𝐨𝐧",
			session3: "𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧",
			session4: "𝐄𝐯𝐞𝐧𝐢𝐧𝐠",
			session5: "𝐍𝐢𝐠𝐡𝐭",

			welcomeMessage:
				`𝐇𝐞𝐲 𝐅𝐯𝐫𝐭 𝐁𝐨𝐭\n\n` +
				`𝐓𝐡𝐞 𝐁𝐨𝐭 𝐈𝐬 𝐍𝐨𝐰 𝐀𝐜𝐭𝐢𝐯𝐞 𝐈𝐧 𝐓𝐡𝐢𝐬 𝐆𝐫𝐨𝐮𝐩\n\n` +
				`𝐁𝐨𝐭 𝐏𝐫𝐞𝐟𝐢𝐱 : %1\n\n` +
				`𝐓𝐨 𝐕𝐢𝐞𝐰 𝐀𝐥𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬\n` +
				`𝐓𝐲𝐩𝐞 : %1help`,

			multiple1: "𝐓𝐨",
			multiple2: "𝐓𝐨 𝐎𝐮𝐫",

			defaultWelcomeMessage:
				`𝐀𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦\n\n` +
				`𝐇𝐞𝐲 {userName}\n\n` +
				`𝐖𝐞𝐥𝐜𝐨𝐦𝐞 {multiple} 𝐂𝐡𝐚𝐭 𝐆𝐫𝐨𝐮𝐩\n` +
				`𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞 : {boxName}\n\n` +
				`𝐖𝐢𝐬𝐡𝐢𝐧𝐠 𝐘𝐨𝐮 𝐀 𝐍𝐢𝐜𝐞 {session}`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType !== "log:subscribe") return;

		const hours = getTime("HH");
		const { threadID } = event;
		const prefix = global.utils.getPrefix(threadID);
		const { nickNameBot } = global.GoatBot.config;
		const dataAddedParticipants = event.logMessageData.addedParticipants;

		// Bot added to group
		if (dataAddedParticipants.some(u => u.userFbId == api.getCurrentUserID())) {
			if (nickNameBot)
				api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
			return message.send(getLang("welcomeMessage", prefix));
		}

		if (!global.temp.welcomeEvent[threadID]) {
			global.temp.welcomeEvent[threadID] = {
				joinTimeout: null,
				dataAddedParticipants: []
			};
		}

		global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
		clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

		global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
			const threadData = await threadsData.get(threadID);
			if (threadData.settings.sendWelcomeMessage === false) return;

			const added = global.temp.welcomeEvent[threadID].dataAddedParticipants;
			const banned = threadData.data.banned_ban || [];
			const threadName = threadData.threadName;

			const names = [];
			const mentions = [];
			let multiple = added.length > 1;

			for (const user of added) {
				if (banned.some(b => b.id == user.userFbId)) continue;
				names.push(user.fullName);
				mentions.push({
					tag: user.fullName,
					id: user.userFbId
				});
			}

			if (!names.length) return;

			let welcomeMessage =
				threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

			const form = {
				mentions: welcomeMessage.includes("{userNameTag}") ? mentions : null
			};

			welcomeMessage = welcomeMessage
				.replace(/\{userName\}|\{userNameTag\}/g, names.join(", "))
				.replace(/\{boxName\}|\{threadName\}/g, threadName)
				.replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
				.replace(
					/\{session\}/g,
					hours <= 10
						? getLang("session1")
						: hours <= 12
							? getLang("session2")
							: hours <= 18
								? getLang("session3")
								: getLang("session4")
				);

			form.body = welcomeMessage;

			if (threadData.data.welcomeAttachment) {
				const files = threadData.data.welcomeAttachment;
				const attachments = files.map(file => drive.getFile(file, "stream"));
				form.attachment = (await Promise.allSettled(attachments))
					.filter(r => r.status === "fulfilled")
					.map(r => r.value);
			}

			message.send(form);
			delete global.temp.welcomeEvent[threadID];
		}, 1500);
	}
};
