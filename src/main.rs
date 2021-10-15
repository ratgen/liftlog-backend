use rocket::serde::json::Json;
use rocket::serde::{Serialize, Deserialize};
use rocket::http::{Status, ContentType};
use rocket::State;
use rocket::http::{CookieJar, Cookie};
use jsonwebtoken::errors::ErrorKind;
use mongodb::{bson::doc, options::ClientOptions, Client, Database};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

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

#[derive(Serialize, Deserialize, Debug)]
struct CookiesValues {
    token: String
}


#[derive(Serialize, Deserialize, Debug)]
struct Claims {
    exp: usize,
    iat: usize,
    name: String,
    userId: String
}


#[derive(Serialize, Deserialize, Debug)]
struct Token {
    header: String,
    claims: Claims
}

#[derive(Serialize, Deserialize, Debug)]
enum AuthErrors {
    ParsingError,
    NotValid,
    NotAuthenticated,
    TokenExpired
}

async fn verify_cookie(cookie: &Cookie<'_>) -> Result<bool, AuthErrors> {
    println!("{}", cookie);
    
    let parsed_token: CookiesValues = match serde_json::from_str(cookie.value()) {
        Ok(c) => c,
        Err(_) => return Err(AuthErrors::ParsingError)
    };

    let secret = "xDw8eBjZyCTeOILknIrZPIonKsM17U1a";
    let token_data = match decode::<Claims>(&parsed_token.token, &DecodingKey::from_secret(secret.as_ref()), &Validation::new(Algorithm::HS256)) {
        Ok(c) => c,
        Err(err) => match *err.kind() {
            ErrorKind::InvalidToken => return Err(AuthErrors::NotValid),
            ErrorKind::Json(..) => return Err(AuthErrors::ParsingError),
            _ => {
                return Err(AuthErrors::NotValid);
            },
        },
    };

    println!("{:?}", token_data.claims);
    println!("{:?}", token_data.header);

    Ok(true)
}

#[post("/workout", format = "json", data = "<workout>")]
fn hello(workout : Json<Workout> ) -> String {
    return format!("Workout is {:?}", workout);
}

#[get("/workout")]
async fn get_workout(cookies: &CookieJar<'_>, services: &State<AppServices>) -> Option<(Status, (ContentType, String))> {
    let jwt_cookie = cookies.get("jwt").unwrap();
    let valid = match verify_cookie(&jwt_cookie).await {
        Ok(b) => b,
        Err(_) => return Some((Status::BadRequest, (ContentType::Text, format!("BadRequest"))))
    };

    if valid {
        let collection: mongodb::Collection<Workout> = services.database.collection("workouts");
        let result = collection.find_one(
            doc! {
                "title": "Eftermiddagstræning",
            }, None
        ).await.unwrap().unwrap();
        return Some((Status::Ok, (ContentType::Text, format!("{:?}", result))));
    } else {
        return Some((Status::Unauthorized, (ContentType::Text, format!("{}", "Unauthorized"))));
    }
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

