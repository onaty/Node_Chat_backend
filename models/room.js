const mongoose = require('mongoose');
const config = require('../config/database');

 const RoomSchema =mongoose.Schema({

  name1 : {type:String,default:"",required:true},
  name2 : {type:String,default:"",required:true},
  members : [],
  lastActive : {type:Date,default:Date.now},
  createdOn : {type:Date,default:Date.now}

});

const Room = module.exports = mongoose.model('Room',  RoomSchema);
