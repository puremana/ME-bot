var bot;

exports.setters = {
    setBot: function(theBot) {
        bot = theBot;
        console.log("the bot is");
        console.log(bot);
    }
}

exports.functions = {
    getBot: function() {
        return bot;
    }
}