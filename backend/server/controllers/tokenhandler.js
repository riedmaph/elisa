var jwt = require('jsonwebtoken');

var config = {};
config.tokensecrete='supersicher';
config.tokenexpiresin='2 days';

function createToken(userid) {

	var token = jwt.sign({'userid': userid}, config.tokensecrete, {
    expiresIn: config.tokenexpiresin // expires in 24 hours
  });

	return token;
}

//middleware function to verify token
function verifyToken(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, config.tokensecrete, function(err, decoded) {      
      if (err) {
        res.status(403)
          .json({
            message: 'Failed to authenticate token.'
          });
      } else {
        // if everything is good, save to request for use in other routes
        req.body.userid = decoded.userid;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'Failed to authenticate token.' 
    });
    
  }
};


module.exports = {
	createToken,
  verifyToken
};