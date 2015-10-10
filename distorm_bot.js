var Discord = require("discord.js");
var bot = new Discord.Client();
var AuthDetails = require("./auth.json");
var RPSModule = require("./RPSController.js");
var RPSController = new RPSModule(bot);

bot.on("ready", function () {
	console.log("Starting up in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
	
});

bot.on("message", function(msg){

    //drop our own messages to prevent feedback loops
	if(msg.author == bot.user){
		return;
	}

	//Break up the arguments
	//TODO: Smarter split command to stick quoted things together and eliminate quotes"
	var args = msg.content.split(" ");

	//Check to see if this is a ! command
	if(msg.content.substring(0, 1) === "!"){

		//Ask everyone in the channel if they want to play something
		if (args[0] === "!game") {
			args.shift();
			args = args.join(" ");
			var game = args;
			if(game === "cs"){
				game = "Counter-Strike";
			}
			else if(game === "lol"){
				game = "League of Legends"
			}
			else if(game === "tf2"){
				game = "Team Fortress 2"
			}
			else if(game === "poe"){
				game = "Path of Exile"
			}
			else if(game === "duo"){
				game = "duo queue"
			}

			bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "?");
			console.log("sent game invites for " + game);
		}

		//Start a rock paper scissors game with someone
		else if(args[0] === "!rps"){
			if(args[1] === "status"){
				if(args[2] === "global"){
					RPSController.globalstatus();
				}
				else{
					RPSController.status(msg.sender);
				}
			}
			else{
				var opponent = bot.getUser("username", args[1]);
				if(!opponent){
					opponent = bot.getUser("id", args[1]);
				}
				if(opponent){
					RPSController.startGame(msg.sender, opponent);
				}
				else{
					bot.sendMessage(msg.channel, "Could not find user " + args[1]);
				}
			}

		}

		//Roll dice
		else if(args[0] === "!roll"){
			var count = 1;
			var sides = 6;
			if(args[1]){
				args = args[1].split("d");
				//TODO: Input validation here
				if(args[1]){
					count = args[0];
					sides = args[1];
				}
				else{
					sides = args[0];
				}
			}
			var rolls = [];
			var total = 0;
			for(var i = 0; i<count; i++){
				var die = Math.floor(Math.random() * sides + 1)
				rolls.push(die);
				total += die;
			}
			var str = msg.sender.username + " rolled " + count + "d" + sides + " and got " + total + ". ";
			if(count > 1){
				str += "(";
				for(var i = 0; i<rolls.length; i++){
					if(i != 0){
						str += "+";
					}
					str += rolls[i];
				}
				str += ")";
			}
			bot.sendMessage(msg.channel, str);
		}

		//Echo what was said
		else if(args[0] === "!say") {
			args.shift();
			bot.sendMessage(msg.channel, args);
		}

		//Pull latest master and restart server
		else if(args[0] === "!pullanddeploy") {
			bot.sendMessage(msg.channel,"Restarting server!",
				function(error,sentMsg){
					console.log("updating...");
		            var spawn = require('child_process').spawn;
					spawn('sh', [ 'pullanddeploy.sh' ]).on("close",function(code){
						console.log("exiting");
						process.exit();
					});
				});
		}

		//Display version from git log
		else if(args[0] === "!version") {
			var commit = require('child_process').spawn('git', ['log','-n','1']);
			commit.stdout.on('data', function(data) {
				bot.sendMessage(msg.channel,data);
			});
			commit.on('close',function(code) {
				if( code != 0){
					bot.sendMessage(msg.channel,"failed checking git version!");
				}
			});
		}

		//Display help for commands
		else if(args[0] === "!help"){
			bot.sendMessage(msg.channel, "Placeholder help text!");
		}

		//Send contents to console log
		else if(args[0] === "!log") {
			args.shift();
			console.log(args);
		}
		else{
			bot.sendMessage(msg.channel, "Unrecognized ! command. See !help for a list of commands");
		}
	}

});

bot.login(AuthDetails.email, AuthDetails.password);