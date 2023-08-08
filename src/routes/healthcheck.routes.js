const express = require('express');
const { healthCheck }  = require("../controllers/healthCheckController");

const router = express.Router();

router.route("/").get(healthCheck);

module.exports = router;