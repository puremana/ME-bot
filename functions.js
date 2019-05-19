exports.functions = {
    reply: function(message, content) {
        message.channel.send(content)
            .catch(err => {
                console.log(err)
            });
    }
}