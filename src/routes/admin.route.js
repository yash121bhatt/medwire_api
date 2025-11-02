const router = require('express').Router();
const path = require('path');
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminCheckForgotEmail = require('../middlewares/adminCheckForgotEmail');
const checkOperatorPermission = require('../middlewares/checkOperatorPermission');
const adminController = require('../controllers/admin.controller');
const { dashboardChart: dashboardChart, latestTestReportValidate: latestTestReportValidate } = require('../validators/dashboard');
const dashboardController = require('../controllers/dashboard.controller');
const laboratoryController = require('../controllers/laboratoryController.js');
const billingHistoryController = require('../controllers/billingHistory.controller');
const bookApointmentController = require('../controllers/bookApointment.controller');
const operaterPermission = require('../controllers/operaterPermission.controller');
const paytmPayment = require('../controllers/paytmPayment.controller');
const notification = require('../controllers/notification.controller');
const jwtAuthAdmin = require("../middlewares/jwtAuthAdmin");
const multer = require('multer');
const cron = require('node-cron');
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
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5mb
    }
    //fileFilter:fileFilter
})

router.route('/login').post(asyncHandler(adminController.signin));
router.route('/admin-profile').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.findById));
router.route('/updateProfile').post(asyncHandler(jwtAuthAdmin), upload.single('profile_image'), asyncHandler(adminController.updateUser));

router.route('/operater-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.operaterShow));
router.route('/operater').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.operaterFindById));
router.route('/add-operater').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), upload.single('profile_image'), asyncHandler(adminController.operaterCreate));
router.route('/edit-operater').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), upload.single('profile_image'), asyncHandler(adminController.operaterUpdate));
router.route('/operater-delete').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.operaterDelete));
router.route('/add-operator-permission').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(operaterPermission.addPermission));
router.route('/show-operator-permission').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(operaterPermission.showPermission));

router.route('/updatePassword').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.updatePassword));
router.route('/forgotPassword').post(asyncHandler(adminCheckForgotEmail), asyncHandler(adminController.forgotPassword));
router.route('/check-otp-verify').post(asyncHandler(adminController.checkOtpVerify));
router.route('/resetPassword').post(asyncHandler(adminController.resetPassword));

router.route('/patient_list').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.paitentList));
router.route('/patient_detail').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.paitentDetail));

router.route('/dashboard_count').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.dashboard_count));
router.route('/patients_chart').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler());
router.route('/laboratories_chart').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler());
router.route('/radiologist_chart').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler());
router.route('/laboratry_list').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.labradList));
router.route('/aprroveLabRadUser').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.aprroveLabRadUser));
router.route('/labradListApprove').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(adminController.labradListApprove));
router.route('/card-data-count').post(asyncHandler(jwtAuthAdmin), asyncHandler(dashboardController.cartdDataCount));
router.route('/dashboard-day-month-year-count').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), asyncHandler(dashboardController.dashboardDayMonthYearCount));
router.route('/dashboard-chart').post(asyncHandler(jwtAuthAdmin), asyncHandler(checkOperatorPermission), dashboardChart, asyncHandler(dashboardController.dashboarChart));
router.route('/latest-test-report').post(asyncHandler(jwtAuthAdmin), latestTestReportValidate, asyncHandler(laboratoryController.latestTestReport));

// vineet
router.route('/clinic-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.clinicList));
router.route('/doctor-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.doctorList));
router.route('/userListApprove').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.userListApprove));
router.route('/approved-user-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.approvedUserList));


router.route('/add-plan').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.addPlan));
router.route('/plan-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.findAllPlans));
router.route('/plan-detail').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getPlanDetail));
router.route('/update-plan').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.updatePlan));
router.route('/delete-plan').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.deletePlan));
router.route('/set-as-default-plan').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.setAsDefaultPlan));
router.route('/plan-purchase-history').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.planPurchaseHistory));

// commission routes
router.route('/add-commission').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.addCommission));
router.route('/get-specific-lab-radiology-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getSpecificLabAndRadioLogyList));
router.route('/get-all-commissions').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getAllCommissions));
router.route('/get-commission-detail').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getCommissionDetail));
router.route('/update-commission').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.updateCommission));
router.route('/delete-commission').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.deleteCommission));

// appointment routes
router.route('/get-all-appointments').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getAllAppointments));
router.route('/get-all-appointments-for-admin').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getAllAppointmentsForAdmin));
router.route('/get-insight-appointments').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getInsightAppointments));
router.route('/get-all-lab-visited-appointments').post(asyncHandler(jwtAuthAdmin), asyncHandler(adminController.getAllLabVistedAppointments));
router.route('/get-all-appointment-for-doctor-list').post(asyncHandler(jwtAuthAdmin), asyncHandler(bookApointmentController.getAllAppointmentForDoctorList));

//phase3 krishna
router.route('/appointment-graph').post(asyncHandler(jwtAuthAdmin), asyncHandler(dashboardController.appointmentGraph));


/*  billing history */
router.route('/billing-history-appointments').post(asyncHandler(jwtAuthAdmin), asyncHandler(billingHistoryController.billingHistoryAppointments));
router.route('/billing-history').post(asyncHandler(jwtAuthAdmin), asyncHandler(billingHistoryController.billingHistoryByRole));
router.route('/billing-unpaid-history').post(asyncHandler(jwtAuthAdmin), asyncHandler(billingHistoryController.unpaidBillingHistory));
router.route('/billing-paid-history').post(asyncHandler(jwtAuthAdmin), asyncHandler(billingHistoryController.paidBillingHistory));
router.route('/add-billing-unpaid-history').post(asyncHandler(jwtAuthAdmin), asyncHandler(billingHistoryController.addUnpaidBillingHistory));
router.route('/payment-billing').get(asyncHandler(paytmPayment.paymentBilling));
router.route('/payment-billing-callback/:id/:email/:type').post(asyncHandler(paytmPayment.paymentBillingCallback));

router.route('/menturation-cycle').post(asyncHandler(notification.menturationCycle));


// cron.schedule('1 * * * * *', function() {
//     /* console.log('cron is working...!'); */
//     notification.InsertMedicineReminder(); 
//     notification.InsertPreReminder(); 
// });
// cron.schedule('* * * * * *', function() {
//     /* console.log('cron is working for pregnant women...!'); */
//     notification.pregnantWomen();
// });
// cron.schedule('* * * 1 * *', function(){
//     notification.menturationCycle();
// });

// cron.schedule('* * * * * *', function() {
//     /*console.log('cron is working for schedule notification');*/
//     notification.sendScheduleNotification();
// });

module.exports = router;