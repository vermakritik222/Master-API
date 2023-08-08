const express = require('express');
const userControllers = require('../../controllers/users/userControllers');

const router = express.Router();

router.get('/me', userControllers.getMe, userControllers.getUser);

router.delete('/deleteMe', userControllers.deleteMe);

module.exports = router;