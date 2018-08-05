var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Project = require('./shares');
var User = require('./users');

var Share = new Schema({
	project_id: String,
	project: [Project],
	project_title: String,
	project_description: String,
	username: [User.name]
});

module.exports = mongoose.model('Share',Share);