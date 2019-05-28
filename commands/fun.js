var functions = require("../functions.js");
const LEADERSHIPID = process.env.LEADERSHIP_ID;
const FUNCOMMANDS = functions.setEnv(process.env.FUN_COMMANDS.toLowerCase(), "true");
const FUNCHANNELID = process.env.FUN_CHANNEL_ID;
const PREFIX = functions.setEnv(process.env.PREFIX, "$");

module.exports = {
    echo: function(message) {
        if (message.member == null) {
            functions.reply(message, "Message author is undefined.");
            return;
        }
        if (message.member.roles.has(message.guild.roles.get(LEADERSHIPID).id)) {
            var text = message.content.substring(PREFIX.length + 5);
            functions.reply(message, text);
            if (message.channel.type != "dm") {
                try {
                    message.delete(0);
                } catch (err) {
                    console.log(err)
                }
            }
        }
        else {
            functions.reply(message, "You do not have the Leadership role.");
        }
    },
    cat: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS === 'false')) {
            return;
        }
        Promise.all([httpRequest("http", "aws.random.cat", "/meow")]).then(values => { 
            let catJson = JSON.parse(values[0]);
            functions.reply(message, catJson.file);
        });
    },
    dog: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS === 'false')) {
            return;
        }
        Promise.all([httpRequest("https", "dog.ceo", "/api/breeds/image/random")]).then(values => { 
            let dogJson = JSON.parse(values[0]);
            functions.reply(message, dogJson.message);
        });
    },
    flip: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS == 'false')) {
            return;
        }
        var toss = (Math.floor(Math.random() * 2) == 0);
        if (toss) {
            functions.reply(message, "Heads");
        } 
        else {
            functions.reply(message, "Tails");
        }
    },
    ball: function(message) {
        if ((message.channel.id != FUNCHANNELID) || (FUNCOMMANDS == 'false')) {
            return;
        }
        Promise.all([httpRequest("https", "8ball.delegator.com", "/magic/JSON/abc")]).then(values => { 
            ballJson = JSON.parse(values[0]);
            functions.reply(message, ballJson.magic.answer);
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
}