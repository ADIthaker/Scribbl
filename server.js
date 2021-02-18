const http = require('http')
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const session = require('express-session');
const app = express();
const redis = require("redis");
var store = require("connect-redis")(session);
const redisClient = redis.createClient();

redisClient.on("error", function(error) {
  console.error(error);
});

app.set('port', '3000');
app.set('views', path.join(__dirname, 'views')) ;
app.set('view engine', 'ejs');

const server = http.createServer(app);
server.on('listening', () => {
 console.log('Listening on port 3000 \nGO to http://localhost:3000/')
});
const io = require('socket.io')(server);
const sessionMiddleware = session({
    store: new store({client: redisClient}), // XXX redis server config
    secret: "keyboard cat",
	resave: false,
    saveUninitialized: true,
});

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next);
});

app.use(sessionMiddleware);


app.get('/',(req,res,next)=>{
	res.render('new.ejs');
});

app.get('/createroom',(req,res,next) => {
	let val = crypto.randomBytes(16).toString('hex');
	res.redirect(`/room/${val}`);
});
app.get('/room/:roomId',(req,res,next)=>{
	res.render('index.ejs',{roomId:req.params.roomId});
});
app.use('/public',express.static('public'));

// Web sockets

let participants = [];
io.on('connection', (socket) => {
	
	
	socket.on('connected_to_room',data=>{
		socket.join(data.roomId);
		socket.request.session.user = {
			id: data.userId ,
			roomId : data.roomId,
		}
		console.log(`${data.userId} joined room ${data.roomId}`);
		participants.push(data.userId);
		console.log(participants);
	});
	socket.on("user_rejoined", data=>{
		console.log(`${data.userId} rejoined room ${data.roomId}`);
		console.log(socket.request.session);
		socket.request.session.user = {
			id: data.userId ,
			roomId : data.roomId,
		}
		participants.push(data.userId);
		console.log(participants);
	});

	socket.on('mouse', (data) => socket.broadcast.emit('mouse', data))

	socket.on('disconnect', () => {
		console.log(`${socket.request.session.user.id} has left`);
		participants = participants.filter((val)=>{
			return val != socket.request.session.user.id
		});
	});
})

server.listen('3000');