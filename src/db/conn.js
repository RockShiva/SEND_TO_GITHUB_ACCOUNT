const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/GOOGLE_ACCOUNT", {useNewUrlParser:true}).then(()=>{
	console.log("Connected");
}).catch(()=>{
	console.log("Not connected");
});