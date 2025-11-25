module.exports = {
	config: {
		name: "beauty",
		version: "1.0",
		author: "Samir",
		role: 0,
		category: "𝗙𝗨𝗡𝗡𝗬",
		guide: {
			vi: "Just For Fun",
			en: "Calculate Your Beautiness"
		} 
	},

	onStart: async function ({ api, event }) {
      const data = ["You are 1% beautiful🫠", "You are 2% beautiful🫠", "You are 3% beautiful🫠", "You are 4% beautiful🫠", "You are 5% beautiful🫠", "You are 6% beautiful🫠", "You are 7% beautiful🫠", "You are 8% beautiful🫠", "You are 9% beautiful🫠", "You are 10% beautiful🫠", "You are 11% beautiful🫠", "You are 12% beautiful🫠", "You are 13% beautiful🫠", "You are 14% beautiful🫠", "You are 15% beautiful🫠", "You are 16% beautiful🫠", "You are 17% beautiful🫠", "You are 18% beautiful🫠", "You are 19% beautiful🫠", "You are 20% beautiful🫠", "You are 21% beautiful🫠", "You are 22% beautiful🫠", "You are 23% beautiful🫠", "You are 24% beautiful🫠", "You are 25% beautiful🫠", "You are 26% beautiful🫠", "You are 27% beautiful🫠", "You are 28% beautiful🫠", "You are 29% beautiful🫠", "You are 30% beautiful🫠", "You are 31% beautiful🫠", "You are 32% beautiful🫠", "You are 33% beautiful🫠", "You are 34% beautiful🫠", "You are 35% beautiful🫠", "You are 36% beautiful🫠", "You are 37% beautiful🫠", "You are 38% beautiful🫠", "You are 39% beautiful🫠", "You are 40% beautiful🫠", "You are 41% beautiful🫠", "You are 42% beautiful🫠", "You are 43% beautiful🫠", "You are 44% beautiful🫠", "You are 45% beautiful🫠", "You are 46% beautiful🫠", "You are 47% beautiful🫠", "You are 48% beautiful🫠", "You are 49% beautiful🫠", "You are 50% beautiful🫠", "You are 51% beautiful🫠", "You are 52% beautiful🫠", "You are 53% beautiful🫠", "You are 54% beautiful🫠", "You are 55% beautiful🫠", "You are 56% beautiful🫠", "You are 57% beautiful🫠", "You are 58% beautiful🫠", "You are 59% beautiful🫠", "You are 60% beautiful🫠", "You are 61% beautiful🫠", "You are 62% beautiful🫠", "You are 63% beautiful🫠", "You are 64% beautiful🫠", "You are 65% beautiful🫠", "You are 66% beautiful🫠", "You are 67% beautiful🫠", "You are 68% beautiful🫠", "You are 69% beautiful🫠", "You are 70% beautiful🫠", "You are 71% beautiful🫠", "You are 72% beautiful🫠", "You are 73% beautiful🫠", "You are 74% beautiful🫠", "You are 75% beautiful🫠", "You are 76% beautiful🫠", "You are 77% beautiful🫠", "You are 78% beautiful🫠", "You are 79% beautiful🫠", "You are 80% beautiful🫠", "You are 81% beautiful🫠", "You are 82% beautiful🫠", "You are 83% beautiful🫠", "You are 84% beautiful🫠", "You are 85% beautiful🫠", "You are 86% beautiful🫠", "You are 87% beautiful🫠", "You are 88% beautiful🫠", "You are 89% beautiful🫠", "You are 90% beautiful🫠", "You are 91% beautiful🫠", "You are 92% beautiful🫠", "You are 93% beautiful🫠", "You are 94% beautiful🫠", "You are 95% beautiful🫠", "You are 96% beautiful🫠", "You are 97% beautiful🫠", "You are 98% beautiful🫠", "You are 99% beautiful🫠", "Oh Oh O My God 😲 Cuteness Overload... My System Is Gonna To Crash Out 🤯 !!", 
  ];
  return api.sendMessage(`${data[Math.floor(Math.random() * data.length)]}`, event.threadID, event.messageID);
	}
};