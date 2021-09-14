const express = require('express');
const router = express.Router();
require('dotenv').config();

const authentication = require('../middleware/authentication.js')
const workout_controller = require('../controller/workout.js')
const cors = require('../middleware/cors_allow_all.js')

router.post("/workout", cors.allow_all,  authentication.authenticate_token, workout_controller.workout_post);
router.get("/workout", cors.allow_all, authentication.authenticate_token, workout_controller.workout_get);
router.delete("/workout/:workoutId", cors.allow_all, authentication.authenticate_token, workout_controller.workout_delete);

/*
 * Rename a workout.
 */
router.post("/workout/rename", cors.allow_all, authentication.authenticate_token, workout_controller.workout_post_rename);

/*
 * Replace the entire exercise in a workout.
 */
router.post("/workout/update_exercise", cors.allow_all, authentication.authenticate_token, workout_controller.workout_post_update_exercise)

router.put('/workout/exercise', cors.allow_all, authentication.authenticate_token, workout_controller.workout_delete_exercise )

/*
 * Rename an exercise in the workout.
 */
router.put("/workout/rename_exercise", cors.allow_all, authentication.authenticate_token, workout_controller.workout_put_exercise_name)

/*
 * Change the reps in an exercise in the workout.
 */
router.put("/workout/rep_change", cors.allow_all, authentication.authenticate_token, workout_controller.workout_change_reps)

/*
 * Add an empty exercise to the workout.
 */
router.put("/workout/add_exercise", cors.allow_all, authentication.authenticate_token, workout_controller.workout_add_exercise)

/*
 * Add a repetition to an exercise. 
 */
router.put("/workout/add_repetition", cors.allow_all, authentication.authenticate_token, workout_controller.workout_add_repetition)

router.put("/workout/delete_rep", cors.allow_all, authentication.authenticate_token, workout_controller.workout_controller_delete_repetition)



module.exports = router
