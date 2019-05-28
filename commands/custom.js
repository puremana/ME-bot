var functions = require("../functions.js");
var customCommands = require('./../storage/custom.json');
const PREFIX = functions.setEnv(process.env.PREFIX, "$");
const LEADERSHIPID = process.env.LEADERSHIP_ID;

module.exports = {
    add: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            if (args.length < 3) {
                functions.reply(message, "Please enter the command in the format `" + PREFIX + "add command_name command description`.");
                return;
            }
            var desc = "";
            for (d = 2; d < args.length; d++) {
                desc = desc + args[d] + " ";
            }
            var command = "\'" + args[1].toLowerCase() + "': '" + desc + "',";
            customCommands[args[1].toLowerCase()] = desc;
            functions.saveJson('custom', customCommands);
            functions.reply(message, "Command " + PREFIX + args[1] + " added.");
        }
        else {
            functions.reply(message, "You do not have the Leadership role.");
        }
    },
    remove: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            if (args.length == 2) {
                for (c in customCommands) {
                    if (args[1].toLowerCase() == c) {
                        delete customCommands[c];
                        functions.saveJson('custom', customCommands);
                        functions.reply(message, "Command " + PREFIX + args[1] + " removed.");
                        return;
                    }
                }
                functions.reply(message, "There is no " + PREFIX + args[1] + " command.");
            }
            else {
                functions.reply(message, "Please enter the command in the format `" + PREFIX + "remove command_name`.");
                return;
            }
        }
        else {
            functions.reply(message, "You do not have the Leadership role.");
        }
    }
}