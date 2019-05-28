var bot;
var bingoFunction;

exports.setters = {
    setBot: function(theBot) {
        bot = theBot;
    },
    setBingoFunction: function(theBingoFunction) {
        bingoFunction = theBingoFunction;
    }
}

exports.functions = {
    getBot: function() {
        return bot;
    },
    getBingoFunction: function() {
        return bingoFunction;
    }
}