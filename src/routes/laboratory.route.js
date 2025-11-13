const router = require("express").Router();
const path = require("path");
const { asyncHandler } = require("../middlewares/asyncHandler");
const jwtAuth = require("../middlewares/jwtAuth");
const laboratoryController = require("../controllers/laboratoryController.js");
const testCategory = require("../controllers/testCategory.controller.js");
const labTestController = require("../controllers/labtest.controller.js");
const packageController = require("../controllers/package.controller.js");
const { memberSearch: memberSearch, newVisit: newVisit } = require("../validators/laboratory");

//phase3
const bookApointmentController = require("../controllers/bookApointment.controller");
const addByDoctor = require("../controllers/addByDoctor.controller");

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, "./public/laboratory/");
    },
    filename: function (req, file, cb) {
        // cb(null,new Date().toISOString().replace(/:/g,'-')+file.originalname)
        const r_no = Math.random() * 1000;
        cb(null, r_no + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1000 // 1gb
    }
});

router.route("/memberSearch").post(asyncHandler(jwtAuth), memberSearch, asyncHandler(laboratoryController.memberSearch));

router.route("/newVisit").post(asyncHandler(jwtAuth), newVisit, asyncHandler(laboratoryController.newVisit));

router.route("/visitList").post(asyncHandler(jwtAuth), asyncHandler(laboratoryController.visitList));

router.route("/uploadReport").post(asyncHandler(jwtAuth), upload.single("report_document"), asyncHandler(laboratoryController.uploadReport));

router.route("/upload-multiple-report").post(asyncHandler(jwtAuth), upload.array("report_document"), asyncHandler(laboratoryController.uploadReportMultiple));

router.route("/add-category").post(asyncHandler(jwtAuth), asyncHandler(testCategory.create));
router.route("/edit-category").post(asyncHandler(jwtAuth), asyncHandler(testCategory.update));
router.route("/delete-category").post(asyncHandler(jwtAuth), asyncHandler(testCategory.delete));
router.route("/category-list").post(asyncHandler(jwtAuth), asyncHandler(testCategory.show));
router.route("/category").post(asyncHandler(jwtAuth), asyncHandler(testCategory.GetFirst));

router.route("/add-lab-test").post(asyncHandler(jwtAuth), upload.single("image"), asyncHandler(labTestController.create));
router.route("/edit-lab-test").post(asyncHandler(jwtAuth), upload.single("image"), asyncHandler(labTestController.update));
router.route("/lab-test-list").post(asyncHandler(jwtAuth), asyncHandler(labTestController.show));
router.route("/delete-lab-test").post(asyncHandler(jwtAuth), asyncHandler(labTestController.delete));
router.route("/lab-test").post(asyncHandler(jwtAuth), asyncHandler(labTestController.GetFirst));

router.route("/all-lab-test").post(asyncHandler(jwtAuth), asyncHandler(packageController.allPackageTest));
//alltest
router.route("/add-package").post(asyncHandler(jwtAuth), upload.single("image"), asyncHandler(packageController.create));
router.route("/edit-package").post(asyncHandler(jwtAuth), upload.single("image"), asyncHandler(packageController.update));
router.route("/package-list").post(asyncHandler(jwtAuth), asyncHandler(packageController.list));
router.route("/package").post(asyncHandler(jwtAuth), asyncHandler(packageController.Onelist));
router.route("/delete-package").post(asyncHandler(jwtAuth), asyncHandler(packageController.destroy));
router.route("/all-package").post(asyncHandler(jwtAuth), asyncHandler(packageController.allPackage));

router.route("/package-description").post(asyncHandler(jwtAuth), asyncHandler(packageController.singlePackage));
router.route("/lab-test-description").post(asyncHandler(jwtAuth), asyncHandler(packageController.singleTest));

//phase3
router.route("/coupon-codes").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.CouponCodesList));
router.route("/add-coupon-code").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.addCouponCode));
router.route("/add-cart").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.create));
router.route("/cart-item").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.cartItem));
router.route("/cartlist").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.cartlist));
router.route("/bookingSummery").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.bookingSummery));
router.route("/more-test-list").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.cartlist));
router.route("/checkAppointment-datetime").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.checkAppointment));
router.route("/add-Appointment").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.createAppoint));
router.route("/create-appointment-txn-token").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.createAppointmentTxnToken));
router.route("/appointment-list").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.appointmentList));
router.route("/timeslote-list").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.checktimeslote));
router.route("/lab-radio-appointmentList").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.LabRadioAppointmentList));
router.route("/lab-radio-appointment").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.LabRadioAppointmentfind));
router.route("/lab-radio-appointment-reschedule").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.LabRadioAppointmentStatusReschedule));
router.route("/lab-radio-appointment-status").post(asyncHandler(bookApointmentController.LabRadioAppointmentStatusUpdate));
router.route("/lab-radio-billing-history").post(asyncHandler(jwtAuth), asyncHandler(bookApointmentController.LabRadioBillingHistory));
router.route("/DoctorRequestlabRadioList").post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.DoctorRequestlabRadio));
router.route("/DoctorlabRadio-change-status").post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.statusDoctorlabRadio));
router.route("/labRadioApprovedDoctor").post(asyncHandler(jwtAuth), asyncHandler(addByDoctor.DoctorlabRadioApproved));

router.route("/findTestlistBycategory").post(asyncHandler(jwtAuth), asyncHandler(labTestController.findTestlist));
router.route("/lab-radio-count-detail").post(asyncHandler(jwtAuth), asyncHandler(laboratoryController.labRadioCountDetail));
module.exports = router;