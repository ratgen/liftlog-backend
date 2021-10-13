use rocket::serde::json::Json;
use rocket::serde::{Serialize, Deserialize};
use mongodb::{bson::doc, options::ClientOptions, Client};
use std::vec::Vec;


#[macro_use] extern crate rocket;

#[derive(Serialize, Deserialize, Debug)]
struct Repetition {
    repetitions: u8,
    weight: u8
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
struct Workout<'r> {
    title: &'r str,
    dueDate: u64,
    exerciseList: Vec<Exercise>
}

#[post("/workout", format = "json", data = "<workout>")]
fn hello(workout : Json<Workout> ) -> String {
    return format!("Workout is {:?}", workout);
}

async fn launch_dbase() -> mongodb::error::Result<()> {
    println!("lanching dbase");
    // Parse a connection string into an options struct.
    let mut client_options = ClientOptions::parse("mongodb://peter:Pepsi1609@localhost:27017/?authSource=admin").await?;

    // Manually set an option.
    client_options.app_name = Some("My App".to_string());

    // Get a handle to the deployment.
    let client = Client::with_options(client_options)?;

    // List the names of the databases in that deployment.
    for db_name in client.list_database_names(None, None).await? {
        println!("{}", db_name);
    }
    Ok(())
}


#[launch]
async fn rocket() -> _ {
    let _result = launch_dbase().await;
    rocket::build().mount("/", routes![hello])
}

