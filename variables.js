var bot;
var bingoFunction;
var weekliesFunction;

exports.setters = {
    setBot: function(theBot) {
        bot = theBot;
    },
    setBingoFunction: function(theBingoFunction) {
        bingoFunction = theBingoFunction;
    },
    setWeekliesFunction: function(theWeekliesFunction) {
        weekliesFunction = theWeekliesFunction;
    }
}

exports.functions = {
    getBot: function() {
        return bot;
    },
    getBingoFunction: function() {
        return bingoFunction;
    },
    getWeekliesFunction: function() {
        return weekliesFunction;
    },
}