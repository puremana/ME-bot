const dotenv = require('dotenv').config();
const Discord = require("discord.js");
var functions = require("../functions.js");

const LEADERSHIPID = process.env.LEADERSHIP_ID;
const PREFIX = functions.setEnv(process.env.PREFIX, "$");
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const BOTNAME = functions.setEnv(process.env.BOT_NAME, "Guild Bot");
const BOTDESC = " is made with love (and nodejs) by Level \n" + "Type **" + PREFIX + "help** to get DMed the current list of commands \n If you enjoy this bot, please star this repo by visiting the source code below!";

module.exports = {
    time: function(message) {
        var offset = -5.0
        var date = new Date();
        var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        var EST = new Date(utc + (3600000 * offset));
    
        var stringDate = EST.getDate() + "/" + (EST.getMonth() + 1) + "/" + EST.getFullYear();
        var stringTime = EST.getHours() + ":" + EST.getMinutes() + ":" + EST.getSeconds();
        functions.reply(message, "**Server Time:** " + days[EST.getDay()] + " " + stringDate + " " + stringTime + " (EST)");
    }, 
    help: function(message) {
        var showingRoles = "";
        var additionalBot = "";
        var pushCommands = "";
    
        if (message.member != null) {
            let leadershipID = message.guild.roles.get(LEADERSHIPID).id;
            if (leadershipID) {
                if (message.member.roles.has(leadershipID)) {
                    showingRoles = "Leadership";
                    additionalBot = PREFIX + "add *(Leadership only)* - `" + PREFIX + "add command-name description` \n" +  
                    PREFIX + "remove *(Leadership only)* - `" + PREFIX + "remove command-name` \n";
                    additionalBot = additionalBot + PREFIX + "echo *(Leadership only)* \n";
                    pushCommands += PREFIX + 'pushsetup "available slots" "push end date" "push time" "leader role name" "push description" "(optional) inviter role name" \n' +
                    PREFIX + 'pushdelete \n';
                }
            }
        }

        if (showingRoles === "") {
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

        pushCommands += PREFIX + "sent - `" + PREFIX + "sent AccountName` *(Leaders only)* \n" + 
        PREFIX + "senttop - `" + PREFIX + "senttop NumberOfPeopleToDelete` *(Leaders only)* \n" +
        PREFIX + "queueremove - `" + PREFIX + "queueremove AccountName` *(Leaders only)* \n" +
        PREFIX + "updateslots - `" + PREFIX + "updateslots AvailableSlots` *(Leaders only)* \n" +
        PREFIX + "showcommands - `" + PREFIX + "showcommands yes/no` *(Leaders only)* \n" +
        PREFIX + "createnewmessage - `" + PREFIX + "createnewmessage` *(Leaders only)* \n" +
        PREFIX + "purge - `" + PREFIX + "purge NumberOfMessages` *(Leaders only)* \n" +
        PREFIX + 'move - `' + PREFIX + 'move "AccountName" NumberInQueue` *(Leaders only)* \n' +
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
    }
}