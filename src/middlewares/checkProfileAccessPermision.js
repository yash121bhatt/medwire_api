const { async } = require('q');
const db = require('../config/db.config');
const helperFunction = require('../helper/helperFunction');
const helperQuery = require('../helper/helperQuery');
const profileAccess = require('../models/profileAccess.model');

const checkProfileAccessPermision = (req,res,next)=>{

    const {requestId} =req.body;

    helperQuery.First({table:"profile_access",where:"id="+requestId})
    .then(result=>{
        const interval =result.time_interval.split(" ");
        if (interval[0]==undefined || interval[0]==null || interval[1]==undefined || interval[1]==null) {
            return res.status(400).json({
                status_code:400,
                status:"error",
                message:"Sorry! Your validity has expired. Please request again to access"
            });
        }
        if (interval[1]=='Seconds' || interval[1]=='Second') {
            var subDate = interval[0]+' SECOND'; 
        }
        if (interval[1]=='Minutes' || interval[1]=='Minute') {
            var subDate = interval[0]+' MINUTE'; 
        }
        if (interval[1]=='Hours' || interval[1]=='Hour') {
            var subDate = interval[0]+' HOUR'; 
        }
        if (interval[1]=='Days' || interval[1]=='Day') {
            var subDate = interval[0]+' DAY'; 
        }
        if (interval[1]=='Weeks' || interval[1]=='Week') {
            var subDate = interval[0]+' WEEK'; 
        }
        if (interval[1]=='Years' || interval[1]=='Year') {
            var subDate = interval[0]+' YEAR'; 
        }
        if (interval[1]=='Months' || interval[1]=='Month') {
            var subDate = interval[0]+' Month'; 
        }
        profileAccess.ProfileAccessShow({requestId,subDate})
        .then(result1=>{
            if (helperFunction.isEmptyObject(result1)) {
                return res.status(500).json({
                    status_code:500,
                    status:"error",
                    message:"Sorry! Your validity has expired. Please request again to access"
                });
            }
            next();
        }).catch(error=>{
            console.log(error)
        });
   }).catch(error=>{
    console.log(error)
});
}
module.exports = checkProfileAccessPermision;