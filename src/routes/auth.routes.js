const express = require('express');
const authController = require('../controllers/authentication/jwtauth.controller');
const authorizeMiddleware = require('../middleware/authorize.middleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/sendotp', authController.sendOtp);
router.post('/verify', authController.verifyOtp);
router.get('/refresh', authController.refresh);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authorizeMiddleware.protect);

router.get('/logout', authController.logout);
router.patch('/update-email', authController.updateEmailRequest);
router.get('/email-verify/:token', authController.updateEmailVerify);
router.patch('/update-password', authController.updatePassword);

module.exports = router;
