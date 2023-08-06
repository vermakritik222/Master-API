const express = require('express');
const AuthController = require('../controllers/jwtauthController');

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

router.use(AuthController.protect);

router.patch('/updateMyPassword', AuthController.updatePassword);

module.exports = router;