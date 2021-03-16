const events = require("./events.json");
const things = ["CAT","DOG","PLANE","CAR","MAN"];
module.exports = (socket, io, redisClient) =>{
    socket.on(events.CONNECT_ROOM, async data =>{
		socket.data = data;
		console.log(data);
		socket.join(data.roomId);
        try{
            await redisClient.lpush(data.roomId, socket.data.userId);
            console.log(`${data.userId} joined room ${data.roomId}`,"\n\n");
            if(data.isAdmin) await redisClient.set(data.roomId+"admin", data.userId);
            const adminId = await redisClient.get(data.roomId+"admin");
            await redisClient.hset(data.roomId+"scores",data.userId, 0);
            let usernames = await redisClient.hgetall(socket.data.roomId+"names");
            const allMembers = await redisClient.lrange(socket.data.roomId,0,-1);
            let lobbyInfo = {
                adminId: adminId,
                users: allMembers,
                roomId: data.roomId, 
                usernames
            };
            await redisClient.set(data.roomId+"round",0);
            io.in(socket.data.roomId).emit(events.SEND_ALL_USERS, lobbyInfo);

        } catch(err){
            console.log(err);
        }
	});
    socket.on(events.START_ROUND, async roomId=>{
        try{
            const gameQ = await redisClient.lrange(roomId+"gameq",0,-1);
            const currentPlayer = gameQ[0];
            gameQ.shift();
            gameQ.push(currentPlayer);
            await redisClient.set(roomId+"currentPlayer",currentPlayer);
            await redisClient.del(roomId+"gameq");
            for(let player of gameQ){
                await redisClient.lpush(roomId+"gameq", player);
            }
		    const randomWord = things[Math.floor(Math.random()*things.length)];
            console.log("SETTED A RANDOM WORD",randomWord);
            const round = await redisClient.get(roomId+"round");
            await redisClient.hset(roomId+"word",round , randomWord);            
            let gameState = {
                roomId,
                currentPlayer,
                randomWord,
            }
            io.in(roomId).emit(events.ROUND_STARTED, gameState);
        } catch (err){  
            console.log(err);
        }
    });// dont use the lobbyInfo.users field at the end of the round its not up-to-date because it saves no of users joined before the user designated to draw first
    socket.on(events.END_ROUND, async gameState => {
        try{
            // let round = await redisClient.get(gameState.roomId+"round");
            // round++;
            // await redisClient.set(gameState.roomId+"round",round);
            const players = await redisClient.lrange(gameState.roomId,0,-1);
            console.log(players);
            for(let player of players){
                let score = await redisClient.hget(gameState.roomId+"scores",player);
                console.log(`${player} scored ${score} points!!\n`);
            }
            await redisClient.del(gameState.roomId+"currentPlayer");
        } catch (err){  
            console.log(err);
        }
    });
}