const express = require('express');
const { healthCheck }  = require("../controllers/healthCheck.controller");

const router = express.Router();

router.route("/").get(healthCheck);

module.exports = router;