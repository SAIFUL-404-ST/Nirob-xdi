const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.5",
		author: "Modified by Mim x ChatGPT",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			leaveType1: "tự rời",
			leaveType2: "bị kick",
			defaultLeaveMessage: "{userName} đã {type} khỏi nhóm"
		},
		en: {
			session1: "সকাল",
			session2: "দুপুর",
			session3: "বিকেল",
			session4: "রাত",
			leaveType1: "নিজে চলে গেছে",
			leaveType2: "কে কিক দেওয়া হয়েছে",
			defaultLeaveMessage:
`📤 {userName} {type} ❗

🔔 সময় ছিল {time}টা — শুভ {session}।

💬 গ্রুপ: {threadName}

😮‍💨 কেউ গেলে গ্রুপ থেমে যায় না,
🫡 আবার নতুন কেউ আসে...
		
🥀 বিদায় {userName}, 
⚠️ গ্রুপে থাকার মতো মন-মানসিকতা ছিল না বোধহয়!`
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage)
					return;
				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID())
					return;

				const hours = getTime("HH");
				const threadName = threadData.threadName;
				const userName = await usersData.getName(leftParticipantFbId);

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;
				const form = {
					mentions: leaveMessage.includes("{userNameTag}") ? [{
						tag: userName,
						id: leftParticipantFbId
					}] : null
				};

				leaveMessage = leaveMessage
					.replace(/\{userName\}|\{userNameTag\}/g, userName)
					.replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
					.replace(/\{threadName\}|\{boxName\}/g, threadName)
					.replace(/\{time\}/g, hours)
					.replace(/\{session\}/g, hours <= 10 ?
						getLang("session1") :
						hours <= 12 ?
							getLang("session2") :
							hours <= 18 ?
								getLang("session3") :
								getLang("session4")
					);

				form.body = leaveMessage;

				if (threadData.data.leaveAttachment) {
					const files = threadData.data.leaveAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}

				message.send(form);
			};
	}
};
