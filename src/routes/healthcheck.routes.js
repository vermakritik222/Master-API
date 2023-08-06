const express = require('express');
const { healthcheck }  = require("../controllers/healthcheckController");

const router = express.Router();

router.route("/").get(healthcheck);

module.exports = router;