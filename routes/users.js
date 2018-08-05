var express = require('express');
var router = express.Router();

//here we have required/included all the models we have created.
//like we do include in php

var Project = require('../models/projects');
var Task = require('../models/tasks');
var People = require('../models/people');
var Requirement = require('../models/requirements');
var Location = require('../models/location');
var Resource = require('../models/resources');
var Share = require('../models/shares');
var User = require('../models/users');
var bcrypt = require('bcryptjs');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var tasks = "";
var requirements = "";
var locations = "";
var ppl;
var completedTasks;
var completedRequirements;
var resources;
var ProjectShareCount;
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

//this is the route for submiting creat project form
router.post('/createProject',function(req,res,next){
	//here we are checking session that if user is not logged in then redirect the user to login page
	if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

	///here we are validating the form
	req.checkBody('project_title','Project Title Must be entered.').notEmpty();
	req.checkBody('project_description','Project Description Must be Provided.').notEmpty();
	var errors = req.validationErrors();
	//if there are errors so the user will be redirected back with errors messages
	if(errors)
	{
		//the error messages are sent in the flash
		//flash is a session function.
		//it displays messages and then disappears
		req.flash('errors',errors);
		//here we are redirecting the user back
		return res.redirect('back');
	}



	var projectTitle = req.body.project_title;
	var description  = req.body.project_description;

	//here project is stored.
	p = new Project({
	user_id: req.session.idd,
	project_title: projectTitle,
	project_description: description
	});

	p.save(function(err,result){
		//if there was no error
		if(!err)
		{
			//send the message that project is corrected.
			req.flash('msg','Project Created');
			res.redirect('back');
		}
		else
		{
			//send error message.
			req.flash('msg','Error occurred in creating the Project. Try again.');
			res.redirect('back');
		}
	});

});


//this is the router for loading a project by id.

router.get('/project/:pid',function(req,res,next){

	if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var pid = req.params.pid;

//here tasks of the project are fetched from the @Task Model by @project_id
Task.find({project_id: pid},function(err,result){
this.tasks = result;

});

//resources are fetched by project_id
Resource.find({project_id: pid},function(err,result){
this.resources = result;
});

//here we are fetching tasks for the project
Task.find({project_id: pid,isCompleted: 1},function(err,result){
this.completedTasks = result;
});

//here requirements are fetched
Requirement.find({project_id: pid},function(err,reqs){
this.requirements = reqs;
});

//here the completed requirements are fetched.
//when a requirement is marked as completed so it isCompleted column will be updated from 0 to 1
//when a requirement has 1 status it means it is marked as completed.
Requirement.find({project_id: pid, isCompleted: 1},function(err,reqs){
this.completedRequirements = reqs;
});

//here locations are loaded
Location.find({project_id: pid},function(err,locs){
this.locations = locs;
});

//here people are loaded
People.find({project_id: pid},function(err,pl){
this.ppl = pl;
});

//here it is checked that whether the project is shared or not
//if the project was stored into the shares collections. so it means that the project is shared with users.
Share.count({project_id: pid},function(err,result){
this.ProjectShareCount = result;

});

Project.findById(pid,function(err,pro){

//here the design of the project is loaded and all the details are passed to it.
	res.render('AppViews/project',{project: pro, project_id: pro._id, tasks: this.tasks, reqs: this.requirements, 
		locations: this.locations, people: this.ppl, inct: this.completedTasks, cr: this.completedRequirements, resources: this.resources,
		shared: this.ProjectShareCount});
});
});


//this is the route for task addition 
router.post('/addtask',function(req,res,next){
	if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

req.checkBody('task_title','Task Title Must be entered.').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		req.flash('errors',errors);
		return res.redirect('back');
	}


var project_idd = req.body.project_id;
var task_titlee = req.body.task_title;
task = new Task({
task_title: task_titlee,
project_id: project_idd,
});

task.save(function(err,result){
	if(!err)
	{
		req.flash('msg','Task Added to the Project.');

		res.redirect('back');
	}
	else
	{
		req.flash('msg','Error Occurred in Adding the Task. Try again.');

		res.redirect('back');
	}
});

});


//this is the route for deleting task from project

router.get('/projectDelete/:id',function(req,res,next){
	if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}


	var id = req.params.id;

	Task.remove({_id: id},function(err,result){
		if(result.n > 0)
		{
		req.flash('msg','Task Deleted.');

		}
		else
		{
		req.flash('msg','Error occurred in deleting the Task. Try again.');

		}

		res.redirect('back');
	
	});
});

//mark the project task as completed.
router.get('/projectTaskComplete/:id',function(req,res,next){

	if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}


	var pid = req.params.id;
	Task.update({_id: pid},{isCompleted: 1},function(err,result){
		if(result.nModified > 0)
		{
		req.flash('msg','Task is marked as completed.');

		}
		else
		{
		req.flash('msg','Error occurred in changing the task status. Try again.');

		}
		res.redirect('back');
	});
});

//add requirement to the project - form
//route for adding requirement to the project.
router.post('/addRequirement',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

req.checkBody('req_title','Requirement Title Must be entered.').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		req.flash('errors',errors);
		return res.redirect('back');
	}


var req_titlee = req.body.req_title;
var pid = req.body.project_id;
requ = new Requirement({
req_title: req_titlee,
project_id: pid
});

requ.save(function(err,result){
	if(!err)
	{
		req.flash('msg','Requirement Added to the Project.');
		res.redirect('back');
	}
	else
	{
		req.flash('msg','Error occurred in Adding the Requirement. Try again.');

		res.redirect('back');
	}
});
});

/// delete project requirement
//router for deleting requirements from the project
router.get('/projectReqDelete/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

	var id = req.params.id;
	Requirement.remove({_id: id},function(err,result){
		//when requirement is deleted
		if(result.n > 0)
		{
		req.flash('msg','Requirement Deleted.');

		}
		else
		{
		req.flash('msg','Error occurred in deleting the requirement. Try again.');

		}

		res.redirect('back');
	});
});

// mark requirement as done
//route for marking the requirements as done.
router.get('/projectReqComplete/:id',function(req,res,next){
	if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}


	var rid = req.params.id;
	Requirement.update({_id: rid},{isCompleted: 1},function(err,result){
	if(result.nModified > 0)
		{
		req.flash('msg','Requirements is marked as done.');

		}
		else
		{
		req.flash('msg','Error occurred in changing the Requirement status. Try again.');

		}
		res.redirect('back');
	});
});

//add location 
//route for adding location to the project
router.post('/addlocation',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

req.checkBody('location_title','Location Field can not be empty.').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		req.flash('errors',errors);
		return res.redirect('back');
	}	

var pid = req.body.project_id;
var loc_title = req.body.location_title;
loc = new Location({
	location_title: loc_title,
	project_id: pid
});

loc.save(function(err,result){
		if(!err)
		{
		req.flash('msg','Location is Added to the Project.');

		}
		else
		{
		req.flash('msg','Error occurred Adding location to the project. Try again.');

		}
res.redirect('back');
});

});

//delete location
//router for deleting location from the project
router.get('/DeleteLocation/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

	var lid = req.params.id;
Location.remove({_id: lid},function(err,result){
	if(result.n > 0)
		{
		req.flash('msg','Location deleted.');

		}
		else
		{
		req.flash('msg','Error occurred in deleting the location. Try again.');

		}
res.redirect('back');
});
});

//add person people to the project
//add person to the project
router.post('/addPeople',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

req.checkBody('person_name','Person Name Must be entered.').notEmpty();
req.checkBody('task_title','Task Must be Selected.').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		req.flash('errors',errors);
		return res.redirect('back');
	}


var namee = req.body.person_name;
var pid = req.body.project_id;
var task_titlee = req.body.task_title;
people = new People({
name: namee,
project_id: pid,
task_title: task_titlee
});
people.save(function(err,result){

	if(!err)
		{
		req.flash('msg','Person is Added to the Project.');

		}
		else
		{
		req.flash('msg','Error occurred in Adding Person Try again.');

		}

res.redirect('back');
});
});


//delete person from the project
//route for deleting person from the project
router.get('/deletePerson/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var id = req.params.id;
People.remove({_id: id},function(err,result){
		if(result.n > 0)
		{
		req.flash('msg','Person deleted.');

		}
		else
		{
		req.flash('msg','Error occurred in deleting the person. Try again.');

		}
res.redirect('back');
});
});

//add resource
//route for adding resource to the project
router.post('/addResource',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

req.checkBody('resource_title','Resource Title Must be entered.').notEmpty();
	var errors = req.validationErrors();
	if(errors)
	{
		req.flash('errors',errors);
		return res.redirect('back');
	}


var pid = req.body.project_id;
var title = req.body.resource_title;
var reso = new Resource({
	resource_title: title,
	project_id: pid
});

reso.save(function(err,result){
		if(!err)
		{
		req.flash('msg','Resource Added to the Project.');

		}
		else
		{
		req.flash('msg','Error occurred in Adding the Resource. Try again.');

		}
res.redirect('back');
});

});

//delete Resource
//route for deleting resource from the project.
router.get('/deleteResource/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

	var id = req.params.id;
Resource.remove({_id: id},function(err,result){

		if(result.n > 0)
		{
		req.flash('msg','Resource deleted.');

		}
		else
		{
		req.flash('msg','Error occurred in deleting the Resource. Try again.');

		}
res.redirect('back');
});
});


//share project on share board
//route for sharing project
router.get('/share/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}


var id = req.params.id;
Share.count({project_id: id},function(err,result){
this.ProjectShareCount = result;

});

if(this.ProjectShareCount > 0)
{
	res.redirect('back');
}
else {
Project.findOne({_id: id},function(err,result){
User.findOne({_id: result.user_id},function(errr,result2){
s = new Share({
project_id: id,
project: result,
project_title: result.project_title,
project_description: result.project_description,
username: result2.name
});

s.save(function(err,ress){
	if(!err)
		{
		req.flash('msg','Project is Shared with Users.');

		}
		else
		{
		req.flash('msg','Error occurred in Sharing the Project. Try again.');

		}
res.redirect('back');
});
});



});
}


});


//unshare project
//route for unsharing the project
router.get('/unshare/:id',function(req,res,next){
if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var id = req.params.id;
Share.remove({project_id: id},function(err,result){
		if(result.n > 0)
		{
		req.flash('msg','Project Unshared.');

		}
		else
		{
		req.flash('msg','Error occurred in unsharing the project. Try again.');

		}
	res.redirect('back');
});
});

//delete project
//route for deleting the project as a whole.
router.get('/deleteProject/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}


var pid = req.params.id;
Project.remove({_id: pid},function(err,result){
	if(result.n > 0){
			req.flash('msg','Project Deleted');
		}
		else
		{
			req.flash('msg','Error Occurred in deleting the project. Try again.');
		}

res.redirect('back');
});
});


//shared projects
//route for displaying shared board page
router.get('/sharedboard',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

	Share.find({},function(err,result){
	res.render('AppViews/shareboard',{pros: result});
	});
});

//view shared Project Details
//route for displaying project details
router.get('/sharedproject/:id',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var pid = req.params.id;

Task.find({project_id: pid},function(err,result){
this.tasks = result;

});

Resource.find({project_id: pid},function(err,result){
this.resources = result;
});

Task.find({project_id: pid,isCompleted: 1},function(err,result){
this.completedTasks = result;
});

Requirement.find({project_id: pid},function(err,reqs){
this.requirements = reqs;
});

Requirement.find({project_id: pid, isCompleted: 1},function(err,reqs){
this.completedRequirements = reqs;
});

Location.find({project_id: pid},function(err,locs){
this.locations = locs;
});

People.find({project_id: pid},function(err,pl){
this.ppl = pl;
});

Share.count({project_id: pid},function(err,result){
this.ProjectShareCount = result;

});

Project.findById(pid,function(err,pro){

	res.render('AppViews/sharedProject',{project: pro, project_id: pro._id, tasks: this.tasks, reqs: this.requirements, 
		locations: this.locations, people: this.ppl, inct: this.completedTasks, cr: this.completedRequirements, resources: this.resources,
		shared: this.ProjectShareCount});
});
});


//load profile
//route for loading/displaying profile page
router.get('/profile',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}


	var user_id = req.session.idd;
	var email = req.session.email;
	var name = req.session.name;
res.render('AppViews/profile',{userid: user_id,email: email, name: name});
});


//update profile
//route for profile form submission
router.post('/changeProfile',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var userid = req.body.user_id;
var email = req.body.email;
var name = req.body.name;
User.update({_id: userid},{email: email,name:name},function(err,result){
	if(result.nModified > 0){
		req.session.email = email;
req.session.name = name;
req.flash('msg','Profile Updated');
res.redirect('back');

}
else
{
req.flash('msg','Error Occurred in Updating the Profile. Try again.');

	res.redirect('back');
}
});
});


//logout
//route for loggin out from the site.
router.get('/logout',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

//here the session is destroyed.
req.session.destroy(function(err){
if(err)
{
	res.redirect('back');
}
else
{
	res.redirect('/');
}
});
});

//load settings page
//route for loading/displaying the settings page.
router.get('/settings',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var userid = req.session.idd;
res.render('AppViews/settings',{userid: userid});
});


//change password

//route for changing the password form submission
router.post('/changePassword',function(req,res,next){

if(!(req.session.email && req.session.idd))
	{
		res.redirect('/login');
	}

var currentPassword = req.body.current_password;
var newPassword = req.body.new_password;

User.findOne({_id: req.session.idd},function(err,user){
bcrypt.compare(currentPassword, user.password, function(err, result) {
if(result)
{
bcrypt.hash(newPassword, 10, function(err, hash) {
User.update({_id: req.session.idd},{password: hash},function(err,ures){
if(ures.nModified > 0)
{
req.flash('msg','Password Changed.');

res.redirect('back');
}
else
{
req.flash('msg','Error Occurred in changing the Password. Try again.');

res.redirect('back');
}

});
});
}
else
{
req.flash('msg','Invalid Current Password.');

res.redirect('back');
}


 });
});

});
module.exports = router;
