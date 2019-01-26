const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const passport = require('passport');
var multer = require('multer');
var path = require('path');
const config = require('../config/database');
var shortid = require("shortid");



router.post('/register', (req, res, next) => {
 
  var id = shortid.generate();
 
  User.getUserByUsername(req.body.username, (err, user) => {
    if (err) throw err;
    console.log(user)
    if (user !== null) {
      if (user.username==username) {
        return res.json({
          success: false,
          msg: 'User exists already,make use of another name'
        });
      }
  
    }
  
  let newUser = new User({
    userid:id,
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
  });



  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({
        success: false,
        msg: 'Failed to register user'
      });
    } else {
      res.json({
        success: true,
        msg: 'User registered'
      });
    }
  });
});
});

//register
router.post('/authenticate', (req, res, next) => {


  const username = req.body.username;
  const password = req.body.password;
console.log(req.body)
  User.getUserByUsername(username, (err, user) => {
    console.log(err)
    if (err) throw err;

    if (!user) {
      return res.json({
        success: false,
        msg: 'User not found'
      });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      console.log(err)
      if (err) throw err;
      console.log(isMatch)
      if (isMatch) {

        const token = jwt.sign({
          data: user
        }, config.secret, {
          expiresIn: 604800 // 1 week
        });
        res.json({
          success: true,
          token: 'JWT ' + token,
          user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email
          }
        })
      } else {
        return res.json({
          success: false,
          msg: 'Wrong password'
        });
      }
    });
  });
});

//get profile
router.get('/profile', passport.authenticate('jwt', {
  session: false
}), (req, res, next) => {
  res.json({
    user: req.user
  });
});

//add friend
router.post('/addfriend', (req, res, next) => {
  username = req.body.username;
  friendsname = req.body.friendsname;

  User.addfriend(username, friendsname, (err, user) => {
    if (err) {
      res.json({
        success: false,
        msg: 'Failed to add friend'
      });
    } else {
      res.json({
        success: true,
        msg: 'Congrats you have a new friend whose name is :-' + friendsname
      });
    }
  });

});

//remove friend
router.post('/removefriend', passport.authenticate('jwt', {
  session: false
}),(req, res, next) => {
  username = req.body.username;
  friendsname = req.body.friendsname;

  User.removefriend(username, friendsname, (err, user) => {
    if (err) {
      res.json({
        success: false,
        msg: 'Failed to remove friend'
      });
    } else {
      res.json({
        success: true,
        msg: ' you have removed ' + friendsname + ' from your friends list'
      });
    }
  });

});

//get all users

router.get('/getallusers', (req, res, next) => {

  User.getusers({}, (err, users) => {
    if (err) throw err;

    if (!users) {
      res.json({
        success: false,
        msg: 'users not found'
      });
    }

    var user = [];
    for (var i = 0; i < users.length; i++) {
      g = users[i];
      user.push({
        name: g.name,
        username: g.username,
        email: g.email
      });
    }
    res.json({
      success: true,
      usersinfo: user
    });

  });
});

//get a persons friend
router.get('/myfriends/:id', (req, res, next) => {
  const username = req.params.id;
  User.getUserByUsername(username, (err, result) => {
    if (err) {
      return res.json({
        success: false,
        msg: 'there was a slight error'
      });
    }

    return res.json({
      success: false,
      msg: result.friends
    });

  });

});


module.exports = router;
