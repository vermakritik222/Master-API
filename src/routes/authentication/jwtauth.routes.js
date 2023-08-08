const express = require('express');
const AuthController = require('../../controllers/authentication/jwtauthController');
const authorizeMiddleware = require('../../middleware/authorization/authorizeMiddleware');

const router = express.Router();

router.post('/signup', AuthController.signup);
router.post('/signup/:token', AuthController.orgSignup);
router.post('/login', AuthController.login);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

router.use(authorizeMiddleware.protect);

router.post('/generate-login-token', AuthController.genOrgUserToken);
router.patch('/updateMyPassword', AuthController.updatePassword);

module.exports = router;