const express = require('express');
const router = express.Router();
require('dotenv').config();

const authentication = require('../middleware/authentication.js')
const cors = require('../middleware/cors_allow_all.js')
const workout_history_controller = require('../controller/workout_history.js')


router.post('/workout_history', cors.allow_all, authentication.authenticate_token, workout_history_controller.start_workout);
router.post('/workout_history/send_rep', cors.allow_all, authentication.authenticate_token, workout_history_controller.send_rep);
router.put('/workout_history/skip_exercise', cors.allow_all, authentication.authenticate_token, workout_history_controller.skip_exercise);
router.put('/workout_history/end_exercise', cors.allow_all, authentication.authenticate_token, workout_history_controller.end_exercise);


module.exports = router;
