var Discord = require("discord.js");
var bot = new Discord.Client();
var AuthDetails = require("./auth.json");
var RPSModule = require("./RPSController.js");
var RPSController = new RPSModule(bot);

var games = {
	"cs": "Counter-Strike",
	"lol": "League of Legends",
	"tf2": "Team Fortress 2",
	"poe": "Path of Exile",
	"duo": "duo queue"
}

var commands = {
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
	},
	"roll": {
		usage: "<(x)d(y)> where x is the number of dice you're rolling and y is the number of sides",
		help: "Rolls dice and returns the result. Argument optional, rolls 1d6 by default",
		method: function(bot, msg, suffix){
			var count = 1;
			var sides = 6;
			if(suffix){
				var args = suffix.split("d");
				//TODO: Input validation here
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
	"pullanddeploy": {
        help: "bot will perform a git pull master and restart with the new code",
        method: function(bot,msg,suffix) {
            bot.sendMessage(msg.channel,"fetching updates...", function(error,sentMsg){
                console.log("updating...");
	            var spawn = require('child_process').spawn;
                var log = function(err,stdout,stderr){
                    if(stdout){console.log(stdout);}
                    if(stderr){console.log(stderr);}
                };
                var fetch = spawn('git', ['fetch']);
                fetch.stdout.on('data',function(data){
                    console.log(data.toString());
                });
                fetch.on("close",function(code){
                    var reset = spawn('git', ['reset','--hard','origin/master']);
                    reset.stdout.on('data',function(data){
                        console.log(data.toString());
                    });
                    reset.on("close",function(code){
                        var npm = spawn('npm', ['install']);
                        npm.stdout.on('data',function(data){
                            console.log(data.toString());
                        });
                        npm.on("close",function(code){
                            console.log("goodbye");
                            bot.sendMessage(msg.channel,"brb!",function(){
                                bot.logout(function(){
                                    process.exit();
                                });
                            });
                        });
                    });
                });
            });
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
                bot.sendMessage(msg.channel,info);
            }
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