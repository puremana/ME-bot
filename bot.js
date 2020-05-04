console.log("Bot loading...");
const dotenv = require('dotenv').config();
const Discord = require("discord.js");
var bot = new Discord.Client();
var customCommands = require('./storage/custom.json');
var commands = require('./commands.js');
var functions = require('./functions.js');
var schedule = require('node-schedule');
var variables = require('./variables.js');

const PREFIX = functions.setEnv(process.env.PREFIX, "$");
const questionRegex = /^[PREFIX]+$/;
const TOKEN = process.env.BOT_TOKEN;
const TIMEOUT = functions.setEnv(process.env.TIMEOUT, 1500);
const SERVER_ID = process.env.SERVER_ID;
const BINGO = functions.setEnv(process.env.FUN_COMMANDS.toLowerCase(), "true");
const BINGO_ROLE_NAME = functions.setEnv(process.env.BINGO_ROLE_NAME, "bingo");
const WEEKLIES_ROLE_NAME = functions.setEnv(process.env.WEEKLIES_ROLE_NAME, "weeklies");
const LEADERSHIPID = process.env.LEADERSHIP_ID;
const WEEKLIES = functions.setEnv(process.env.WEEKLIES.toLowerCase(), 'false');
const BINGO_CHANNEL_ID = process.env.BINGO_CHANNEL_ID;


//Load Bot - loop through functions in commands and add to hashmap
variables.setters["setBot"](bot);

var hashArray = [];
for (com in commands.functions) {
    hashArray.push(com);
}

if (BINGO === 'true') {
    // Scheduler for bingo
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0,6];
    rule.hour = [1,5,9,13,17,21];
    rule.minute = 50;
    //set to utc
    rule.tz = 'America/Indiana/Indianapolis';

    var bingoFunction = schedule.scheduleJob(rule, function(){
        var bingoRole = bot.guilds.find(name => name.id === SERVER_ID).roles.find(role => role.name === BINGO_ROLE_NAME);
        bot.guilds.find(name => name.id === SERVER_ID).channels.find(name => name.id === BINGO_CHANNEL_ID).send("<@&" + bingoRole.id + "> 10 Minutes till Bingo! :tada:");
    });

    variables.setters["setBingoFunction"](bingoFunction);

    //scheduler for bingo
    var extraRule = new schedule.RecurrenceRule();
    extraRule.dayOfWeek = [0,6];
    extraRule.hour = [2,6,10,14,18,22];
    extraRule.minute = 8;
    //set to utc
    extraRule.tz = 'America/Indiana/Indianapolis';

    var extraBingoFunction = schedule.scheduleJob(extraRule, function(){
        var bingoRole = bot.guilds.find(name => name.id === SERVER_ID).roles.find(role => role.name === BINGO_ROLE_NAME);
        bot.guilds.find(name => name.id === SERVER_ID).channels.find(name => name.id === BINGO_CHANNEL_ID).send("<@&" + bingoRole.id + "> remember to dab! :dab:");
    });
}

if (WEEKLIES === 'true') {
    // Scheduler for Weeklies
    var weekliesRule = new schedule.RecurrenceRule();
    weekliesRule.dayOfWeek = [2];
    weekliesRule.hour = [2];
    weekliesRule.minute = 0;
    // Set to Seattle Timezone
    weekliesRule.tz = 'America/Dawson';

    var weekliesFunction = schedule.scheduleJob(weekliesRule, function(){
        var weekliesRole = bot.guilds.find(name => name.id === SERVER_ID).roles.find(role => role.name === WEEKLIES_ROLE_NAME);
        bot.guilds.find(name => name.id === SERVER_ID).channels.find("name", "parties").send("<@&" + weekliesRole.id + "> Weekly Parties are out! :tada:");
    });

    variables.setters["setWeekliesFunction"](weekliesFunction);

    // Scheduler for After Weeklies
    var afterWeekliesRule = new schedule.RecurrenceRule();
    afterWeekliesRule.dayOfWeek = [3];
    afterWeekliesRule.hour = [14];
    afterWeekliesRule.minute = 0;
    // Set to Seattle Timezone
    afterWeekliesRule.tz = 'America/Dawson';

    var afterWeekliesFunction = schedule.scheduleJob(afterWeekliesRule, function(){
        var empireRole = bot.guilds.find(name => name.id === SERVER_ID).roles.find(role => role.id === LEADERSHIPID);
        bot.guilds.find(name => name.id === SERVER_ID).channels.find("name", "parties").send("<@&" + empireRole.id + "> 36 hours since weekly parties have been released.");
    });
}

bot.on("ready", function() {
	console.log("Bot ready...");
	bot.user.setActivity(PREFIX + "help " + PREFIX + "info")
    bot.user.setAvatar("./storage/avatar.png")
        .catch(err => console.log("Avatar changing too fast error."));
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
                message.content = trimMultipleSpaces(message.content);
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
                .then(m => {
                    m.delete(TIMEOUT * 10)
                        .catch(err => {});
                })
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
        message.delete(TIMEOUT)
            .catch(err => {});
    }
}

function trimMultipleSpaces(content) {
    return content.replace(/\s\s+/g, ' ');
}
