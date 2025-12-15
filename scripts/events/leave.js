const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.1",
		author: "SAIF",
		category: "events"
	},

	langs: {
		vi: {
			session1: "🌅 𝐒𝐀𝐍𝐆",
			session2: "🌞 𝐓𝐑𝐔̛𝐀",
			session3: "☀️ 𝐂𝐇𝐈𝐄̂̀𝐔",
			session4: "🌙 𝐓𝐎̂́𝐈",
			leaveType1: "✨ 𝐓𝐔̛̣ 𝐑𝐎̛̀𝐈",
			leaveType2: "⚡ 𝐁𝐈̣ 𝐊𝐈𝐂𝐊 𝐁𝐨̛̉𝐢",
			defaultLeaveMessage:
`🌿 𝐒𝐚𝐲 𝐛𝐲𝐞 {userName} 🌸
💌 𝐓𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐭𝐡𝐞 𝐦𝐨𝐦𝐞𝐧𝐭𝐬 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮! 😿
🕰 𝐓𝐢𝐦𝐞: {time} — 𝐇𝐚𝐯𝐞 𝐚 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 {session} 💫
💬 𝐆𝐫𝐨𝐮𝐩: {threadName}
🌟 𝐑𝐞𝐦𝐞𝐦𝐛𝐞𝐫, 𝐥𝐢𝐟𝐞 𝐠𝐨𝐞𝐬 𝐨𝐧… 🫡`
		},
		en: {
			session1: "🌅 𝐌𝐎𝐑𝐍𝐈𝐍𝐆",
			session2: "☀️ 𝐀𝐅𝐓𝐄𝐑𝐍𝐎𝐎𝐍",
			session3: "🌞 𝐀𝐅𝐓𝐄𝐑𝐍𝐎𝐎𝐍",
			session4: "🌙 𝐍𝐈𝐆𝐇𝐓",
			leaveType1: "✨ 𝐉𝐔𝐒𝐓 𝐋𝐄𝐅𝐓",
			leaveType2: "⚡ 𝐊𝐈𝐂𝐊𝐄𝐃 𝐁𝐘 𝐀𝐃𝐌𝐈𝐍",
			defaultLeaveMessage:
`📤 𝐎𝐨𝐨𝐨𝐩𝐬! {userName} {type} ❗
💌 𝐇𝐨𝐩𝐞 𝐲𝐨𝐮 𝐞𝐧𝐣𝐨𝐲𝐞𝐝 𝐲𝐨𝐮𝐫 𝐭𝐢𝐦𝐞 😿
🕰 𝐓𝐢𝐦𝐞: {time} — 𝐇𝐚𝐯𝐞 𝐚 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 {session} 🌟
💬 𝐆𝐫𝐨𝐮𝐩: {threadName}
🌿 𝐍𝐞𝐯𝐞𝐫 𝐬𝐚𝐝, 𝐚𝐧𝐨𝐭𝐡𝐞𝐫 𝐩𝐞𝐫𝐬𝐨𝐧 𝐰𝐢𝐥𝐥 𝐜𝐨𝐦𝐞 🫡
🥀 𝐁𝐲𝐞 {userName}, 𝐭𝐡𝐚𝐧𝐤𝐬 𝐟𝐨𝐫 𝐛𝐞𝐢𝐧𝐠 𝐚 𝐩𝐚𝐫𝐭 𝐨𝐟 𝐮𝐬! 💫`
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType !== "log:unsubscribe") return;

		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		if (!threadData.settings.sendLeaveMessage) return;

		const { leftParticipantFbId } = event.logMessageData;
		if (leftParticipantFbId == api.getCurrentUserID()) return;

		const hours = getTime("HH:mm:ss");
		const threadName = threadData.threadName;
		const userName = await usersData.getName(leftParticipantFbId);

		let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
		const form = {
			mentions: leaveMessage.includes("{userNameTag}") ? [{ tag: userName, id: leftParticipantFbId }] : null
		};

		leaveMessage = leaveMessage
			.replace(/\{userName\}|\{userNameTag\}/g, userName)
			.replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
			.replace(/\{threadName\}|\{boxName\}/g, threadName)
			.replace(/\{time\}/g, hours)
			.replace(/\{session\}/g,
				hours <= 10 ? getLang("session1") :
				hours <= 12 ? getLang("session2") :
				hours <= 18 ? getLang("session3") :
				getLang("session4")
			);

		form.body = leaveMessage;

		if (threadData.data.leaveAttachment) {
			const attachments = threadData.data.leaveAttachment.map(file => drive.getFile(file, "stream"));
			form.attachment = (await Promise.allSettled(attachments))
				.filter(({ status }) => status === "fulfilled")
				.map(({ value }) => value);
		}

		message.send(form);
	}
};
