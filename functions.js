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
    }
}

// var setEnv = function(envVariable, defaultVariable) {
//     return Object.is(envVariable, undefined) ? defaultVariable : envVariable;
// }
// exports.setEnv = setEnv;