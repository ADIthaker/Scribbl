socket = io(`http://localhost:3000/`);
const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	let userId;
	if(userInfo == null){
		userId = uuidv1();
		sessionStorage.setItem("userInfo",JSON.stringify({
			userId: userId,
			roomId: roomId,
			info: "lobbyInfo",
            admin: isAdmin,
		}));
		socket.emit("joined lobby", {roomId: roomId, userId: userId, admin: isAdmin});
	} else {
		socket.emit("joined lobby", userInfo);
	}
socket.on("user joined lobby", lobbyInfo =>{
    if(isAdmin) addStartButton(roomId);
    const playersPane = document.getElementById("lobby-players");
    playersPane.innerHTML = "";
    console.log(lobbyInfo.users);
    lobbyInfo.users.forEach( user => {
        addPlayerTo(user,playersPane,lobbyInfo.adminId);
    })
});
socket.on("admin changed",adminId => {
	if(userId==adminId) addStartButton(roomId);
	const playersPane = document.getElementById("lobby-players");
    playersPane.innerHTML = "";
    console.log(lobbyInfo.users);
    lobbyInfo.users.forEach( user => {
        addPlayerTo(user,playersPane,adminId);
    })
})
socket.on("go to game",(roomId)=>{
	window.location.href = "/room/"+roomId;
	
})
function addPlayerTo (user, playersPane,adminId) {
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
    if(user==adminId) newplayer.innerHTML = user+" (admin)";
	else newplayer.innerHTML= user;
	newplayer.classList.add("lobby-players");
	col.classList.add("col-11");
	col.appendChild(newplayer);
	playersPane.appendChild(col);
}
function addStartButton(roomId){
    const controlPane = document.getElementById("control-pane");
    if(document.querySelector("#start-button")) return;
    const startButton = document.createElement("button");
    startButton.innerHTML = "START";
    startButton.id = "start-button";
    startButton.classList.add("start-button");
    controlPane.appendChild(startButton);
	startButton.addEventListener("click",(e)=>{
		socket.emit("game started",roomId);
	});
}

