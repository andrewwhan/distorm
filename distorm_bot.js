var Discord = require("discord.js");
var bot = new Discord.Client();
var AuthDetails = require("./auth.json");
var RPSModule = require("./RPSController.js");
var RPSController = new RPSModule(bot);

//Game abbreviations for use by !game
var games = {
	"cs": "Counter-Strike",
	"lol": "League of Legends",
	"tf2": "Team Fortress 2",
	"poe": "Path of Exile",
	"duo": "duo queue"
}

//List of commands with usage, help text, and the function they call
var commands = {
	"about": {
		help: "About this bot"
		method: function(bot, msg, suffix){
			bot.sendMessage(msg.channel, "This bot was created by Darkstorm. Source can be found at https://github.com/andrewwhan/distorm." + 
				" If you want to add to the project, lemme know and I'll add you as a contributor on the project.");
		}
	},
	"avatar": {
		usage: "<username>",
		help: "Retrieve the full avatar of the target user, leave blank to get your own",
		method: function(bot, msg, suffix){
			if(suffix){
				var target = bot.getUser("username", suffix);
				if(!target){
					target = bot.getUser("id", suffix);
				}
				if(target){
					bot.sendMessage(msg.channel, target.avatarURL);
				}
				else{
					bot.sendMessage(msg.channel, "Could not find user " + suffix);
				}
			}
			else{
				bot.sendMessage(msg.channel, msg.sender.avatarURL);
			}
		}
	},
	"game": {
		usage: "<name of game>",
		help: "Ask everyone if they want to play the specified game",
		method: function(bot, msg, suffix){
			var game = games[suffix];
			if(!game){
				game = suffix;
			}
			bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "?");
		}
	},
	"roll": {
		usage: "<(x)d(y)>",
		help: "Rolls dice where x is the number of dice you're rolling and y is the number of sides. Argument optional, rolls 1d6 by default",
		method: function(bot, msg, suffix){
			var count = 1;
			var sides = 6;
			if(suffix){
				var args = suffix.split("d");
				if(args[1]){
					if(!isNaN(args[0])){
						count = args[0];
					}
					if(!isNaN(args[1])){
						sides = args[1];
					}
				}
				else{
					if(!isNaN(args[0])){
						sides = args[0];
					}
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
	},
	"rps": {
		usage: "<opponent> or !rps status (global)",
		help: "Challenge an opponent to rock paper scissors or see the status of your/all rps games",
		method: function(bot, msg, suffix){
			var args = suffix.split(" ");
			if(args[0] === "status"){
				if(args[1] === "global"){
					RPSController.globalstatus();
				}
				else{
					RPSController.status(msg, true);
				}
			}
			else{
				var opponent = bot.getUser("username", suffix);
				if(!opponent){
					opponent = bot.getUser("id", suffix);
				}
				if(opponent){
					RPSController.startGame(msg, opponent);
				}
				else{
					bot.sendMessage(msg.channel, "Could not find user " + suffix);
				}
			}
		}
	},
	"rock":{
		usage: "<gameid>",
		help: "Play rock in rock paper scissors",
		method: function(bot, msg, suffix){
			RPSController.play(RPSController.plays.ROCK, msg, suffix);
		}
	},
	"paper":{
		usage: "<gameid>",
		help: "Play paper in rock paper scissors",
		method: function(bot, msg, suffix){
			RPSController.play(RPSController.plays.PAPER, msg, suffix);
		}
	},
	"scissors":{
		usage: "<gameid>",
		help: "Play scissors in rock paper scissors",
		method: function(bot, msg, suffix){
			RPSController.play(RPSController.plays.SCISSORS, msg, suffix);
		}
	},
    "version": {
        help: "returns the git commit this bot is running",
        method: function(bot,msg,suffix) {
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
    },
    "log": {
        usage: "<log message>",
        help: "logs message to bot console",
        method: function(bot,msg,suffix){console.log(msg.content);}
    }
}

bot.on("ready", function () {
	console.log("Starting up in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
	
});

bot.on("message", function(msg){

    //drop our own messages to prevent feedback loops
	if(msg.author.id == bot.user.id){
		return;
	}

	//Check to see if this is a ! command
	if(msg.content[0] === "!"){
		//Get the command by taking the first token and grabbing everything after the !
		var cmdTxt = msg.content.split(" ")[0].substring(1);
		var suffix = msg.content.substring(cmdTxt.length+2);
		var cmd = commands[cmdTxt];
		//Display help for commands
		if(cmdTxt === "help"){
			var string = "";
            //help is special since it iterates over the other commands
            for(var cmd in commands) {
                var info = "!" + cmd;
                var usage = commands[cmd].usage;
                if(usage){
                    info += " " + usage;
                }
                var help = commands[cmd].help;
                if(help){
                    info += "\n\t" + help;
                }
                string += info + "\n";
            }
            bot.sendMessage(msg.channel, string);
        }
        else if(cmd) {
            cmd.method(bot,msg,suffix);
		}
		else {
        	bot.sendMessage(msg.channel, "Invalid command " + cmdTxt);
        } 
	}
});

bot.login(AuthDetails.email, AuthDetails.password);