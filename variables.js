var bot;

exports.setters = {
    setBot: function(theBot) {
        bot = theBot;
    }
}

exports.functions = {
    getBot: function() {
        return bot;
    }
}