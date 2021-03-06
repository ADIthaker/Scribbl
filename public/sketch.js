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
	let userId;
	if(userInfo == null){
		userId = uuidv1();
		sessionStorage.setItem("userInfo",JSON.stringify({
			userId: userId,
			roomId: roomId,
		}));
		socket.emit("connected_to_room", {roomId: roomId, userId: userId});
	} else {
		socket.emit("connected_to_room", userInfo);
	}
	socket.on("all_players", users => {
		const playersPane = document.getElementById("player-pane");
		playersPane.innerHTML = "";
		users.forEach( user => {
			addPlayerTo(user,playersPane);
		})
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
	line(mouseX, mouseY, pmouseX, pmouseY);
	sendmouse(mouseX, mouseY, pmouseX, pmouseY)
}

function addPlayerTo (name, playersPane) {
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
	newplayer.innerHTML= "Aditya";
	newplayer.classList.add("lobby-players");
	col.classList.add("col-12");
	col.appendChild(newplayer);
	playersPane.appendChild(col);
}

function utilityButton (){

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