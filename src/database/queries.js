const { hash } = require("../utils/password");
const { DB_NAME } = require("../utils/secrets");

const createDB = `CREATE DATABASE IF NOT EXISTS ${DB_NAME}`;

const dropDB = `DROP DATABASE IF EXISTS ${DB_NAME}`;

const createAdmin = `insert into super_admin (name, email, gender, image_name, mobile_no, password, role)
values ('${process.env.ADMIN_NAME}', '${process.env.ADMIN_EMAIL}', NULL, NULL, NULL, '${hash(process.env.ADMIN_PASSWORD)}', 'admin');`;

const createTableUsers = `
CREATE TABLE
IF
  NOT EXISTS users (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    first_name VARCHAR (100) NOT NULL,
    last_name VARCHAR (100) NULL,
    username VARCHAR (100) NULL,
    email VARCHAR (255) UNIQUE,
    mobile VARCHAR (20) UNIQUE,
    alternate_mobile VARCHAR (20),
    gender ENUM ('Male', 'Female', 'Other'),
    date_of_birth VARCHAR (255),
    profile_image VARCHAR (255),
    blood_group VARCHAR (10),
    pin_code VARCHAR (10),
    address VARCHAR (500),
    password VARCHAR (255) NULL,
    role_id INT NOT NULL,
    user_type VARCHAR (50) NOT NULL,
    forgot_otp VARCHAR (10),
    added_by INT COMMENT 'ID of the user who added this user (e.g., Clinic adding a Doctor)',
    created_by_id INT COMMENT 'ID of the primary entity (e.g., Clinic ID)',
    experience_in_year INT,
    doctor_limit INT,
    adhar_card VARCHAR (255),
    approve_document VARCHAR (255),
    permanent_id VARCHAR (50),
    suggested_by VARCHAR (100),
    suggested_by_id INT,
    enquiry_date DATE,
    account_verify ENUM ('0', '1') DEFAULT '0',
    device_token VARCHAR (255),
    device_type VARCHAR (50),
    auth_token VARCHAR (255),
    opening_time VARCHAR (100),
    closing_time VARCHAR (100),
    latitude VARCHAR (255),
    longitude VARCHAR (255),
    status varchar(255) DEFAULT NULL,
    approve_status varchar(255) DEFAULT NULL,
    deleted_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createSuperAdmin = `
CREATE TABLE
IF
  NOT EXISTS super_admin (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    email varchar(255) DEFAULT NULL,
    gender enum('Male','Female','Other') DEFAULT NULL,
    image_name varchar(255) DEFAULT NULL,
    mobile_no varchar(20) DEFAULT NULL,
    password varchar(255) NOT NULL,
    role varchar(50) NOT NULL,
    auth_token varchar(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createUsersDocuments = `
CREATE TABLE
IF
  NOT EXISTS users_documents (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    member_id INT NOT NULL,
    document_title VARCHAR (255) NULL,
    document_file VARCHAR (255) NULL,
    document_date VARCHAR (255) NULL,
    scan_doc_text VARCHAR (255) NULL,
    type VARCHAR (255) NULL,
    appointment_id VARCHAR (255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createNotificationPreMedicine = `
CREATE TABLE
IF
  NOT EXISTS notification_pre_medicine (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    member_id INT NOT NULL,
    medicine_name VARCHAR (255) NULL, 
    medicine_type VARCHAR (255) NULL, 
    quantity VARCHAR (255) NULL, 
    frequency VARCHAR (255) NULL, 
    take_time_one VARCHAR (255) NULL, 
    take_dose_one VARCHAR (255) NULL, 
    take_time_two VARCHAR (255) NULL, 
    take_dose_two VARCHAR (255) NULL,
    take_time_third VARCHAR (255) NULL,
    take_dose_third VARCHAR (255) NULL,
    take_time_fourth VARCHAR (255) NULL,
    take_dose_fourth VARCHAR (255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createUsersHWBMIDetails = `
CREATE TABLE
IF
  NOT EXISTS users_hwbmi_details (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    member_id INT NOT NULL,
    Height VARCHAR (255) NULL,
    Weight VARCHAR (255) NULL,
    BMI VARCHAR (255) NULL,
    heart_rate VARCHAR (255) NULL,
    blood_pressure VARCHAR (255) NULL,
    respiratory_rate VARCHAR (255) NULL,
    oxygen_saturation VARCHAR (255) NULL,
    temperature VARCHAR (255) NULL,
    createdate VARCHAR (255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createNewVisit = `
CREATE TABLE
IF
  NOT EXISTS new_visit (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    member_id INT NOT NULL,
    appointment_id INT NOT NULL,
    lab_id INT NOT NULL,
    mobile VARCHAR (255) NULL,
    online_ofline_status VARCHAR (255) NULL,
    category VARCHAR (255) NULL,
    sub_category VARCHAR (255) NULL,
    type VARCHAR (255) NULL,
    report_document VARCHAR (255) NULL,
    dcm_document VARCHAR (255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createDoctorsClinic = `
CREATE TABLE
IF
  NOT EXISTS doctors_clinic (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    doctor_id INT NOT NULL,
    clinic_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createOperatorPermission = `
CREATE TABLE
IF
  NOT EXISTS operator_permission (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    operator_id INT NOT NULL,
    permissions VARCHAR (255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createPlans = `
CREATE TABLE
IF
  NOT EXISTS plans (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    created_by_id int NOT NULL,
    plan_for varchar(255) NOT NULL,
    benefit varchar(255) NOT NULL,
    plan_name varchar(255) NOT NULL,
    price varchar(255) NOT NULL,
    validity varchar(255) NOT NULL,
    description varchar(255) NOT NULL,
    deleted_at datetime DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createCommissions = `
CREATE TABLE
IF
  NOT EXISTS commissions (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    user_id int not null,
    commission_for varchar (255) null,
    created_by_id int not null,
    commission_percent float(8,2) not null,
    deleted_at datetime DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createAppointments = `
CREATE TABLE
IF
  NOT EXISTS appointments (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    payment_order_id int null,
    user_id int null,
    member_id int null,
    refer_by_id int null,
    promo_code_id int null,
    from_time varchar (255) null,
    appointment_date varchar (255) null,
    total_amount varchar (255) null,
    grand_total varchar (255) null,
    created_by_id int null,
    patient_id int null,
    doctor_id int null,
    clinic_id int null,
    type varchar (255) null,
    consulting_fee varchar (255) null,
    reason varchar (255) null,
    appointments_user_type varchar (255) null,
    status varchar (255) null,
    payment_status varchar (255) null,
    appointment_id int null,
    prescription_pdf_name_for_admin varchar(255) DEFAULT NULL,
    reason_of_reschedule varchar(255) DEFAULT NULL,
    admin_status varchar(255) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createSystemNotifications = `
CREATE TABLE
IF
  NOT EXISTS system_notifications (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    from_user_id int not null,
    to_user_id int not null,
    title varchar (255) null,
    type varchar (255) null,
    message varchar (255) null,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`;

const createNewUser = `
INSERT INTO users(first_name,email,mobile,alternate_mobile,password,user_type,forgot_otp,role_id,created_at) VALUES(?,?,?,?,?,?,?,?,NOW())
`;
const createNewradioUserQuery = "INSERT INTO users(first_name,email,mobile,password,user_type,role_id,adhar_card,approve_document,forgot_otp,created_at) VALUES(?,?,?,?,?,?,?,?,?,NOW())";

const findUserByEmail = `
SELECT * FROM users WHERE email = ? OR mobile = ?
`;
const findUserByIdQuery = "SELECT * FROM users WHERE id = ?";

const verifyOtp = "UPDATE users SET forgot_otp = ? WHERE (email= ? OR mobile= ?) AND role_id=?";

const verifyOtpUpdate = "UPDATE users SET otp_status_mobile =1 WHERE id= ?";

const findMemberByIdQuery = "SELECT * FROM users WHERE id=? OR created_by_id= ?";

const createMember = `
INSERT INTO users(first_name,date_of_birth,user_type,role_id,gender,profile_image,blood_group,created_by_id,created_at) VALUES(?,?,?,?,?,?,?,?,NOW())
`;

const updateMember = `UPDATE users SET first_name = ?, mobile = ?, date_of_birth = ?, gender = ?, profile_image = ?, blood_group=?  WHERE id = ?
`;

const resetPassword = "UPDATE users SET password = ? WHERE forgot_otp = ? AND email= ?";
const oldPassword = "SELECT * FROM users WHERE password = ? AND id = ?";
const updateUser = "UPDATE users SET  username =?,profile_image=?,gender=?,date_of_birth=?,first_name=?,last_name=?,address=?,pin_code=?,opening_time=?,closing_time=?,alternate_mobile=?,blood_group=?,latitude=?,longitude=? WHERE id =?";

const updatePassword = "UPDATE users SET password=? WHERE id =?";


// vineet

const createNewClinicOrHospitalQuery = "INSERT INTO users(first_name,email,mobile,password,user_type,role_id,adhar_card,approve_document,doctor_limit,created_at) VALUES(?,?,?,?,?,?,?,?,3,NOW())";

const createDoctor = "INSERT INTO users(added_by,first_name,email,mobile,alternate_mobile,gender,experience_in_year,date_of_birth,user_type,role_id,created_by_id,password,profile_image,created_at,account_verify) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),'1')";


const findClinicOrHospitalByIdAndRoleQuery = "SELECT id,first_name,last_name,mobile,adhar_card,date_of_birth,gender,profile_image FROM users WHERE id=? and role_id = ?";
//17/10/2022
const addStaff = "INSERT INTO users(first_name,email,mobile,gender,date_of_birth,role_id,created_by_id,password,user_type,profile_image,created_at,account_verify) VALUES(?,?,?,?,?,?,?,?,?,?,NOW(),'1')";
const updateStaff = "update users SET first_name = ?, role_id = ?, email = ?, mobile = ?, date_of_birth = ?, gender = ? ,user_type = ? , profile_image = ?,updated_at = ? WHERE id = ?";

const addPatient = "INSERT INTO users(added_by,alternate_mobile,first_name,email,date_of_birth,mobile,gender,role_id,pin_code,address,created_by_id,suggested_by,suggested_by_id,user_type,enquiry_date,profile_image,password) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
const updatePatient = "update users SET alternate_mobile = ?, first_name = ?, email = ?, mobile = ?, date_of_birth = ?,  gender = ?  ,pin_code = ? ,address = ? ,profile_image = ?, suggested_by = ?,suggested_by_id = ?, enquiry_date = ? ,updated_at = ?  WHERE id = ?";

// vineet

const addDoctorSpeciality = "INSERT INTO doctor_specialities(doctor_id,speciality_name,created_by_id,created_at) VALUES(?,?,?,NOW())";
const addDoctorDegree = "INSERT INTO doctor_degrees(doctor_id,degree_name,created_by_id,created_at) VALUES(?,?,?,NOW())";

const updateDoctorSpeciality = "UPDATE doctor_specialities SET speciality_name = ?,updated_at = ? where  id = ?";
const updateDoctorDegree = "UPDATE doctor_degrees SET degree_name = ? ,updated_at = ? where  id = ?";


const addPromoCode = "INSERT INTO promo_code(promo_code_for,promo_code_for_id,discount_type,promo_code,discount_rate,discount_price,validity_start_date,validity_end_date,max_uses,price,banner_image,description,created_by_id ,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())";
const updatePromoCode = "update promo_code SET promo_code_for = ? , promo_code_for_id = ? ,  discount_type = ?,promo_code = ? , discount_rate = ?,discount_price =?, validity_start_date = ?, validity_end_date = ?, max_uses = ?, price = ? ,banner_image = ?  , description = ? ,updated_at = ? WHERE id = ?";


//Parth
const addDoctorSchedule = "Insert into doctor_schedule(doctor_id,clinic_id,days,morning_shift_start,morning_shift_end,afternoon_shift_start,afternoon_shift_end,evening_shift_start,evening_shift_end,status,created_at) values(?,?,?,?,?,?,?,?,?,?,NOW())";
const updateDoctorSchedule = "UPDATE doctor_schedule SET days = ?,morning_shift_start = ? ,morning_shift_end = ?,afternoon_shift_start = ?,afternoon_shift_end = ?,evening_shift_start = ?,evening_shift_end = ?,status = ?,updated_at = NOW() where id = ?";
const addDoctorAvailability = "Insert into doctor_schedule_date(doctor_id,clinic_id,date,days_status,morning_shift_status,afternoon_shift_status,evening_shift_status,day_name) values(?,?,?,?,?,?,?,?)";
const updateDoctorAvailability = "UPDATE doctor_schedule_date SET date = ?,days_status = ? ,morning_shift_status = ?,afternoon_shift_status = ?,evening_shift_status = ?,day_name = ? where id = ?";

module.exports = {
    createDB,
    dropDB,
    createAdmin,

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
    
    createNewUser,
    findUserByEmail,
    findUserByIdQuery,
    verifyOtp,
    verifyOtpUpdate,
    findMemberByIdQuery,
    createMember,
    updateMember,
    resetPassword,
    updateUser,
    updatePassword,
    oldPassword,
    createNewradioUserQuery,
    createNewClinicOrHospitalQuery,
    createDoctor,
    findClinicOrHospitalByIdAndRoleQuery,
    addStaff,
    updateStaff,
    addPatient,
    updatePatient,
    addDoctorSpeciality,
    addDoctorDegree,
    updateDoctorSpeciality,
    updateDoctorDegree,
    addPromoCode,
    updatePromoCode,
    addDoctorSchedule,
    updateDoctorSchedule,
    addDoctorAvailability,
    updateDoctorAvailability
};
