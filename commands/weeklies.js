var functions = require("../functions.js");
var variables = require('../variables.js');
const PREFIX = functions.setEnv(process.env.PREFIX, "$");
const WEEKLIES_ROLE_NAME = functions.setEnv(process.env.WEEKLIES_ROLE_NAME, "weeklies");
const WEEKLIES = functions.setEnv(process.env.WEEKLIES.toLowerCase(), "false");
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

module.exports = {
    weekliesadd: function(message) {
        //check we're in a text channel
        if (message.channel.type == "dm") {
            return;
        }
        //check doesn't already have weeklies role
        if (message.member.roles.find(role => role.name === WEEKLIES_ROLE_NAME)) {
            functions.reply(message, "You already have the weeklies role. Use `" + PREFIX + "weekliesremove` to remove it.")
            return;
        }
        //add the role
        let weekliesRole = message.member.guild.roles.find(role => role.name === WEEKLIES_ROLE_NAME);
        functions.reply(message, "Your weeklies role has been added.")
        message.member.addRole(weekliesRole, "Command issued.");
    },
    weekliesremove: function(message) {
        //check we're in dm channel
        if (message.channel.type == "dm") {
            return;
        }
        //check they have the bingo role
        if (message.member.roles.find(role => role.name === WEEKLIES_ROLE_NAME)) {
            //remove the role
            let weekliesRole = message.member.guild.roles.find(role => role.name === WEEKLIES_ROLE_NAME);
            functions.reply(message, "Your weeklies role has been removed.")
            message.member.removeRole(weekliesRole, "Command issued.");
        }
        else {
            functions.reply(message, "You don't have the weeklies role. Use `" + PREFIX + "weekliesadd` to get it.")
        }
    },
    weeklieswhen: function(message) {
        if (message.author === null) {
            return;
        }

        if (WEEKLIES === 'false') {
            return;
        }

        let weekliesFunction = variables.functions["getWeekliesFunction"]();
        let weekliesDate = weekliesFunction.nextInvocation().getTime();
        // Adjusting for the 10 minutes before bingo that the bot sends the notifcation message
        weekliesDate = weekliesDate + 600000;
        let now = Date.now();
        let diff = weekliesDate - now;

        var msec = diff;
        var days = Math.floor(msec / 1000 / 60 / 60 / 24);
        msec -= days * 1000 * 60 * 60 * 24;
        var hours = Math.floor(msec / 1000 / 60 / 60);
        msec -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(msec / 1000 / 60);
        msec -= minutes * 1000 * 60;
        var seconds = Math.floor(msec / 1000);
        msec -= seconds * 1000;

        let stringDiff = "The weekly parties will reset in ";
        
        if (days > 0) {
            stringDiff = stringDiff + days + " days, ";
        }
        if (hours > 0) {
            stringDiff = stringDiff + hours + " hours, ";
        }

        stringDiff = stringDiff + minutes + " minutes, and " + seconds + " seconds";

        functions.reply(message, stringDiff);
    }
}