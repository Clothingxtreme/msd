const TelegramBot = require('node-telegram-bot-api');
const DATABASE = require("./database.json");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const bot = new TelegramBot(DATABASE.telegramBotToken, {});

function sendMessageToChat(chat_id, message, reply_markup = null) {
    try {
        bot.sendMessage(chat_id, message, { parse_mode: "html", disable_web_page_preview: true, reply_markup });
    } catch (error) {
        console.error(error);
    }
}

async function initTG() {
    //
}

module.exports = { initTG, sendMessageToChat }