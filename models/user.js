const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

// friends
const friendsSchema = mongoose.Schema({
  friend_name: {
    type: String
  },
  friend_email: {
    type: String
  },
  friend_username: {
    type: String
  }
});

// user schema
const UserSchema = mongoose.Schema({
  userid: {
    type: String
  },
  name: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
  ,
  friends: [friendsSchema]

});





const User = module.exports = mongoose.model('User', UserSchema);


module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}


module.exports.getUserByUsername = function(username, callback) {
  const query = {
    username: username
  }
  User.findOne(query, callback);
}

module.exports.addfriend = function(username, name_of_friend, callback) {
  // find user
  const query = {
    username: username
  }

  // find friend
  const query2 = {
    username: name_of_friend
  }
  // find the new friend that is to be added and get his details
  User.findOne(query2, (err, fres) => {
    console.log(fres.name);
    let friend = new User({
      friends: [{
        friend_name: fres.name,
        friend_email: fres.email,
        friend_username: fres.username
      }]

    });
    console.log(friend);
    /*find the person that wants to add friend then push
    the new friend to the array of friends he has*/
    User.findOne(query, (err, result) => {
      result.friends.push(friend.friends[0]);
      result.save(callback);
    });
  });

}

// remove friend
module.exports.removefriend = function(username, name_of_friend, callback) {
  // find user
  const query = {
    username: username
  }
  /*find the person that wants to remove friend then remove_friend*/
  User.findOne(query, (err, result) => {

    var remove_friend = result.friends.map(function(item) {
      return item.friend_name;
    }).indexOf(name_of_friend);
    result.friends.splice(remove_friend, 1);

    result.save(callback);
  });


}



//get all users
module.exports.getusers=function ({},callback){

  User.find({},callback);

}


module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
}
