var functions = require("../functions.js");

module.exports = {
    guide: function(message) {
        functions.reply(message, "https://tinyurl.com/IOUguide");
    },
    multicalc: function(message) {
        functions.reply(message, "https://docs.google.com/spreadsheets/d/1QGBm6KtcOZraqSkLWVuqTF16vUD7rrOvIpdh59bFLmg/edit#gid=357923173");
    },
    forum: function(message) {
        functions.reply(message, "http://iourpg.com/forum");
    },
    wiki: function(message) {
        functions.reply(message, "http://iourpg.wikia.com/wiki/Idle_Online_Universe_Wiki");
    },
    cards: function(message) {
        functions.reply(message, "http://iouhelper.com/cards.html");
    },
    test: function(message) {
        functions.reply(message, "https://discord.gg/ncEarFv");
    },
    trello: function(message) {
        functions.reply(message, "https://trello.com/b/usVhG9Ry/iou-development-board");
    },
}