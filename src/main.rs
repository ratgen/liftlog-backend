use rocket::serde::json::Json;
use rocket::serde::{Serialize, Deserialize};
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

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![hello])
}
