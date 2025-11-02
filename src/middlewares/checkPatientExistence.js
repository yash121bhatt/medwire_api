const User = require('../models/user.model');

const checkPatientExistence =  (req, res, next) => {
    const { email_id ,search_key,user_id,patient_id,primary_user_id } = req.body;
    if(patient_id!=null && primary_user_id!=null && patient_id!='' && primary_user_id!='' ){
        next();
    }else{
        User.findByEmailForUpdateNew(email_id,search_key,user_id, (_, data) => {
            if (data) {
                res.status(500).send({
                    status: 'error',
                    message: `Email is already taken`
                });
                return;
            }
            next();
        });
    }
  
}
module.exports = checkPatientExistence;