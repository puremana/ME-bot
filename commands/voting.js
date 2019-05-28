var functions = require("../functions.js");
var votes = require('./../storage/votes.json');
const PREFIX = functions.setEnv(process.env.PREFIX, "$");

module.exports = {
    votenew: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

        var rawSplit = message.content.split("\"");
        //if there is already a poll with this name
        for (v in votes) {
            if (v == rawSplit[1]) {
                functions.reply(message, "There is already a poll with the name **" + rawSplit[1] + "**. Please `" + PREFIX + "voteclose` it before recreating.");
                return;
            }
        }
        //if the poll options isn't an int
        if (isNaN(rawSplit[3])) {
            functions.reply(message, "Please make sure the second argument (number of votes) is a number before creating the poll.");
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
        if (!functions.verifyJson(vJson)) {
            functions.reply(message, "Message could not be saved. Please try again.");
            return;
        }
        votes[rawSplit[1]] = vJson;
        functions.saveJson('votes', votes);
        //display the new poll
        displayPoll(message, rawSplit[1]);
    },
    vote: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }
  
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
                    functions.reply(message, ':negative_squared_cross_mark: Already voted, please use `' + PREFIX + 'votereset "poll name"` before trying again.');
                    return;
                }
                //check the poll isn't closed already
                if (votes[v]["closed"] == true) {
                    functions.reply(message, ':negative_squared_cross_mark: This poll has been closed.');
                    return;
                }
                //check number of votes they are doing is less than what's in there
                var messageVotes = (rawSplit.count - 2) / 2;
                if ((messageVotes + count) > numVotes) {
                    functions.reply(message, ':negative_squared_cross_mark: Trying to enter too many votes, please use `' + PREFIX + 'votereset "poll name"` before trying again.');
                    return;
                }
                //if they haven't put their vote or votes in 
                //if poll vote is not real
                var theVotes = [];
                for (var l = 3; l < rawSplit.length; l = l + 2) {
                    if (isNaN(rawSplit[l])) {
                        functions.reply(message, ':negative_squared_cross_mark: Use digits to indicate what you are voting for. Please try again.');
                        return;
                    }
                    if (parseInt(rawSplit[l]) > (poll.length / 2)) {
                        functions.reply(message, ':negative_squared_cross_mark: One or more of your votes are not in the poll. Please try again.');
                        return;
                    }
                    theVotes.push(rawSplit[l]);
                }
                //check not voting for same thing twice
                if ((new Set(theVotes)).size !== theVotes.length) {
                    functions.reply(message, ':negative_squared_cross_mark: You cannot vote for the same option twice. Please try again.');
                    return;
                }
                //else put their vote in
                for (var j = 0; j < theVotes.length; j++) {
                    var num = parseInt(theVotes[j]) + parseInt(theVotes[j] - 1);
                    for (var o = 0; o < poll[num].length; o++) {
                        if (poll[num][o] == message.author.id) {
                            functions.reply(message, ':negative_squared_cross_mark: You cannot vote for the same option twice. Please try again.');
                            return;
                        }
                    }
                    poll[num].push(message.author.id);
                }
                functions.saveJson('votes', votes);
                if (theVotes.length == 1) {
                    functions.reply(message, ':white_check_mark: Your vote has been registered.');
                }
                else {
                    functions.reply(message, ':white_check_mark: Your votes have been registered.');
                }
                displayPoll(message, rawSplit[1]);
                return;
            }
        }
        functions.reply(message, ":negative_squared_cross_mark: Couldn't find poll name " + rawSplit[1]);
        return;
    },
    votecheck: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

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
                    functions.reply(message, "Your current votes in poll **" + rawSplit[1] + "** are options " + arrayResult);
                }
                else {
                    functions.reply(message, "You haven't voted in this poll yet.");
                }
                return;
            }
        }
        functions.reply(message, "Couldn't find poll name " + rawSplit[1]);
        return;
    },
    votedisplay: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                displayPoll(message, rawSplit[1]);
                return;
            }
        }
        functions.reply(message, "Couldn't find poll name " + rawSplit[1]);
        return;
    },
    voteclose: function (message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to close poll
                if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || message.member.id == vote[v]["author"]) {
                    //check the poll isn't already closed
                    if (votes[v]["closed"] == true) {
                        functions.reply(message, "This poll has already been closed.");
                        return;
                    }
                    //close poll
                    votes[v]["closed"] = true;
                    functions.reply(message, "Poll **" + rawSplit[1] + "** is now closed.");
                    functions.saveJson('votes', votes);
                    return;
                }
                else {
                    functions.reply(message, "You do not have permissions to close this poll.");
                    return;
                }
            }
        }
    },
    voteopen: function (message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to close poll
                if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || message.member.id == vote[v]["author"]) {
                    //check the poll isn't open
                    if (votes[v]["closed"] == false) {
                        functions.reply(message, "This poll is already open.");
                        return;
                    }
                    //open poll
                    votes[v]["closed"] = false;
                    functions.reply(message, "Poll **" + rawSplit[1] + "** has been reopened.");
                    functions.saveJson('votes', votes);
                    return;
                }
                else {
                    functions.reply(message, "You do not have permissions to open this poll.");
                    return;
                }
            }
        }
    },
    votedelete: function (message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

        var rawSplit = message.content.split("\"");
        //check if that is a poll
        for (v in votes) {
            if (v == rawSplit[1]) {
                //check they have permissions to delete
                if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id) || message.member.id == vote[v]["author"]) {
                    //delete poll
                    delete votes[v];
                    functions.reply(message, "Poll **" + rawSplit[1] + "** is now deleted.");
                    functions.saveJson('votes', votes);
                    return;
                }
                else {
                    functions.reply(message, "You do not have permissions to close this poll.");
                    return;
                }
            }
        }
    },
    votereset: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }

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
                functions.reply(message, "Your responses for poll **" + rawSplit[1] + "** have been reset.");
                functions.saveJson('votes', votes);
            }
        }
    }
}

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
    functions.reply(message, textMessage);
}