var mongoose = require('mongoose');
var schema = mongoose.Schema;

var Location = new schema({
location_title: String,
project_id: String,
created_at: Date
});

Location.pre('save',function(next){
var cd = new Date();
loc = this;
loc.created_at = cd;
next();
});

module.exports = mongoose.model('Location',Location);