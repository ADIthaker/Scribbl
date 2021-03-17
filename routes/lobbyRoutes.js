const express = require("express");
const router = express.Router();
const redisClient  = require("../config/redis");
const crypto = require("crypto");
const querystring = require('querystring'); 

router.post("/createroom",async (req,res,next) => {
	const {name} = req.body;
	let val = crypto.randomBytes(16).toString("hex");
	const qstring = querystring.stringify({
		"isadmin": true,
		"name": name
	})
	res.redirect(`/lobby/${val}/?`+qstring);
});
router.post("/joinroom", async (req,res,next) => {
	const {name,room_id} = req.body;
	const qstring = querystring.stringify({
		"name": name
	});
 	res.redirect(`/lobby/${room_id}/?`+qstring);
});
router.get("/scores/:roomId",async (req,res,next)=>{
	const scores = await redisClient.hgetall(req.params.roomId+"scores");
	const usernames = await redisClient.hgetall(req.params.roomId+"names");
	console.log(req.params.roomId);
	res.render("scoreboard",{scores,usernames});
});

module.exports = router;