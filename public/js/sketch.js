let socket;
let color = '#000';
let strokeWidth = 4;
function setup() {
	// Creating canvas
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
		socket.emit("connect and get room info", {roomId,userId:userInfo.userId,isAdmin:userInfo.admin});
	}
	socket.on("all_players", lobbyInfo => {
		console.log(lobbyInfo);
		if(lobbyInfo.adminId == lobbyInfo.userId) socket.emit("start round",lobbyInfo);
		const playersPane = document.getElementById("player-pane");
		playersPane.innerHTML = "";
		lobbyInfo.users.forEach( user => {
			addPlayerTo(user,playersPane);
		});
		
	});
	socket.on("round started", gameState => {
		console.log(gameState);
		sessionStorage.setItem("gameState",JSON.stringify(gameState));
	});
	socket.on("display chat msg",msgData => {
		console.log("got it here",msgData)
		addMsgToChatBox(msgData);
	});
	socket.on('mouse', data => {
		stroke(data.color);
		strokeWeight(data.strokeWidth)
		line(data.x, data.y, data.px, data.py);
	});
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
	const gameState = JSON.parse(sessionStorage.getItem("gameState"));
	const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	if(gameState!=null && (gameState.currentPlayer == userInfo.userId)){
		stroke(color)
		strokeWeight(strokeWidth)
		line(mouseX, mouseY, pmouseX, pmouseY)

		sendmouse(mouseX, mouseY, pmouseX, pmouseY)
	} else {
		return;
	}
	
}

function takeChatMessage(){
	const gameState = JSON.parse(sessionStorage.getItem("gameState"));
	const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	const chatInput = document.getElementById("chat-input");
	chatInput.addEventListener("keyup",(event)=>{
		if(event.key=="Enter"){
			data = {
				roomId : userInfo.roomId,
				userId : userInfo.userId,
				msg: event.target.value,
			}
			event.target.value="";
			socket.emit("sending chat msg",data);
		}
	})
}
function addMsgToChatBox(msgData){
	const chatBox = document.getElementById("chat-box");
	const newMsg = document.createElement("div");
	newMsg.innerHTML = msgData.userId + " : " + msgData.msg;
	chatBox.appendChild(newMsg);
}

function addPlayerTo (name, playersPane) {
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
	newplayer.innerHTML= "Aditya";
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