var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.connect('mongodb://<dbuser>:<dbpassword>@ds135290.mlab.com:35290/projectmanagement');
var Project = new Schema({
	user_id: String,
	project_title: String,
	project_description: String,
	created_date: Date
});

Project.pre('save',function(next){
project = this;
var cDate = new Date();
project.created_date = cDate;
next();
});

module.exports = mongoose.model('Project',Project);