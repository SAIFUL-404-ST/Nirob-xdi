module.exports = {
 config: {
 name: "connect4",
 aliases: ["4inarow", "c4"],
 version: "2.2",
 author: "Chitron Bhattacharjee",
 countDown: 30,
 role: 0,
 category: "game",
 shortDescription: {
 en: "🟡🔴 4-in-a-Row with PvE/PvP modes"
 },
 longDescription: {
 en: "Classic connection game with visual board and smart AI"
 },
 guide: {
 en: "PvE: connect4 [bet]\nPvP: connect4 [bet] @player"
 }
 },

 onStart: async function ({ api, event, args, usersData, message }) {
 const minBet = 100;
 const betAmount = parseInt(args[0]);
 const mentioned = Object.keys(event.mentions);

 // Validate input
 if (!betAmount || isNaN(betAmount)) {
 return message.reply(`🌀 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗕𝗲𝘁\n━━━━━━━━━━━━\n❌ Please specify bet amount\n💸 Minimum: ${minBet} coins\n\n🔹 Usage: connect4 [bet] @player`);
 }
 if (betAmount < minBet) {
 return message.reply(`⚠️ 𝗠𝗶𝗻𝗶𝗺𝘂𝗺 𝗕𝗲𝘁\n━━━━━━━━━━━━\n💰 You need to bet at least ${minBet} coins!`);
 }

 const player1 = event.senderID;
 let gameType, player2;

 if (mentioned.length === 0) {
 // PvE Mode
 gameType = "pve";
 player2 = "bot";
 } else if (mentioned.length === 1) {
 // PvP Mode
 gameType = "pvp";
 player2 = mentioned[0];
 
 if (player1 === player2) {
 return message.reply("❌ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗢𝗽𝗽𝗼𝗻𝗲𝗻𝘁\n━━━━━━━━━━━━\nYou can't play against yourself!");
 }
 } else {
 return message.reply("⚠️ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗜𝗻𝗽𝘂𝘁\n━━━━━━━━━━━━\n🔹 PvE: connect4 [bet]\n🔹 PvP: connect4 [bet] @player");
 }

 // Check balances
 const [player1Data, player2Data] = await Promise.all([
 usersData.get(player1),
 gameType === "pvp" ? usersData.get(player2) : Promise.resolve({ money: Infinity })
 ]);

 if (player1Data.money < betAmount) {
 return message.reply(`💸 𝗜𝗻𝘀𝘂𝗳𝗳𝗶𝗰𝗶𝗲𝗻𝘁 𝗙𝘂𝗻𝗱𝘀\n━━━━━━━━━━━━\n❌ You only have ${player1Data.money} coins\n💰 Needed: ${betAmount} coins`);
 }
 if (gameType === "pvp" && player2Data.money < betAmount) {
 return message.reply(`💸 𝗢𝗽𝗽𝗼𝗻𝗲𝗻𝘁'𝘀 𝗙𝘂𝗻𝗱𝘀\n━━━━━━━━━━━━\n❌ Opponent needs ${betAmount} coins to play`);
 }

 // Deduct coins
 await usersData.set(player1, {
 money: player1Data.money - betAmount
 });
 if (gameType === "pvp") {
 await usersData.set(player2, {
 money: player2Data.money - betAmount
 });
 }

 // Initialize game
 const board = Array(6).fill().map(() => Array(6).fill(0)); // 6x6 grid
 const gameState = {
 players: [player1, player2],
 currentPlayer: 0,
 board,
 betAmount,
 gameType,
 messageID: null
 };

 const displayText = gameType === "pve" 
 ? `🤖 𝗣𝗹𝗮𝘆𝗲𝗿 𝘃𝘀 𝗕𝗼𝘁\n💰 Bet: ${betAmount} coins`
 : `👥 𝗣𝗹𝗮𝘆𝗲𝗿 𝘃𝘀 𝗣𝗹𝗮𝘆𝗲𝗿\n💰 Pot: ${betAmount * 2} coins`;

 const msg = await message.reply(
 `🎮 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝟰 🎮\n━━━━━━━━━━━━\n${displayText}\n\n${this.getBoardDisplay(board)}\n\n` +
 `🔹 Current Turn: ${await this.getPlayerName(api, player1)}\n` +
 "💬 Reply with column (1-6) to play!"
 );

 gameState.messageID = msg.messageID;
 global.connect4Games = global.connect4Games || {};
 global.connect4Games[msg.messageID] = gameState;
 },

 onChat: async function ({ api, event, message, usersData }) {
 if (!global.connect4Games) return;

 const gameEntry = Object.entries(global.connect4Games).find(([_, game]) => 
 game.players[game.currentPlayer] === event.senderID && 
 /^[1-6]$/.test(event.body)
 );

 if (!gameEntry) return;

 const [messageID, game] = gameEntry;
 const column = parseInt(event.body) - 1; // Convert to 0-5 index

 // Human player move
 const row = this.makeMove(game.board, column, game.currentPlayer + 1);
 if (row === -1) {
 return message.reply("⚠️ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗠𝗼𝘃𝗲\n━━━━━━━━━━━━\n❌ Column is full!\n🔹 Choose another (1-6)");
 }

 // Check for win
 if (this.checkWin(game.board, row, column)) {
 const winner = game.players[game.currentPlayer];
 const winnings = game.betAmount * (game.gameType === "pvp" ? 2 : 1.5);
 
 await usersData.set(winner, {
 money: (await usersData.get(winner)).money + winnings
 });

 const resultText = winner === "bot" 
 ? "🤖 𝗕𝗼𝘁 𝗪𝗶𝗻𝘀!\n━━━━━━━━━━━━\n❌ Better luck next time!"
 : `🎉 𝗩𝗶𝗰𝘁𝗼𝗿𝘆!\n━━━━━━━━━━━━\n💰 ${await this.getPlayerName(api, winner)} wins ${winnings} coins!`;

 message.reply(
 `🎯 𝗚𝗮𝗺𝗲 𝗢𝘃𝗲𝗿 🎯\n━━━━━━━━━━━━\n${resultText}\n\n${this.getBoardDisplay(game.board)}`
 );
 delete global.connect4Games[messageID];
 return;
 }

 // Check for draw
 if (this.isBoardFull(game.board)) {
 const refund = game.betAmount;
 await usersData.set(game.players[0], {
 money: (await usersData.get(game.players[0])).money + refund
 });
 if (game.gameType === "pvp") {
 await usersData.set(game.players[1], {
 money: (await usersData.get(game.players[1])).money + refund
 });
 }

 message.reply(
 "🤝 𝗗𝗿𝗮𝘄!\n━━━━━━━━━━━━\n💰 Both players get their coins back\n\n" +
 this.getBoardDisplay(game.board)
 );
 delete global.connect4Games[messageID];
 return;
 }

 // Switch turns
 game.currentPlayer = 1 - game.currentPlayer;

 // Bot move in PvE
 if (game.gameType === "pve" && game.currentPlayer === 1) {
 const botColumn = this.getBotMove(game.board);
 const botRow = this.makeMove(game.board, botColumn, 2);
 
 if (this.checkWin(game.board, botRow, botColumn)) {
 message.reply(
 `🎯 𝗚𝗮𝗺𝗲 𝗢𝘃𝗲𝗿 🎯\n━━━━━━━━━━━━\n🤖 𝗕𝗼𝘁 𝗪𝗶𝗻𝘀!\n\n${this.getBoardDisplay(game.board)}`
 );
 delete global.connect4Games[messageID];
 return;
 }

 game.currentPlayer = 0; // Switch back to player
 }

 // Update game board
 await message.reply(
 `🎮 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 𝟰 🎮\n━━━━━━━━━━━━\n` +
 `${game.gameType === "pve" ? "🤖 PvE" : "👥 PvP"} | 💰 Pot: ${game.betAmount * 2} coins\n\n` +
 `${this.getBoardDisplay(game.board)}\n\n` +
 `🔹 Current Turn: ${await this.getPlayerName(api, game.players[game.currentPlayer])}\n` +
 "💬 Reply with column (1-6)"
 );
 api.unsendMessage(messageID);
 },

 // Helper Methods
 makeMove: function(board, col, player) {
 if (col < 0 || col > 5 || board[0][col] !== 0) return -1;
 
 for (let row = 5; row >= 0; row--) {
 if (board[row][col] === 0) {
 board[row][col] = player;
 return row;
 }
 }
 return -1;
 },

 getBotMove: function(board) {
 // Try to win
 for (let col = 0; col < 6; col++) {
 const testBoard = JSON.parse(JSON.stringify(board));
 const row = this.makeMove(testBoard, col, 2);
 if (row !== -1 && this.checkWin(testBoard, row, col)) {
 return col;
 }
 }
 
 // Block player
 for (let col = 0; col < 6; col++) {
 const testBoard = JSON.parse(JSON.stringify(board));
 const row = this.makeMove(testBoard, col, 1);
 if (row !== -1 && this.checkWin(testBoard, row, col)) {
 return col;
 }
 }

 // Center preference
 if (board[5][3] === 0) return 3;
 
 // Random valid move
 const validColumns = [];
 for (let col = 0; col < 6; col++) {
 if (board[0][col] === 0) validColumns.push(col);
 }
 return validColumns[Math.floor(Math.random() * validColumns.length)];
 },

 checkWin: function(board, row, col) {
 const player = board[row][col];
 const directions = [
 [0, 1], [1, 0], [1, 1], [1, -1]
 ];

 return directions.some(([dx, dy]) => {
 let count = 1;
 
 // Check in positive direction
 for (let i = 1; i < 4; i++) {
 const r = row + i * dx;
 const c = col + i * dy;
 if (r < 0 || r >= 6 || c < 0 || c >= 6 || board[r][c] !== player) break;
 count++;
 }
 
 // Check in negative direction
 for (let i = 1; i < 4; i++) {
 const r = row - i * dx;
 const c = col - i * dy;
 if (r < 0 || r >= 6 || c < 0 || c >= 6 || board[r][c] !== player) break;
 count++;
 }
 
 return count >= 4;
 });
 },

 isBoardFull: function(board) {
 return board[0].every(cell => cell !== 0);
 },

 getBoardDisplay: function(board) {
 const symbols = ['⬜', '🔴', '🟡']; // Empty, Player1, Player2/Bot
 let display = '1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣\n'; // Column indicators
 
 for (const row of board) {
 display += row.map(cell => symbols[cell]).join('') + '\n';
 }
 
 return display;
 },

 getPlayerName: async function(api, userID) {
 try {
 if (userID === "bot") return "🤖 Bot";
 const userInfo = await api.getUserInfo(userID);
 return userInfo[userID].name || `Player ${userID}`;
 } catch {
 return `Player ${userID}`;
 }
 }
};
