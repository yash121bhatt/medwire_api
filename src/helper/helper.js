const { unlink } = require("node:fs/promises");
const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");

// initialize nodemailer SMTP transport
let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: process.env.MAIL_SECURE, // true for 465, false for other ports
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USERNAME, // generated ethereal user
        pass: process.env.MAIL_PASSWORD // generated ethereal password
    },
});

// point to the template folder
const handlebarOptions = {
    viewEngine: {
        extname: "handlebars",
        partialsDir: path.resolve("./public/views/"),
        defaultLayout: false,
    },
    viewPath: path.resolve("./public/views/"),
};

// use a template file with nodemailer
// transporter.use('compile', hbs(handlebarOptions))
const template = (transporter, temp) => {
    if (temp == true) {
        return transporter.use("compile", hbs(handlebarOptions));
    }
};


var mailOptions = {
    from: "\"Adebola\" <adebola.rb.js@gmail.com>", // sender address
    to: "krishnapawar90906@gmail.com", // list of receivers
    subject: "Welcome!",
    // template: 'email', // the name of the template file i.e email.handlebars
    // context:{
    //     name: "Adebola", // replace {{name}} with Adebola
    //     company: 'My Company' // replace {{company}} with My Company
    // }
};

// trigger the sending of the E-mail
// transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//         return console.log(error);
//     }
//     console.log('Message sent: ' + info.response);
// });

//strong password auto generater
const autoGenPassword = () => {
    var chars = "1234567890abcdefghijklmnopqrstuvwqyz!#%&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var passwordLength = 12;
    var password = "";

    for (let index = 0; index < passwordLength; index++) {
        var randomNumber = Math.floor(Math.random() * chars.length);
        password += chars.substring(randomNumber, randomNumber + 1);
    }
    return password;
};

//auto string to array converter 
const convertStringToArray = (str, index, bythe = " ") => {
    return str.split(bythe)[index];
};

//a simple date formatting function
function dateFormat(inputDate, format) {
    //parse the input date
    const date = new Date(inputDate);

    //extract the parts of the date
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    //replace the month
    format = format.replace("MM", month.toString().padStart(2, "0"));

    //replace the year
    if (format.indexOf("yyyy") > -1) {
        format = format.replace("yyyy", year.toString());
    } else if (format.indexOf("yy") > -1) {
        format = format.replace("yy", year.toString().substr(2, 2));
    }

    //replace the day
    format = format.replace("dd", day.toString().padStart(2, "0"));

    return format;
}

//email and mobile number check function by mysqli query 
const uniqueEmailAndMobile = (check, res) => {
    const errorMessage = [];
    if (check.code == "ER_DUP_ENTRY") {
        if (convertStringToArray(check.sqlMessage, 5) == "'mobile'") {
            errorMessage.push({
                status: 400,
                status_code: "400",
                message: convertStringToArray(check.sqlMessage, 5) + " " + convertStringToArray(check.sqlMessage, 2) + " is already existed!"
            });

        }
        if (convertStringToArray(check.sqlMessage, 5) == "'email'") {
            errorMessage.push({
                status: 400,
                status_code: "400",
                message: convertStringToArray(check.sqlMessage, 5) + " " + convertStringToArray(check.sqlMessage, 2) + " is already existed!"
            });
        }
    }
    return errorMessage;
};
// delete file from folder function folderPath is folder name defualt will be member 
// and basefolder will be public if want to change path you will to give path in
// in proper order for exma. => removeFileFromFolder('file name','file folder name','base folder name')
const removeFileFromFolder = async (fileName, folderPath = "member", baseFolder = "public",) => {
    try {
        const deleteFile = baseFolder + "/" + folderPath + "/" + fileName;
        await unlink(deleteFile);
        console.log("file remove Successfully deleted!");
    } catch (error) {
        console.error("there was an error:", error.message);

    }
};

module.exports = {
    transporter,
    template,
    mailOptions,
    autoGenPassword,
    convertStringToArray,
    dateFormat,
    uniqueEmailAndMobile,
    removeFileFromFolder
};
