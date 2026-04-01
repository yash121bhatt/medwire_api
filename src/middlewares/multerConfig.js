const multer = require("multer");
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
});

const originalSingle = upload.single.bind(upload);

upload.single = (fieldName) => {
  const middleware = originalSingle(fieldName);
  return (req, res, next) => {
    req.cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER_NAME}/member/`;
    middleware(req, res, next);
  };
};

// --------------------------------- Signature Upload
const signupload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB
});

const originalSingleSign = signupload.single.bind(signupload);

signupload.single = (fieldName) => {
  const middleware = originalSingleSign(fieldName);
  return (req, res, next) => {
    req.cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER_NAME}/signature/`;
    middleware(req, res, next);
  };
};

// --------------------------------- laboratory Upload
const labUpload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1000 }, // 1 GB
});

const originalSingleLab = labUpload.single.bind(labUpload);

labUpload.single = (fieldName) => {
  const middleware = originalSingleLab(fieldName);
  return (req, res, next) => {
    req.cloudinaryFolder = `${process.env.CLOUDINARY_FOLDER_NAME}/laboratory/`;
    middleware(req, res, next);
  };
};

module.exports = { upload, signupload, labUpload };