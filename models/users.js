var mongoose = require('mongoose');
var schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
//mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds135290.mlab.com:35290/projectmanagement');
var User = new schema({
	id : {
		type: Number,
		autoIncrement: true,
		primaryKey: true
	},

	name: String,
	email: {type: String, unique: true},
	password: { type: String, required: true }
});

User.pre('save',function(next){

var user = this;
bcrypt.hash(user.password, 10, function(err, hash) {
  // Store hash in your password DB.
  if(err) return next(err);

  	user.password = hash;
  	next();
});
});

//comparing password

User.methods.comparePassword = function(password, hash)
{
	bcrypt.compare(password, hash, function(err, res) {
		if(err) {console.log(err); }
    // res == true
    return res;
});
}

module.exports = mongoose.model('User',User);