let socket;
let color = '#000';
let strokeWidth = 4;
function setup() {
	// Creating canvas
	const cv = createCanvas(600, 600);
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
		});
	});
	socket.on('mouse', data => {
		stroke(data.color);
		strokeWeight(data.strokeWidth)
		line(data.x, data.y, data.px, data.py);
	});
	// Getting our buttons and the holder through the p5.js dom
	const color_picker = select('#pickcolor');
	const color_btn = select('#color-btn');
	const color_holder = select('#color-holder');

	const stroke_width_picker = select('#stroke-width-picker');
	const stroke_btn = select('#stroke-btn');

	// Adding a mousePressed listener to the button
	color_btn.mousePressed(() => {
		// Checking if the input is a valid hex color
		if (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color_picker.value())) {
			color = color_picker.value();
			color_holder.style('background-color', color);
		}
		else {console.log('Enter a valid hex value')}
	})

	// Adding a mousePressed listener to the button
	stroke_btn.mousePressed(() => {
		const width = parseInt(stroke_width_picker.value())
		if (width > 0) strokeWidth = width
	})
}


function mouseDragged() {
	// Draw
	stroke(color)
	strokeWeight(strokeWidth)
	line(mouseX, mouseY, pmouseX, pmouseY)

	// Send the mouse coordinates
	sendmouse(mouseX, mouseY, pmouseX, pmouseY)
}

function addPlayerTo (name, playersPane) {
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
	newplayer.innerHTML= name;
	newplayer.classList.add("player-tab");
	col.classList.add("col-12");
	col.appendChild(newplayer);
	playersPane.appendChild(col);
	
}
// Sending data to the socket
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