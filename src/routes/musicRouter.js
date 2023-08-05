const express = require('express');
const musicController = require('../controllers/musicController');

const router = express.Router();

router.route('/stream/:filename').get(musicController.streamSong);

module.exports = router;
