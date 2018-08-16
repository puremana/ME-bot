const Discord = require("discord.js");
var fs = require("fs");
var customCommands = require('./storage/custom.json');
var votes = require('./storage/votes.json');
var pushes = require('./storage/pushes.json');
const BOTNAME = "Empire Ruler";
var PREFIX = "?";
const BOTDESC = " is made with love (and nodejs) by Level \n" + "Type **" + PREFIX + "help** to get DMed the current list of commands \n";
var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var boolFunCommands = true;
var bot;
const BINGOCHANNELID = "";
const CHALLENGECHANNELID = "";
const FUNCHANNELID = "355227226389872642";
const BINGOTIMEOUT = 5000;
const PUSHTIMEOUT = 15000;
const PUSHINSTRUCTIONS = "Signup using the `" + PREFIX + "signup AccountName` command. Use `" + PREFIX + "in` when you enter and `" + PREFIX + "out` when you leave.";

exports.setters = {
    setBot: function(theBot) {
        bot = theBot;
    }
}

exports.functions = {
    //Challenge Commands
    bronze: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            message.channel.send("http://i.imgur.com/POra9Kx.jpg");
        }
    },
    silver: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            message.channel.send("http://i.imgur.com/rkJ51fC.jpg");
        }
    },
    gold: function(message) {
        if ((message.channel.id == CHALLENGECHANNELID) || (message.channel.type == "dm")) {
            message.channel.send("http://i.imgur.com/5GXghiA.jpg");
        }
    },

    //Event Commands
    invasion: function(message) {
        message.channel.send("https://docs.google.com/spreadsheets/d/1RDw0FEdFd6lKhmvMK972J5_xvvjVYeUYrTQQ4ZbMR74/edit");
    },
    energyevent: function(message) {
        message.channel.send("https://docs.google.com/spreadsheets/d/1R97uuDvEI80LBbqxveXIyHbwMGXG-nZsGvlH5YNoiV8/edit");
    },
    rpg: function(message) {
        message.channel.send("https://docs.google.com/document/d/1laVfybGGtTsXs_jeXQcE9yUpV8xz0FMokBFvCSIcIa4/edit?usp=sharing")
    },
    mafia: function(message) {
        message.channel.send("https://docs.google.com/spreadsheets/d/1AzBi0Dt9AePvASVeiWAUSSVcpTHfpQlUzDrIWxCL8AA/edit#gid=0");
    },

    //Bot Related Commands
    time: function(message) {
        var offset = -5.0
        var date = new Date();
        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        var EST = new Date(utc + (3600000 * offset));
    
        var stringDate = EST.getDate() + "/" + (EST.getMonth() + 1) + "/" + EST.getFullYear();
        var stringTime = EST.getHours() + ":" + EST.getMinutes() + ":" + EST.getSeconds();
        message.channel.send("**Server Time:** " + days[EST.getDay()] + " " + stringDate + " " + stringTime + " (EST)");
    }, 
    help: function(message) {
        var showingRoles = "";
        var additionalBot = "";
    
        if (message.member != null) {
            if (message.member.roles.find("name", "Empire Leadership")) {
                showingRoles = "Empire Leadership";
                additionalBot = PREFIX + "add *(Leadership only)* - `" + PREFIX + "add command-name description` \n" +  
                PREFIX + "remove *(Leadership only)* - `" + PREFIX + "remove command-name` \n";
                additionalBot = additionalBot + PREFIX + "echo *(Leadership only)* \n";
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
        PREFIX + "8ball ";
    
        var embed = new Discord.RichEmbed()
        .setAuthor("Showing commands for - " + showingRoles, message.author.avatarURL)
        .addField("Bot Related Commands", botRelated, true)
        .addField("Challenge Commands", challengeCommands, true)
        .addField("Voting Commands", votingCommands)
        .addField("Event Commands", eventCommands, true)
        .addField("Useful Links", usefulLinks, true)
        .setColor(0x9B59B6)
        if (customP == "") {
            embed.addField("Custom Commands", "There are no custom commands to display.", true)
        }
        else {
            embed.addField("Custom Commands", customP, true)
        }
        if (boolFunCommands) {
            embed.setFooter("Fun Commands " + funCommands)
        }
        message.author.send(embed);
    }, 
    info: function(message) {
        var embed = new Discord.RichEmbed()
        .addField(BOTNAME, BOTNAME + BOTDESC)
        .setColor(0x9B59B6)
        .setFooter("Source code: https://github.com/puremana/iou-bot")
        .setThumbnail(bot.user.avatarURL)
        message.channel.send(embed);
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
        message.channel.send(embed);
    },
    add: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        if (message.member.roles.find("name", "Empire Leadership") || message.member.roles.find("name", "Helper")) {
            if (args.length < 3) {
                message.channel.send("Please enter the command in the format `" + PREFIX + "add command_name command description`.");
                return;
            }
            var desc = "";
            for (d = 2; d < args.length; d++) {
                desc = desc + args[d] + " ";
            }
            var command = "\'" + args[1].toLowerCase() + "': '" + desc + "',";
            customCommands[args[1].toLowerCase()] = desc;
            fs.writeFile("storage/custom.json", JSON.stringify(customCommands), "utf8");
            message.channel.send("Command " + PREFIX + args[1] + " added.");
        }
        else {
            message.channel.send("You do not have the Empire Leadership role.");
        }
    },
    remove: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        if (message.member.roles.find("name", "Empire Leadership") || message.member.roles.find("name", "Helper")) {
            if (args.length == 2) {
                for (c in customCommands) {
                    if (args[1].toLowerCase() == c) {
                        delete customCommands[c];
                        fs.writeFile("storage/custom.json", JSON.stringify(customCommands), "utf8");
                        message.channel.send("Command " + PREFIX + args[1] + " removed.");
                        return;
                    }
                }
                message.channel.send("There is no " + PREFIX + args[1] + " command.");
            }
            else {
                message.channel.send("Please enter the command in the format `" + PREFIX + "remove command_name`.");
                return;
            }
        }
        else {
            message.channel.send("You do not have the Empire Leadership role.");
        }
    },
    echo: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        if (message.member.roles.find("name", "Empire Leadership") || message.member.roles.find("name", "Helper")) {
            var text = message.content.substring(PREFIX.length + 5);
            message.channel.send(text);
            if (message.channel.type != "dm") {
                try {
                    message.delete(0);
                } catch (err) {
                    console.log(err)
                }
            }
        }
        else {
            message.channel.send("You do not have the Empire Leadership role.");
        }
    },

    //Voting
    votenew: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //if there is already a poll with this name
        for (v in votes) {
            if (v == rawSplit[1]) {
                message.channel.send("There is already a poll with the name **" + rawSplit[1] + "**. Please `?voteclose` it before recreating.");
                return;
            }
        }
        //if the poll options isn't an int
        if (isNaN(rawSplit[3])) {
            message.channel.send("Please make sure the second argument (number of votes) is a number before creating the poll.");
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
            message.channel.send("Message could not be saved. Please try again.");
            return;
        }
        votes[rawSplit[1]] = vJson;
        fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
        //display the new poll
        displayPoll(message, rawSplit[1]);
    },
    vote: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
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
                    message.channel.send(':negative_squared_cross_mark: Already voted, please use `?votereset "poll name"` before trying again.');
                    return;
                }
                //check the poll isn't closed already
                if (votes[v]["closed"] == true) {
                    message.channel.send(':negative_squared_cross_mark: This poll has been closed.');
                    return;
                }
                //check number of votes they are doing is less than what's in there
                var messageVotes = (rawSplit.count - 2) / 2;
                if ((messageVotes + count) > numVotes) {
                    message.channel.send(':negative_squared_cross_mark: Trying to enter too many votes, please use `?votereset "poll name"` before trying again.');
                    return;
                }
                //if they haven't put their vote or votes in 
                //if poll vote is not real
                var theVotes = [];
                for (var l = 3; l < rawSplit.length; l = l + 2) {
                    if (isNaN(rawSplit[l])) {
                        message.channel.send(':negative_squared_cross_mark: Use digits to indicate what you are voting for. Please try again.');
                        return;
                    }
                    if (parseInt(rawSplit[l]) > (poll.length / 2)) {
                        message.channel.send(':negative_squared_cross_mark: One or more of your votes are not in the poll. Please try again.');
                        return;
                    }
                    theVotes.push(rawSplit[l]);
                }
                //check not voting for same thing twice
                if ((new Set(theVotes)).size !== theVotes.length) {
                    message.channel.send(':negative_squared_cross_mark: You cannot vote for the same option twice. Please try again.');
                    return;
                }
                //else put their vote in
                for (var j = 0; j < theVotes.length; j++) {
                    var num = parseInt(theVotes[j]) + parseInt(theVotes[j] - 1);
                    for (var o = 0; o < poll[num].length; o++) {
                        if (poll[num][o] == message.author.id) {
                            message.channel.send(':negative_squared_cross_mark: You cannot vote for the same option twice. Please try again.');
                            return;
                        }
                    }
                    poll[num].push(message.author.id);
                }
                fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
                if (theVotes.length == 1) {
                    message.channel.send(':white_check_mark: Your vote has been registered.');
                }
                else {
                    message.channel.send(':white_check_mark: Your votes have been registered.');
                }
                displayPoll(message, rawSplit[1]);
                return;
            }
        }
        message.channel.send(":negative_squared_cross_mark: Couldn't find poll name " + rawSplit[1]);
        return;
    },
    votecheck: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
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
                    message.channel.send("Your current votes in poll **" + rawSplit[1] + "** are options " + arrayResult);
                }
                else {
                    message.channel.send("You haven't voted in this poll yet.");
                }
                return;
            }
        }
        message.channel.send("Couldn't find poll name " + rawSplit[1]);
        return;
    },
    votedisplay: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
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
        message.channel.send("Couldn't find poll name " + rawSplit[1]);
        return;
    },
    voteclose: function (message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to close poll
                if (message.member.roles.find("name", "Empire Leadership") || message.member.roles.find("name", "Helper") || message.member.id == vote[v]["author"]) {
                    //check the poll isn't already closed
                    if (votes[v]["closed"] == true) {
                        message.channel.send("This poll has already been closed.");
                        return;
                    }
                    //close poll
                    votes[v]["closed"] = true;
                    message.channel.send("Poll **" + rawSplit[1] + "** is now closed.");
                    fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
                    return;
                }
                else {
                    message.channel.send("You do not have permissions to close this poll.");
                    return;
                }
            }
        }
    },
    voteopen: function (message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to close poll
                if (message.member.roles.find("name", "Empire Leadership") || message.member.roles.find("name", "Helper") || message.member.id == vote[v]["author"]) {
                    //check the poll isn't open
                    if (votes[v]["closed"] == false) {
                        message.channel.send("This poll is already open.");
                        return;
                    }
                    //open poll
                    votes[v]["closed"] = false;
                    message.channel.send("Poll **" + rawSplit[1] + "** has been reopened.");
                    fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
                    return;
                }
                else {
                    message.channel.send("You do not have permissions to open this poll.");
                    return;
                }
            }
        }
    },
    votedelete: function (message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
            return;
        }
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to delete
                if (message.member.roles.find("name", "Empire Leadership") || message.member.roles.find("name", "Helper") || message.member.id == vote[v]["author"]) {
                    //delete poll
                    delete votes[v];
                    message.channel.send("Poll **" + rawSplit[1] + "** is now deleted.");
                    fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
                    return;
                }
                else {
                    message.channel.send("You do not have permissions to close this poll.");
                    return;
                }
            }
        }
    },
    votereset: function(message) {
        if (message.member == null) {
            message.channel.send("Message author is undefined.");
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
                message.channel.send("Your responses for poll **" + rawSplit[1] + "** have been reset.");
                fs.writeFile("storage/votes.json", JSON.stringify(votes), "utf8");
            }
        }
    },

    //Useful Links
    guide: function(message) {
        message.channel.send("https://tinyurl.com/IOUguide");
    },
    multicalc: function(message) {
        message.channel.send("https://docs.google.com/spreadsheets/d/1QGBm6KtcOZraqSkLWVuqTF16vUD7rrOvIpdh59bFLmg/edit#gid=357923173");
    },
    forum: function(message) {
        message.channel.send("http://iourpg.com/forum");
    },
    wiki: function(message) {
        message.channel.send("http://iourpg.wikia.com/wiki/Idle_Online_Universe_Wiki");
    },
    cards: function(message) {
        message.channel.send("http://iouhelper.com/cards.html");
    },
    test: function(message) {
        message.channel.send("https://discord.gg/ncEarFv");
    },
    trello: function(message) {
        message.channel.send("https://trello.com/b/usVhG9Ry/iou-development-board");
    },

    //bingo
    bingoadd: function(message) {
        //check we're in bingo channel
        if (message.channel.id != BINGOCHANNELID) {
            return;
        }
        //check doesn't already have bingo role
        if (message.member.roles.find("name", "Bingo!!")) {
            message.channel.send("You already have the bingo role. Use `" + PREFIX + "bingoremove` to remove it.")
                .then(m => m.delete(BINGOTIMEOUT))
                .catch(err => console.log(err));
            return;
        }
        //add the role
        var bingoRole = message.member.guild.roles.find("name", "Bingo!!");
        message.channel.send("Your bingo role has been added.")
            .then(m => m.delete(BINGOTIMEOUT))
            .catch(err => console.log(err));
        message.member.addRole(bingoRole, "Command issued.");
    },
    bingoremove: function(message) {
        //check we're in bingo channel
        if (message.channel.id != BINGOCHANNELID) {
            return;
        }
        //check they have the bingo role
        if (message.member.roles.find("name", "Bingo!!")) {
            //remove the role
            var bingoRole = message.member.guild.roles.find("name", "Bingo!!");
            message.channel.send("Your bingo role has been removed.")
                .then(m => m.delete(BINGOTIMEOUT))
                .catch(err => console.log(err));
            message.member.removeRole(bingoRole, "Command issued.");
        }
        else {
            message.channel.send("You don't have the bingo role. Use `" + PREFIX + "bingoadd` to get it.")
                .then(m => m.delete(BINGOTIMEOUT))
                .catch(err => console.log(err));
        }
    },

    //weeklies
    weekliesadd: function(message) {
        //check we're in a text channel
        if (message.channel.type == "dm") {
            return;
        }
        //check doesn't already have weeklies role
        if (message.member.roles.find("name", "Weeklies")) {
            message.channel.send("You already have the weeklies role. Use `" + PREFIX + "weekliesremove` to remove it.")
                .then(m => m.delete(BINGOTIMEOUT))
                .catch(err => console.log(err));
            return;
        }
        //add the role
        var weekliesRole = message.member.guild.roles.find("name", "Weeklies");
        message.channel.send("Your weeklies role has been added.")
            .then(m => m.delete(BINGOTIMEOUT))
            .catch(err => console.log(err));
        message.member.addRole(weekliesRole, "Command issued.");
    },
    weekliesremove: function(message) {
        //check we're in dm channel
        if (message.channel.type == "dm") {
            return;
        }
        //check they have the bingo role
        if (message.member.roles.find("name", "Weeklies")) {
            //remove the role
            var weekliesRole = message.member.guild.roles.find("name", "Weeklies");
            message.channel.send("Your weeklies role has been removed.")
                .then(m => m.delete(BINGOTIMEOUT))
                .catch(err => console.log(err));
            message.member.removeRole(weekliesRole, "Command issued.");
        }
        else {
            message.channel.send("You don't have the weeklies role. Use `" + PREFIX + "weekliesadd` to get it.")
                .then(m => m.delete(BINGOTIMEOUT))
                .catch(err => console.log(err));
        }
    },

    //push
    pushsetup: function(message) {
        if (!message.member.roles.find("name", "Empire Leadership")) {
            message.channel.send("You require the Empire Leadership role to create a push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }
        //creates default messages
        var args = message.content.substring(PREFIX.length).split(" ");
        var rawSplit = message.content.split("\"");

        //correct format
        if (rawSplit.length != 9) {
            message.channel.send('Please make use the command in the following format, `' + PREFIX + 'pushsetup "available slots" "push end date" "leader role name" "push description"`')
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
            var pJson = {"messageid" : m.id, "channel name": message.channel.name, "author" : message.author.id, "slots" : rawSplit[1], "ending date" : rawSplit[3], "leaders" : rawSplit[5], "description" : rawSplit[7], "invites" : [], "currently" : []};
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
        })
        .catch(err => console.log(err));

    },
    pushdelete: function(message) {
        if (!message.member.roles.find("name", "Empire Leadership")) {
            message.channel.send("You require the Empire Leadership role to delete a push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        for (p in pushes) {
            if (p == message.channel.id) {
                delete pushes[p];
                message.channel.send("Push deleted.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
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
        pushes[message.channel.id]["invites"].push(text)
        fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");
        rewriteEmbed(message);

        message.channel.send("Username " + text + " has been added to the invite list.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
    },
    clearsignup: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find("name", pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var text = message.content.substring(PREFIX.length + 12);
        for (name in pushes[message.channel.id]["invites"]) {

            if (pushes[message.channel.id]["invites"][name] === text) {
                pushes[message.channel.id]["invites"].splice(name, 1);
                fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

                rewriteEmbed(message);

                message.channel.send("Username " + text + " has been removed from the invite list.")
                    .then(m => m.delete(PUSHTIMEOUT))
                    .catch(err => console.log(err));

                return;
            }
        }
        message.channel.send("Could not find a username " + text + " in the invite list.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));
    },
    cleartopsignups: function(message) {
        if (!pushes.hasOwnProperty(message.channel.id)) {
            message.channel.send("Could not find a push in this channel.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (!message.member.roles.find("name", pushes[message.channel.id]["leaders"])) {
            message.channel.send("You require the " + pushes[message.channel.id]["leaders"] + " role to clear signups for this push.")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));
            return;
        }

        var num = message.content.substring(PREFIX.length + 16);
        console.log("j" + num + "j")


        if (isNaN(num)) {
            message.channel.send("Please use this command in the following format `" + PREFIX + "cleartopsignups NumberOfPeopleToDelete`")
                .then(m => m.delete(PUSHTIMEOUT))
                .catch(err => console.log(err));

            return;
        }

        if (num > pushes[message.channel.id]["invites"].length) {
            num = pushes[message.channel.id]["invites"].length;
        }

        pushes[message.channel.id]["invites"].splice(0, num);
        fs.writeFile("storage/pushes.json", JSON.stringify(pushes), "utf8");

        rewriteEmbed(message);

        message.channel.send(num + " usernames have been removed from the invite list.")
            .then(m => m.delete(PUSHTIMEOUT))
            .catch(err => console.log(err));

    },
    resetslots: function(message) {

    },
    in: function(message) {

    },
    out: function(message) {

    },

    //fun
    cat: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (boolFunCommands == false)) {
            return;
        }
        Promise.all([httpRequest("http", "aws.random.cat", "/meow")]).then(values => { 
            catJson = JSON.parse(values[0]);
            message.channel.send(catJson.file);
        });
    },
    dog: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (boolFunCommands == false)) {
            return;
        }
        Promise.all([httpRequest("https", "dog.ceo", "/api/breeds/image/random")]).then(values => { 
            dogJson = JSON.parse(values[0]);
            message.channel.send(dogJson.message);
        });
    },
    flip: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (boolFunCommands == false)) {
            return;
        }
        var toss = (Math.floor(Math.random() * 2) == 0);
        if (toss) {
            message.channel.send("Heads");
        } 
        else {
            message.channel.send("Tails");
        }
    },
    ball: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (boolFunCommands == false)) {
            return;
        }
        Promise.all([httpRequest("https", "8ball.delegator.com", "/magic/JSON/abc")]).then(values => { 
            ballJson = JSON.parse(values[0]);
            message.channel.send(ballJson.magic.answer);
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
    message.channel.send(textMessage);
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
function createPushEmbed(id) {
    var pInfo = pushes[id];
    var commands = '`' + PREFIX + 'signup AccountName` \n' +
        '`' + PREFIX + 'clearsignup AccountName` *(' + pushes[id]["leaders"] + ' only)* \n' +
        '`' + PREFIX + 'cleartopsignups NumberOfPeopleToDelete` *(' + pushes[id]["leaders"] + ' only)* \n' +
        '`' + PREFIX + 'updateslots Number` *(' + pushes[id]["leaders"] + ' only)* \n' +
        '`' + PREFIX + 'in` \n' +
        '`' + PREFIX + 'out` \n';

    var invites = "*none*";
    if (pushes[id]["invites"].length != 0) {
        invites = "";
        for (invite in pushes[id]["invites"]) {
            invites += pushes[id]["invites"][invite] + "\n";
        }
    }

    var currently = "*none*";
    if (pushes[id]["currently"].length != 0) {
        currently = "";
        for (current in pushes[id]["currently"]) {
            currently += pushes[id]["currently"][current] + "\n";
        }
    }

    var embed = new Discord.RichEmbed()
        .setAuthor(pInfo["channel name"], bot.user.avatarURL)
        .addField("Description", pInfo["description"])
        .addField("Instructions", PUSHINSTRUCTIONS)
        .addField("Ending Date", pInfo["ending date"])
        .addField("Available Slots", pInfo["slots"])
        .addField("Pushing Currently", currently)
        .addField("Invites Needed", invites)
        .addField("Commands", commands)
        .setColor(0xE74C3C)
        .setFooter("Message Level with any bug reports")
        .setThumbnail(bot.user.avatarURL)

    return embed;
}