const events = require("./events.json");
module.exports = (socket, io, redisClient) =>{
    socket.on(events.USER_JOINED_LOBBY, data=>{
		socket.data = data;
		socket.join(data.roomId);
		redisClient.lpush(data.roomId,socket.data.userId)
		.then(res => {
			console.log(`${data.userId} joined lobby ${data.roomId}`,"\n\n");
		});
		redisClient.hset(socket.data.roomId+"names",data.userId,data.username)
		.then(res=> console.log(`${data.userId} set to ${data.username}`))
		if (socket.data.admin){
			redisClient.set(socket.data.roomId+"admin",socket.data.userId)
			.then(res =>{
				redisClient.lrange(socket.data.roomId,0,-1)
				.then(data => {
					redisClient.get(socket.data.roomId+"admin")
					.then(adminId=>{
						redisClient.hgetall(socket.data.roomId+"names")
						.then(usernames=>{
							let lobbyInfo = {
								adminId,
								users: data,
								usernames,
							};
							io.in(socket.data.roomId).emit("user joined lobby", lobbyInfo);
						})
						
						
					})
					
				});
			});
		}
		else {
			redisClient.lrange(socket.data.roomId,0,-1)
			.then(data => {
				redisClient.get(socket.data.roomId+"admin")
					.then(adminId=>{
						redisClient.hgetall(socket.data.roomId+"names")
						.then(usernames=>{
							let lobbyInfo = {
								adminId,
								users: data,
								usernames
							};
							io.in(socket.data.roomId).emit("user joined lobby", lobbyInfo);
						})
					})
			});
		}		
	});
	socket.on(events.START_GAME, async roomId => {
        try{
            const allPlayers = await redisClient.lrange(roomId,0,-1);
            for(let player of allPlayers){
                await redisClient.lpush(roomId+"gameq", player);
            } // check length here before letting them join
			
            io.in(roomId).emit(events.GO_TO_GAME, roomId);
        } catch(err){
            console.log(err);
        }
    });
    socket.on(events.USER_DISCONNECTED, async () => {
		try{
			let currParticipants = await redisClient.lrange(socket.data.roomId,0,-1);
			let newParticipants = currParticipants.filter(val=>{
				return val != socket.data.userId;
			});
			let usernames = await redisClient.hgetall(socket.data.roomId+"names");
			console.log(newParticipants,"players remaining after one guy left");
			if(newParticipants.length != 0 ) {
				let adminId = await redisClient.get(socket.data.roomId+"admin");
				if(adminId == socket.data.userId) {
					console.log("ADMIN HAS LEFT, MAKING A RANDOM USER ADMIN")
					adminId = newParticipants[Math.floor(Math.random()*newParticipants.length)];
					console.log(adminId);
					let lobbyInfo = {
						adminId,
						users: newParticipants,
						usernames
					}
					await redisClient.set(socket.data.roomId+"admin",adminId);
					io.in(socket.data.roomId).emit("admin changed",lobbyInfo);
				}
				redisClient
				.pipeline()
				.del(socket.data.roomId)
				.lpush(socket.data.roomId,newParticipants)
				.exec((err,res)=>{
					if (err) throw new Error(err);
					console.log(newParticipants,"updated room after player left",res,"\n\n");
				});
				redisClient.lrange(socket.data.roomId,0,-1)
				.then(data => {
					let lobbyInfo = {
						adminId,
						users:data,
						usernames
					}
					io.in(socket.data.roomId).emit("user joined lobby", lobbyInfo);
					io.in(socket.data.roomId).emit("SEND_ALL_USERS", lobbyInfo);
				});
			} else {
				await redisClient.del(socket.data.roomId);
				await redisClient.del(socket.data.roomId+"admin");
				await redisClient.del(socket.data.roomId+"word");
				console.log(`${socket.data.roomId} room cleared`);
			}
		} catch(err){
			console.log(err);
		}
	});
}