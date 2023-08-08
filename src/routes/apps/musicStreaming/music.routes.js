const express = require('express');
const musicController = require('../../../controllers/apps/musicStreaming/musicController');

const router = express.Router();

router.route('/stream/:filename').get(musicController.streamSong);

module.exports = router;
