socket = io(`http://localhost:3000/`);
const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
	let userId;
	if(userInfo == null){
		userId = uuidv1();
		sessionStorage.setItem("userInfo",JSON.stringify({
			userId: userId,
			roomId: roomId,
            admin: isAdmin,
		}));
		socket.emit("joined lobby", {roomId: roomId, userId: userId, admin: isAdmin});
	} else {
		socket.emit("joined lobby", userInfo);
	}
socket.on("user joined lobby", lobbyInfo =>{
    if(isAdmin) addStartButton();
    const playersPane = document.getElementById("lobby-players");
    playersPane.innerHTML = "";
    console.log(lobbyInfo.users);
    lobbyInfo.users.forEach( user => {
        addPlayerTo(user,playersPane,lobbyInfo);
    })
});
function addPlayerTo (user, playersPane,lobbyInfo) {
	let newplayer = document.createElement("div");
	let col = document.createElement("div");
    if(user==lobbyInfo.adminId) newplayer.innerHTML = user+" (admin)";
	else newplayer.innerHTML= user;
	newplayer.classList.add("lobby-players");
	col.classList.add("col-11");
	col.appendChild(newplayer);
	playersPane.appendChild(col);
}
function addStartButton(){
    const controlPane = document.getElementById("control-pane");
    if(document.querySelector("#start-button")) return;
    const startButton = document.createElement("button");
    startButton.innerHTML = "START";
    startButton.id = "start-button";
    startButton.classList.add("start-button");
    controlPane.appendChild(startButton);
}
