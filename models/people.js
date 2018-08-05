var mongoose = require('mongoose');
var schema = mongoose.Schema;
var People = new schema({

	name: String,
	project_id: String,
	task_title: String,
	created_at: Date
});

People.pre('save',function(next){
people = this;
var cd = new Date();
people.created_at = cd;
next();
});

module.exports = mongoose.model('People',People);