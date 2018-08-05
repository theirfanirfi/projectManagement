var mongoose = require('mongoose');
var Schema = mongoose.Schema;
Resources = new Schema({
	resource_title: String,
	project_id: String,
	created_at: Date
});

Resources.pre('save',function(next){
var resource = this;
var cd = new Date();
resource.created_at = cd;
next();
});

module.exports = mongoose.model('Resource',Resources);