var functions = require("../functions.js");
var variables = require('../variables.js');
const PREFIX = functions.setEnv(process.env.PREFIX, "$");
const BINGO_ROLE_NAME = functions.setEnv(process.env.BINGO_ROLE_NAME, "bingo");

module.exports = {
    bingoadd: function(message) {
        //check doesn't already have bingo role
        if (message.member.roles.find(role => role.name === BINGO_ROLE_NAME)) {
            functions.reply(message, "You already have the bingo role. Use `" + PREFIX + "bingoremove` to remove it.")
            return;
        }
        //add the role
        let bingoRole = message.member.guild.roles.find(role => role.name === BINGO_ROLE_NAME);
        message.member.addRole(bingoRole, "Command issued.");
        functions.reply(message, "Your bingo role has been added.")
    },
    bingoremove: function(message) {
        //check they have the bingo role
        if (message.member.roles.find(role => role.name === BINGO_ROLE_NAME)) {
            //remove the role
            let bingoRole = message.member.guild.roles.find(role => role.name === BINGO_ROLE_NAME);
            message.member.removeRole(bingoRole, "Command issued.");
            functions.reply(message, "Your bingo role has been removed.")
        }
        else {
            functions.reply(message, "You don't have the bingo role. Use `" + PREFIX + "bingoadd` to get it.")
        }
    },
    bingowhen: function(message) {
        if (message.author == null) {
            return;
        }

        let bingoFunction = variables.functions["getBingoFunction"]();
        let bingoDate = bingoFunction.nextInvocation().getTime();
        // Adjusting for the 10 minutes before bingo that the bot sends the notifcation message
        bingoDate = bingoDate + 600000;
        let now = Date.now();
        let diff = bingoDate - now;

        var msec = diff;
        var days = Math.floor(msec / 1000 / 60 / 60 / 24);
        msec -= days * 1000 * 60 * 60 * 24;
        var hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(msec / 1000 / 60);
        msec -= minutes * 1000 * 60;
        var seconds = Math.floor(msec / 1000);
        msec -= seconds * 1000;

        let stringDiff = "The next bingo will be in ";
        
        if (days > 0) {
            stringDiff = stringDiff + days + " days, ";
        }
        if (hours > 0) {
            stringDiff = stringDiff + hours + " hours, ";
        }

        stringDiff = stringDiff + minutes + " minutes, and " + seconds + " seconds";

        functions.reply(message, stringDiff);
    },
}