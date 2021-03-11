const http = require("http")
const express = require("express");
const path = require("path");
const app = express();
const redis = require('socket.io-redis');
const lobbyRoutes = require("./routes/lobbyRoutes");
const redisClient = require("./config/redis");

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
app.get("/lobby/:roomId",(req, res, next)=>{
	console.log("admin",req.query.isadmin);
	res.render("lobby.ejs",{roomId:req.params.roomId,admin:req.query.isadmin});
});
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

	require("./events/lobby")(socket, io, redisClient);
	require("./events/room")(socket, io, redisClient);
	require("./events/chat")(socket, io, redisClient);


	socket.on("mouse", data => {
		socket.to(data.roomId).emit("mouse", data);
	});	

	
})