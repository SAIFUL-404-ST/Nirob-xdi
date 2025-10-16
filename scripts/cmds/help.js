const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "Saif",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View all commands in bot" },
    longDescription: { en: "View all commands and usage info" },
    category: "info",
    guide: { en: "{p}help <command>" },
    priority: 1
  },

  onStart: async function({ message, args, event, threadsData, role }) {
    const prefix = getPrefix(event.threadID);

    // Helper: small bold caps letters
    const smallBold = (text) => {
      const map = {
        "0":"𝟎","1":"𝟏","2":"𝟐","3":"𝟑","4":"𝟒","5":"𝟓","6":"𝟔","7":"𝟕","8":"𝟖","9":"𝟗",
        "a":"𝐀","b":"𝐁","c":"𝐂","d":"𝐃","e":"𝐄","f":"𝐅","g":"𝐆","h":"𝐇","i":"𝐈","j":"𝐉","k":"𝐊","l":"𝐋","m":"𝐌",
        "n":"𝐍","o":"𝐎","p":"𝐏","q":"𝐐","r":"𝐑","s":"𝐒","t":"𝐓","u":"𝐔","v":"𝐕","w":"𝐖","x":"𝐗","y":"𝐘","z":"𝐙",
        " ":" ","/":"/","_":"_"
      };
      return text.toLowerCase().split("").map(c => map[c] || c).join("");
    };

    if (!args[0]) {
      // List all commands
      const categories = {};
      for (const [name, cmd] of commands) {
        if (cmd.config.role > 1 && role < cmd.config.role) continue;
        const cat = cmd.config.category || "OTHERS";
        categories[cat] = categories[cat] || [];
        categories[cat].push(name);
      }

      let msg = `📜 ${smallBold("AVAILABLE COMMANDS IN BOT")}\n\n`;

      for (const cat of Object.keys(categories)) {
        msg += `| ${smallBold(cat)} |\n| ▪️\n`;
        const cmds = categories[cat].sort();
        for (let i = 0; i < cmds.length; i += 3) {
          const line = cmds.slice(i, i + 3).map(c => `▪️ ${smallBold(c)}`).join(" ");
          msg += `| ${line}\n`;
        }
        msg += `\n`;
      }

      // Footer
      msg += `⚒️ ${smallBold("TOTAL COMMANDS")}: ${smallBold(commands.size.toString())}\n`;
      msg += `🛸 ${smallBold("PREFIX")}: ${smallBold(prefix)}\n`;
      msg += `👑 ${smallBold("OWNER")}: ${smallBold("𝐌𝐢𝐤𝐚𝐬𝐚 𝐁𝐚𝐛𝐲 🎀")}\n`;

      return message.reply(msg.trim());
    } else {
      // Single command info
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) return message.reply(`Command "${commandName}" not found.`);

      const cfg = command.config;
      const author = cfg.author || "Unknown";
      const description = cfg.longDescription?.en || "No description available.";
      const guide = (cfg.guide?.en || "No guide available.").replace(/{p}/g, prefix).replace(/{n}/g, cfg.name);

      const response = `
╭───⊙ ${smallBold(cfg.name.toUpperCase())} ⊙───╮
│ Description: ${description}
│ Author: ${author}
│ Guide: ${guide}
│ Version: ${cfg.version || "1.0"}
╰─────────────────────────╯
      `.trim();

      return message.reply(response);
    }
  }
};
