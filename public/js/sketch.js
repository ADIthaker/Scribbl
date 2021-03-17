let socket;
let color = '#000';
let strokeWidth = 4;
let duration = 59;

function setup() {
	const cv = createCanvas(620, 600);
	cv.position(0,0);
	cv.background(255,255,255);
	cv.style('border','1px solid black');
	cv.parent("canvas-parent");
	cv.class('drawing-board');

	socket = io(`http://localhost:3000/`);
	const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	if(userInfo == null){
		window.location.href = "/";
	} else {
		socket.emit("CONNECT_ROOM", {roomId,userId:userInfo.userId,isAdmin:userInfo.admin});
	}

	socket.on("SEND_ALL_USERS", lobbyInfo => {
		console.log(lobbyInfo);
		const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
		const gameState = sessionStorage.getItem("gameState");
		console.log(gameState,"checking gamestate when sending userinfo")
		if(userInfo.admin && gameState==null) socket.emit("START_ROUND",lobbyInfo.roomId); 
		const playersPane = document.getElementById("player-pane");
		playersPane.innerHTML = "";
		lobbyInfo.users.forEach( user => {
			addPlayerTo(user, playersPane,lobbyInfo);
		});
	});
//everytime someone new joins room sendall users is triggered and will always trigger start round because sendallusers is sent to every user
	socket.on("DISPLAY_CHAT_MESSAGE", msgData => {
		console.log("got it here",msgData)
		addMsgToChatBox(msgData);
	});

	socket.on("ROUND_STARTED", gameState => {
		console.log("ROUND STARTED");
		sessionStorage.setItem("gameState",JSON.stringify(gameState));
		const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
		startTimer();
		let timer = setInterval(()=>{
			if(duration > 0){
				duration--;
			const timer = document.getElementById("timer");
			console.log(duration);
			if(duration < 10){
				timer.innerHTML = "00:0"+duration ;
			} else timer.innerHTML = "00:"+duration ;
			} else{
				clearInterval(timer);
				console.log("TIMER ENDED");
				socket.emit("END_ROUND", gameState);
			}			
		},1000);
		if(userInfo.userId == gameState.currentPlayer) {
			showWord(gameState.randomWord);
		}
		
	});


	socket.on('mouse', data => {
		stroke(data.color);
		strokeWeight(data.strokeWidth)
		line(data.x, data.y, data.px, data.py);
	});

	socket.on("SHOW_SCORES",roomId=>{
		window.location.href="/scores/"+roomId;
		sessionStorage.removeItem("gameState");
		sessionStorage.removeItem("userInfo");
	})

	const colorPickers = document.getElementsByClassName("color-sel");
	for(let i=0;i<colorPickers.length;i++){

		colorPickers[i].addEventListener("click", function assignColor(e){
			color = window.getComputedStyle(colorPickers[i]).backgroundColor;
			sessionStorage.setItem("color",window.getComputedStyle(colorPickers[i]).backgroundColor);
		});	
	}
	const cleanButton = select(".clear-button");
	const eraser = select(".eraser");
	const pen = select(".pen");
	eraser.mousePressed(()=>{
		color = "#fff";
		eraser.style("border","5px solid #4243DC");
		pen.style("border","3px solid rgb(255, 240, 0)");
		cv.removeClass("pen-on");
		cv.addClass("eraser-on");		
	})
	takeChatMessage();
	pen.mousePressed(()=>{
		color = sessionStorage.getItem("color");
		eraser.style("border","3px solid rgb(255, 240, 0)");
		pen.style("border","5px solid #4243DC");
		cv.removeClass("eraser-on");
		cv.addClass("pen-on");
	})
	cleanButton.mousePressed(()=>{
		cv.background(255,255,255)
	});
	const strokeInp = select("#stroke-weight");
	strokeWidth = 3;
	strokeInp.input(()=>{
		strokeWidth = strokeInp.value();
	})
}


function mouseDragged() {
		stroke(color)
		strokeWeight(strokeWidth)
		line(mouseX, mouseY, pmouseX, pmouseY)

		sendmouse(mouseX, mouseY, pmouseX, pmouseY)
}

function takeChatMessage(){

	const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	const chatInput = document.getElementById("chat-input");
	chatInput.addEventListener("keyup",(event)=>{
		if(event.key=="Enter"){
			data = {
				roomId : userInfo.roomId,
				userId : userInfo.userId,
				msg: event.target.value,
				username: userInfo.username
			}
			event.target.value="";
			socket.emit("SEND_CHAT_MESSAGE",data);
		}
	})
}
let startTimer = ()=>{
	const timer = document.getElementById("timer");
	timer.innerHTML = "00:"+duration;
}
	
function addMsgToChatBox(msgData){
	const chatBox = document.getElementById("chat-box");
	const newMsg = document.createElement("div");
	newMsg.innerHTML = "<b>"+ msgData.username+"</b>" + " : " + msgData.msg;
	chatBox.appendChild(newMsg);
}

function addPlayerTo (user, playersPane,lobbyInfo) {
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
	newplayer.innerHTML= lobbyInfo.usernames[user];
	newplayer.classList.add("player-tab");
	col.classList.add("col-12");
	col.appendChild(newplayer);
	playersPane.appendChild(col);
}

function sendmouse(x, y, pX, pY) {
	let userId = JSON.parse(sessionStorage.getItem("userInfo")).userId;
	let roomId = JSON.parse(sessionStorage.getItem("userInfo")).roomId;
	const data = {
		userId,
		roomId,
		x: x,
		y: y,
		px: pX,
		py: pY,
		color: color,
		strokeWidth: strokeWidth,
	}

	socket.emit('mouse', data)
}

function showWord(word){
	const drawingBoard = document.getElementById("canvas-parent");
	const title = document.getElementById("title-word");
	title.innerHTML = word;
	title.classList.add("guess-word");
	drawingBoard.appendChild(title);
}