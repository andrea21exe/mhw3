const linkF1 = "http://ergast.com/api/f1/drivers.json?limit=950"
const linkF1_wins = "http://ergast.com/api/f1/drivers/"

const clientID = "407f5d95300442719679e0ebda708e64"
const clientSecret = "e5fbb3799ae546239cba04fbb91fd6a5"


function check_homonyms_back(list, surname, m, drivers_i_look_for){

    if (list[m].familyName.toLowerCase() == surname.toLowerCase()){
        drivers_i_look_for.push(list[m]);
        check_homonyms_back(list,surname, m-1, drivers_i_look_for);
    }

}

function check_homonyms_forward(list, surname, m, drivers_i_look_for){
    if (list[m].familyName.toLowerCase() == surname.toLowerCase()){
        drivers_i_look_for.push(list[m]);
        check_homonyms_forward(list,surname, m + 1, drivers_i_look_for);
    }
}

function binarySearch(list, surname, start, finish, drivers_i_look_for){

    while(start <= finish){

        const m = Math.floor((finish + start) / 2);

        if(list[m].familyName.toLowerCase() == surname.toLowerCase()){

            drivers_i_look_for.push(list[m]);
            check_homonyms_back(list, surname, m - 1, drivers_i_look_for);
            check_homonyms_forward(list, surname, m + 1, drivers_i_look_for);
            return;

        } else if(surname.toLowerCase() < list[m].familyName.toLowerCase()){

            finish = m - 1;
            
        } else if (surname.toLowerCase() > list[m].familyName.toLowerCase()){

            start = m + 1;
            
        }
    }
}

function onJson(json){
    drivers_list = json.MRData.DriverTable.Drivers;
}

function onResponse(response){
    return response.json();
}

function show_driver(driver){

    //creo il driver container
    console.log(driver);
    const container_driver = document.createElement("a");
    container_driver.href = driver.url; 
    container_driver.classList.add("container_driver");

    //creo il driver name
    const driver_name = document.createElement("h2");
    driver_name.classList.add("driver_name");
    driver_name.textContent = driver.givenName + " " + driver.familyName;
    container_driver.appendChild(driver_name);

    //creo la bio
    const bio = document.createElement("div");
    bio.classList.add("bio");
    container_driver.appendChild(bio);

    //popolo la bio
    const birthdate = document.createElement("span");
    birthdate.textContent = "Data di nascita: " + driver.dateOfBirth;
    bio.appendChild(birthdate);

    const nationality = document.createElement("span");
    nationality.textContent = "Nazionalità: " + driver.nationality;
    bio.appendChild(nationality);

    if (driver.permanentNumber){
        const race_number = document.createElement("span");
        race_number.textContent = "Numero di gara: " + driver.permanentNumber;
        bio.appendChild(race_number);
    }

    document.getElementById("all_the_drivers").appendChild(container_driver);

}

function search(event){
    event.preventDefault();
    
    document.getElementById("all_the_drivers").innerHTML = " ";

    const drivers_i_look_for = [];
    const surname = document.querySelector("#driver_input").value;

    binarySearch(drivers_list, surname, 0, drivers_list.length - 1, drivers_i_look_for);


    for(driver of drivers_i_look_for){
        show_driver(driver);
    }

}

//funzioni Spotify -----------------------------

function onSpotifyJson(json){

    const spotify_container = document.getElementById("podcast-container");
    const podcast_list = json.shows.items;

    for(podcast of podcast_list){
        //creo la playlist-box
        const link = document.createElement("a");

        const podcast_box = document.createElement("div");
        podcast_box.classList.add("podcast-box");

        //inserisco l'immagine
        const podcast_img = document.createElement("img");
        podcast_img.src = podcast.images[1].url
        podcast_box.appendChild(podcast_img);

        //inserisco il titolo
        const podcast_title = document.createElement("h3");
        podcast_title.textContent = podcast.name;
        podcast_box.appendChild(podcast_title);

        //inserisco il creator
        const podcast_creator = document.createElement("h5");
        podcast_creator.textContent = podcast.publisher;
        podcast_box.appendChild(podcast_creator);

        link.href = podcast.external_urls.spotify
        link.appendChild(podcast_box);
        spotify_container.appendChild(link);

    }
}

function onTokenJson(json){
    spotifyToken = json.access_token;
    fetch("https://api.spotify.com/v1/search?market=IT&type=show&q=formula1&limit=10", {

            headers: {
                "Authorization": "Bearer " + spotifyToken
            }
        }    
    ).then(onResponse).then(onSpotifyJson);
}

function onTokenResponse(response){
    return response.json();
}


let drivers_list = [];
let wins_list = [];
let spotifyToken;
const form = document.querySelector("form");
form.addEventListener("submit", search);

fetch(linkF1).then(onResponse).then(onJson);
fetch("https://accounts.spotify.com/api/token",
      {
        method: "post",
        body: "grant_type=client_credentials",
        headers:{
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientID + ":" + clientSecret) 
        }
      }  
    ).then(onTokenResponse).then(onTokenJson);
