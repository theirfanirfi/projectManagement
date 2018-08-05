var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Requirement = new Schema({
req_title: String,
project_id: String,
created_at: Date,
isCompleted: Number
});

Requirement.pre('save',function(next){
req = this;
cd = new Date();
req.created_at = cd;
req.isCompleted = 0;
next();
});

module.exports = mongoose.model('Requirement',Requirement);