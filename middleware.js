var crypto = require('crypto-js');
var jwt = require('jsonwebtoken');

var middleware = function(db) {
     return {
     	requireAuthentication: function (req, res, next){
             var token = req.get('Auth') || '';
             db.token.findOne({
                where: {
                    token : token
                }
             }).then(function (tokenInstance) {
             
                  if(!tokenInstance) {
                      req.token = 'Invalid token'
                  // throw new Error(); 
                  }
            
				jwt.verify(token,'token', function (err, decoded){
				
				            if (err){
				                console.log(err);
				           
				            } else {
								            console.log('--------In middleware-------');
                            console.log(decoded.id)
                            console.log(decoded.email)
				                    req.email = decoded.email
                            req.id = decoded.id
				                    next();
				            }
				        });
			
             });
     	}
     };
};
 module.exports = middleware;