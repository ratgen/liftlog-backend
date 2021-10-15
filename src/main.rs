use rocket::serde::json::Json;
use rocket::serde::{Serialize, Deserialize};
use rocket::State;
use mongodb::{bson::doc, options::ClientOptions, Client, Database};
use std::vec::Vec;


#[macro_use] extern crate rocket;

#[derive(Serialize, Deserialize, Debug)]
struct Repetition {
    repetitions: f32,
    weight: f32
}
impl ToString for Repetition {
    fn to_string(&self) -> String {
        format!("{}, {}", self.repetitions, self.weight)
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Exercise {
    name: String,
    set: Vec<Repetition>
}
impl ToString for Exercise {
    fn to_string(&self) -> String {
        format!("{}, {:#?}",self.name, self.set)
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Workout {
    title: String,
    due_date: f64,
    exercise_list: Vec<Exercise>
}

#[post("/workout", format = "json", data = "<workout>")]
fn hello(workout : Json<Workout> ) -> String {
    return format!("Workout is {:?}", workout);
}

#[get("/workout")]
async fn get_workout(services: &State<AppServices>) -> String {
    let collection: mongodb::Collection<Workout> = services.database.collection("workouts");
    let result = collection.find_one(
        doc! {
            "title": "Eftermiddagstræning",
        }, None
    ).await.unwrap().unwrap();
    return format!("{:?}", result);
}

struct AppServices {
    database: Database
}

async fn launch_dbase() -> mongodb::error::Result<Database> {
    println!("lanching dbase");
    // Parse a connection string into an options struct.
    let mut client_options = ClientOptions::parse("mongodb://peter:Pepsi1609@localhost:27017/?authSource=admin").await?;

    // Manually set an option.
    client_options.app_name = Some("My App".to_string());

    // Get a handle to the deployment.
    let client = Client::with_options(client_options)?;

    let database = client.database("workout_db");
    
    Ok(database)
}


#[launch]
async fn rocket() -> _ {
    let database = launch_dbase().await;
    rocket::build()
        .manage(AppServices {database: database.unwrap()})
        .mount("/", routes![hello])
        .mount("/", routes![get_workout])
}

