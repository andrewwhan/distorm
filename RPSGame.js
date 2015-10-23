function RPSGame(msg, player2){
	this.players = [{"player": msg.sender, "play": 0}, {"player": player2, "play": 0}];
	this.channel = msg.channel;
}

RPSGame.prototype.containsPlayer = function(player){
	// console.log(this.players[0].player.id + " " + this.players[1].player.id + " " + player.id);
	if(this.players[0].player.id === player.id){
		return 0;
	}
	if(this.players[1].player.id === player.id){
		return 1;
	}
	return -1;
}

//In this game, set the given play for player. If the opponent has also played, 
//return true indicating the game is over
RPSGame.prototype.play = function(player, play){
	var playerSlot = this.containsPlayer(player);
	var opponentSlot = playerSlot === 0 ? 1 : 0;
	this.players[playerSlot].play = play;
	return this.players[opponentSlot].play !== 0;
}

module.exports = RPSGame;