const jwt = require("jsonwebtoken");
const { async } = require("q");
const helperQuery = require("../helper/helperQuery");
const { JWT_SECRET_KEY } = require("../utils/secrets");
const jwtAuth = (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }
  jwt.verify(token, JWT_SECRET_KEY, async(err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    if (decoded) {
      const userData = await helperQuery.First({table:"users",where:" id="+decoded.id});
      const adminData = await helperQuery.First({table:"super_admin",where:" id="+decoded.id});
    
      if (userData && userData.auth_token==token) {
        req.userId = decoded.id;
        next();
      }else if(adminData && adminData.auth_token==token){
        req.userId = decoded.id;
        next();
      }else{
        return res.status(401).send({
          message: "Unauthorized!"
        });
      }
    }
  });
};

module.exports = jwtAuth;