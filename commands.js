const dotenv = require('dotenv').config();
const Discord = require("discord.js");
var fs = require("fs");
var child_process = require('child_process');
var customCommands = require('./storage/custom.json');
var votes = require('./storage/votes.json');
var pushes = require('./storage/pushes.json');

const PREFIX = setEnv(process.env.PREFIX, "$");
const SERVER_ID = process.env.SERVER_ID;
const LEADERSHIPID = process.env.LEADERSHIP_ID;
const FUNCHANNELID = process.env.FUN_CHANNEL_ID;
const PUSH_LOG_ID = process.env.PUSH_LOG_CHANNEL_ID;
const PUSHTIMEOUT = setEnv(process.env.PUSH_TIMEOUT, 15000);
const FUNCOMMANDS = setEnv(process.env.FUN_COMMANDS.toLowerCase(), "true");
const BINGO_ROLE_NAME = setEnv(process.env.BINGO_ROLE_NAME, "bingo");
const WEEKLIES_ROLE_NAME = setEnv(process.env.WEEKLIES_ROLE_NAME, "weeklies");
const AHK_INVITER = setEnv(process.env.AHK_INVITER.toLowerCase(), "false");

const PUSHINSTRUCTIONS = "Request a guild invite by using the `" + PREFIX + "signup AccountName` command.\nUse `" + PREFIX + "queuejoin AccountName` to join the queue.\n Use `" + PREFIX + "in Accountname` when you are in the front of the queue and `" + PREFIX + "out AccountName` when you are done pushing.";
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var bot;
var bingoFunction;
var weekliesFunction;

exports.setters = {
    setBot: function(theBot) {
        bot = theBot;
    },
    setBingoFunction: function(theBingoFunction) {
        bingoFunction = theBingoFunction;
    },
    setWeekliesFunction: function(theWeekliesFunction) {
        weekliesFunction = theWeekliesFunction;
    }
}

exports.functions = {
    ...require('./commands/challenges'),
    ...require('./commands/events'),
    ...require('./commands/info')
}

exports.functions = {    
    add: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            if (args.length < 3) {
                reply(message, "Please enter the command in the format `" + PREFIX + "add command_name command description`.");
                return;
            }
            var desc = "";
            for (d = 2; d < args.length; d++) {
                desc = desc + args[d] + " ";
            }
            var command = "\'" + args[1].toLowerCase() + "': '" + desc + "',";
            customCommands[args[1].toLowerCase()] = desc;
            saveJson('custom', customCommands);
            reply(message, "Command " + PREFIX + args[1] + " added.");
        }
        else {
            reply(message, "You do not have the Leadership role.");
        }
    },
    remove: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            if (args.length == 2) {
                for (c in customCommands) {
                    if (args[1].toLowerCase() == c) {
                        delete customCommands[c];
                        saveJson('custom', customCommands);
                        reply(message, "Command " + PREFIX + args[1] + " removed.");
                        return;
                    }
                }
                reply(message, "There is no " + PREFIX + args[1] + " command.");
            }
            else {
                reply(message, "Please enter the command in the format `" + PREFIX + "remove command_name`.");
                return;
            }
        }
        else {
            reply(message, "You do not have the Leadership role.");
        }
    },
    echo: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            var text = message.content.substring(PREFIX.length + 5);
            reply(message, text);
            if (message.channel.type != "dm") {
                try {
                    message.delete(0);
                } catch (err) {
                    console.log(err)
                }
            }
        }
        else {
            reply(message, "You do not have the Leadership role.");
        }
    },

    //Voting
    votenew: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //if there is already a poll with this name
        for (v in votes) {
            if (v == rawSplit[1]) {
                reply(message, "There is already a poll with the name **" + rawSplit[1] + "**. Please `" + PREFIX + "voteclose` it before recreating.");
                return;
            }
        }
        //if the poll options isn't an int
        if (isNaN(rawSplit[3])) {
            reply(message, "Please make sure the second argument (number of votes) is a number before creating the poll.");
            return;
        }
        //create a new poll with those options
        var voteOptions = [];
        for (i = 5; i < (rawSplit.length - 1); i++) {
            if (rawSplit[i] != " ") {
                voteOptions.push(rawSplit[i]);
                voteOptions.push([]);
            }
        }
        var vJson = {"author" : message.author.id, "numOptions" : rawSplit[3], "voteOptions" : voteOptions, "closed" : false};
        if (!verifyJson(vJson)) {
            reply(message, "Message could not be saved. Please try again.");
            return;
        }
        votes[rawSplit[1]] = vJson;
        saveJson('votes', votes);
        //display the new poll
        displayPoll(message, rawSplit[1]);
    },
    vote: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check how many votes you can do
                var numVotes = votes[v]["numOptions"];
                //check if this user has voted before x number of times
                var poll = votes[v]["voteOptions"];
                var count = 0;
                for (i = 1; i < poll.length; i = i + 2) {
                    for (j = 0; j < poll[i].length; j++) {
                        if (poll[i][j] == message.author.id) {
                            count++;
                        }
                    }
                }
                if (numVotes <= count) {
                    reply(message, ':negative_squared_cross_mark: Already voted, please use `' + PREFIX + 'votereset "poll name"` before trying again.');
                    return;
                }
                //check the poll isn't closed already
                if (votes[v]["closed"] == true) {
                    reply(message, ':negative_squared_cross_mark: This poll has been closed.');
                    return;
                }
                //check number of votes they are doing is less than what's in there
                var messageVotes = (rawSplit.count - 2) / 2;
                if ((messageVotes + count) > numVotes) {
                    reply(message, ':negative_squared_cross_mark: Trying to enter too many votes, please use `' + PREFIX + 'votereset "poll name"` before trying again.');
                    return;
                }
                //if they haven't put their vote or votes in 
                //if poll vote is not real
                var theVotes = [];
                for (var l = 3; l < rawSplit.length; l = l + 2) {
                    if (isNaN(rawSplit[l])) {
                        reply(message, ':negative_squared_cross_mark: Use digits to indicate what you are voting for. Please try again.');
                        return;
                    }
                    if (parseInt(rawSplit[l]) > (poll.length / 2)) {
                        reply(message, ':negative_squared_cross_mark: One or more of your votes are not in the poll. Please try again.');
                        return;
                    }
                    theVotes.push(rawSplit[l]);
                }
                //check not voting for same thing twice
                if ((new Set(theVotes)).size !== theVotes.length) {
                    reply(message, ':negative_squared_cross_mark: You cannot vote for the same option twice. Please try again.');
                    return;
                }
                //else put their vote in
                for (var j = 0; j < theVotes.length; j++) {
                    var num = parseInt(theVotes[j]) + parseInt(theVotes[j] - 1);
                    for (var o = 0; o < poll[num].length; o++) {
                        if (poll[num][o] == message.author.id) {
                            reply(message, ':negative_squared_cross_mark: You cannot vote for the same option twice. Please try again.');
                            return;
                        }
                    }
                    poll[num].push(message.author.id);
                }
                saveJson('votes', votes);
                if (theVotes.length == 1) {
                    reply(message, ':white_check_mark: Your vote has been registered.');
                }
                else {
                    reply(message, ':white_check_mark: Your votes have been registered.');
                }
                displayPoll(message, rawSplit[1]);
                return;
            }
        }
        reply(message, ":negative_squared_cross_mark: Couldn't find poll name " + rawSplit[1]);
        return;
    },
    votecheck: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                var arrayResult = [];
                var poll = votes[v]["voteOptions"];
                for (i = 1; i < poll.length; i = i + 2) {
                    for (j = 0; j < poll[i].length; j++) {
                        if (poll[i][j] == message.author.id) {
                            arrayResult.push((i + 1) / 2);
                        }
                    }
                }
                if (arrayResult.length > 0) {
                    reply(message, "Your current votes in poll **" + rawSplit[1] + "** are options " + arrayResult);
                }
                else {
                    reply(message, "You haven't voted in this poll yet.");
                }
                return;
            }
        }
        reply(message, "Couldn't find poll name " + rawSplit[1]);
        return;
    },
    votedisplay: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                displayPoll(message, rawSplit[1]);
                return;
            }
        }
        reply(message, "Couldn't find poll name " + rawSplit[1]);
        return;
    },
    voteclose: function (message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to close poll
                if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || message.member.id == vote[v]["author"]) {
                    //check the poll isn't already closed
                    if (votes[v]["closed"] == true) {
                        reply(message, "This poll has already been closed.");
                        return;
                    }
                    //close poll
                    votes[v]["closed"] = true;
                    reply(message, "Poll **" + rawSplit[1] + "** is now closed.");
                    saveJson('votes', votes);
                    return;
                }
                else {
                    reply(message, "You do not have permissions to close this poll.");
                    return;
                }
            }
        }
    },
    voteopen: function (message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to close poll
                if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || message.member.id == vote[v]["author"]) {
                    //check the poll isn't open
                    if (votes[v]["closed"] == false) {
                        reply(message, "This poll is already open.");
                        return;
                    }
                    //open poll
                    votes[v]["closed"] = false;
                    reply(message, "Poll **" + rawSplit[1] + "** has been reopened.");
                    saveJson('votes', votes);
                    return;
                }
                else {
                    reply(message, "You do not have permissions to open this poll.");
                    return;
                }
            }
        }
    },
    votedelete: function (message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to delete
                if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || message.member.id == vote[v]["author"]) {
                    //delete poll
                    delete votes[v];
                    reply(message, "Poll **" + rawSplit[1] + "** is now deleted.");
                    saveJson('votes', votes);
                    return;
                }
                else {
                    reply(message, "You do not have permissions to close this poll.");
                    return;
                }
            }
        }
    },
    votereset: function(message) {
        if (message.member == null) {
            reply(message, "Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) { 
                var poll = votes[v]["voteOptions"];
                //loop through and remove
                for (i = 1; i < poll.length; i = i + 2) {
                    var index = poll[i].indexOf(message.author.id);
                    if (index != -1) {
                        poll[i].splice(index, 1);
                    }
                }
                reply(message, "Your responses for poll **" + rawSplit[1] + "** have been reset.");
                saveJson('votes', votes);
            }
        }
    },

    //Useful Links
    guide: function(message) {
        reply(message, "https://tinyurl.com/IOUguide");
    },
    multicalc: function(message) {
        reply(message, "https://docs.google.com/spreadsheets/d/1QGBm6KtcOZraqSkLWVuqTF16vUD7rrOvIpdh59bFLmg/edit#gid=357923173");
    },
    forum: function(message) {
        reply(message, "http://iourpg.com/forum");
    },
    wiki: function(message) {
        reply(message, "http://iourpg.wikia.com/wiki/Idle_Online_Universe_Wiki");
    },
    cards: function(message) {
        reply(message, "http://iouhelper.com/cards.html");
    },
    test: function(message) {
        reply(message, "https://discord.gg/ncEarFv");
    },
    trello: function(message) {
        reply(message, "https://trello.com/b/usVhG9Ry/iou-development-board");
    },

    //bingo
    bingoadd: function(message) {
        //check doesn't already have bingo role
        if (message.member.roles.find(role => role.name === BINGO_ROLE_NAME)) {
            reply(message, "You already have the bingo role. Use `" + PREFIX + "bingoremove` to remove it.")
            return;
        }
        //add the role
        let bingoRole = message.member.guild.roles.find(role => role.name === BINGO_ROLE_NAME);
        message.member.addRole(bingoRole, "Command issued.");
        reply(message, "Your bingo role has been added.")
    },
    bingoremove: function(message) {
        //check they have the bingo role
        if (message.member.roles.find(role => role.name === BINGO_ROLE_NAME)) {
            //remove the role
            let bingoRole = message.member.guild.roles.find(role => role.name === BINGO_ROLE_NAME);
            message.member.removeRole(bingoRole, "Command issued.");
            reply(message, "Your bingo role has been removed.")
        }
        else {
            reply(message, "You don't have the bingo role. Use `" + PREFIX + "bingoadd` to get it.")
        }
    },
    bingowhen: function(message) {
        if (message.author == null) {
            return;
        }

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

        reply(stringDiff);
    },

    //weeklies
    weekliesadd: function(message) {
        //check we're in a text channel
        if (message.channel.type == "dm") {
            return;
        }
        //check doesn't already have weeklies role
        if (message.member.roles.find(role => role.name === WEEKLIES_ROLE_NAME)) {
            reply(message, "You already have the weeklies role. Use `" + PREFIX + "weekliesremove` to remove it.")
            return;
        }
        //add the role
        let weekliesRole = message.member.guild.roles.find(role => role.name === WEEKLIES_ROLE_NAME);
        reply(message, "Your weeklies role has been added.")
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
            reply(message, "Your weeklies role has been removed.")
            message.member.removeRole(weekliesRole, "Command issued.");
        }
        else {
            reply(message, "You don't have the weeklies role. Use `" + PREFIX + "weekliesadd` to get it.")
        }
    },
    weeklieswhen: function(message) {
        if (message.author != null) {
            let dayString = days[weekliesFunction.nextInvocation().getDay()];
            let monthString = monthNames[weekliesFunction.nextInvocation().getMonth()];
            let dateString = weekliesFunction.nextInvocation().getDate();
            let timeString = weekliesFunction.nextInvocation().toLocaleTimeString('en-US');
            message.author.send("Weeklies should arrive **" + dayString + ", " + monthString + " " + dateString + ", " + timeString + "** (America/Dawsons Standard Time)");
        }
    },

    //push
    pushsetup: function(message) {
        if (!(message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || (message.author.id == "146412379633221632"))) {
            pushReply(message, "You require the Leadership role to create a push.");
            return;
        }
        //creates default messages
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");

        //correct format
        if (rawSplit.length != 11 && rawSplit.length != 13) {
            pushReply(message, 'Please make use the command in the following format, `' + PREFIX + 'pushsetup "available slots" "push end date" "time limit" "leader role name" "push description" "*(optional)* inviter role name"`');
            return;
        }

        //number as argument
        if (isNaN(rawSplit[1])) {
            pushReply(message, "Please make sure the first argument (available slots) is a number before creating the poll.");
            return;
        }

        //number as argument
        if (isNaN(rawSplit[5])) {
            pushReply(message, "Please make sure the third argument (time per push) is a number (minutes) before creating the poll.");
            return;
        }

        //push has been created already
        for (p in pushes) {
            if (p == message.channel.id) {
                pushReply(message, "A push has already been created in this channel, please use `" + PREFIX + "pushdelete` to delete.");
                return;
            }
        }

        //send embed
        message.channel.send("Processing...")
        .then(m => {        
            //create push
            var pJson = {"messageid" : m.id, "channel name": message.channel.name, "author" : message.author.id, "slots" : rawSplit[1], "ending date" : rawSplit[3], "push time" : rawSplit[5], "leaders" : rawSplit[7], "description" : rawSplit[9], "inviter" : rawSplit[11], "invites" : [], "currently" : [], "queue" : [], "showcommands": true, "pushids" : [], "requeue" : true, "pushnames" : [], "alts": true};
            if (!verifyJson(pJson)) {
                pushReply(message, "Push could not be saved. Please try again.");
                return;
            }
            pushes[message.channel.id] = pJson;
            saveJson('pushes', pushes);

            //make embed
            var embed = createPushEmbed(message.channel.id);

            m.edit(embed);
            log("<@" + message.author.id + "> has created a new push in channel " + message.guild.channels.get(message.channel.id).toString());
        })
        .catch(err => console.log(err));

    },
    pushdelete: function(message) {
        if (!(message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || (message.author.id == "146412379633221632"))) {
            pushReply(message, "You require the Leadership role to delete a push.");
            return;
        }

        for (p in pushes) {
            if (p == message.channel.id) {
                deleteEmbed(message);

                delete pushes[p];
                reply(message, "Push deleted.");

                saveJson('pushes', pushes);
                log("<@" + message.author.id + "> has deleted a push in channel " + message.guild.channels.get(message.channel.id).toString());
                return;
            }
        }

        pushReply(message, "Could not find a push in this channel.");
    },
    signup: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        // If the push isn't allowing alt accounts
        if (pushes[message.channel.id].hasOwnProperty("pushids") && pushes[message.channel.id]["alts"] === false && pushes[message.channel.id]["pushids"].includes(message.author.id)) {
            pushReply(message, "This push is currently not accepting alt accounts.");
            return;
        }

        var text = message.content.substring(PREFIX.length + 7);

        // If the push isn't allowing re-queuing
        if (pushes[message.channel.id].hasOwnProperty("pushnames") && pushes[message.channel.id]["requeue"] === false && pushes[message.channel.id]["pushnames"].includes(text.toLowerCase())) {
            pushReply(message, "This push does not currently allow you to re-queue the same account.");
            return;
        }

        for (name in pushes[message.channel.id]["invites"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["invites"][name]["name"].toLowerCase()) {
                pushReply(message, "Username " + text + " is already on the invite list.");
                return;
            }
        }

        if (!text.replace(/\s/g, '').length) {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "signup AccountName`");
            return;
        }

        if (pushes[message.channel.id]["inviter"] != null) {
            // If set to use the bot
            if ((AHK_INVITER === 'true') && (pushes[message.channel.id]["inviter"] === "bot")) {
                fs.writeFile("storage/invites.txt", text, "utf8", (err) => {
                    if (err) {
                        console.log("There was an error saving the invites file. Error: "  + err);
                        pushReply(message, "There was an error saving invites file. Please contact the bot owner.");
                    }
                });  

                let exe = ".\\AutoHotkey.exe inviter.ahk";
                child_process.exec(exe, function (err, stdout, stderr){
                    if (err) {
                        console.log("child processes failed with error code: " +
                            err.code);
                    }
                    else {
                        pushReply(message, "The bot has now sent **" + text + "** an invite.");
                    }
                });
            }
            else {
                pushReply(message, "Username " + text + " has been added to the invite list."); 
                pushes[message.channel.id]["invites"].push({id : message.author.id, name : text});
                saveJson('pushes', pushes);
                rewriteEmbed(message);

                let inviterRole = bot.guilds.find(name => name.id === SERVER_ID).roles.find(role => role.name === pushes[message.channel.id]["inviter"]);
                if (inviterRole) {
                    pushReplyExtended(message, "<@&" + inviterRole.id + "> Username **" + text + "** would like an invite.");
                }
            }
        }
        else {
            pushReply(message, "Username " + text + " has been added to the invite list."); 
            pushes[message.channel.id]["invites"].push({id : message.author.id, name : text});
            saveJson('pushes', pushes);
            rewriteEmbed(message);
        }

        log("<@" + message.author.id + "> has signed up in with username **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    queue: function(message) {
        exports.functions.queuejoin(message, 6);
    },
    queuejoin: function(message, prefixText) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        // If the push isn't allowing alt accounts
        if (pushes[message.channel.id].hasOwnProperty("pushids") && pushes[message.channel.id]["alts"] === false && pushes[message.channel.id]["pushids"].includes(message.author.id)) {
            pushReply(message, "This push is currently not accepting alt accounts.");
            return;
        }

        var text;
        if (prefixText !== undefined) {
            text = message.content.substring(PREFIX.length + prefixText);
        }
        else {
            text = message.content.substring(PREFIX.length + 10);
        }

        // If no username, use member nickname
        if (!text.replace(/\s/g, '').length) {
            text = message.member.displayName;
        }

        // If the push isn't allowing re-queuing
        if (pushes[message.channel.id].hasOwnProperty("pushnames") && pushes[message.channel.id]["requeue"] === false && pushes[message.channel.id]["pushnames"].includes(text.toLowerCase())) {
            pushReply(message, "This push does not currently allow you to re-queue the same account.");
            return;
        }
        
        for (name in pushes[message.channel.id]["queue"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {
                pushReply(message, "Username " + text + " is already in the queue.");
                return;
            }
        }

        if (!text.replace(/\s/g, '').length) {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "queuejoin AccountName`");
            return;
        }

        pushes[message.channel.id]["queue"].push({id : message.author.id, name : text});
        saveJson('pushes', pushes);
        rewriteEmbed(message);

        pushReply(message, "Username " + text + " has been added to the queue.");
        log("<@" + message.author.id + "> has joined the queue with username **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());

        if (Object.keys(pushes[message.channel.id]["queue"]).length <= pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) {
            checkQueue(message);
        }
    },
    leave: function(message) {
        exports.functions.queueleave(message, 6);
    },
    queueleave: function(message, prefixText) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }
        
        var text;
        if (prefixText !== undefined) {
            text = message.content.substring(PREFIX.length + prefixText);
        }
        else {
            text = message.content.substring(PREFIX.length + 11);
        }

        // If no username, use member nickname
        if (!text.replace(/\s/g, '').length) {
            text = message.member.displayName;
        }

        for (name in pushes[message.channel.id]["queue"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {
                
                var userid = pushes[message.channel.id]["queue"][name]["id"];

                if (userid != message.author.id) {
                    pushReply(message, "Username **" + text + "** was added to the queue by a different Discord user. If you have the " + pushes[message.channel.id]["leaders"] + " role, please use `" + PREFIX + "queueremove AccountName`.");
                    return;
                }

                pushes[message.channel.id]["queue"].splice(name, 1);
                saveJson('pushes', pushes);

                rewriteEmbed(message);

                pushReply(message, "Username **" + text + "** has been removed from the queue.");
                log("<@" + message.author.id + "> has removed account username **" + text + "** from the queue in channel " + message.guild.channels.get(message.channel.id).toString());
                
                //if leaving has an effect on who can push
                if (name < pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) {
                    checkQueue(message);
                }
                
                return;
            }
        }
    },
    queueremove: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to remove other players from this push queue.");
            return;
        }

        var text = message.content.substring(PREFIX.length + 12);

        for (name in pushes[message.channel.id]["queue"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {

                pushes[message.channel.id]["queue"].splice(name, 1);
                saveJson('pushes', pushes);

                rewriteEmbed(message);

                pushReply(message, "Username **" + text + "** has been removed from the queue.");
                log("<@" + message.author.id + "> has removed account username **" + text + "** from the queue in channel " + message.guild.channels.get(message.channel.id).toString());
                
                //if leaving has an effect on who can push
                if (name < pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) {
                    checkQueue(message);
                }
                
                return;
            }
        }
    },
    sent: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.");
            return;
        }

        var text = message.content.substring(PREFIX.length + 5);

        for (name in pushes[message.channel.id]["invites"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["invites"][name]["name"].toLowerCase()) {
                
                var userid = pushes[message.channel.id]["invites"][name]["id"];

                pushes[message.channel.id]["invites"].splice(name, 1);
                saveJson('pushes', pushes);

                rewriteEmbed(message);

                pushReplyExtended(message, "Username **" + text + "** has been sent an invite - <@" + userid + ">");

                let user = bot.users.find(user => user.id === userid);
                if (user) {
                    user.send("Username **" + text + "** has been sent an invite in " + message.guild.channels.get(message.channel.id).toString());
                }
                    
                log("<@" + message.author.id + "> has sent an invite to Discord username <@" + userid + "> , account username **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
                return;
            }
        }
        
        pushReply(message, "Could not find a username " + text + " in the invite list.");
    },
    senttop: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.");
            return;
        }

        var num = message.content.substring(PREFIX.length + 8);

        if (!num.replace(/\s/g, '').length) {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "senttop NumberOfPeopleToDelete`");
            return;
        }

        if (isNaN(num)) {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "senttop NumberOfPeopleToDelete`");
            return;
        }

        if (num > pushes[message.channel.id]["invites"].length) {
            num = pushes[message.channel.id]["invites"].length;
        }

        var tagText = "";
        for (i= 0; i < num; i++) {
            tagText += "Account name: **" + pushes[message.channel.id]["invites"][i]["name"] + "**, Discord account: <@" + pushes[message.channel.id]["invites"][i]["id"] + "> \n";
        }

        pushes[message.channel.id]["invites"].splice(0, num);
        saveJson('pushes', pushes);

        rewriteEmbed(message);

        pushReplyExtended(message, num + " usernames have been sent an invite. \n" + tagText);
        log("<@" + message.author.id + "> has invited **" + num + " players** \n" + tagText + "\nIn channel " + message.guild.channels.get(message.channel.id).toString());
    },
    updateslots: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.");
            return;
        }

        var num = message.content.substring(PREFIX.length + 12);

        if (isNaN(num)) {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "updateslots NumberOfSlots`");
            return;
        }

        //update slots
        pushes[message.channel.id]["slots"] = num;
        saveJson('pushes', pushes);

        rewriteEmbed(message);

        pushReply(message, "Available guild spots have been updated.");
        log("<@" + message.author.id + "> has updated slots to **" + num + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    showcommands: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.");
            return;
        }

        var answer = message.content.substring(PREFIX.length + 13);

        if (answer === 'yes' || answer === 'true') {
            pushes[message.channel.id]["showcommands"] = true;
            saveJson('pushes', pushes);
    
            rewriteEmbed(message);

            pushReply(message, "The push message should now show commands.");
        }
        else if (answer === 'no' || answer === 'false') {
            pushes[message.channel.id]["showcommands"] = false;
            saveJson('pushes', pushes);
    
            rewriteEmbed(message);

            pushReply(message, "The push message should now not show any commands.");
        }
        else {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "showcommands yes`");
            return;
        }

        log("<@" + message.author.id + "> has sent showcommands to **" + answer + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    in: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        var text = message.content.substring(PREFIX.length + 3);

        // If no username, use member nickname
        if (!text.replace(/\s/g, '').length) {
            text = message.member.displayName;
        }

        let letIn = false;
        let idIndex;

        // If queue and slots are empty, let them in
        if ((pushes[message.channel.id]["queue"].length === 0) && (pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length)) {
            letIn = true;
        }
        else {
            for (name in pushes[message.channel.id]["queue"]) {
                if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {
                    idIndex = name;
                    letIn = true;
                    break;
                }
            }
        }

        // If the push isn't allowing alt accounts
        if (pushes[message.channel.id].hasOwnProperty("pushids") && pushes[message.channel.id]["requeue"] === false && pushes[message.channel.id]["pushids"].includes(message.author.id)) {
            pushReply(message, "This push is currently not accepting alt accounts.");
            return;
        }

        // If the push isn't allowing re-queuing
        if (pushes[message.channel.id].hasOwnProperty("pushnames") && pushes[message.channel.id]["requeue"] === false && pushes[message.channel.id]["pushnames"].includes(text.toLowerCase())) {
            pushReply(message, "This push does not currently allow you to re-queue the same account.");
            return;
        }

        if (letIn) {
            //make sure it was same person who made
            if (pushes[message.channel.id]["queue"].length !== 0) {
                var userid = pushes[message.channel.id]["queue"][idIndex]["id"];

                if (userid != message.author.id) {
                    pushReply(message, "Username **" + text + "** was added to the queue by a different Discord user.");
                    return;
                }
            }
            

            // If it is the one who is ready
            if ((idIndex < pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) || pushes[message.channel.id]["queue"].length === 0) {
    
                // Add to current push list
                pushes[message.channel.id]["currently"].push({"id" : message.author.id, "name" : text});
                
                // Delete from queue
                pushes[message.channel.id]["queue"].splice(idIndex, 1);
                // If on invite list, delete
                for (person in pushes[message.channel.id]["invites"]) {
                    if (text.toLowerCase() === pushes[message.channel.id]["invites"][person]["name"].toLowerCase()) {
                        pushes[message.channel.id]["invites"].splice(person, 1);
                    }
                }

                // If push has a pushid queue, put them in
                if (pushes[message.channel.id].hasOwnProperty("pushids")) {
                    // Check the user ID isn't already in the push
                    if (!pushes[message.channel.id]["pushids"].includes(message.author.id)) {
                        pushes[message.channel.id]["pushids"].push(message.author.id);
                    }
                }

                // If push has an alts queue, put them in
                if (pushes[message.channel.id].hasOwnProperty("pushnames")) {
                    // Check the user name isn't already in the push
                    if (!pushes[message.channel.id]["pushnames"].includes(text.toLowerCase())) {
                        pushes[message.channel.id]["pushnames"].push(text.toLowerCase());
                    }
                }

                saveJson('pushes', pushes);
                rewriteEmbed(message);

                pushReply(message, "Account name **" + text + "** has entered the guild.");
                log("<@" + message.author.id + "> has entered the guild on account name **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
                
                if (pushes[message.channel.id]["push time"] != 0) {
                    setTimeout(function() {
                        pingMember(message, text);
                    }, pushes[message.channel.id]["push time"] * 60000);
                }
                
                return;
            } 
            else {
                pushReply(message, "Account name **" + text + "** is not at the top of the queue.");
                return;
            }
        }
        else {
            pushReply(message, "Could not find account name **" + text + "** in the queue.");
        }
    },
    out: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        var text = message.content.substring(PREFIX.length + 4);

        // If no username, use member nickname
        if (!text.replace(/\s/g, '').length) {
            text = message.member.displayName;
        }

        for (name in pushes[message.channel.id]["currently"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["currently"][name]["name"].toLowerCase()) {

                var userid = pushes[message.channel.id]["currently"][name]["id"];

                if (userid != message.author.id) {
                    pushReply(message, "Username **" + text + "** was added to the current push by a different Discord user.");
                    return;
                }
                    
                pushes[message.channel.id]["currently"].splice(name, 1);
                saveJson('pushes', pushes);
                rewriteEmbed(message);
        
                pushReply(message, "Account name **" + text + "** has exited the guild.");
                log("<@" + message.author.id + "> has exited the guild on account name **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
                
                checkQueue(message);
                return;
            }
        }
        pushReply(message, "Could not find account name **" + text + "** in the push.");
    },
    currentremove: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.");
            return;
        }

        var text = message.content.substring(PREFIX.length + 14);

        for (name in pushes[message.channel.id]["currently"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["currently"][name]["name"].toLowerCase()) {
                    
                pushes[message.channel.id]["currently"].splice(name, 1);
                saveJson('pushes', pushes);
                rewriteEmbed(message);
        
                pushReply(message, "Account name **" + text + "** has been removed from the guild.");
                log("<@" + message.author.id + "> has removed account name **" + text + "** from the guild in channel " + message.guild.channels.get(message.channel.id).toString());
                
                checkQueue(message);
                return;
            }
        }
        pushReply(message, "Could not find account name **" + text + "** in the push.");
    },
    createnewmessage: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.");
            return;
        }

        var id = message.channel.id;

        //send embed
        reply(message, "Processing...")
        .then(m => {
            message.channel.fetchMessage(pushes[id]["messageid"])
            .then(msg => {
                msg.delete();
            })
            .catch(console.error);
            pushes[id]["messageid"] = m.id;
            saveJson('pushes', pushes);

            //make embed
            var embed = createPushEmbed(id);

            m.edit(embed);
            log("<@" + message.author.id + "> has replaced/created a new message the push message in channel " + message.guild.channels.get(message.channel.id).toString());
        })
        .catch(err => console.log(err));
    },
    purge: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"]) || !message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to clear messages in this push.");
            return;
        }

        var text = parseInt(message.content.substring(PREFIX.length + 6), 10);

        if (!Number.isInteger(text)) {
            pushReply(message, "Please use this command in the following format `" + PREFIX + "purge NumberOfMessagesToDelete`");
            return;
        }

        if (text > 99) {
            pushReply(message, "Please delete less than 100 messages at a time.");
            return;
        }

        if (text < -1) {
            pushReply(message, "Please use values greater than 1.");
            return;
        }

        var msgsToDelete = [];

        message.channel.fetchMessages({limit: text + 1})
            .then(msgs => {
                let arr = msgs.array();
                for (let i = 1; i < arr.length; i++) {
                    if (arr[i].id == pushes[message.channel.id]["messageid"]) {
                        break;
                    }
                    msgsToDelete.push(arr[i]);
                }

                message.channel.bulkDelete(msgsToDelete);
            })
            .catch(err => console.log("Unknown message error (message was deleted before it could be deleted by purge)"));
    },
    move: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"]) || !message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            pushReply(message, "You require the " + pushes[message.channel.id]["leaders"] + " role to move players in this push.");
            return;
        }

        var rawSplit = message.content.split("\"");

        if (rawSplit.length != 3) {
            pushReply(message, 'Please use this command in the following format `' + PREFIX + 'move "account name" numberSpotInQueue`')
            return;
        }

        let user = rawSplit[1];
        let num = parseInt(rawSplit[2].replace(/\s\s+/g, ''), 10);

        if (!Number.isInteger(num)) {
            pushReply(message, 'Please use this command in the following format `' + PREFIX + 'move "account name" numberSpotInQueue`')
            return;
        }

        num--;
        let found = false;
        let arrayIndex = 0;

        for (name in pushes[message.channel.id]["queue"]) {
            if (user.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {
                arrayIndex = name;
                found = true;
                break;
            }
        }

        if (!found) {
            pushReply("Username " + user + " not found in the queue.");
        }

        arrayMove(pushes[message.channel.id]["queue"], arrayIndex, num);
        saveJson('pushes', pushes);

        rewriteEmbed(message);

        // If moving has an effect on who can push
        if ((num < pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) || (arrayIndex <= pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length)) {
            checkQueue(message);
        }
    },
    updateinviter: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!(message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || (message.author.id == "146412379633221632"))) {
            pushReply(message, "You require the Leadership role update the inviter role.");
            return;
        }

        let inviter = message.content.substring(PREFIX.length + 14);

        // Update inviter
        let past = pushes[message.channel.id]["inviter"];
        pushes[message.channel.id]["inviter"] = inviter;
        saveJson('pushes', pushes);

        pushReply(message, "Inviter role has been updated to **" + inviter + "**");
        log("<@" + message.author.id + "> has the inviter role from **" + past + "** to **" + inviter + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    togglealts: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!(message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || (message.author.id == "146412379633221632"))) {
            pushReply(message, "You require the Leadership role to toggle alt mode.");
            return;
        }

        // Check if this push has a pushid queue first
        if (!pushes[message.channel.id].hasOwnProperty("pushids")) {
            pushReply(message, "Guild push was created before the alt mode update. Please recreate the push to activate this feature");
            return;
        }

        if (pushes[message.channel.id].hasOwnProperty("alts") && pushes[message.channel.id]["alts"] === false) {
            pushes[message.channel.id]["alts"] = true;
            pushReply(message, "Alt mode has been toggled on. You will be able to queue alts.");
        } else {
            pushes[message.channel.id]["alts"] = false;
            pushReply(message, "Alt mode has been toggled off. You will not be able to use queue alts.");
        }
        saveJson('pushes', pushes);
        log("<@" + message.author.id + "> has toggled the alt mode to be " + pushes[message.channel.id]['alts'] + " in " + message.guild.channels.get(message.channel.id).toString());
    },
    togglerequeue: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            pushReply(message, "Could not find a push in this channel.");
            return;
        }

        if (!(message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || (message.author.id == "146412379633221632"))) {
            pushReply(message, "You require the Leadership role to toggle re-queue mode.");
            return;
        }

        // Check if this push has a pushid queue first
        if (!pushes[message.channel.id].hasOwnProperty("pushnames")) {
            pushReply(message, "Guild push was created before re-queue update. Please recreate the push to activate this feature");
            return;
        }

        if (pushes[message.channel.id].hasOwnProperty("requeue") && pushes[message.channel.id]["requeue"] === false) {
            pushes[message.channel.id]["requeue"] = true;
            pushReply(message, "Re-queue mode has been toggled on. You will be able to re-queue your account.");
        } else {
            pushes[message.channel.id]["requeue"] = false;
            pushReply(message, "Re-queue mode has been toggled off. You will not be able to re-queue your account.");
        }
        saveJson('pushes', pushes);
        log("<@" + message.author.id + "> has toggled the re-queue mode to be " + pushes[message.channel.id]['requeue'] + " in " + message.guild.channels.get(message.channel.id).toString());
    },

    //fun
    cat: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS === 'false')) {
            return;
        }
        Promise.all([httpRequest("http", "aws.random.cat", "/meow")]).then(values => { 
            catJson = JSON.parse(values[0]);
            reply(message, catJson.file);
        });
    },
    dog: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS === 'false')) {
            return;
        }
        Promise.all([httpRequest("https", "dog.ceo", "/api/breeds/image/random")]).then(values => { 
            dogJson = JSON.parse(values[0]);
            reply(message, dogJson.message);
        });
    },
    flip: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS == false)) {
            return;
        }
        var toss = (Math.floor(Math.random() * 2) == 0);
        if (toss) {
            reply(message, "Heads");
        } 
        else {
            reply(message, "Tails");
        }
    },
    ball: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS == false)) {
            return;
        }
        Promise.all([httpRequest("https", "8ball.delegator.com", "/magic/JSON/abc")]).then(values => { 
            ballJson = JSON.parse(values[0]);
            reply(message, ballJson.magic.answer);
        });
    }
}
var httpRequest = function (type, url, ranHost) {
    return new Promise((resolve, reject) => {
        var http = require(type);
    
        var options = {
            host: url,
            path: ranHost
        }
        var request = http.request(options, function (res) {
            var data = '';
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                resolve(data);
            });
        });
        request.on('error', function (e) {
            reject(e.message);
        });
        request.end();
    });
};
var displayPoll = function(message, nameOfPoll) {
    var poll = votes[nameOfPoll]["voteOptions"]; 
    var num = 1;
    var isClosed = "Open";
    if (votes[nameOfPoll]["closed"] == true) {
        isClosed = "Closed";
    }
    var textMessage = "**Poll - " + nameOfPoll + "** [" + isClosed + "]\n\n";
    for (i = 0; i < poll.length; i = i + 2) {
        textMessage = textMessage + "`[" + num + "] " + poll[i] + ": " + poll[i + 1].length + "`\n";
        num++;
    }
    reply(message, textMessage);
}
function verifyJson(json) {
    try {
        JSON.stringify(json);
    } catch (e) {
        return false;
    }
    return true;
}

function rewriteEmbed(message) {
    var id = message.channel.id;
    var embed = createPushEmbed(id);
    var msg = message.channel.fetchMessage(pushes[id]["messageid"])
        .then(m => {
            m.edit(embed);
        })
        .catch(console.error);
}
function deleteEmbed(message) {
    var id = message.channel.id;
    var msg = message.channel.fetchMessage(pushes[id]["messageid"])
        .then(m => {
            m.delete();
        })
        .catch(console.error);
}
function createPushEmbed(id) {
    var pInfo = pushes[id];
    var leaderCommands = '`' + PREFIX + 'sent AccountName` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'senttop NumberOfPeopleToDelete` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'queueremove AccountName` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'updateslots Number` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'currentremove AccountName` *(' + pushes[id]["leaders"] + ' only)* \n' + 
    '`' + PREFIX + 'showcommands yes/no` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'createnewmessage` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'purge NumberOfMessages` *(' + pushes[id]["leaders"] + ' only)* \n' +
    '`' + PREFIX + 'move "AccountName" NumberInQueue` *(' + pushes[id]["leaders"] + ' only)*';

    var commands = '`' + PREFIX + 'signup AccountName` \n' +
        '`' + PREFIX + 'queuejoin AccountName` \n' +
        '`' + PREFIX + 'queueleave AccountName` \n' +
        '`' + PREFIX + 'in AccountName` \n' +
        '`' + PREFIX + 'out AccountName`';

    var invites = "*none*";
    if (pushes[id]["invites"].length != 0) {
        invites = "";
        for (invite in pushes[id]["invites"]) {
            invites += pushes[id]["invites"][invite]["name"] + "\n";
        }
    }

    var currently = "*none*";
    if (Object.keys(pushes[id]["currently"]).length != 0) {
        currently = "";
        for (current in pushes[id]["currently"]) {
            currently += pushes[id]["currently"][current]["name"] + "\n";
        }
    }

    var aSlots = pInfo["slots"] - Object.keys(pushes[id]["currently"]).length;
    var sSlots = aSlots;

    var queue = "*none*";
    if (Object.keys(pushes[id]["queue"]).length != 0) {
        queue = "";
        for (member in pushes[id]["queue"]) {
            if (member < sSlots) {
                queue += pushes[id]["queue"][member]["name"] + " *(Ready for push!)*\n";
            } else {
                queue += pushes[id]["queue"][member]["name"] + "\n";
            }
            
        }
    }

    if (aSlots < 1) {
        sSlots = "Full (" + aSlots + ")";
    }

    var pushTime = pInfo["push time"] + " Minutes";
    if (pInfo["push time"] == 0) {
        pushTime = "Infinite";
    }

    if (pInfo["showcommands"]) {
        var embed = new Discord.RichEmbed()
        .setAuthor(pInfo["channel name"], bot.user.avatarURL)
        .addField("Description", pInfo["description"])
        .addField("Instructions", PUSHINSTRUCTIONS)
        .addField("Ending Date", pInfo["ending date"], true)
        .addField("Push Time", pushTime, true)
        .addField("Available Slots", sSlots)
        .addField("Invites Needed", invites)
        .addField("Queue", queue)
        .addField("Pushing Currently", currently)
        .addField("Leader Commands", leaderCommands)
        .addField("Member Commands", commands)
        .setColor(0xE74C3C)
        .setFooter("If you enjoy this bot, please star this repo by visiting https://github.com/puremana/me-bot")
        .setThumbnail(bot.user.avatarURL)
    }
    else {
        var embed = new Discord.RichEmbed()
        .setAuthor(pInfo["channel name"], bot.user.avatarURL)
        .addField("Description", pInfo["description"])
        .addField("Instructions", PUSHINSTRUCTIONS)
        .addField("Ending Date", pInfo["ending date"], true)
        .addField("Push Time", pushTime, true)
        .addField("Available Slots", sSlots)
        .addField("Invites Needed", invites)
        .addField("Queue", queue)
        .addField("Pushing Currently", currently)
        .setColor(0xE74C3C)
        .setFooter("If you enjoy this bot, please star this repo by visiting https://github.com/puremana/me-bot")
        .setThumbnail(bot.user.avatarURL)
    }

    return embed;
    }
    function checkQueue(message) {
        //ping next people in queue
        var id = message.channel.id;
        var sSlots = pushes[id]["slots"] - Object.keys(pushes[id]["currently"]).length;
        var text = "";

        if (Object.keys(pushes[id]["queue"]).length != 0) {
            for (member in pushes[id]["queue"]) {
                if (member < sSlots) {
                    let user = bot.users.find(user => user.id === pushes[id]["queue"][member]["id"]);
                    if (user) {
                        user.send("Account name **" + pushes[id]["queue"][member]["name"] + "** is ready for pushing in " + message.guild.channels.get(message.channel.id).toString());
                    }
                    text += "Account name **" + pushes[id]["queue"][member]["name"] + "** is ready for pushing <@" + pushes[id]["queue"][member]["id"] + ">\n";
                } 
            }
        }

        if (text != "") {
            pushReplyExtended(message, text);
        }
    }
    function log(text) {
        bot.guilds.find(name => name.id === SERVER_ID).channels.find(channel => channel.id === PUSH_LOG_ID).send(text)
            .catch(err => console.log(err));
    }
    function pingMember(message, name) {
        // If the member is still in the guild
        for (user in pushes[message.channel.id]["currently"]) {
            if (name.toLowerCase() === pushes[message.channel.id]["currently"][user]["name"].toLowerCase()) {

                // Tell them to get out of there
                pushReplyExtended(message, "<@" + message.author.id + "> your account name " + name + " has reached the time limit in the guild for this push. Please exit the guild and use the `" + PREFIX + "out` command.");

                log("<@" + message.author.id + "> on account name " + name + " has reached the time limit for the guild push in channel " + message.guild.channels.get(message.channel.id).toString());

                return;
            }
        }
    }
    // If the env variable is not set, use a default variable
    function setEnv(envVariable, defaultVariable) {
        return Object.is(envVariable, undefined) ? defaultVariable : envVariable;
    }

    function pushReply(message, content) {
        message.channel.send(content)
            .then(m => {
                m.delete(PUSHTIMEOUT)
                    .catch(err => {})
            })
            .catch(err => console.log(err));
    }

    function pushReplyExtended(message, content) {
        message.channel.send(content)
            .then(m => {
                m.delete(PUSHTIMEOUT * 10)
                    .catch(err => {})
            })
            .catch(err => console.log(err));
    }

    function saveJson(file, data) {
        fs.writeFile("storage/" + file + ".json", JSON.stringify(data), "utf8", (err) => {
            if (err) {
                console.log("There was an error saving the file. Error: "  + err);
                pushReply(message, "There was an error saving the " + file + " file. Please contact the bot owner.");
            }
        });
    }

    function arrayMove(arr, oldIndex, newIndex) {
        while (oldIndex < 0) {
            oldIndex += arr.length;
        }
        while (newIndex < 0) {
            newIndex += arr.length;
        }
        if (newIndex >= arr.length) {
            var k = newIndex - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    };