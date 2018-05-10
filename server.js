var express = require('express');
var basicAuth = require('express-basic-auth');
var multer = require('multer');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var _ = require('underscore'); 
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');
var path = require('path');
var db = require('./db.js');
var fcm = require('fcm-node');
var middleware = require('./middleware.js')(db);
var app = express();

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
              callback(null, __dirname + '/uploads/')
	},
	filename: function(req, file, callback) {
		callback(null,Date.now() + path.extname(file.originalname));
	}
});


var PORT = process.env.PORT || 8080;

var nextTodoId = 1;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());	

app.use(basicAuth({
    users: { 'username': 'password' }
}));

app.use(express.static('uploads'))

 app.post('/users/signup', function (req, res) {

   var body = _.pick(req.body,'email', 'password');

   db.user.findOne({
		where: {
              email: body.email
           }
	}).then(function (user){

		if (!user) {
			   body = { email: body.email , password: body.password }
			   console.log(body)
			     	db.user.create(body).then(function (user) {
				     		res.json({ 
				     		"success": 1,
				     		"message": "Registration successfull",

				     		"data": user.toJSON()
				     	});
			     	})
			} else {

						res.json({
						"success": 0,
						"message": "User already exists",
				});
			}
		
	},function (e) {
		res.send(e);
		res.status(404).send();
	});
}); 
// to get all users 
 app.get('/users', function (req,res) {

       db.user.findAll({
		  where: {}
		}).then(function (data){
		          	res.json({
                          "success": 1,
                          "message": "Request successfull",
                          "data": data
		          	});

			    },function (e) {
			    	res.status(500).send();
			});
});    

// Find user by id
 app.get('/user', function (req,res) {

	db.user.findOne({
		where: {
			id : req.query.id
		}
	}).then(function (user){
	 if(!!user){
		           res.json({
		           	"success": 1,
		           	"message": "Request successfull",
		           	"data": user.toJSON()
		           });                      
		    	 } else {
		              res.status(404).send();
		    	}
		    },function (e) {
		    	res.status(500).send();
			 });

});   



//login user
app.post('/users/login', function (req,res) {
	var body = _.pick(req.body,'email', 'password');
	//var email = body.email

      if (typeof body.email !== 'string' && typeof body.password !== 'string'){
             res.status(404).send();
         }
         db.user.findOne({
           where: {
              email: body.email
           }
         }).then(function (user) {
         	if (!user) {
         		 return res.json({
							"success": 0,
							"message": "User not registered"
					});
         	}
             else if(!bcrypt.compareSync(body.password,user.get('password_hash'))){      //match password entered by user in login and the stired hashed password
	         {
   						res.json({
							"success": 0,
							"message": "password is not correct"
						});
	            }  
                return res.status(401).send();
             }
	         var id = user.id
	         var email = user.email
	          var token = jwt.sign({email: email, id: id}, 'token')
	          db.token.create({
		           	   token: token
		           }).then(function (tokenInstance) {
		           	    res.header('Auth', tokenInstance.get('token')).json(user.toJSON());
		           }).catch(function () {
		           	    res.status(401).send();
		           	});
			   var json = user.toJSON();
				 
               res.json({
						"success": 1,
						"message": "User logged In",
						"token": token,
						"data": user.toJSON()  //_.pick(json,'id','email','salt','profileImage','createdAt','updatedAt')
				});
             
         }, function (e) {
              res.status(500).send();
         });   
});

app.delete('/users/deleteUser', middleware.requireAuthentication, function (req, res) {

        db.user.destroy({
		    	where: {
		    		email: req.email
		    	}
		    }).then(function (rowDeleted) {
		    	console.log(req.body)
		         if (rowDeleted === 0){
		         	res.json({
		         		"success": 0,
		         		"message": "Request unsuccessfull"
		         	})
		
		         }else{
		         	res.json({
		         		"success": 1,
		         		"message": "User deleted successfully"
		         	})

		         }
		    },function () {
		    	res.status(500).send();
		    });
});


var upload = multer({ storage: storage}).single('myImage');

app.post('/users/image', function (req,res) {
    console.log(req.file)
	upload(req, res, function(err) {

        console.log('------Image-----')
		console.log(req.file)
		if (err){ 
			return res.json({
					"success": 0,
					"message": "Image not uploaded"
				})
		}
		res.json({
			"success": 1,
			"message": "Image uploaded successfully",
			"image":  `${req.file.filename}`
		});
	});
});

var upload = multer({ storage: storage})

app.post('/users/register',upload.single('profileImage'), function (req,res) {

    var email = req.body.email
    var password = req.body.password

	upload(req, res, function(err) {
    
        // console.log(req)
        console.log('------Image-----')
		console.log(req.file)
		if (err){ 
			console.log('err => '+err)
			return res.json({
					"success": 0,
					"message": "Request unsuccessfull",
					"error": err
				})
		}else{
             console.log('body password = ' + password)
             db.user.findOne({
					where: {
			              email: email
			           }
				}).then(function (user){

					if (!user) {
						         if (req.file) {
						             var body = { email: email , password: password , profileImage: `${req.file.filename}`}
						         }else{
						         	var body = { email: email , password: password , profileImage: "" }
						         }
						     	console.log('body password = ' + body.password)
					              db.user.create(body).then(function (user) {
					              	  var json = user.toJSON();
									     		res.json({ 
									     		"success": 1,
									     		"message": "Registration successfull",

									     		"data": _.pick(json,'id','email','salt','password_hash','profileImage','createdAt','updatedAt')
									     	});
								     	});
						} else {

									res.json({
									"success": 0,
									"message": "User already exists",
							});
						}
					
				},function (e) {
					res.send(e);
					res.status(404).send();
				});
			
			} 
	});
});

var upload = multer({ storage: storage});

app.put('/users/single_user',[middleware.requireAuthentication,upload.single('profileImage')], function (req,res) {

	var password = req.body.password

	upload(req, res, function(err) {

        console.log(req.body)
        console.log('------Image-----')
		console.log(req.file)
		if (err){ 
			return res.json({
					"success": 0,
					"message": "Something went wrong",
					"error": err
				})
		}else{

             db.user.findOne({
					where: {
			              id: req.id
			           }
				}).then(function (user){

					if (user) {
						         if (req.file) {
						             user.profileImage = req.file.filename
						         } 
						         if (password) {
						         	var salt = bcrypt.genSaltSync(10)              
					                var hashedPassword = bcrypt.hashSync(password, salt)

					                user.salt = salt,
									user.password_hash = hashedPassword
						         }
						     	
					               user.save().then( function(user){
					                                   res.json({
						                                  	"success": 1,
						                                  	"message": "Request successfull",
						                                  	"data": user.toJSON()
						                                  })
					                            });
						} else {

									res.json({
									"success": 0,
									"message": "User not found",
							});
						}
					
				},function (e) {
					res.send(e);
					res.status(404).send();
				});
			
			} 
	});
});

var upload = multer({ storage: storage}).single('teamImage');

app.post('/users/createTeam', middleware.requireAuthentication, function (req,res) {

	//var body = { teamCaptain: req.id , teamName: req.body.teamName , teamPlayers: req.body.teamPlayers }

	upload(req, res, function(err) {

		if (err){ 
			return res.json({
					"success": 0,
					"message": "Error in creating team"
				})
		}else{

             db.teams.findOne({
					where: {
			              teamName: req.body.teamName
			           }
				}).then(function (team){

					if (!team) {
						         if (req.file) {
						            var body = { teamCaptain: req.id , teamName: req.body.teamName , teamPlayers: req.body.teamPlayers , teamImage: `${req.file.filename}`}
						         }else{
						         	var body = { teamCaptain: req.id , teamName: req.body.teamName , teamPlayers: req.body.teamPlayers , teamImage: "" }
						         }
						     	
					              db.teams.create(body).then(function (team) {
					              	//  var json = user.toJSON();

									     		res.json({ 
									     		"success": 1,
									     		"message": "Registration successfull",

									     		"data":  team.toJSON()   //_.pick(json,'id','email','salt','profileImage','createdAt','updatedAt')
									     	});
								     	});
						} else {

									res.json({
									"success": 0,
									"message": "Team already exists",
							});
						}
					
				},function (e) {
					res.send(e);
					res.status(404).send();
				});
			
			} 
	});

});

app.post('/users/send_notification', middleware.requireAuthentication, function (req,res) {
     //  var body = _.pick(req.body,'receiver');

       var body = { sender: req.id , receiver: req.body.receiver , text: "Request send" , type: 0 , status: 0  }

        db.user.findOne({
					where: {
			              id: req.body.receiver
			           }
				}).then(function (user){

						 db.notification.create(body).then(function (user) {
							     		res.json({ 
								     		"success": 1,
								     		"message": "Registration successfull",
								     		"data": user.toJSON()
							     	});
						     	},function (e) {
								    	res.status(500).send();
					    });
			},function (e) {
					res.send(e);
					res.status(404).send();
				});
});

app.get('/users/get_notifications',middleware.requireAuthentication, function (req,res) {
	// var userid = parseInt( req.params.id, 10 );
	// var matchedUser;

	db.notification.findAll({
		where: {
			receiver: req.id
		}
	}).then(function (data){
	 if(!!data){
		          res.json({
			          	"success": 1,
			          	"message": "Request successfull",
			          	"data": data
		          	})        
		    	 } else {
		              res.status(404).send();
		    	}
		    },function (e) {
		    	res.status(500).send();
			 });

});  


db.sequelize.sync({
	force: true
}).then(function () {
	console.log(PORT)
    app.listen(PORT, function () {
            console.log('Express listening on post ' + PORT + '!'); 
    });
});
