const http = require('http')
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const app = express();

app.set('views', path.join(__dirname, 'views')) ;
app.set('view engine', 'ejs');

app.get('/',(req,res,next)=>{
	res.render('new.ejs');
});

app.get('/createroom',(req,res,next) => {
	let val = crypto.randomBytes(16).toString('hex');
	res.redirect(`/room/${val}`);
});
app.get('/room/:roomId',(req,res,next)=>{
	console.log(req.params.roomId);
	res.render('index.ejs',{roomId:req.params.roomId});
});
app.use('/public',express.static('public'));
app.set('port', '3000');

const server = http.createServer(app);
server.on('listening', () => {
 console.log('Listening on port 3000 \nGO to http://localhost:3000/')
})

// Web sockets
const io = require('socket.io')(server)

io.on('connection', (socket) => {
	console.log('Client connected: ' + socket.id)

	socket.on('mouse', (data) => socket.broadcast.emit('mouse', data))

	socket.on('disconnect', () => console.log('Client has disconnected'))
})

server.listen('3000')