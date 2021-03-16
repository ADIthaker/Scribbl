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
			username
		}));
		socket.emit("USER_JOINED_LOBBY", {roomId, userId, admin: isAdmin,username});
	} else {
		socket.emit("USER_JOINED_LOBBY", userInfo);
	}
socket.on("user joined lobby", lobbyInfo =>{
    if(isAdmin) addStartButton(roomId);
    const playersPane = document.getElementById("lobby-players");
    playersPane.innerHTML = "";
    console.log(lobbyInfo.users);
    lobbyInfo.users.forEach( user => {
        addPlayerTo(user,playersPane,lobbyInfo);
    })
});
socket.on("admin changed",lobbyInfo => {
	removeStartButton();
	if(userId==adminId) addStartButton(roomId);
	const playersPane = document.getElementById("lobby-players");
    playersPane.innerHTML = "";
    console.log(lobbyInfo.users);
    lobbyInfo.users.forEach( user => {
        addPlayerTo(user,playersPane,lobbyInfo);
    })
})
socket.on("GO_TO_GAME",(roomId)=>{
	window.location.href = "/room/"+roomId;
})
function addPlayerTo (user, playersPane,lobbyInfo) {
	console.log(lobbyInfo);
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
    if(user==lobbyInfo.adminId) newplayer.innerHTML = lobbyInfo.usernames[user]+" (admin)";
	else newplayer.innerHTML= lobbyInfo.usernames[user];
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
		socket.emit("START_GAME", roomId);
	});
}
function removeStartButton(){
	const startButton = document.getElementById("start-button");
	if(startButton!=null) startButton.remove();
}

