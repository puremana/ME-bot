const dotenv = require('dotenv').config();
const Discord = require("discord.js");
var fs = require("fs");
var customCommands = require('./storage/custom.json');
var votes = require('./storage/votes.json');
var pushes = require('./storage/pushes.json');
const BOTNAME = setEnv(process.env.BOT_NAME, "Guild Bot");
const PREFIX = setEnv(process.env.PREFIX, "$");
const SERVER_ID = process.env.SERVER_ID;
const LEADERSHIPID = process.env.LEADERSHIP_ID;
const CHALLENGECHANNELID = process.env.CHALLENGE_CHANNEL_ID;
const FUNCHANNELID = process.env.FUN_CHANNEL_ID;
const PUSH_LOG_ID = process.env.PUSH_LOG_CHANNEL_ID;
const PUSHTIMEOUT = setEnv(process.env.PUSH_TIMEOUT, 15000);
const FUNCOMMANDS = setEnv(process.env.FUN_COMMANDS, true);
const BINGO_ROLE_NAME = setEnv(process.env.BINGO_ROLE_NAME, "bingo");
const WEEKLIES_ROLE_NAME = setEnv(process.env.WEEKLIES_ROLE_NAME, "weeklies");

const PUSHINSTRUCTIONS = "Request a guild invite by using the `" + PREFIX + "signup AccountName` command.\nUse `" + PREFIX + "queuejoin AccountName` to join the queue.\n Use `" + PREFIX + "in Accountname` when you are in the front of the queue and `" + PREFIX + "out AccountName` when you are done pushing.";
const BOTDESC = " is made with love (and nodejs) by Level \n" + "Type **" + PREFIX + "help** to get DMed the current list of commands \n If you enjoy this bot, please star this repo by visiting the source code below!";
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
    //Challenge Commands
    bronze: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            reply(message, "http://i.imgur.com/POra9Kx.jpg");
        }
    },
    silver: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            reply(message, "http://i.imgur.com/rkJ51fC.jpg");
        }
    },
    gold: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            reply(message, "http://i.imgur.com/5GXghiA.jpg");
        }
    },

    //Event Commands
    invasion: function(message) {
        reply(message, "https://docs.google.com/spreadsheets/d/1RDw0FEdFd6lKhmvMK972J5_xvvjVYeUYrTQQ4ZbMR74/edit");
    },
    energyevent: function(message) {
        reply(message, "https://docs.google.com/spreadsheets/d/1R97uuDvEI80LBbqxveXIyHbwMGXG-nZsGvlH5YNoiV8/edit");
    },
    rpg: function(message) {
        reply(message, "https://docs.google.com/document/d/1laVfybGGtTsXs_jeXQcE9yUpV8xz0FMokBFvCSIcIa4/edit?usp=sharing")
    },
    mafia: function(message) {
        reply(message, "https://docs.google.com/spreadsheets/d/1AzBi0Dt9AePvASVeiWAUSSVcpTHfpQlUzDrIWxCL8AA/edit#gid=0");
    },

    //Bot Related Commands
    time: function(message) {
        var offset = -5.0
        var date = new Date();
        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        var EST = new Date(utc + (3600000 * offset));
    
        var stringDate = EST.getDate() + "/" + (EST.getMonth() + 1) + "/" + EST.getFullYear();
        var stringTime = EST.getHours() + ":" + EST.getMinutes() + ":" + EST.getSeconds();
        reply(message, "**Server Time:** " + days[EST.getDay()] + " " + stringDate + " " + stringTime + " (EST)");
    }, 
    help: function(message) {
        var showingRoles = "";
        var additionalBot = "";
        var pushCommands = "";
    
        if (message.member != null) {
            if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
                showingRoles = "Leadership";
                additionalBot = PREFIX + "add *(Leadership only)* - `" + PREFIX + "add command-name description` \n" +  
                PREFIX + "remove *(Leadership only)* - `" + PREFIX + "remove command-name` \n";
                additionalBot = additionalBot + PREFIX + "echo *(Leadership only)* \n";
                pushCommands += PREFIX + 'pushsetup "available slots" "push end date" "push time" "leader role name" "push description" \n' +
                PREFIX + 'pushdelete \n';
            }
            else {
                showingRoles = "Member";
            }
        }
        else {
            showingRoles = "Member";
        }
    
        var customP = "";
        for (c in customCommands) {
            customP = customP + PREFIX + c + "\n";
        }
        var botRelated = PREFIX + "help \n" + 
        PREFIX + "info \n" +
        PREFIX + "time \n" +
        PREFIX + "serverinfo \n" +
        PREFIX + "bingoadd \n" +
        PREFIX + "bingoremove \n" +
        PREFIX + "bingowhen \n" +
        PREFIX + "weekliesadd \n" +
        PREFIX + "weekliesremove \n" +
        PREFIX + "weeklieswhen \n" +
        additionalBot;
    
        var challengeCommands = PREFIX + "bronze \n" +
        PREFIX + "silver \n" +
        PREFIX + "gold \n";

        var votingCommands = PREFIX + 'votenew - `' + PREFIX + 'votenew "Name of Poll" "# of times you can vote" "Option One" "Option Two" "Etc"` \n' +
        PREFIX + 'vote - `' + PREFIX + 'vote "Name of Poll" "index of option (eg 1)"` \n' +
        PREFIX + 'votecheck - `' + PREFIX + 'votecheck "Name of Poll"` \n' +
        PREFIX + 'votedisplay - `' + PREFIX + 'votedisplay "Name of Poll"` \n' +
        PREFIX + 'voteclose - `' + PREFIX + 'voteclose "Name of Poll"` \n' +
        PREFIX + 'voteopen - `' + PREFIX + 'voteopen "Name of Poll"` \n' +
        PREFIX + 'votedelete - `' + PREFIX + 'votedelete "Name of Poll"` \n' +
        PREFIX + 'votereset - `' + PREFIX + 'votereset "Name of Poll"` \n';

        pushCommands += PREFIX + "sent - " + PREFIX + "sent AccountName` *(Leaders only)* \n" + 
        PREFIX + "senttop - `" + PREFIX + "senttop NumberOfPeopleToDelete` *(Leaders only)* \n" +
        PREFIX + "queueremove - `" + PREFIX + "queueremove AccountName` *(Leaders only)* \n" +
        PREFIX + "updateslots - `" + PREFIX + "updateslots AvailableSlots` *(Leaders only)* \n" +
        PREFIX + "showcommands - `" + PREFIX + "showcommands yes/no` *(Leaders only)* \n" +
        PREFIX + "createnewmessage - `" + PREFIX + "createnewmessage` *(Leaders only)* \n" +
        PREFIX + "signup - `" + PREFIX + "signup AccountName` \n" + 
        PREFIX + "queuejoin - `" + PREFIX + "queuejoin AccountName` \n" + 
        PREFIX + "queueleave - `" + PREFIX + "queueleave AccountName` \n" + 
        PREFIX + "in - `" + PREFIX + "in AccountName` \n" + 
        PREFIX + "out - `" + PREFIX + "out AccountName`";

        var eventCommands = PREFIX + "invasion \n" + 
        PREFIX + "energyevent \n" + 
        PREFIX + "rpg \n" + 
        PREFIX + "mafia \n";
    
        var usefulLinks =  PREFIX + "guide \n" +
        PREFIX + "multicalc \n" +
        PREFIX + "forum \n" +
        PREFIX + "wiki \n" +
        PREFIX + "cards \n" +
        PREFIX + "test \n" +
        PREFIX + "trello \n";
    
        var funCommands = PREFIX + "cat " +
        PREFIX + "dog " +
        PREFIX + "flip " +
        PREFIX + "ball ";
    
        var embed = new Discord.RichEmbed()
        .setAuthor("Showing commands for - " + showingRoles, message.author.avatarURL)
        .addField("Bot Related Commands", botRelated, true)
        .addField("Challenge Commands", challengeCommands, true)
        .addField("Voting Commands", votingCommands)
        .addField("Event Commands", eventCommands, true)
        .addField("Useful Links", usefulLinks, true)
        .addField("Push Commands", pushCommands)
        .addField("Fun Commands", funCommands)
        .setColor(0x9B59B6)
        if (customP == "") {
            embed.addField("Custom Commands", "There are no custom commands to display.", true)
        }
        else {
            embed.addField("Custom Commands", customP, true)
        }
        embed.setFooter("If you enjoy this bot, please star this repo by visiting https://github.com/puremana/me-bot")
        
        message.author.send(embed);
    }, 
    info: function(message) {
        var embed = new Discord.RichEmbed()
        .addField(BOTNAME, BOTNAME + BOTDESC)
        .setColor(0x9B59B6)
        .setFooter("If you enjoy this bot, please star this repo by visiting https://github.com/puremana/me-bot")
        .setThumbnail(bot.user.avatarURL)
        reply(message, embed);
    },
    serverinfo: function(message) {
        if (message.channel.type == "dm") {
            return;
        }
        var botCount = 0;
        var totalMembers = message.guild.memberCount;
        var activeMembers = 0;
        //loop through members
        for (u in message.guild.members.array()) {
            if (message.guild.members.array()[u].user.bot == true) {
                botCount++;
            }
            if (message.guild.members.array()[u].presence.status != "offline") {
                activeMembers++;
            }
        }
        var embed = new Discord.RichEmbed()
        .setAuthor(BOTNAME, bot.user.avatarURL)
        .setTitle("Server Info - " + message.guild.name)
        .setColor(0x9B59B6)
        .setThumbnail(message.guild.iconURL)
        .addField("Bots", botCount, true)
        .addField("Owner", message.guild.owner, true)
        .addField("Active Members", activeMembers, true)
        .addField("Region", message.guild.region, true)
        .addField("Total Members", totalMembers, true)
        .addField("Invite Link", "https://discord.gg/WfcvtZm", true)
        .setFooter("Server creation - " + message.guild.createdAt, message.guild.owner.user.avatarURL)
        reply(message, embed);
    },
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
            fs.writeFile("storage/custom.json", JSON.stringify(customCommands), "utf8");
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
                        fs.writeFile("storage/custom.json", JSON.stringify(customCommands), "utf8");
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
        fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
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
                fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
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
                    fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
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
                    fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
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
                    fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
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
                fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
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

        message.channel.send(stringDiff);
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
            message.channel.send("You require the Leadership role to create a push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }
        //creates default messages
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");

        //correct format
        if (rawSplit.length != 11) {
            message.channel.send('Please make use the command in the following format, `' + PREFIX + 'pushsetup "available slots" "push end date" "time limit" "leader role name" "push description"`')
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        //number as argument
        if (isNaN(rawSplit[1])) {
            message.channel.send("Please make sure the first argument (available slots) is a number before creating the poll.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        //number as argument
        if (isNaN(rawSplit[5])) {
            message.channel.send("Please make sure the third argument (time per push) is a number (minutes) before creating the poll.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        //push has been created already
        for (p in pushes) {
            if (p == message.channel.id) {
                message.channel.send("A push has already been created in this channel, please use `" + PREFIX + "pushdelete` to delete.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                return;
            }
        }

        //send embed
        message.channel.send("Processing...")
        .then(m => {        
            //create push
            var pJson = {"messageid" : m.id, "channel name": message.channel.name, "author" : message.author.id, "slots" : rawSplit[1], "ending date" : rawSplit[3], "push time" : rawSplit[5], "leaders" : rawSplit[7], "description" : rawSplit[9], "invites" : [], "currently" : [], "queue" : [], "showcommands": true};
            if (!verifyJson(pJson)) {
                message.channel.send("Push could not be saved. Please try again.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                return;
            }
            pushes[message.channel.id] = pJson;
            fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

            //make embed
            var embed = createPushEmbed(message.channel.id);

            m.edit(embed);
            log("<@" + message.author.id + "> has created a new push in channel " + message.guild.channels.get(message.channel.id).toString());
        })
        .catch(err => console.log(err));

    },
    pushdelete: function(message) {
        if (!(message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || (message.author.id == "146412379633221632"))) {
            message.channel.send("You require the Leadership role to delete a push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        for (p in pushes) {
            if (p == message.channel.id) {
                deleteEmbed(message);

                delete pushes[p];
                reply(message, "Push deleted.");

                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
                log("<@" + message.author.id + "> has deleted a push in channel " + message.guild.channels.get(message.channel.id).toString());
                return;
            }
        }

        message.channel.send("Could not find a push in this channel.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
    },
    signup: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 7);

        for (name in pushes[message.channel.id]["invites"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["invites"][name]["name"].toLowerCase()) {
                message.channel.send("Username " + text + " is already on the invite list.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                return;
            }
        }

        if (!text.replace(/\s/g, '').length) {
            message.channel.send("Please use this command in the following format `" + PREFIX + "signup AccountName`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        pushes[message.channel.id]["invites"].push({id : message.author.id, name : text});
        fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
        rewriteEmbed(message);

        message.channel.send("Username " + text + " has been added to the invite list.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
        log("<@" + message.author.id + "> has signed up in with username **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    queuejoin: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 10);

        for (name in pushes[message.channel.id]["queue"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {
                message.channel.send("Username " + text + " is already in the queue.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                return;
            }
        }

        if (!text.replace(/\s/g, '').length) {
            message.channel.send("Please use this command in the following format `" + PREFIX + "queuejoin AccountName`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        pushes[message.channel.id]["queue"].push({id : message.author.id, name : text});
        fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
        rewriteEmbed(message);

        message.channel.send("Username " + text + " has been added to the queue.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
        log("<@" + message.author.id + "> has joined the queue with username **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());

        if (Object.keys(pushes[message.channel.id]["queue"]).length <= pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) {
            checkQueue(message);
        }
    },
    queueleave: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 11);

        for (name in pushes[message.channel.id]["queue"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {
                
                var userid = pushes[message.channel.id]["queue"][name]["id"];

                if (userid != message.author.id) {
                    message.channel.send("Username **" + text + "** was added to the queue by a different Discord user. If you have the " + pushes[message.channel.id]["leaders"] + " role, please use `" + PREFIX + "queueremove AccountName`.")
                        .then(m => m.delete(PUSHTIMEOUT))
                        .catch(err => console.log(err));
                    return;
                }

                pushes[message.channel.id]["queue"].splice(name, 1);
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

                rewriteEmbed(message);

                message.channel.send("Username **" + text + "** has been removed from the queue.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
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
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to remove other players from this push queue.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 12);

        for (name in pushes[message.channel.id]["queue"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["queue"][name]["name"].toLowerCase()) {

                pushes[message.channel.id]["queue"].splice(name, 1);
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

                rewriteEmbed(message);

                message.channel.send("Username **" + text + "** has been removed from the queue.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
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
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 5);

        for (name in pushes[message.channel.id]["invites"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["invites"][name]["name"].toLowerCase()) {
                
                var userid = pushes[message.channel.id]["invites"][name]["id"];

                pushes[message.channel.id]["invites"].splice(name, 1);
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

                rewriteEmbed(message);

                message.channel.send("Username **" + text + "** has been sent an invite - <@" + userid + ">")
                    .then(m => m.delete(PUSHTIMEOUT * 10))
                    .catch(err => console.log(err));
                log("<@" + message.author.id + "> has sent an invite to Discord username <@" + userid + "> , account username **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
                return;
            }
        }
        
        message.channel.send("Could not find a username " + text + " in the invite list.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
        
    },
    senttop: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var num = message.content.substring(PREFIX.length + 8);

        if (!num.replace(/\s/g, '').length) {
            message.channel.send("Please use this command in the following format `" + PREFIX + "senttop NumberOfPeopleToDelete`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        if (isNaN(num)) {
            message.channel.send("Please use this command in the following format `" + PREFIX + "senttop NumberOfPeopleToDelete`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

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
        fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

        rewriteEmbed(message);

        message.channel.send(num + " usernames have been sent an invite. \n" + tagText)
            .then(m => m.delete(PUSHTIMEOUT * 10))
            .catch(err => console.log(err));
        log("<@" + message.author.id + "> has invited **" + num + " players** \n" + tagText + "\nIn channel " + message.guild.channels.get(message.channel.id).toString());
    },
    updateslots: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var num = message.content.substring(PREFIX.length + 12);

        if (isNaN(num)) {
            message.channel.send("Please use this command in the following format `" + PREFIX + "updateslots NumberOfSlots`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        //update slots
        pushes[message.channel.id]["slots"] = num;
        fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

        rewriteEmbed(message);

        message.channel.send("Available guild spots have been updated.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
        log("<@" + message.author.id + "> has updated slots to **" + num + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    showcommands: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var answer = message.content.substring(PREFIX.length + 13);

        if (answer === 'yes' || answer === 'true') {
            pushes[message.channel.id]["showcommands"] = true;
            fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
    
            rewriteEmbed(message);

            message.channel.send("The push message should now show commands.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
        }
        else if (answer === 'no' || answer === 'false') {
            pushes[message.channel.id]["showcommands"] = false;
            fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
    
            rewriteEmbed(message);

            message.channel.send("The push message should now not show any commands.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
        }
        else {
            message.channel.send("Please use this command in the following format `" + PREFIX + "showcommands yes`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        log("<@" + message.author.id + "> has sent showcommands to **" + answer + "** in channel " + message.guild.channels.get(message.channel.id).toString());
    },
    in: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        var text = message.content.substring(PREFIX.length + 3);
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

        if (letIn) {
            //make sure it was same person who made
            if (pushes[message.channel.id]["queue"].length !== 0) {
                var userid = pushes[message.channel.id]["queue"][idIndex]["id"];

                if (userid != message.author.id) {
                    message.channel.send("Username **" + text + "** was added to the queue by a different Discord user.")
                        .then(m => m.delete(PUSHTIMEOUT))
                        .catch(err => console.log(err));
                    return;
                }
            }
            

            //if it is the one who is ready
            if ((idIndex < pushes[message.channel.id]["slots"] - Object.keys(pushes[message.channel.id]["currently"]).length) || pushes[message.channel.id]["queue"].length === 0) {
    
                //add to current push list
                pushes[message.channel.id]["currently"].push({"id" : message.author.id, "name" : text});
                //delete from queue
                pushes[message.channel.id]["queue"].splice(idIndex, 1);
                //if on invite list, delete
                for (person in pushes[message.channel.id]["invites"]) {
                    if (text.toLowerCase() === pushes[message.channel.id]["invites"][person]["name"].toLowerCase()) {
                        pushes[message.channel.id]["invites"].splice(person, 1);
                    }
                }

                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
                rewriteEmbed(message);

                message.channel.send("Account name **" + text + "** has entered the guild.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                log("<@" + message.author.id + "> has entered the guild on account name **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
                
                if (pushes[message.channel.id]["push time"] != 0) {
                    setTimeout(function() {
                        pingMember(message, text);
                    }, pushes[message.channel.id]["push time"] * 60000);
                }
                
                return;
            } 
            else {
                message.channel.send("Account name **" + text + "** is not at the top of the queue.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                return;
            }
        }
        else {
            message.channel.send("Could not find account name **" + text + "** in the queue.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
        }
    },
    out: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        var text = message.content.substring(PREFIX.length + 4);

        for (name in pushes[message.channel.id]["currently"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["currently"][name]["name"].toLowerCase()) {

                var userid = pushes[message.channel.id]["currently"][name]["id"];

                if (userid != message.author.id) {
                    message.channel.send("Username **" + text + "** was added to the current push by a different Discord user.")
                        .then(m => m.delete(PUSHTIMEOUT))
                        .catch(err => console.log(err));
                    return;
                }
                    
                pushes[message.channel.id]["currently"].splice(name, 1);
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
                rewriteEmbed(message);
        
                message.channel.send("Account name **" + text + "** has exited the guild.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                log("<@" + message.author.id + "> has exited the guild on account name **" + text + "** in channel " + message.guild.channels.get(message.channel.id).toString());
                
                checkQueue(message);
                return;
            }
        }
        message.channel.send("Could not find account name **" + text + "** in the push.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
    },
    currentremove: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 14);

        for (name in pushes[message.channel.id]["currently"]) {
            if (text.toLowerCase() === pushes[message.channel.id]["currently"][name]["name"].toLowerCase()) {
                    
                pushes[message.channel.id]["currently"].splice(name, 1);
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
                rewriteEmbed(message);
        
                message.channel.send("Account name **" + text + "** has been removed from the guild.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                log("<@" + message.author.id + "> has removed account name **" + text + "** from the guild in channel " + message.guild.channels.get(message.channel.id).toString());
                
                checkQueue(message);
                return;
            }
        }
        message.channel.send("Could not find account name **" + text + "** in the push.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
    },
    createnewmessage: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find(role => role.name === pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
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
            fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

            //make embed
            var embed = createPushEmbed(id);

            m.edit(embed);
            log("<@" + message.author.id + "> has replaced/created a new message the push message in channel " + message.guild.channels.get(message.channel.id).toString());
        })
        .catch(err => console.log(err));
    },

    //fun
    cat: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS == false)) {
            return;
        }
        Promise.all([httpRequest("http", "aws.random.cat", "/meow")]).then(values => { 
            catJson = JSON.parse(values[0]);
            reply(message, catJson.file);
        });
    },
    dog: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS == false)) {
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
    '`' + PREFIX + 'createnewmessage` *(' + pushes[id]["leaders"] + ' only)*';

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
                    text += "Account name **" + pushes[id]["queue"][member]["name"] + "** is ready for pushing <@" + pushes[id]["queue"][member]["id"] + ">\n";
                } 
            }
        }

        if (text != "") {
            message.channel.send(text)
                .then(m => m.delete(PUSHTIMEOUT * 10))
                .catch(err => console.log(err));
        }
    }
    function log(text) {
        bot.guilds.find(name => name.id === SERVER_ID).channels.find(channel => channel.id === PUSH_LOG_ID).send(text)
            .catch(err => console.log(err));
    }
    function pingMember(message, name) {
        //if the member is still in the guild
        for (user in pushes[message.channel.id]["currently"]) {
            if (name.toLowerCase() === pushes[message.channel.id]["currently"][user]["name"].toLowerCase()) {

                //tell them to get out of there
                message.channel.send("<@" + message.author.id + "> your account name " + name + " has reached the time limit in the guild for this push. Please exit the guild and use the `" + PREFIX + "out` command.")
                .then(m => m.delete(PUSHTIMEOUT * 10))
                .catch(err => console.log(err));

                log("<@" + message.author.id + "> on account name " + name + " has reached the time limit for the guild push in channel " + message.guild.channels.get(message.channel.id).toString());

                return;
            }
        }
    }
    // If the env variable is not set, use a default variable
    function setEnv(envVariable, defaultVariable) {
        return Object.is(envVariable, undefined) ? defaultVariable : envVariable;
    }

    function reply(message, content) {
        message.channel.send(content)
            .catch(err => console.log(err));
    }