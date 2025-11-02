function generateOTP() {
    let otp = '';
    const value = Math.floor(1000 + Math.random() * 9000);
    otp = otp + value;
    return otp;
}

module.exports = generateOTP;