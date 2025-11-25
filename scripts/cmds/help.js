const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.20",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Display the list of available commands or details about a specific command.",
    },
    longDescription: {
      en: "Shows all available commands categorized or gives detailed usage info for one.",
    },
    category: "Utility",
    guide: {
      en: "{pn} [command name]",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // 🧩 You can manually put your Facebook link here
    const adminFacebook = "https://www.facebook.com/muhammed.saiful.islam873645485 "; // <––– Add your Facebook link inside the quotes later

    if (!args || args.length === 0) {
      const categories = {};
      let msg = "";

      msg += "╭───✦ 𝐇𝐄𝐋𝐏 𝐌𝐄𝐍𝐔 ✦───╮\n";
      msg += `│ Current Prefix: ${prefix}\n`;
      msg += "╰────────────────────╯\n\n";

      // Sort and categorize commands
      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      // Build the message
      for (const categoryName of Object.keys(categories).sort()) {
        if (categoryName === "info") continue;
        const cmds = categories[categoryName].sort();
        msg += `╭─  ${categoryName.toUpperCase()}  ─╮\n`;
        for (let i = 0; i < cmds.length; i += 3) {
          const row = cmds.slice(i, i + 3).map(x => `⭔ ${x}`).join("   ");
          msg += `│ ${row}\n`;
        }
        msg += "╰────────────────────╯\n\n";
      }

      const totalCommands = commands.size || 0;
      msg += "╭─────✰[ ENJOY ]\n";
      msg += `│ Total Commands: [${totalCommands}]\n`;
      msg += `│ Use: ${prefix}help [command]\n`;
      msg += "╰────────────✰\n\n";

      msg += "╭─────✰\n";
      msg += `│ Admin Facebook: ${adminFacebook || "Not provided"}\n`;
      msg += "│ Author: Saif\n";
      msg += "╰────────────✰";

      return message.reply(msg);
    }

    // ─── Specific command info ───
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!command)
      return message.reply(`⚠️ Command "${commandName}" not found.`);

    const c = command.config;
    const desc = c.longDescription?.en || "No description available.";
    const guide = c.guide?.en
      ? c.guide.en.replace(/{pn}/g, `${prefix}${c.name}`)
      : "No guide provided.";
    const roleText = convertRole(c.role);

    const response = [
      "╭───✦ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐈𝐍𝐅𝐎 ✦───╮",
      `│ Name: ${c.name}`,
      "├── INFO",
      `│ Description: ${desc}`,
      `│ Author: ${c.author || "Unknown"}`,
      `│ Guide: ${guide}`,
      "├── DETAILS",
      `│ Version: ${c.version || "1.0"}`,
      `│ Role: ${roleText}`,
      "╰────────────✦",
      `\nAdmin Facebook: ${adminFacebook || "Not provided"}`
    ].join("\n");

    return message.reply(response);
  },
};

function convertRole(role) {
  switch (role) {
    case 0: return "0 (All Users)";
    case 1: return "1 (Group Admins)";
    case 2: return "2 (Bot Admins)";
    default: return "Unknown";
  }
}
