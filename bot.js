console.log("Bot loading...");
const Discord = require("discord.js");
var bot = new Discord.Client();
var config = require('./storage/config.json');
var customCommands = require('./storage/custom.json');
var commands = require('./commands.js')
var schedule = require('node-schedule-tz');
const PREFIX = "$";
const questionRegex = /^[$]+$/;
const TOKEN = config.token;
const TIMEOUT = 1500;
const serverID = "208543018385539072";

//Load Bot - loop through functions in commands and add to hashmap
var hashArray = [];
for (com in commands.functions) {
    hashArray.push(com);
}
commands.setters["setBot"](bot);

//scheduler for bingo
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0,6];
rule.hour = [1,5,9,13,17,21];
rule.minute = 50;
//set to utc
rule.tz = 'America/Indiana/Indianapolis';

var bingoFunction = schedule.scheduleJob(rule, function(){
    var bingoRole = bot.guilds.find("id", serverID).roles.find("name", "Bingo!!");
    bot.guilds.find("id", serverID).channels.find("name", "me-general").send("<@&" + bingoRole.id + "> 10 Minutes till Bingo! :tada:");
});

// Scheduler for Weeklies
var weekliesRule = new schedule.RecurrenceRule();
weekliesRule.dayOfWeek = [2];
weekliesRule.hour = [12];
weekliesRule.minute = 0;
// Set to Seattle Timezone
weekliesRule.tz = 'America/Dawsons';

var weekliesFunction = schedule.scheduleJob(weekliesRule, function(){
    var weekliesRole = bot.guilds.find("id", serverID).roles.find("name", "Weeklies");
    bot.guilds.find("id", serverID).channels.find("name", "parties").send("<@&" + weekliesRole.id + "> Weekly Parties are out! :tada:");
});

commands.setters["setWeekliesFunction"](weekliesFunction);

// Scheduler for After Weeklies
var afterWeekliesRule = new schedule.RecurrenceRule();
afterWeekliesRule.dayOfWeek = [3];
afterWeekliesRule.hour = [0];
afterWeekliesRule.minute = 0;
// Set to Seattle Timezone
afterWeekliesRule.tz = 'America/Dawsons';

var afterWeekliesFunction = schedule.scheduleJob(afterWeekliesRule, function(){
    var empireRole = bot.guilds.find("id", serverID).roles.find("name", "Empire Leadership");
    bot.guilds.find("id", serverID).channels.find("name", "parties").send("<@&" + empireRole.id + "> 36 hours since weekly parties have been released.");
});

bot.on("ready", function() {
	console.log("Bot ready...");
	bot.user.setGame(PREFIX + "help " + PREFIX + "info")
    bot.user.setAvatar("./storage/avatar.png")
});

bot.on("error", console.error)

try {
    bot.on("message", function(message) {
        if (message.author.equals(bot.user)) {
            return;
        }

        if (!message.content.startsWith(PREFIX)) {
            return;
        }

        if (questionRegex.test(message.content)) {
            return;
        }

        var args = message.content.substring(PREFIX.length).split(" ");
        //Hashmap stuff
        if (hashArray.indexOf(args[0].toLowerCase()) > -1) {
            try {
                commands.functions[args[0].toLowerCase()](message);
            } catch (err) {
                console.log(err)
            }
        }
        else {
            if (customCommands.hasOwnProperty(args[0].toLowerCase())) {
                message.channel.send(customCommands[args[0].toLowerCase()]);
                deleteMessage(message);
                return;
            }
            message.channel.send("Invalid command, type **" + PREFIX + "help** to get current list of commands")
                .then(m => m.delete(TIMEOUT * 10))
                .catch(err => console.log(err));
        }
        deleteMessage(message);
    });
} catch (err) {
    console.log(err)
}
       
bot.login(TOKEN);

var deleteMessage = function(message) {
    if (message.channel.type != "dm") {
        try {
            message.delete(TIMEOUT);
        } catch (err) {
            console.log(err)
        }
    }
}
