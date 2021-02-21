const express = require("express");
const router = express.Router();
const redisClient  = require("../config/redis");
const crypto = require("crypto");

router.get("/createroom",(req,res,next) => {
	let val = crypto.randomBytes(16).toString("hex");
	res.redirect(`/room/${val}`);
});



module.exports = router;