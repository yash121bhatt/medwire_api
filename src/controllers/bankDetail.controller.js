const User = require('../models/user.model');
const BankDetail = require('../models/bankdetail.model');


// add and update bank detail code by vineet shirdhonkar
exports.addUpdateBankDetail = (req,res) => {
    var {beneficiary_name,bank_name,bank_account_number,ifsc_code,account_type,user_id,role_id} = req.body;
   
    if(!ifsc_code.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)){
        res.status(404).send({
                    status_code : 400,
                    status: 'error',
                    message: `IFSC code should be valid`
        });
        return;
    } 
   
    User.findByIdAndRole(user_id,role_id,(err,data) =>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `User does not exist`
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }

      
        if(data){ 
            var pattern =/^[0-9]{9,18}$/;
            if(!pattern.test(bank_account_number)){
                return res.status(400).json({
                        status_code: 400,    
                        status: 'error',
                        message: "Account number should be between 9 to 18 digit"
                    }); 

            }

            BankDetail.addUpdateBankDetail(beneficiary_name,bank_name,bank_account_number,ifsc_code,account_type,user_id,(err,data) =>{
                   res.status(200).send({
                        status_code : 200,
                        status: 'success',
                        message:"Bank Details Saved Successfully!"
                    });
                    return;
                
            });       
        }   
    });
}

// get bank detail code by vineet shirdhonkar

exports.getBankDetail = (req, res) => {
    const { user_id,role_id } = req.body;
    var bank_details = [];
    User.findByIdAndRole(user_id,role_id,(err,data) =>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    status_code : 404,
                    status: 'error',
                    message: `User does not exist`
                });
                return;
            }
            res.status(500).send({
                status_code : 500,
                status: 'error',
                message: err.message
            });
            return;
        }
       
        if(data){
            BankDetail.getDetail(user_id,(err1,bdData) =>{    
            if (err1) {
                    res.status(500).send({
                        status_code : 500,
                        status: 'error',
                        message: err1.message
                    });
                    return;
                }
              
                if(bdData){   
                    var beneficiary_name = (bdData.beneficiary_name !== null) ? bdData.beneficiary_name : '' ;
                    var bank_name = (bdData.bank_name !== null) ? bdData.bank_name : '' ;
                    var bank_account_number = (bdData.bank_account_number !== null) ? bdData.bank_account_number : '' ;
                    var ifsc_code = (bdData.ifsc_code !== null) ? bdData.ifsc_code : '' ;
                    var account_type = (bdData.account_type !== null) ? bdData.account_type : '';
                    bank_details.push({"beneficiary_name":beneficiary_name,"bank_name":bank_name,"bank_account_number":bank_account_number,'ifsc_code':ifsc_code,'account_type':account_type});
                }
                  res.status(200).send({
                    status_code : 200,
                    status: 'success',
                    bank_details: bank_details,
                });
            return;
            });
        }        
    });
}
    