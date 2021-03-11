const events = require("./events.json");
module.exports = (socket, io, redisClient) =>{
    socket.on(events.SEND_CHAT_MESSAGE,async msgData=>{
		console.log("in server sending chat",msgData);
		const round = await redisClient.get(msgData.roomId+"round");
		const word = await redisClient.hget(msgData.roomId+"word",round);
		console.log(word);
		let matchWord = word.toUpperCase();
		let test = msgData.msg.toUpperCase();
		if(test.includes(matchWord)) {
			const isDone = await redisClient.hget(msgData.roomId+"scores",msgData.userId+"done");
			if(!isDone){
				let newScore = await redisClient.hget(msgData.roomId+"scores",msgData.userId);
				newScore = parseInt(newScore)+10;
				await redisClient.hset(msgData.roomId+"scores",msgData.userId, newScore);
				await redisClient.hset(msgData.roomId+"scores",msgData.userId+"done", true);
			}
		}
		io.in(msgData.roomId).emit(events.DISPLAY_CHAT_MESSAGE,msgData);
	});
}

