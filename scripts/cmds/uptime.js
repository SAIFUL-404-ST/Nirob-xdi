const os = require("os");
const fs = require("fs-extra");
const axios = require("axios");

const startTime = new Date();

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up"],
    author: "SAIF",
    countDown: 0,
    role: 0,
    category: "system",
    longDescription: {
      en: "Get System Information",
    },
  },

  onStart: async function ({ api, event, args, threadsData, usersData }) {
    try {
      const uptimeInSeconds = (new Date() - startTime) / 1000;
      const days = Math.floor(uptimeInSeconds / (3600 * 24));
      const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
      const secondsLeft = Math.floor(uptimeInSeconds % 60);
      const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${secondsLeft}s`;

      const cpuUsage = os.cpus().reduce((acc, curr) => acc + curr.times.user, 0) / os.cpus().length;
      const totalMemoryGB = os.totalmem() / 1024 ** 3;
      const freeMemoryGB = os.freemem() / 1024 ** 3;
      const usedMemoryGB = totalMemoryGB - freeMemoryGB;

      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const currentDate = new Date();
      const date = currentDate.toLocaleDateString("en-US");
      const time = currentDate.toLocaleTimeString("en-US", {
        timeZone: "Asia/dhaka",
        hour12: true,
      });

      const timeStart = Date.now();
      await api.sendMessage("🔎 Checking system info...", event.threadID);
      const ping = Date.now() - timeStart;

      let pingStatus = "⛔ Bad System";
      if (ping < 1000) pingStatus = "✅ Smooth System";

      const systemInfo = `♡   ∩_∩
（„• ֊ •„)♡
╭─∪∪────────────⟡
│ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
├───────────────⟡
│ ⏰ Runtime: ${uptimeFormatted}
│ OS: ${os.type()} ${os.arch()}
│ CPU: ${os.cpus()[0].model}
│ Storage: ${usedMemoryGB.toFixed(2)} GB / ${totalMemoryGB.toFixed(2)} GB
│ CPU Usage: ${cpuUsage.toFixed(1)}%
│ RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB
├───────────────⟡
│ 📆 Date: ${date}
│ ⏱️ Time: ${time}
│ 👥 Users: ${allUsers.length}
│ 🧵 Threads: ${allThreads.length}
│ 📡 Ping: ${ping}ms
│ Status: ${pingStatus}
╰───────────────⟡`;

      // Media from catbox (video)
      let attachment = null;
      const mediaUrl = "https://files.catbox.moe/ggr1ui.mp4";

      if (mediaUrl.endsWith(".jpg") || mediaUrl.endsWith(".png") || mediaUrl.endsWith(".mp4")) {
        const response = await axios.get(mediaUrl, { responseType: "stream" });
        attachment = response.data;
      }

      api.sendMessage(
        {
          body: systemInfo,
          attachment,
        },
        event.threadID,
      );
    } catch (error) {
      console.error("System info error:", error);
      api.sendMessage("⚠️ Could not retrieve system information.", event.threadID);
    }
  },
};
