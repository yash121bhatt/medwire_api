const router = require('express').Router();
const path = require('path');
const { asyncHandler } = require('../middlewares/asyncHandler');
const checkEmail = require('../middlewares/checkEmail');
const { signup: signupValidator, signin: signinValidator, signinRole: signinValidatorRole, addMember: addMemberValidator, updatePassword: updatePasswordValidator, signupradioValidator: signupradioValidator, forgotPassword: forgotPasswordValidator, profileValidator: profileValidator } = require('../validators/auth');

const { addBmi: addBmiValidator, oxygen: oxygenValidator, temperature: temperatureValidator, respiratory: respiratoryValidator, bloodPressure: bloodPressureValidator, heartRate: heartRateValidator, listdata: listdata, historyNotepadValidator: historyNotepadValidator, historyNotepadData: historyNotepadData, historyNotepadsingleData: historyNotepadsingleData, historyNotepadUpdateData: historyNotepadUpdateData } = require('../validators/healthResult');
const { edit_notification_pre_medicine: edit_notification_pre_medicine, notification_pre_medicine: notification_pre_medicine, list_notification_pre_medicine: list_notification_pre_medicine, pre_notification: pre_notification, list_pre_notification: list_pre_notification } = require('../validators/notification');

const { add_baby: add_baby, list_baby: list_baby, update_baby: update_baby, delete_baby: delete_baby } = require('../validators/baby');

const authController = require('../controllers/auth.controller');
const checkForgotEmail = require('../middlewares/checkForgotEmail');
const jwtAuth = require("../middlewares/jwtAuth");
const multer = require('multer');

const healthController = require('../controllers/health.controller');
const notificationController = require('../controllers/notification.controller');
const babyController = require('../controllers/baby.controller');
const documentController = require('../controllers/document.controller');
const dashboard = require('../controllers/dashboard.controller');
const ccavenuePayment = require('../controllers/ccavenuePayment.controller');

const checkMemberLimit = require('../middlewares/checkMemberLimit');
const checkEmailVerify = require('../middlewares/checkEmailVerify');
const checkEmailVerifyRoleSignIn = require('../middlewares/checkEmailVerifyRoleSignIn');
const checkProfileAccessPermision = require('../middlewares/checkProfileAccessPermision');
//const bookApointmentController = require('../controllers/bookApointment.controller');
//profile access




// vineet
const checkClinicEmail = require('../middlewares/checkClinicEmail');
const checkClinicMobileNumber = require('../middlewares/checkClinicMobileNumber');
const checkDoctorExistence = require('../middlewares/checkDoctorExistence');
const checkDoctorExistenceForUpdate = require('../middlewares/checkDoctorExistenceForUpdate');
const checkClinicHospitalForgotEmail = require('../middlewares/checkClinicHospitalForgotEmail');
const checkPatientExistence = require('../middlewares/checkPatientExistence');
const checkStaffExistence = require('../middlewares/checkStaffExistence');
const checkStaffExistenceForUpdate = require('../middlewares/checkStaffExistenceForUpdate');
const checkUserExistenceForUpdate = require('../middlewares/checkUserExistenceForUpdate');
const checkPromoCodeExistence = require('../middlewares/checkPromoCodeExistence');
const checkPromoCodeExistenceForUpdate = require('../middlewares/checkPromoCodeExistenceForUpdate');
const checkExistence = require('../middlewares/checkExistence');
// vineet

const { bankDetailValidator: bankDetailValidator, addUpdateBankDetailValidator: addUpdateBankDetailValidator } = require('../validators/bankDetail');
const { updateDoctorFeeValidation: updateDoctorFeeValidation, deleteDoctorFeeValidation: deleteDoctorFeeValidation, getDoctorListValidation: getDoctorListValidation, getDoctorDetailsValidation: getDoctorDetailsValidation, listDoctorValidation: listDoctorValidation, deleteDoctorValidation: deleteDoctorValidation, addDoctorFeeValidation: addDoctorFeeValidation } = require('../validators/doctor');
const { listStaffValidation: listStaffValidation, deleteStaffValidation: deleteStaffValidation, getStaffDetailValidation: getStaffDetailValidation } = require('../validators/staff');
const { getDoctorsClinicValidation: getDoctorsClinicValidation, getClinicAppointmentValidation: getClinicAppointmentValidation, addSymptomValidation: addSymptomValidation, symptomListValidation: symptomListValidation, addHealthStatusValidation: addHealthStatusValidation, healthStatusListValidation: healthStatusListValidation, addExamFindingValidation: addExamFindingValidation, examFindingListValidation: examFindingListValidation, addAdviceValidation: addAdviceValidation, adviceListValidation: adviceListValidation, addFollowUpValidation: addFollowUpValidation, followupListValidation: followupListValidation, addDiagnosticValidation: addDiagnosticValidation } = require('../validators/appointment');
const { prescriptionFooterValidation: prescriptionFooterValidation } = require('../validators/prescription');


// const authController = require('../controllers/auth.controller');
const doctorFeeController = require('../controllers/doctorFee.controller');
const doctorController = require('../controllers/doctor.controller');
const bankDetailController = require('../controllers/bankDetail.controller');
const patientController = require('../controllers/patient.controller');
const staffController = require('../controllers/staff.controller');
const promocodeController = require('../controllers/promoCode.controller');
const planController = require('../controllers/plan.controller');
const appointmentController = require('../controllers/appointment.controller');
const prescriptionController = require('../controllers/prescription.controller');
const profileAccessController = require('../controllers/profileAccess.controller');

//krishna
const { symtomesAdd: symtomesAdd, symtomesList: symtomesList, addpregnantWomen: addpregnantWomen } = require('../validators/symtomes');
const { menturationCycleAdd: menturationCycleAdd, menturationCycleEdit: menturationCycleEdit } = require('../validators/menturationCycle');
const { latestTestReportValidate: latestTestReportValidate } = require('../validators/dashboard');

const symtomesController = require('../controllers/symtomes.controller');
const pregnantWomen = require('../controllers/pregnantWomen.controller');
const menturationCycleController = require('../controllers/menturationCycle.controller');
const laboratoryController = require('../controllers/laboratoryController.js');
const scanDocumentController = require('../controllers/scanDocument.controller');
const settingContentController = require('../controllers/settingContent.controller');
const doctorSpecialityMasterController = require('../controllers/doctorSpecialityMaster.controller');


//phase3
const addDoctorByPatient = require('../controllers/addDoctorByPatient.controller');
const bookApointmentController = require('../controllers/bookApointment.controller');
const addByDoctor = require('../controllers/addByDoctor.controller');
const bookingHistoryController = require('../controllers/bookingHistory.controller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './public/member/')
    },
    filename: function (req, file, cb) {
        // cb(null,new Date().toISOString().replace(/:/g,'-')+file.originalname)
        const r_no = Math.random() * 1000;
        cb(null, r_no + "_" + Date.now() + path.extname(file.originalname));
    }
})
// const fileFilter = (req,file,cb) => {
//     // reject or accept file
//     if(file.mimetype === 'image/jpeg' || file.mimetype==='image/png' || file.mimetype === 'image/jpg')
//     {
//         cb(null,true)
//     }else{
//         cb(null,false)
//     }
// } 
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
    }
    //fileFilter:fileFilter
})

const signStorage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './public/signature/')
    },
    filename: function (req, file, cb) {
        // cb(null,new Date().toISOString().replace(/:/g,'-')+file.originalname)
        const r_no = Math.random() * 1000;
        cb(null, r_no + "_" + Date.now() + path.extname(file.originalname));
    }
})

const signUpload = multer({
    storage: signStorage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
    }
    //fileFilter:fileFilter
})

router.route('/truncate').post(asyncHandler(authController.trunCate));

router.route('/signup').post(signupValidator, asyncHandler(checkExistence), asyncHandler(authController.signup));
router.route('/signin').post(signinValidator, asyncHandler(checkForgotEmail), checkEmailVerify, asyncHandler(authController.signin));
router.route('/logout').post(asyncHandler(jwtAuth), asyncHandler(authController.logOut));
router.route('/profile').post(asyncHandler(jwtAuth), asyncHandler(authController.profile));
router.route('/resendotp').post(asyncHandler(authController.resendOtp));
router.route('/forgotPassword').post(asyncHandler(checkForgotEmail), asyncHandler(authController.forgotPassword));
router.route('/resetPassword').post(asyncHandler(authController.resetPassword));

router.route('/radiosignup').post(upload.single('approve_document'), asyncHandler(checkExistence), asyncHandler(authController.radiosignup));
router.route('/role-signin').post(signinValidatorRole, asyncHandler(checkForgotEmail), checkEmailVerifyRoleSignIn, asyncHandler(authController.signinRole));

router.route('/members').post(asyncHandler(jwtAuth), asyncHandler(authController.myprofiles));
router.route('/addmember').post(asyncHandler(jwtAuth), upload.single('profile_image'), checkMemberLimit, asyncHandler(authController.addMembers));
router.route('/updatemember').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(authController.updateMember));
router.route('/deletemember').post(asyncHandler(jwtAuth), asyncHandler(authController.deleteMember));

router.route('/updateUser').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(authController.updateUser));
router.route('/updatePassword').post(asyncHandler(jwtAuth), updatePasswordValidator, asyncHandler(authController.updatePassword));
router.route('/updateUserDoctor').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(authController.updateDoctorUser));
router.route('/update-device-detail').post(asyncHandler(jwtAuth), asyncHandler(authController.updateDeviceDetail));

router.route('/addBmi').post(asyncHandler(jwtAuth), addBmiValidator, asyncHandler(healthController.addBmi));
router.route('/listBmi').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listBmi));

router.route('/heartRate').post(asyncHandler(jwtAuth), heartRateValidator, asyncHandler(healthController.heartRate));
router.route('/listHeartRate').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listHeartRate));

router.route('/bloodPressure').post(asyncHandler(jwtAuth), bloodPressureValidator, asyncHandler(healthController.bloodPressure));
router.route('/listBloodPressure').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listBloodPressure));

router.route('/respiratory').post(asyncHandler(jwtAuth), respiratoryValidator, asyncHandler(healthController.respiratory));
router.route('/listRespiratory').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listRespiratory));

router.route('/oxygen').post(asyncHandler(jwtAuth), oxygenValidator, asyncHandler(healthController.oxygen));
router.route('/listOxygen').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listOxygen));

router.route('/temperature').post(asyncHandler(jwtAuth), temperatureValidator, asyncHandler(healthController.temperature));
router.route('/listTemperature').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listTemperature));

router.route('/listdashboard').post(asyncHandler(jwtAuth), listdata, asyncHandler(healthController.listdashboard));
router.route('/deletehealthreport').post(asyncHandler(jwtAuth), asyncHandler(healthController.deletehealthreport));

router.route('/history_notepad').post(asyncHandler(jwtAuth), historyNotepadValidator, asyncHandler(healthController.history_notepad));
router.route('/list_history_notepad').post(asyncHandler(jwtAuth), historyNotepadData, asyncHandler(healthController.list_history_notepad));
router.route('/single_history_notepad').post(asyncHandler(jwtAuth), historyNotepadsingleData, asyncHandler(healthController.single_history_notepad));
router.route('/update_history_notepad').post(asyncHandler(jwtAuth), historyNotepadUpdateData, asyncHandler(healthController.update_history_notepad));

router.route('/notification_pre_medicine').post(asyncHandler(jwtAuth), notification_pre_medicine, asyncHandler(notificationController.notification_pre_medicine));
router.route('/list_notification_pre_medicine').post(asyncHandler(jwtAuth), list_notification_pre_medicine, asyncHandler(notificationController.list_notification_pre_medicine));
router.route('/pre_notification').post(asyncHandler(jwtAuth), pre_notification, asyncHandler(notificationController.pre_notification));
router.route('/list_pre_notification').post(asyncHandler(jwtAuth), list_pre_notification, asyncHandler(notificationController.list_pre_notification));
router.route('/edit_notification_pre_medicine').post(asyncHandler(jwtAuth), edit_notification_pre_medicine, asyncHandler(notificationController.edit_notification_pre_medicine));
router.route('/delete_notification_pre_medicine').post(asyncHandler(jwtAuth), asyncHandler(notificationController.delete_notification_pre_medicine));
router.route('/delete-pre-notification').post(asyncHandler(jwtAuth), asyncHandler(notificationController.deletePreNotification));


router.route('/list_baby').post(asyncHandler(jwtAuth), list_baby, asyncHandler(babyController.list_baby));
router.route('/add_baby').post(asyncHandler(jwtAuth), add_baby, asyncHandler(babyController.add_baby));
router.route('/update_baby').post(asyncHandler(jwtAuth), update_baby, asyncHandler(babyController.update_baby));
router.route('/delete_baby').post(asyncHandler(jwtAuth), delete_baby, asyncHandler(babyController.delete_baby));
router.route('/single_baby').post(asyncHandler(jwtAuth), delete_baby, asyncHandler(babyController.single_baby));
router.route('/user_baby_vaccination').post(asyncHandler(jwtAuth), asyncHandler(babyController.user_baby_vaccination));
router.route('/single_baby_vaccination').post(asyncHandler(jwtAuth), asyncHandler(babyController.single_baby_vaccination));
router.route('/update_baby_vaccination').post(asyncHandler(jwtAuth), asyncHandler(babyController.update_baby_vaccination));

router.route('/list_document').post(asyncHandler(jwtAuth), asyncHandler(documentController.list_document));
router.route('/add_document').post(asyncHandler(jwtAuth), upload.single('document_file'), asyncHandler(documentController.add_document));
router.route('/delete_document').post(asyncHandler(jwtAuth), asyncHandler(documentController.delete_document));

router.route('/dashboardChart').post(asyncHandler(dashboard.heartchart));

//krishna
router.route('/add-symtome').post(asyncHandler(jwtAuth), symtomesAdd, asyncHandler(symtomesController.createSymtomes));
router.route('/symtomes-list').post(asyncHandler(jwtAuth), symtomesList, asyncHandler(symtomesController.findSymtomesId));
router.route('/default-symptoms-list').post(asyncHandler(jwtAuth), asyncHandler(symtomesController.defaultSymptomList));
router.route('/add-user-symptoms').post(asyncHandler(jwtAuth), asyncHandler(symtomesController.addUserSymptom));
router.route('/default-symptoms-list-web').post(asyncHandler(jwtAuth), asyncHandler(symtomesController.DefaultSymptomListWeb));

router.route('/add-pregnant-women').post(asyncHandler(jwtAuth), addpregnantWomen, asyncHandler(pregnantWomen.create));
router.route('/pregnant-women').post(asyncHandler(jwtAuth), asyncHandler(pregnantWomen.show));
router.route('/delete-pregnant-women').post(asyncHandler(jwtAuth), asyncHandler(pregnantWomen.delete));
router.route('/view-pregnant-women').post(asyncHandler(jwtAuth), asyncHandler(pregnantWomen.findById));
router.route('/add-menturation-cycle').post(asyncHandler(jwtAuth), asyncHandler(menturationCycleController.create));
router.route('/edit-menturation-cycle').post(asyncHandler(jwtAuth), asyncHandler(menturationCycleController.update));
router.route('/delete-menturation-cycle').post(asyncHandler(jwtAuth), asyncHandler(menturationCycleController.delete));
router.route('/list-menturation-cycle').post(asyncHandler(jwtAuth), asyncHandler(menturationCycleController.show));

router.route('/add-menturation-cycles').post(asyncHandler(jwtAuth), asyncHandler(menturationCycleController.createNew));
router.route('/list-menturation-cycles').post(asyncHandler(jwtAuth), asyncHandler(menturationCycleController.showNew));

router.route('/list-document-latest').post(asyncHandler(jwtAuth), asyncHandler(documentController.list_document_six));
router.route('/latest-test-report').post(asyncHandler(jwtAuth), latestTestReportValidate, asyncHandler(laboratoryController.latestTestReport));
router.route('/patient-test-report').post(asyncHandler(jwtAuth), latestTestReportValidate, asyncHandler(laboratoryController.testReport));
router.route('/latest-doc').post(asyncHandler(jwtAuth), asyncHandler(documentController.latestTestDocs));

router.route('/scan-document').post(asyncHandler(jwtAuth), upload.single('document_file'), asyncHandler(scanDocumentController.create));
//router.route('/search-document').post(asyncHandler(jwtAuth),asyncHandler(scanDocumentController.searchDoc ));
router.route('/scan-document-list').post(asyncHandler(jwtAuth), asyncHandler(scanDocumentController.scanDocList));
router.route('/check-otp-verify').post(asyncHandler(authController.checkOtpVerify));
router.route('/search-document').post(asyncHandler(jwtAuth), asyncHandler(documentController.search_document));
router.route('/search-document-timeline').post(asyncHandler(jwtAuth), asyncHandler(documentController.searchDocumentTimeline));


router.route('/labRadiolist').post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.labRadiolist));
router.route('/AddlabRadio').post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.AddlabRadio));
router.route('/DoctorlabRadioList').post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.showDoctorlabRadio));
router.route('/DeleteDoctorlabRadio').post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.DeleteDoctorlabRadio));
router.route('/all-doctor-search').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.allDoctorSearch));
router.route('/doctorSpecialities').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.doctorSpecialities));
router.route('/allclinicList').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.allclinicList));
router.route('/addAppointmentDoctor').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.addAppointmentForDoctor));
router.route('/clinic-add-appointment-doctor').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.clinicAddAppointmentForDoctor));
router.route('/appointmentForDoctorList').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.AppointmentForDoctorList));
router.route('/doctorDetail').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.doctorDetail));
router.route('/patientBillingHistoryLabRadio').post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.patientBillingHistoryLabRadio));
router.route('/doctotTimeSlote').post(asyncHandler(bookApointmentController.viewDoctorAvailability));
router.route('/clinicAppointmenHistory').post(asyncHandler(jwtAuth), asyncHandler(bookingHistoryController.clinicAppointmenHistory));
router.route('/patientBillingHistoryClinic').post(asyncHandler(jwtAuth), asyncHandler(bookingHistoryController.patientBillingHistoryClinic));
router.route('/clinicBookingHistory').post(asyncHandler(jwtAuth), asyncHandler(bookingHistoryController.clinicBookingHistory));
router.route('/DoctorlabRadio').post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.DoctorlabRadio));
router.route('/clinicCard').post(asyncHandler(jwtAuth), asyncHandler(dashboard.clinicCard));
router.route('/doctorCard').post(asyncHandler(jwtAuth), asyncHandler(dashboard.doctorCard));
router.route('/getTermAndCondition').post(asyncHandler(settingContentController.getTermAndCondition));
//vineet

router.route('/clinic-hosptial-signup').post(upload.single('approve_document'), asyncHandler(checkClinicEmail), asyncHandler(checkClinicMobileNumber), asyncHandler(authController.clinichospitalsignup));
router.route('/clinic-hosptial-forgot-password').post(forgotPasswordValidator, asyncHandler(checkClinicHospitalForgotEmail), asyncHandler(authController.clinichospitalforgotPassword));
router.route('/clinic-hosptial-profile').post(asyncHandler(jwtAuth), profileValidator, asyncHandler(authController.clinichospitalprofile));
router.route('/update-profile').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(checkUserExistenceForUpdate), asyncHandler(authController.updateProfile));

// bank detail routes
router.route('/add-update-bank-detail').post(asyncHandler(jwtAuth), addUpdateBankDetailValidator, asyncHandler(bankDetailController.addUpdateBankDetail));
router.route('/get-bank-detail').post(asyncHandler(jwtAuth), bankDetailValidator, asyncHandler(bankDetailController.getBankDetail));

// doctor routes
router.route('/add-doctor').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(doctorController.addDoctors));
router.route('/get-doctor-details').post(asyncHandler(jwtAuth), getDoctorDetailsValidation, asyncHandler(doctorController.getDoctorDetails));
router.route('/get-all-doctors').post(asyncHandler(jwtAuth), listDoctorValidation, asyncHandler(doctorController.getAllDoctors));
router.route('/update-doctor').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(doctorController.updateDoctor));
router.route('/delete-doctor').post(asyncHandler(jwtAuth), deleteDoctorValidation, asyncHandler(doctorController.deleteDoctor));
router.route('/upload-signature').post(asyncHandler(jwtAuth), signUpload.single('signature'), asyncHandler(doctorController.uploadSignature));
router.route('/get-doctors-clinic').post(asyncHandler(jwtAuth), asyncHandler(doctorController.getDoctorsClinic));
router.route('/get-doctor-signature').post(asyncHandler(jwtAuth), asyncHandler(doctorController.getSignature));

// doctor fee routes
router.route('/add-doctor-fee').post(asyncHandler(jwtAuth), addDoctorFeeValidation, asyncHandler(doctorFeeController.addDoctorFee));
router.route('/fee-specific-doctor-list').post(asyncHandler(jwtAuth), getDoctorListValidation, asyncHandler(doctorFeeController.getFeeSpecificDoctorList));
router.route('/get-all-doctor-fees').post(asyncHandler(jwtAuth), getDoctorListValidation, asyncHandler(doctorFeeController.getAllDoctorFeeList));
router.route('/get-doctor-fee-detail').post(asyncHandler(jwtAuth), asyncHandler(doctorFeeController.getDoctorFeeDetail));
router.route('/update-doctor-fee').post(asyncHandler(jwtAuth), updateDoctorFeeValidation, asyncHandler(doctorFeeController.updateDoctorFee));
router.route('/delete-doctor-fee').post(asyncHandler(jwtAuth), deleteDoctorFeeValidation, asyncHandler(doctorFeeController.deleteDoctorFee));

//patient routes
router.route('/add-patient-clinic').post(upload.single('profile_image'), asyncHandler(checkPatientExistence), asyncHandler(patientController.addForClinic));
router.route('/get-all-patients-clinic').post(asyncHandler(jwtAuth), asyncHandler(patientController.getAllPatientsClinic));


router.route('/search-patient').post(asyncHandler(jwtAuth), asyncHandler(patientController.searchPatient));

router.route('/add-patient').post(upload.single('profile_image'), asyncHandler(checkPatientExistence), asyncHandler(patientController.addPatient));
router.route('/get-all-patients').post(asyncHandler(jwtAuth), asyncHandler(patientController.getAllPatients));

router.route('/get-patient-detail').post(asyncHandler(jwtAuth), asyncHandler(patientController.getPatientDetail));
router.route('/update-patient').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(checkPatientExistence), asyncHandler(patientController.updatePatient));
router.route('/delete-patient').post(asyncHandler(jwtAuth), asyncHandler(patientController.deletePatient));




// staff routes
router.route('/add-staff').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(staffController.addStaff));
router.route('/get-all-staffs').post(asyncHandler(jwtAuth), listStaffValidation, asyncHandler(staffController.getAllStaffs));
router.route('/get-staff-detail').post(asyncHandler(jwtAuth), getStaffDetailValidation, asyncHandler(staffController.getStaffDetail));
router.route('/update-staff').post(asyncHandler(jwtAuth), upload.single('profile_image'), asyncHandler(staffController.updateStaff));
router.route('/delete-staff').post(asyncHandler(jwtAuth), deleteStaffValidation, asyncHandler(staffController.deleteStaff));



// promo code routes
router.route('/add-promo-code').post(asyncHandler(jwtAuth), upload.single('banner_image'), asyncHandler(checkPromoCodeExistence), asyncHandler(promocodeController.addPromoCode));
router.route('/get-all-promo-codes').post(asyncHandler(jwtAuth), asyncHandler(promocodeController.getAllPromoCode));
router.route('/get-promo-code-detail').post(asyncHandler(jwtAuth), asyncHandler(promocodeController.getPromoCodeDetail));
router.route('/update-promo-code').post(asyncHandler(jwtAuth), upload.single('banner_image'), asyncHandler(checkPromoCodeExistenceForUpdate), asyncHandler(promocodeController.updatePromoCode));
router.route('/delete-promo-code').post(asyncHandler(jwtAuth), asyncHandler(promocodeController.deletePromoCode));


//phase3
router.route('/search-doctor').post(asyncHandler(addDoctorByPatient.searchDoctor));
router.route('/addDoctor').post(asyncHandler(addDoctorByPatient.addDoctor));
router.route('/doctorList').post(asyncHandler(addDoctorByPatient.doctorList));
router.route('/deletedoctor').post(asyncHandler(addDoctorByPatient.Deletedoctor));

// plans routes
router.route('/get-all-plans').post(asyncHandler(jwtAuth), asyncHandler(planController.getAllPlans));
router.route('/purchase-plan').post(asyncHandler(jwtAuth), asyncHandler(planController.purchasePlan));
router.route('/user-plan-purchase-history').post(asyncHandler(jwtAuth), asyncHandler(planController.userPlanPurchaseHistory));


// appointment routes

router.route('/clinic-list').post(asyncHandler(jwtAuth), getDoctorsClinicValidation, asyncHandler(appointmentController.clinicList));
router.route('/appointment-list').post(asyncHandler(jwtAuth), getClinicAppointmentValidation, asyncHandler(appointmentController.appointmentList));
router.route('/add-symptom').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addSymptom));
router.route('/add-vital').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addVital));
router.route('/add-examination-finding').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addExamFinding));
router.route('/add-advice').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addAdvice));
router.route('/add-follow-up').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addFollowUp));
router.route('/add-diagnostic').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addDignostic));
router.route('/add-drug').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.addDrug));
router.route('/lab-list').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.labList));
router.route('/prescription-detail').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.prescriptionDetail));
router.route('/clinic-appointment-list').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.clinicAppointmentList));
router.route('/generate-pdf').post(asyncHandler(appointmentController.generatePDF));
router.route('/generate-pdf1').post(asyncHandler(appointmentController.generatePDF1));
router.route('/get-insight-appointments').post(asyncHandler(jwtAuth), asyncHandler(appointmentController.getInsightAppointments));


//prescription routes
router.route('/manage-prescription-header').post(asyncHandler(jwtAuth), upload.single('clinic_logo'), asyncHandler(prescriptionController.managePrescriptionHeader));
router.route('/manage-prescription-footer').post(asyncHandler(jwtAuth), prescriptionFooterValidation, asyncHandler(prescriptionController.managePrescriptionFooter));
router.route('/get-prescription-detail').post(asyncHandler(jwtAuth), asyncHandler(prescriptionController.getPrescriptionDetail));

// plans routes
router.route('/purchase-plan').post(asyncHandler(jwtAuth), asyncHandler(planController.purchasePlan));
router.route('/renew-plan').post(asyncHandler(jwtAuth), asyncHandler(planController.renewPlan));


// notification routes 
router.route('/add-notification').post(asyncHandler(jwtAuth), asyncHandler(notificationController.addNotification));
router.route('/get-all-notifications').post(asyncHandler(jwtAuth), asyncHandler(notificationController.getAllNotifications));
router.route('/get-notification-detail').post(asyncHandler(jwtAuth), asyncHandler(notificationController.getNotificationDetail));

router.route('/update-notification').post(asyncHandler(jwtAuth), asyncHandler(notificationController.updateNotification));
router.route('/delete-notification').post(asyncHandler(jwtAuth), asyncHandler(notificationController.deleteNotification));
router.route('/onlineOflineStatus').post(asyncHandler(checkEmail), asyncHandler(authController.onlineOflineStatus));
router.route('/get-all-system-notifications').post(asyncHandler(jwtAuth), asyncHandler(notificationController.getAllSystemNotifications));
router.route('/read-system-notifications').post(asyncHandler(jwtAuth), asyncHandler(notificationController.readAllSystemNotifications));

//Parth
router.route('/add-doctor-schedule').post(asyncHandler(doctorController.addDoctorWeeklySchedule));
router.route('/add-doctor-availability').post(asyncHandler(doctorController.addDoctorAvailability));
router.route('/view-doctor-availability').post(asyncHandler(doctorController.viewDoctorAvailability));
router.route('/view-doctor-weekly-schedule').post(asyncHandler(doctorController.viewDoctorWeeklySchedule));

// profile access routes
router.route('/profile-access-request').post(asyncHandler(jwtAuth), asyncHandler(doctorController.profileAccessRequest));
router.route('/profile-access-list').post(asyncHandler(jwtAuth), asyncHandler(doctorController.profileAccessList));
router.route('/profile-access-detail').post(asyncHandler(jwtAuth), asyncHandler(doctorController.profileAccessDetail));
router.route('/update-profile-access').post(asyncHandler(jwtAuth), asyncHandler(doctorController.updateProfileAccess));
router.route('/change-profile-access-request-status').post(asyncHandler(jwtAuth), asyncHandler(doctorController.changeProfileAccessRequestStatus));
router.route('/delete-profile-access').post(asyncHandler(jwtAuth), asyncHandler(doctorController.deleteProfileAccess));

//kk
router.route('/healthResult').post(asyncHandler(jwtAuth), checkProfileAccessPermision, asyncHandler(profileAccessController.healthResult));
router.route('/documentAccess').post(asyncHandler(jwtAuth), checkProfileAccessPermision, asyncHandler(profileAccessController.documentAccess));
router.route('/viewProfileAccess').post(asyncHandler(jwtAuth), checkProfileAccessPermision, asyncHandler(profileAccessController.viewProfileAccess));
router.route('/resendProfileAcess').post(asyncHandler(jwtAuth), asyncHandler(profileAccessController.resendProfileAcess));
router.route('/profileAccessDetail').post(asyncHandler(jwtAuth), asyncHandler(profileAccessController.profileAccessDetail));

// zoom meeting routes by vineet
router.route('/create-zoom-meeting').get(asyncHandler(doctorController.createZoomMeeting));
router.route('/get-user-info').get(asyncHandler(doctorController.getUserInfo));
router.route('/send-meeting-notification').post(asyncHandler(jwtAuth), asyncHandler(doctorController.sendMeetingNotification));


//dipesh sir
router.route('/payment-appointment').get(asyncHandler(ccavenuePayment.paymentAppointment));
router.route('/payment-appointment-callback').post(asyncHandler(ccavenuePayment.paymentAppointmentCallback));
router.route('/payment-plan').get(asyncHandler(ccavenuePayment.paymentPlan));
router.route('/payment-plan-callback').post(asyncHandler(ccavenuePayment.paymentPlanCallback));

router.route('/EmailOtpVerify').post(asyncHandler(authController.EmailOtpVerify));
router.route('/PasswordOtpVerify').post(asyncHandler(authController.PasswordOtpVerify));
router.route('/vendor-payment').post(asyncHandler(ccavenuePayment.vendorPayment));



router.route('/create-online-appointment-meeting').post(asyncHandler(jwtAuth), asyncHandler(doctorController.createOnlineAppointmentMeeting));
router.route('/get-online-appointment-meeting').post(asyncHandler(jwtAuth), asyncHandler(doctorController.getOnlineAppointmentMeeting));

router.route('/doctor-speciality-master-list').post(asyncHandler(doctorSpecialityMasterController.show));

module.exports = router;
