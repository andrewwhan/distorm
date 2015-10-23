var gamePrototype = require("./RPSGame.js");
var generalChannel;



function RPSController(client){

	this.bot = client;
	this.games = [];
	this.plays = {
		ROCK: {value: 1, string:"rock"},
		PAPER: {value: 2, string:"paper"},
		SCISSORS: {value: 3, string:"scissors"}
	}
}

RPSController.prototype.startGame = function(msg, opponent){
	this.games.push(new gamePrototype(msg, opponent));
	this.bot.sendMessage(msg.channel, "RPS game started between " + msg.sender.username + " and " + opponent.username + "!");
	this.bot.sendMessage(msg.sender, "You have challenged " + opponent.username + 
		" to rock paper scissors! Please type !rock, !paper, or !scissors.");
	this.bot.sendMessage(opponent, "You have been challenged by " + msg.sender.username +
		" to rock paper scissors! Please type !rock, !paper, or !scissors.");
}

RPSController.prototype.status = function(msg, print){
	var playerIsIn = [];
	for (var i = 0; i < this.games.length; i++) {
		var indexOfPlayer = this.games[i].containsPlayer(msg.sender);
		if(indexOfPlayer > -1){
			// console.log("Player " + indexOfPlayer);
			indexOfOpponent = indexOfPlayer == 0 ? 1 : 0;
			// console.log("Opponent " + indexOfOpponent);
			playerIsIn.push({game: this.games[i], opponent: this.games[i].players[indexOfOpponent].player});
		}
	}
	if(print){
		if(playerIsIn.length > 0){
			var string = "You are in " + playerIsIn.length + (playerIsIn.length > 1 ? " games:\n" : " game:\n");
			for(var i = 0; i < playerIsIn.length; i++){
				string += i+1 + ". " + playerIsIn[i].opponent.username + "\n";
			}
			this.bot.sendMessage(msg.channel, string);
		}
		else{
			this.bot.sendMessage(msg.channel, "You are not currently in any games!");
		}
	}
	return playerIsIn;
}

RPSController.prototype.globalstatus = function(msg){
	if(this.games.length > 0){
		var string = this.games.length + (this.games.length > 1 ? " games " : " game ") + "currently running:\n";
		for(var i = 0; i < this.games.length; i++){
			string += this.games[i].players[0].player.username + " vs " + this.games[i].players[1].player.username + "\n";
		}
		this.bot.sendMessage(msg.channel, string);
	}
	else{
		this.bot.sendMessage(msg.channel, "No games are currently active!");
	}
}

RPSController.prototype.play = function(hand, msg, gameid){
	var playerIsIn = this.status(msg, false);
	if(playerIsIn.length > 0){
		if(gameid && !isNaN(gameid)){
			if(gameid <= playerIsIn.length && gameid > 0){
				if(playerIsIn[gameid - 1].game.play(msg.sender, hand)){
					this.resolve(playerIsIn[gameid - 1].game);
				}
				else{
					this.bot.sendMessage(msg.channel, "Your play has been submitted!");
				}
			}
			else{
				this.bot.sendMessage(msg.channel, "Game ID does not exist!");
			}
		}
		else{
			if(playerIsIn.length === 1){
				if(playerIsIn[0].game.play(msg.sender, hand)){
					this.resolve(playerIsIn[0].game);
				}
				else{
					this.bot.sendMessage(msg.channel, "Your play has been submitted!");
				}
			}
			else{
				this.bot.sendMessage(msg.channel, "Please put the number of the game you're playing at" +
					" the end of your command like this: \n !rock 2");
				this.status(msg, true);
			}
		}
	}
	else{
		this.bot.sendMessage(msg.channel, "You're not in any games!");
	}
}

RPSController.prototype.resolve = function(game){
	var string = "Saisho wa guu, jankenpon!\n"
	string += game.players[0].player.username + " played " + game.players[0].play.string + " and \n";
	string += game.players[1].player.username + " played " + game.players[1].play.string + ". \n";
	var winner = this.findWinner(game.players[0], game.players[1]);
	if(winner === 0){
		string += "It's a tie!";
	}
	else{
		string += winner.player.username + " is the winner!";
	}
	this.bot.sendMessage(game.channel, string);
	this.games.splice(this.games.indexOf(game), 1);
}

RPSController.prototype.findWinner = function(player1, player2){
	if(player1.play.value === player2.play.value){
		return 0;
	}
	else if(player1.play.value % 3 + 1 === player2.play.value){
		return player2;
	}
	else{
		return player1;
	}
}

module.exports = RPSController;