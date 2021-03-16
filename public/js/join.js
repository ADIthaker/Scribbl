const createRoomFn = ()=>{
    const modal = document.getElementById("create-room-modal");
    modal.style.display = "block";
}
const joinRoomFn = ()=>{
    let modal = document.getElementById("join-room-modal");
    modal.style.display = "block";
}
window.onload = ()=>{
    document.body.addEventListener("click",(e)=>{
        console.log(e.target.id);
        if(e.target.id==="create") {
            let modal = document.getElementById("create-room-modal");
            modal.style.display = "block";
            return;
        }
        if(e.target.id==="join") {
            let modal = document.getElementById("join-room-modal");
            modal.style.display = "block";
            return;
        }
        let el1 = document.getElementById("join-room-modal");
        let createForm = document.getElementById("create-form");
        let joinForm = document.getElementById("join-form");
        let el2 = document.getElementById("create-room-modal");
        if((e.target.id!=="create-form" && !createForm.contains(e.target)) && el2.style.display === "block"){
            el2.style.display = "none";
        }
        if((e.target.id!=="join-form" && !joinForm.contains(e.target)) && el1.style.display === "block"){
            el1.style.display = "none";
        }
    });

}
    
