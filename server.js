const http = require("http")
const express = require("express");
const crypto = require("crypto");
const path = require("path");
const app = express();
const redis = require('socket.io-redis');
const lobbyRoutes = require("./routes/lobbyRoutes");
const redisClient = require("./config/redis");
const bodyParser = require("body-parser")

redisClient.on("error", function(error) {
	console.error(error);
});

app.set("port", "3000");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/",(req,res,next)=>{
	res.render("new.ejs");
});

app.use(lobbyRoutes);
app.get("/room/:roomId",(req,res,next)=>{
	res.render("index.ejs",{roomId:req.params.roomId});
});
app.use("/public",express.static("public"));

const server = http.createServer(app);
server.on("listening", () => {
 console.log("Listening on port 3000 \nGO to http://localhost:3000/")
});
const io = require("socket.io")(server);

server.listen("3000");
io.adapter(redis({ host: "127.0.0.1", port: 6379 }));
io.on("connection", (socket) => {
	socket.on("connected_to_room", (data)=>{
		socket.data = data;
		socket.join(data.roomId);
		redisClient.sadd(data.roomId,socket.data.userId)
		.then(res=>{
			console.log(`${data.userId} joined room ${data.roomId}`,"\n\n");
		});
		redisClient.smembers(socket.data.roomId)
		.then(data => {
			io.in(socket.data.roomId).emit("all_players", data);
		});
	});
	socket.on("mouse", data => {
		socket.to(data.roomId).emit("mouse", data);
	});
	socket.on("disconnect", async () => {
		try{
			let currParticipants = await redisClient.smembers(socket.data.roomId);
			let newParticipants = currParticipants.filter(val=>{
				return val != socket.data.userId;
			});
			if(newParticipants.length != 0 ) {
				redisClient
				.pipeline()
				.del(socket.data.roomId)
				.sadd(socket.data.roomId,newParticipants)
				.exec((err,res)=>{
					if (err) throw new Error(err);
					console.log(newParticipants,"updated room after player left",res,"\n\n");
				});
				redisClient.smembers(socket.data.roomId)
				.then(data => {
					io.in(socket.data.roomId).emit("all_players", data);
				});
			} else {
				await redisClient.del(socket.data.roomId);
				console.log(`${socket.data.roomId} room cleared`);
			}
			
		} catch(err){
			console.log(err);
		}
	});
})