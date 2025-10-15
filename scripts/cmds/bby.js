const axios = require('axios');
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby", "mikasa", "hi", "jan", "babu", "janu"],
    version: "6.9.1",
    author: "dipto",
    countDown: 0,
    role: 0,
    description: "Better than all sim simi bots 😎",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2]...\nOR remove [YourMessage]\nOR rm [YourMessage] - [indexNumber]\nOR msg [YourMessage]\nOR list\nOR all\nOR edit [YourMessage] - [NewMessage]"
    }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const link = `${await baseApiUrl()}/baby`;
    const input = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby 💋", "Hmm jaanu 😚", "Type help baby 💡", "Type !baby hi 💬"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        // === Remove Teach ===
        if (args[0] === 'remove') {
            const target = input.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${target}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, event.threadID, event.messageID);
        }

        // === Remove Specific Index ===
        if (args[0] === 'rm' && input.includes('-')) {
            const [msg, index] = input.replace("rm ", "").split(/\s*-\s*/);
            const res = (await axios.get(`${link}?remove=${msg}&index=${index}`)).data.message;
            return api.sendMessage(res, event.threadID, event.messageID);
        }

        // === List Teach Info ===
        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit);
                const teachers = await Promise.all(limited.map(async (item) => {
                    const id = Object.keys(item)[0];
                    const count = item[id];
                    const name = await usersData.getName(id).catch(() => id) || "Unknown";
                    return { name, count };
                }));
                teachers.sort((a, b) => b.count - a.count);
                const output = teachers.map((t, i) => `${i + 1}. ${t.name}: ${t.count}`).join('\n');
                return api.sendMessage(`👑 𝐓𝐄𝐀𝐂𝐇𝐄𝐑 𝐋𝐈𝐒𝐓\nTotal Teach: ${data.length}\n\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`📊 Total Teach = ${d.length || "API off"}\n💬 Total Responses = ${d.responseLength || "API off"}`, event.threadID, event.messageID);
            }
        }

        // === View specific message ===
        if (args[0] === 'msg') {
            const query = input.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${query}`)).data.data;
            return api.sendMessage(`📝 Message: ${query}\n💭 Reply: ${d}`, event.threadID, event.messageID);
        }

        // === Edit message ===
        if (args[0] === 'edit') {
            const [key, newMsg] = input.split(/\s*-\s*/);
            if (!newMsg) return api.sendMessage('❌ | Invalid format!\nUse: edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${newMsg}&senderID=${uid}`)).data.message;
            return api.sendMessage(`✅ Changed Successfully: ${dA}`, event.threadID, event.messageID);
        }

        // === Teach normal ===
        if (args[0] === 'teach' && args[1] !== 'react' && args[1] !== 'amar') {
            [comd, command] = input.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (!command) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✅ Added Successfully!\n👩‍🏫 Teacher: ${teacher}\n📚 Teaches: ${re.data.teachs}\n🗨️ ${tex}`, event.threadID, event.messageID);
        }

        // === Teach react ===
        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = input.split(/\s*-\s*/);
            final = comd.replace("teach react ", "");
            if (!command) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Reaction Added: ${tex}`, event.threadID, event.messageID);
        }

        // === Teach intro ===
        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = input.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (!command) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Intro Added: ${tex}`, event.threadID, event.messageID);
        }

        // === “amar name ki” ===
        if (input.includes('amar name ki') || input.includes('amr name ki') || input.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        // === Default Chat ===
        const d = (await axios.get(`${link}?text=${encodeURIComponent(input)}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("⚠️ Check console for error.", event.threadID, event.messageID);
    }
};

// === Auto Reply Section ===
module.exports.onReply = async ({ api, event }) => {
    try {
        if (event.type === "message_reply") {
            const res = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(res, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

// === Chat Trigger Section (Aliases also work here) ===
module.exports.onChat = async ({ api, event, message }) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        const triggers = ["baby", "bby", "mikasa", "hi", "jan", "babu", "janu", "bot"];

        if (triggers.some(word => body.startsWith(word))) {
            const arr = body.replace(/^\S+\s*/, "");
            const randomReplies = ["৩৩ তারিখ আমার বিয়ে 🐤", "আম গাছে আম নাই, ঢিল কেন মারো? তোমার সাথে কথা নাই বেবি কেনো ডাকো 😾", "Tarpor bolo ", "besto achi, 2 minute por ashtesi janu..rag koiro na"];

            if (!arr) {
                await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    if (!info) message.reply("info object not found");
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: module.exports.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID);
                return;
            }

            const res = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(res, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: module.exports.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};
