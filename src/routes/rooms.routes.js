const express = require('express');
const roomsController = require('../controllers/apps/voiceChat/rooms.controller');

const router = express.Router();

router
    .route('/')
    .get(saveMe, roomsController.getAll)
    .post(saveMe, roomsController.create);
    
router.get('/:roomId', roomsController.getOne);

module.exports = router;