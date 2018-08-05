var express = require('express');
var router = express.Router();
var expressValidator = require('express-validator');
var User = require('../models/users');
var Project = require('../models/projects');
var bcrypt = require('bcryptjs');
/* GET home page. */



//route for home page
router.get('/', function(req, res, next) {

	//here we are checking through sessions that whether the user is logged in or not.
	//as we do in php 

	if(!(req.session.id && req.session.email)){
		req.flash('msg','You are not loggedin. Login/Register to continue.');
		res.redirect('/login');
	}


	Project.find({user_id: req.session.idd},function(err,project){
  		res.render('AppViews/index', { title: 'Project Management', userid: req.session.idd, pros: project });
	});
});


//route for diplaying login page

router.get('/login',function(req,res,next){
	if(req.session.email){
		res.redirect('/');
	}
res.render('login');
});


//route for submitting login form
router.post('/reqlogin',function(req,res,next){

if(req.session.id && req.session.email){
		res.redirect('/');
	}


var email = req.body.email;
var password = req.body.password;
User.findOne({email: email},function(err,user){
if(user)
{

bcrypt.compare(password, user.password, function(err, result) {
		//if(err) {console.log(err); }
    // res == true
    if(result)
    {
    	sess = req.session;
    	sess.email = user.email;
    	sess.idd = user._id;
    	sess.name = user.name;
    	return res.redirect('/');
    }
    else
    {
    	req.flash('msg','Invalid Username/Password');
    	res.redirect('back');
    }
});	

}
else
{
	req.flash('msg','Invalid Username/Password.');
	res.redirect('back');
}
});
});

//this is the route for diplaying registeration page

router.get('/register',function(req,res,next){
	if(req.session.id && req.session.email){
		res.redirect('/');
	}

	res.render('register');
});


//this is the route for submitting registeration form
router.post('/reqregister',function(req,res,next){
	if(req.session.idd && req.session.email){
		res.redirect('/');
	}

//here we are checking the fileds. if the fields are empty we will diplay the messages
req.checkBody('name','Name is required').notEmpty()
req.checkBody('email','Email is required').notEmpty();
req.checkBody('password','Password is required').notEmpty();
req.checkBody('password','Password Length must be at lease 6 characters.').isLength({ min: 6 });
var errors = req.validationErrors();
if(errors)
{
	req.flash('errors',errors);
	return res.redirect('back');
}


	var email = req.body.email;
	var pass = req.body.password;
	var name = req.body.name;

	//here the record is inserted into the users collection
	user = new User({
		email: email,
		password: pass,
		name: name
	});

	//when the user is successfully saved/registerd. We will store the user id and email in sessions 
	// and will redirect the user to home page
	
	user.save(function(err,user){
		if(err) return next(err);
		
		sess = req.session;
		sess.email = user.email;
		sess.idd = user._id;
		sess.name = user.name;
		return res.redirect('/');
	});
});
module.exports = router;
