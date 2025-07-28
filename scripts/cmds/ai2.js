const axios = require('axios');
const gtts = require('gtts');
const path = require('path');
const fs = require('fs');

const Prefixes = [
	'llama',
	'Llama',
	'',
];

module.exports = {
	config: {
		name: 'ai2',
		version: '2.5',
		author: 'SAIF',
		role: 0,
		category: '𝗔𝗜-𝗖𝗛𝗔𝗧',
		shortDescription: {
			en: 'Asks an AI for an answer.',
		},
		longDescription: {
			en: 'Asks an AI for an answer based on the user prompt.',
		},
		guide: {
			en: '{pn} [your question]',
		},
	},

	onStart: async function () {},

	onChat: async function ({ api, event, message }) {
		try {
			const prefix = Prefixes.find(p =>
				event.body && event.body.toLowerCase().startsWith(p.toLowerCase())
			);

			if (!prefix) return;

			const prompt = event.body.substring(prefix.length).trim();
			if (!prompt) return message.reply("❗ Please provide a question or query.");

			await message.reply("⏳ | Answering your question...");

			const res = await axios.get(`https://api.easy-api.online/api/llama?p=${encodeURIComponent(prompt)}`);
			if (res.status !== 200 || !res.data || !res.data.content) {
				throw new Error('❌ Invalid or missing response from API.');
			}

			const replyText = res.data.content.trim();
			const phTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });

			await message.reply({
				body:
`🤖 𝗟𝗹𝗮𝗺𝗮: ${replyText}

📎 𝗗𝗲𝘃: https://www.facebook.com/profile.php?id=61578771147998
🕒 𝗣𝗵𝗶𝗹𝗶𝗽𝗽𝗶𝗻𝗲 𝗧𝗶𝗺𝗲: ${phTime}`
			});

			// Prepare voice
			const cachePath = path.join(__dirname, 'cache');
			if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
			const audioPath = path.join(cachePath, `voice-${event.threadID}.mp3`);

			const tts = new gtts(replyText, 'en');
			tts.save(audioPath, () => {
				api.sendMessage({
					body: "🔊 Voice Answer:",
					attachment: fs.createReadStream(audioPath)
				}, event.threadID, () => fs.unlinkSync(audioPath)); // Delete after sending
			});

		} catch (err) {
			console.error("AI2 Error:", err.message);
			api.sendMessage(
				`❌ ${err.message}\nPlease try again or wait a few moments. The server may be busy or down.`,
				event.threadID
			);
		}
	},
};
