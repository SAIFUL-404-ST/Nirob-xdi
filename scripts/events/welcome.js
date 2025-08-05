const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "1.7",
		author: "SAIF",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			welcomeMessage: "Cảm ơn bạn đã mời tôi vào nhóm!\nPrefix bot: %1\nĐể xem danh sách lệnh hãy nhập: %1help",
			multiple1: "bạn",
			multiple2: "các bạn",
			defaultWelcomeMessage: "Xin chào {userName}.\nChào mừng bạn đến với {boxName}.\nChúc bạn có buổi {session} vui vẻ!"
		},
		en: {
			session1: "𝑴𝒐𝒓𝑵𝒊𝒏𝑮",
			session2: "𝑵𝒐𝒐𝑵",
			session3: "𝑨𝒇𝒕𝒆𝑹𝒏𝒐𝒐𝑵",
			session4: "𝑬𝒗𝒆𝑵𝒊𝒏𝑮",
			session5: "𝑵𝒊𝒈𝑯𝒕",
			welcomeMessage: `𝐀𝐒𝐀𝐋𝐀𝐌𝐔𝐖𝐀𝐋𝐈𝐊𝐔𝐌 ꨄ︎\n	 `
				+ `\n ♻ 𝑻𝒉𝑬 𝑩𝒐𝑻 𝑯𝒂𝑺 𝑩𝒆𝒆𝑵 𝑪𝒐𝒏𝒏𝑬𝒄𝒕𝒆𝑫 𝑻𝒐 𝑻𝒉𝑬 𝑮𝒓𝒐𝑼𝒑 ⚜`
				+ `\n ⚜🔹𝑩𝒐𝑻 𝑷𝒓𝒆𝑭𝒊𝒙🔹: %1`
				+ `\n __________________________`
				+ `\n ~𝑶𝒘𝑵𝒆𝒓🔹:https://www.facebook.com/profile.php?id=100081317798618`
				+ `\n __________________________`
				+ `\n 💠|❇ 𝑻𝒐 𝑽𝒊𝒆𝑾 𝑪𝒐𝒎𝒎𝑨𝒎𝒅𝑺 𝑷𝒍𝒆𝑨𝒔𝑬 𝑬𝒏𝒕𝑬𝒓: %1help`,
			multiple1: "𝑻𝒐 𝑻𝒉𝑬",
			multiple2: "𝑻𝒐 𝑶𝒖𝑹",
			defaultWelcomeMessage: `𝐀𝐒𝐀𝐋𝐀𝐌𝐔𝐖𝐀𝐋𝐈𝐊𝐔𝐌ꨄ︎\n 	 \n~🦋 𝐇𝐄𝐋𝐋𝐎 ❀ {userName}.\n~😽𝐖𝐄𝐋𝐂𝐎𝐌𝐄 {multiple} 𝑪𝒉𝒂𝑻 𝑮𝒓𝒐𝑼𝒑:{boxName} \n~💫𝑾𝒊𝒔𝑯𝒊𝒏𝑮 𝑾𝒆 𝑨 𝑳𝒐𝒗𝑬𝒍𝒀 {session} 😜`
		}
	},

	onStart: async ({ threadsData, message, event, api, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);
				const dataAddedParticipants = event.logMessageData.addedParticipants;
				// if new member is bot
				if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
					if (nickNameBot)
						api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
					return message.send(getLang("welcomeMessage", prefix));
				}
				// if new member:
				if (!global.temp.welcomeEvent[threadID])
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};

				// push new member to array
				global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
				// if timeout is set, clear it
				clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

				// set new timeout
				global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
					const threadData = await threadsData.get(threadID);
					if (threadData.settings.sendWelcomeMessage == false)
						return;
					const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
					const dataBanned = threadData.data.banned_ban || [];
					const threadName = threadData.threadName;
					const userName = [],
						mentions = [];
					let multiple = false;

					if (dataAddedParticipants.length > 1)
						multiple = true;

					for (const user of dataAddedParticipants) {
						if (dataBanned.some((item) => item.id == user.userFbId))
							continue;
						userName.push(user.fullName);
						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}
					// {userName}:   name of new member
					// {multiple}:
					// {boxName}:    name of group
					// {threadName}: name of group
					// {session}:    session of day
					if (userName.length == 0) return;
					let { welcomeMessage = getLang("defaultWelcomeMessage") } =
						threadData.data;
					const form = {
						mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
					};
					welcomeMessage = welcomeMessage
						.replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
						.replace(/\{boxName\}|\{threadName\}/g, threadName)
						.replace(
							/\{multiple\}/g,
							multiple ? getLang("multiple2") : getLang("multiple1")
						)
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
						const attachments = files.reduce((acc, file) => {
							acc.push(drive.getFile(file, "stream"));
							return acc;
						}, []);
						form.attachment = (await Promise.allSettled(attachments))
							.filter(({ status }) => status == "fulfilled")
							.map(({ value }) => value);
					}
					message.send(form);
					delete global.temp.welcomeEvent[threadID];
				}, 1500);
			};
	}
};
