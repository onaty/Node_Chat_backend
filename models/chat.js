const mongoose = require('mongoose');
// const config = require('../config/database');

var chatSchema = mongoose.Schema({

  msgFrom : {type:String,default:"",required:true},
  msgTo : {type:String,default:"",required:true},
  msg : {type:String,default:"",required:true},
  room : {type:String,default:"",required:true},
  createdOn : {type:Date,default:Date.now}

});

const Chat = module.exports = mongoose.model('Chat',chatSchema);
