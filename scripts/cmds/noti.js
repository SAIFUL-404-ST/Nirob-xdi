const { getStreamsFromAttachment } = global.utils;

// ======================
// FIXED ADMIN REPLY THREAD
// ======================
const ADMIN_THREAD_ID = "23869391286001160"; // Your admin group/thread
if (!global.noticeReplyMap) global.noticeReplyMap = {};

module.exports = {
    config: {
        name: "noti",
        aliases: ["notify", "n2"],
        version: "8.0",
        author: "Saif",
        countDown: 0,
        role: 2,
        shortDescription: "Anime-style unlimited 2-way Notification System",
        longDescription: "Send notification to all groups + replies forward to admin + admin can reply back",
        category: "owner",
        guide: "{pn} <message>"
    },

    // ======================
    // SEND NOTIFICATION TO ALL GROUPS
    // ======================
    onStart: async function({ message, api, event, args }) {
        if (!args.length) return message.reply("⚠️ Baka~ You forgot to write the notification!");

        const senderName = (await api.getUserInfo([event.senderID]))[event.senderID].name || "Admin";
        const text = args.join(" ");

        // Anime-style notice
        const notice =
`✨ ┏━━━━━━━━━━━━━━┓ ✨
🎀 『 Notification from ${senderName} 』 senpai~ 🎀
━━━━━━━━━━━━━━
${text}
━━━━━━━━━━━━━━
💌 Reply this message to contact ${senderName} senpai~`;

        // Attachments
        let att = [];
        try {
            att = await getStreamsFromAttachment([
                ...(event.attachments || []),
                ...(event.messageReply?.attachments || [])
            ]);
        } catch {}

        const form = { body: notice, attachment: att };

        // Send to all groups
        const threads = await api.getThreadList(1000, null, ["INBOX"]);
        const groups = threads.filter(t => t.isGroup);
        let count = 0;

        for (let g of groups) {
            try {
                const sentMsg = await api.sendMessage(form, g.threadID);
                count++;
                // Map all replies from any group → fixed admin thread
                global.noticeReplyMap[sentMsg.messageID] = { threadID: g.threadID, threadName: g.name };
            } catch (e) {}
        }

        await api.sendMessage(`✅ Notification sent to ${count} groups! senpai~`, event.threadID);
    },

    // ======================
    // HANDLE REPLIES FROM ANY GROUP
    // ======================
    onChat: async function({ event, api }) {
        const { threadID, messageReply, body, attachments, senderID } = event;
        if (!messageReply) return;
        if (!messageReply.body?.includes("Notification from")) return;

        // Forward all replies to ADMIN_THREAD_ID
        const threadInfo = await api.getThreadInfo(threadID);
        const senderInfo = await api.getUserInfo([senderID]);

        const forward =
`📨 *New Reply From Group* senpai~ 
🆔 Group Name: ${threadInfo.name}
👤 From: ${senderInfo[senderID].name || senderID}
━━━━━━━━━━━━━━
${body || "(media file)"} nya~`;

        let att = [];
        try { att = await getStreamsFromAttachment(attachments || []); } catch {}

        const fwdMsg = await api.sendMessage({ body: forward, attachment: att }, ADMIN_THREAD_ID);
        // Map fwdMsgID → original group
        global.noticeReplyMap[fwdMsg.messageID] = threadID;
    },

    // ======================
    // ADMIN REPLY BACK TO ORIGINAL GROUP
    // ======================
    onReply: async function({ event, api }) {
        const replyID = event.messageReply?.messageID;
        if (!replyID) return;

        const originalGroup = global.noticeReplyMap[replyID];
        if (!originalGroup) return;

        let att = [];
        try { att = await getStreamsFromAttachment(event.attachments || []); } catch {}

        await api.sendMessage({
            body: `📬 *Reply From Admin senpai~*:\n${event.body || "(media file)"} nya~`,
            attachment: att
        }, originalGroup);
    }
};
