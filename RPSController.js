var gamePrototype = require("./RPSGame.js");

function RPSController(client){

	this.bot = client;
	this.games = [];
}

RPSController.prototype.startGame = function(initiator, opponent){
	this.games.push(new gamePrototype(initiator, opponent));
	this.bot.sendMessage(initiator, "You have challenged " + opponent.username + 
		" to rock paper scissors! Please type rock, paper, or scissors.");
	this.bot.sendMessage(opponent, "You have been challenged by " + initiator.username +
		" to rock paper scissors! Please type rock, paper, or scissors.");
}

RPSController.prototype.status = function(player){
	var playerIsIn = [];
	for (var i = 0; i < this.games.length; i++) {
		if(this.games[i].players.indexOf(player) > -1){
			playerIsIn.push(this.games[i]);
		}
	}
	return playerIsIn;
}

RPSController.prototype.globalstatus = function(){
	console.log("Displaying global status");
}

module.exports = RPSController;