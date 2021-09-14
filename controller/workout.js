let mongo = require('mongodb');
const dotenv = require('dotenv');
const {ObjectId} = require('mongodb');
dotenv.config();

exports.workout_post = function(req, res) {
    //check if user exists
    let workout_log = req.body;

    if ('title' in workout_log === false) {
        res.status(400);
        res.send("Include title in workout object")
    }

    if ('exerciseList' in workout_log === false ) {
        res.status(400);
        res.send("Include sets in post")
    }

    for (let exercise of workout_log.exerciseList) {
        let exId = new ObjectId()
        exercise["id"] = exId
        for (let set of exercise.set) {
            set["id"] = new ObjectId()
        }
    }

    let date = new Date();
    workout_log["dateCreated"] = date.valueOf();
    workout_log["userId"] = ObjectId(req.user["userId"]);

    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        dbase.collection("workouts").insertOne(workout_log, function(err, result) {
            if (err) throw err;
            res.send(result["insertedId"])
            db.close();
        });
    });
}

exports.workout_get = function(req, res) {
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        dbase.collection("workouts").find({userId: ObjectId(req.user["userId"])}, {limit : 10}).toArray( function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
}

exports.workout_delete = function(req, res) {

    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        dbase.collection("workouts").deleteOne({_id : ObjectId(req.params.workoutId), userId: ObjectId(req.user["userId"])}, function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
        });
    });
}


exports.workout_post_rename =  function(req, res) {
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let body = req.body
        let dbase = db.db("workout_db");
        let query = { _id: ObjectId(body["id"])}
        let newValues = {$set : { title : body["title"]}}
        dbase.collection("workouts").updateOne(query, newValues, function(err, result) {
            if (err) throw err;
            db.close();
        });
    });
    res.send("Document modified: " + req.body);

}

exports.workout_post_update_exercise = function(req, res) {
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        dbase.collection("workouts").updateOne(
            {
                _id: ObjectId(req.body.id)
            }, 
            {
                $set : 
                    { 
                        exerciseList : req.body.exerciseList
                    }
            }, function(err, result) {
                if (err) throw err;
                db.close();
            }
        );
    });
    res.send("document modified: " + req.body);
}


exports.workout_put_exercise_name = function(req, res) {
    console.log("Changing the name of an exercise")
    let body = req.body
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        let query = { 
            _id: ObjectId(req.body.id)
        }
        let newValues = {
            $set : { 
                "exerciseList.$[el].name" : body.name
            }
        }
        let options = { 
            arrayFilters : [
                { 
                    "el.id" : ObjectId(body.exerciseId)
                } 
            ]
        }     
        dbase.collection("workouts").updateOne(
            query, 
            newValues, 
            options,
            function(err, result) {
                if (err) throw err;
                db.close();
                res.send(result)
            });
    });
}

exports.workout_change_reps = function(req, res) {
    console.log("Changing repetitions.")
    let body = req.body
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        let query = { _id: ObjectId(req.body.workoutId), userId: ObjectId(req.user["userId"])}
        let newValues = {
            $set : { 
                "exerciseList.$[el].set.$[rep].weight" : body.repItem.weight,
                "exerciseList.$[el].set.$[rep].repetitions" : body.repItem.repetitions
            }
        }
        let options = { 
            arrayFilters : [
                { 
                    "el.id" : ObjectId(body.exerciseId)
                }, 
                {
                    "rep.id" : ObjectId(body.repItem.id)
                }
            ]
        }     
        dbase.collection("workouts").updateOne(
            query, 
            newValues, 
            options,
            function(err, result) {
                if (err) throw err;
                db.close();
                if (result.modifiedCount == 0) {
                    res.send("Completed successfully, none modified. Found " + result.matchedCount + " documents.")
                    console.log("none modified")
                } else {
                    res.send("Result modified")
                    console.log("modified")
                }
            }
        );
    });
}

exports.workout_add_exercise = function(req, res) {
    console.log("Adding an exercise.")
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");

        let new_exercise = {
            id : new ObjectId(),
            name : '',
            set : []
        }
        let query = { _id: ObjectId(req.body.workoutId), userId: ObjectId(req.user["userId"])}
        let newValues = {
            $push : { 
                "exerciseList" : new_exercise
            }
        }
        dbase.collection("workouts").updateOne(
            query, 
            newValues, 
            function(err, result) {
                if (err) throw err;
                db.close();
                if (result.modifiedCount == 0) {
                    res.send("Completed successfully, none modified. Found " + result.matchedCount + " documents.")
                } else {
                    res.send(new_exercise.id)
                }
            }
        );
    });

}

exports.workout_add_repetition = function(req, res) {
    console.log("Adding a repetition.")
    let body = req.body
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        body.repItem.id = new ObjectId()
        let dbase = db.db("workout_db");
        let query = { _id: ObjectId(body.workoutId), userId: ObjectId(req.user["userId"])}
        let newValues = {
            $push : { 
                "exerciseList.$[el].set" : body.repItem,
            }
        }
        let options = { 
            arrayFilters : [
                { 
                    "el.id" : ObjectId(body.exerciseId)
                }, 
            ]
        }     
        dbase.collection("workouts").updateOne(
            query, 
            newValues, 
            options,
            function(err, result) {
                if (err) throw err;
                db.close();
                res.send(body.repItem.id)
            }
        );
    });
}

exports.workout_delete_exercise = function (req, res){
    mongo.MongoClient.connect( process.env.DB_URL, function(err,db ) {
        let dbase = db.db("workout_db")
        
        let query = {
            _id : ObjectId(req.body.workoutId), userId : ObjectId(req.user["userId"])
        }
        let newValues = {
            $pull : {
                exerciseList : {
                    id : ObjectId(req.body.exerciseId)
                }
            }
        }
        
        dbase.collection("workouts").updateOne(
            query,
            newValues,
            function(err, result){
                if (err) throw err;
                db.close();
                res.send();
            }
        )
    })
}

exports.workout_controller_delete_repetition = function(req,res ) {
    mongo.MongoClient.connect( process.env.DB_URL, function(err,db ) {
        console.log(req.body)
        let dbase = db.db("workout_db")
        
        let query = {
            _id : ObjectId(req.body.workoutId), userId : ObjectId(req.user["userId"])
        }
        let newValues = {
            $pull : {
                "exerciseList.$[el].set" : { "id" : ObjectId(req.body.repId) } 
            }
        }
        let options = {
            arrayFilters : [
                { 
                    "el.id" : ObjectId(req.body.exerciseId)
                }
            ]
        }
        
        dbase.collection("workouts").updateOne(
            query,
            newValues,
            options,
            function(err, result){
                console.log(result)
                if (err) throw err;
                db.close();
                res.send("Completed");
            }
        )
    })
}
exports.workout_change_reps = function(req, res) {
    console.log("Changing repetitions.")
    let body = req.body
    mongo.MongoClient.connect (process.env.DB_URL, function(err, db) {
        if (err) throw err;
        let dbase = db.db("workout_db");
        let query = { _id: ObjectId(req.body.workoutId), userId: ObjectId(req.user["userId"])}
        let newValues = {
            $set : { 
                "exerciseList.$[el].set.$[rep].weight" : body.repItem.weight,
                "exerciseList.$[el].set.$[rep].repetitions" : body.repItem.repetitions
            }
        }
        let options = { 
            arrayFilters : [
                { 
                    "el.id" : ObjectId(body.exerciseId)
                }, 
                {
                    "rep.id" : ObjectId(body.repItem.id)
                }
            ]
        }     
        dbase.collection("workouts").updateOne(
            query, 
            newValues, 
            options,
            function(err, result) {
                if (err) throw err;
                db.close();
                if (result.modifiedCount == 0) {
                    res.send("Completed successfully, none modified. Found " + result.matchedCount + " documents.")
                    console.log("none modified")
                } else {
                    res.send("Result modified")
                    console.log("modified")
                }
            }
        );
    });
}
