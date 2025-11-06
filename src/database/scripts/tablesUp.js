const { logger } = require("../../utils/logger");
const dbConnection = require("../../config/db.config");

const {
    createTableUsers,
    createSuperAdmin,
    createUsersDocuments,
    createNotificationPreMedicine,
    createUsersHWBMIDetails,
    createNewVisit,
    createDoctorsClinic,
    createOperatorPermission,
    createPlans,
    createCommissions,
    createAppointments,
    createSystemNotifications,
    createProfileAccess,
    createPreNotification,
    createPlanPurchaseHistory,
    createDoctorSpecialities,
    createDoctorDegrees,
    createSpecialityMaster,
    createDoctorFees,
    createUsersPatient,
    createRole,
} = require("../queries");

const tableCreationQueries = [
    { name: "users", query: createTableUsers },
    { name: "super_admin", query: createSuperAdmin },
    { name: "users_documents", query: createUsersDocuments },
    { name: "notification_pre_medicine", query: createNotificationPreMedicine },
    { name: "users_hwbmi_details", query: createUsersHWBMIDetails },
    { name: "new_visit", query: createNewVisit },
    { name: "doctors_clinic", query: createDoctorsClinic },
    { name: "operator_permission", query: createOperatorPermission },
    { name: "plans", query: createPlans },
    { name: "commissions", query: createCommissions },
    { name: "appointments", query: createAppointments },
    { name: "system_notifications", query: createSystemNotifications },
    { name: "profile_access", query: createProfileAccess },
    { name: "pre_notification", query: createPreNotification },
    { name: "plan_purchase_history", query: createPlanPurchaseHistory },
    { name: "doctor_specialities", query: createDoctorSpecialities },
    { name: "doctor_degrees", query: createDoctorDegrees },
    { name: "doctor_speciality_master", query: createSpecialityMaster },
    { name: "doctor_fees", query: createDoctorFees },
    { name: "users_patient", query: createUsersPatient },
    { name: "role", query: createRole },
];

(async () => {
    let createdCount = 0;
    let existedCount = 0;
    let errorCount = 0;
    const createdTables = [];
    const existedTables = [];
    const errorTables = [];

    try {
        for (const { name, query } of tableCreationQueries) {
            await new Promise((resolve) => {
                dbConnection.query(query, (err, result) => {
                    if (err) {
                        // --- ERROR CASE ---
                        logger.error(`Error creating table ${name}: ${err.message}`);
                        errorCount++;
                        errorTables.push(name);
                        return resolve(); // अगले टेबल पर जाने के लिए resolve करें
                    }

                    // --- SUCCESS/WARNING LOGIC ---
                    // Log the result to ensure transparency, as requested
                    // console.log(result, "-----"); 
                    
                    // यदि warningStatus 0 है, तो कोई warning नहीं आई, मतलब टेबल अभी बनी है।
                    // यह CREATE TABLE IF NOT EXISTS के लिए सबसे विश्वसनीय चेक है।
                    if (result.warningStatus === 0) {
                        createdCount++;
                        createdTables.push(name);
                        logger.info(`Table ${name} created successfully! (New Table)`);
                    } 
                    // यदि warningStatus 0 से अधिक है, तो warning आई है, मतलब टेबल पहले से थी।
                    else if (result.warningStatus > 0) {
                        existedCount++;
                        existedTables.push(name);
                        logger.info(`Table ${name} already existed (Skipped).`);
                    } 
                    // Fallback (सैद्धांतिक रूप से आवश्यक नहीं)
                    else {
                        createdCount++;
                        createdTables.push(name);
                        logger.info(`Table ${name} created successfully!`);
                    }
                    resolve();
                });
            });
        }
        
        // --- Final Summary Log ---
        logger.info("--- TABLE MIGRATION SUMMARY ---");
        logger.info(`✅ Tables Created: ${createdCount}`);
        if (createdTables.length > 0) {
            logger.info(`   Names: [${createdTables.join(", ")}]`);
        }
        
        logger.info(`🟡 Tables Already Existed: ${existedCount}`);
        if (existedTables.length > 0) {
            logger.info(`   Names: [${existedTables.join(", ")}]`);
        }
        
        logger.error(`❌ Tables Failed (Errors): ${errorCount}`);
        if (errorTables.length > 0) {
            logger.error(`   Names: [${errorTables.join(", ")}]`);
        }
        
        if (errorCount > 0) {
            process.exit(1);
        } else {
            logger.info("✅ All table migrations completed successfully!");
            process.exit(0);
        }

    } catch (error) {
        logger.error(`❌ Unexpected Migration Failure: ${error.message}`);
        process.exit(1);
    }
})();