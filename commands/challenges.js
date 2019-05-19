var functions = require("../functions.js");
const CHALLENGECHANNELID = process.env.CHALLENGE_CHANNEL_ID;

exports.functions = {
    bronze: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            functions.reply(message, "http://i.imgur.com/POra9Kx.jpg");
        }
    },
    silver: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            functions.reply(message, "http://i.imgur.com/rkJ51fC.jpg");
        }
    },
    gold: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            functions.reply(message, "http://i.imgur.com/5GXghiA.jpg");
        }
    },
}