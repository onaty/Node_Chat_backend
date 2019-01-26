// //    cd documents/projects/meanchat
// //     cd documents/projects/meanchat/chatfront
//  ng add @ng-bootstrap/schematics
//                       chrome.exe --user-data-dir="C://Chrome dev session" --disable-web-security
const express = require('express');
var app = require('express')();
const path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const cors = require('cors');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const Room = require('./models/room');
const Chat = require('./models/Chat');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var _ = require('lodash');
const port=process.env.PORT||8080;
mongoose.connect(config.database);
//on conection
mongoose.connection.on('connected', () => {
  console.log('connected to database:-   ' + config.database + ' mitches');
});

//on conection
mongoose.connection.on('err', (err) => {
  console.log('database error:-   ' + err);
});







app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// var store = new MongoDBStore({
//   uri: 'mongodb://onaty:onaty@cluster0-shard-00-00-mhmoo.mongodb.net:27017,cluster0-shard-00-01-mhmoo.mongodb.net:27017,cluster0-shard-00-02-mhmoo.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',
//   databaseName: 'chatapp',
//   collection: 'mySessions'
// });
// app.use(require('express-session')({
//   secret: 'This is a secret',
//   unset: 'destroy',
//   cookie: {
//     maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
//   },
//   store: store,
//   resave: true,
//   saveUninitialized: true
// }));





const users = require('./routes/users');


app.use(cors());

app.use(cors({
  origin: ["http://192.168.0.100:4200"]
}));
app.use(cors({
  origin: ["http://192.168.0.100:4200"],
  credentials: true
}));

app.use('/users', users);



app.use(logger('dev'));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//set static folder
app.use(express.static(path.join(__dirname, 'images')));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.send('its home');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');

  next();
});


server.listen(port, () => {
  console.log('Server started on port 3000');
});


var userSocket = {};

io.on('connection', function(socket) {
  socket.username;

  console.log('a new connection');
  console.log(socket.id);

  socket.on('loggedin', function(username) {

    //storing variable.
    socket.username = username;
    userSocket[socket.username] = socket.id;
    console.log(userSocket[socket.username]);
    console.log('the log book');

  });

  //setting room.
  socket.on('set-room', function(room) {
    //leaving room.
    socket.leave(socket.room);
    //getting room data.
    eventEmitter.emit('get-room-data', room);
    //setting room and join.
    setRoom = function(roomId) {
      socket.room = roomId;
      console.log("roomId : " + socket.room);
      socket.join(socket.room);
      console.log(userSocket);
      console.log(socket.id + 'this is socket id');
      console.log(userSocket[socket.username] + 'usersocket id');

      console.log('------------');

      io.in(userSocket[socket.username]).emit('room name', socket.room);
    };
  }); //end of set-room event.
  //

  socket.on('join', function(data) {
    friend = data.friend;
    //joining
    socket.join(data.room);
    console.log("conne");
    console.log(data.user + 'joined the room : ' + data.room);

    socket.broadcast.to(data.room).emit('new user joined', {
      user: data.user,
      message: 'you can now chat with' + data.friend
    });
  });



  //for sending and saving  chats.
  socket.on('chat-msg', function(data) {
    //emits event to save chat to database.
    console.log(data.msgTo + ' :-' + data.msg + ' _room_' + socket.room)
    eventEmitter.emit('save-chat', {
      msgFrom: socket.username,
      msgTo: data.msgTo,
      msg: data.msg,
      room: socket.room,
      date: data.date
    });
    //emits event to send chat msg to all clients.
    io.in(data.room).emit('chat-msgs', {
      msgFrom: socket.username,
      msg: data.msg,
      date: data.date
    });
  });





  socket.on('leave', function(data) {
    console.log("a user is leaving");
    console.log(data.user + 'left the room : ' + data.room);

    socket.broadcast.to(data.room).emit('left room', {
      user: data.user,
      message: 'has left this room.'
    });

    socket.leave(data.room);
  });

  socket.on('message', function(data) {

    io.in(data.room).emit('new message', {
      user: data.user,
      message: data.message
    });
  });
  //emits event to read old-chats-init from database.
  socket.on('old-chats-init', function(data) {
    eventEmitter.emit('read-chat', data);
  });

  //emits event to read old chats from database.
  socket.on('old-chats', function(data) {
    eventEmitter.emit('read-chat', data);
  });

  //sending old chats to client.
  oldChats = function(result, username, room) {
    io.to(userSocket[username]).emit('old-chats', {
      result: result,
      room: room
    });
  }



  //for popping disconnection message.
  socket.on('disconnect', function() {

    console.log(socket.username + "  logged out");
    //  socket.broadcast.emit('broadcast',{ description: socket.username + ' Logged out'});



    console.log("chat disconnected.");

    _.unset(userSocket, socket.username);
    //  userStack[socket.username] = "Offline";
    //
    //  ioChat.emit('onlineStack', userStack);
  }); //end of disconnect event.






});


eventEmitter.on('get-room-data', function(room) {
  Room.find({
    $or: [{
      name1: room.name1
    }, {
      name1: room.name2
    }, {
      name2: room.name1
    }, {
      name2: room.name2
    }]
  }, function(err, result) {
    if (err) {
      console.log("Error : " + err);
    } else {
      if (result == "" || result == undefined || result == null) {

        var today = Date.now();

        newRoom = new Room({
          name1: room.name1,
          name2: room.name2,
          lastActive: today,
          createdOn: today
        });

        newRoom.save(function(err, newResult) {

          if (err) {
            console.log("Error : " + err);
          } else if (newResult == "" || newResult == undefined || newResult == null) {
            console.log("Some Error Occured During Room Creation.");
          } else {
            setRoom(newResult._id); //calling setRoom function.
          }
        }); //end of saving room.

      } else {
        var jresult = JSON.parse(JSON.stringify(result));
        setRoom(jresult[0]._id); //calling setRoom function.
      }
    } //end of else.
  }); //end of find room.
}); //end of get-room-data listener.
//end of database operations for chat feature.

//saving chats to database.
eventEmitter.on('save-chat', function(data) {

  // var today = Date.now();

  var newChat = new Chat({

    msgFrom: data.msgFrom,
    msgTo: data.msgTo,
    msg: data.msg,
    room: data.room,
    createdOn: data.date

  });

  newChat.save(function(err, result) {
    if (err) {
      console.log("Error : " + err);
    } else if (result == undefined || result == null || result == "") {
      console.log("Chat Is Not Saved.");
    } else {
      console.log("Chat Saved.");
      //console.log(result);
    }
  });

}); //end of saving chat.

//reading chat from database.
eventEmitter.on('read-chat', function(data) {

  Chat.find({})
    .where('room').equals(data.room)
    .sort('-createdOn')
    .skip(data.msgCount)
    .lean()
    .limit(9)
    .exec(function(err, result) {
      if (err) {
        console.log("Error : " + err);
      } else {
        //calling function which emits event to client to show chats.
        console.log(result);
        console.log(data.room +'   __rome array');
        console.log('###############');
        oldChats(result, data.username, data.room);

      }
    });
}); //end of reading chat from database.
