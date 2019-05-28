var fs = require("fs");

module.exports = {
    reply: function(message, content) {
        message.channel.send(content)
            .catch(err => {
                console.log(err)
            });
    },
    // If the env variable is not set, use a default variable
    setEnv: function(envVariable, defaultVariable) {
        return Object.is(envVariable, undefined) ? defaultVariable : envVariable;
    },

    saveJson: function(file, data) {
        fs.writeFile("storage/" + file + ".json", JSON.stringify(data), "utf8", (err) => {
            if (err) {
                console.log("There was an error saving the file. Error: "  + err);
                pushReply(message, "There was an error saving the " + file + " file. Please contact the bot owner.");
            }
        });
    }
}

// var setEnv = function(envVariable, defaultVariable) {
//     return Object.is(envVariable, undefined) ? defaultVariable : envVariable;
// }
// exports.setEnv = setEnv;