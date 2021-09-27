require('dotenv').config();
const express = require('express');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();

app.set("trust proxy", 'loopback');

app.use(bodyParser.json());

let corsOptions = {
    "origin": "http://localhost:8080",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "credentials" : true
}

//Support preflight requests
app.options('*', cors(corsOptions));

const PORT = process.env.PORT;

const userRoute = require('./routes/users.js')
const workoutRoute = require('./routes/workouts.js')
const historyRoute = require('./routes/workout_history.js')
app.use(userRoute)
app.use(workoutRoute)
app.use(historyRoute)

console.log("port is " + PORT);
app.listen(PORT, function () {
	console.log("Listening on port " + PORT)
})
