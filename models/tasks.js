var mongoose = require('mongoose');
var schema = mongoose.Schema;
var Task = new schema({
task_title: String,
project_id: String,
people_id: String,
isCompleted: Number,
created_at: Date
});

Task.pre('save',function(next){
var task = this;
var cd = new Date();
task.created_at = cd;
task.isCompleted = 0;
next();
});

Task.methods.fetch = function()
{
Task.find(function(err,result){
	return result;
});
};
module.exports = mongoose.model('Task',Task);