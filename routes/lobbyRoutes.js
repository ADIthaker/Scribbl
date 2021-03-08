const express = require("express");
const router = express.Router();
const redisClient  = require("../config/redis");
const crypto = require("crypto");
const querystring = require('querystring'); 

router.get("/createroom",(req,res,next) => {
	let val = crypto.randomBytes(16).toString("hex");
	const adminVal = querystring.stringify({
		"isadmin": true,
	})
	res.redirect(`/lobby/${val}/?`+adminVal);
});

module.exports = router;