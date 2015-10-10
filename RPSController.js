var gamePrototype = require(RPSGame.js);
var games;
var bot;

class RPSController{

	RPSController(var client){
		bot = client;
	}

	startGame(initiator, opponent){
		games.add(new gamePrototype(initiator, opponent));
		bot.sendMessage(initiator, "You have challenged " + opponent.username + 
			" to rock paper scissors! Please type rock, paper, or scissors.");
		bot.sendMessage(opponent, "You have been challenged by " + initiator.username +
			" to rock paper scissors! Please type rock, paper, or scissors.");
	}

	status(player){
		var playerIsIn;
		for (var i = 0; i < games.length; i++) {
			if(games[i].players.contains(player){
				playerIsIn.add(games[i]);
			}
		}
		return playerIsIn;
	}
}