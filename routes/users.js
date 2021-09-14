const express = require('express');
const router = express.Router();
require('dotenv').config();

const authentication = require('../middleware/authentication.js')
const cors = require('../middleware/cors_allow_all.js')
const user_controller = require('../controller/users.js')


router.post('/user', cors.allow_all, user_controller.user_post);
router.get('/user/:userId', cors.allow_all, authentication.authenticate_token, user_controller.user_get);
router.delete('/user/:userId', cors.allow_all, user_controller.user_delete);

router.post('/login', cors.allow_all, user_controller.login);
router.get('/user_validateToken', cors.allow_all,  authentication.authenticate_token , user_controller.validate_token);

module.exports = router;
