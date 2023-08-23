const express = require('express');
const authController = require('../../../controllers/authentication/phoneAuth.controller');
const activateController = require('../../../controllers/authorization/authorize.controller');
const roomsController = require('../../../controllers/apps/voiceChat/rooms.controller');
const {
    saveMe,
} = require('../../../middleware/authorization/authorizeMiddleware');

const router = express.Router();

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.get('/refresh', authController.refresh);

router.post('/logout', saveMe, authController.logout);

router.post('/activate', saveMe, activateController.activate);

router
    .route('/rooms')
    .get(saveMe, roomsController.index)
    .post(saveMe, roomsController.create);
    
router.get('/rooms/:roomId', saveMe, roomsController.show);

router.get('/test', (req, res) => res.json({ msg: 'OK' }));

module.exports = router;
