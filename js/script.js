//Array of cities whose weather we need to display
var cities = [];
window.onload = checkCurrentGeo;

//Function to get weather info from openweathermap.org API
function getJSONWeather( url ){
    var httpReq = new XMLHttpRequest();
    httpReq.open( "GET", url, false );
    httpReq.send(null);
    return httpReq.responseText;          
}

//Function to add html "plate" with weather info of city
function createWeatherPlate(url_request, cityInfo){
    cities.push(cityInfo.name);
    if( url_request != null ){
        saveRequestToDB(url_request, cityInfo.name);
    }
    //Sunrise and sunset time from timestamp format to standart
    let sunrise = new Date(cityInfo.sys.sunrise * 1000);
    let sunset = new Date(cityInfo.sys.sunset * 1000);
    document.getElementById('city-new').insertAdjacentHTML('beforebegin',
    `<div class="col-10 col-sm-6 col-lg-4 mb-3" id="city-`+ cityInfo.name +`">
    <div class="p-4">
        <div class="btn-close" onclick="closeCity('`+ cityInfo.name +`')">X</div>
        <h5 class="text-center"> `+ cityInfo.name +`, `+ cityInfo.sys.country +` </h5>
        <h1 class="text-center"> `+ parseInt(cityInfo.main.temp) +` &#176;C </h1>
        <h6> Minimum temperature: `+ cityInfo.main.temp_min +` &#176;C </h6>
        <h6> Maximum temperature: `+ cityInfo.main.temp_max +` &#176;C </h6>
        <h6> Wind speed: `+ cityInfo.wind.speed +` meter/sec </h6>
        <h6> Cloudiness: `+ cityInfo.clouds.all +` % </h6>
        <h6> Humidity: `+ cityInfo.main.humidity +` % </h6>
        <h6> Sunrise time: `+ sunrise.getHours() +`:`+ ("0" + sunrise.getMinutes()).substr(-2) +` </h6>
        <h6> Sunset time: `+ sunset.getHours() +`:`+ ("0" + sunset.getMinutes()).substr(-2) +` </h6>
    </div>
    </div>`);
}

function addCityWeather(){
    document.getElementById("city-404").style.display = "none";
    let cityName = document.getElementById("new-city").value;
    let url = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=77038ef12ae71b3fecf2d3c3b65c9af6&units=metric";
    var cityInfo = JSON.parse( getJSONWeather( url ) );
    //If city not found - show error
    if( cityInfo.cod != 200 ){
        document.getElementById("city-404").style.display = "block";
        return;
    }
    //If city is already shown - it won't shown one more time
    if( cities.includes(cityInfo.name) ){
        return;
    }
    document.getElementById("new-city").value = "";
    //Add weather info to cookies for 10 minutes
    document.cookie = encodeURIComponent(cityInfo.name) + "=" + JSON.stringify(cityInfo) + "; max-age=600";
    createWeatherPlate(url, cityInfo);
}

//Function to remove weather info of city from html and cookies
function closeCity(cityName){
    let index = cities.indexOf(cityName);
    if (index !== -1) cities.splice(index, 1);
    document.getElementById("city-"+ cityName).remove();
    deleteCookie(cityName);
}

//On load function checks: if cookies are - add "plates" with weather,
//If not - in case of access to user's geo will shown weather info of his location
function checkCurrentGeo() {
    //Check Cookies
    let c = document.cookie.split(";").reduce( (ac, cv, i) => Object.assign(ac, {[cv.split('=')[0]]: cv.split('=')[1]}), {});
    for(let city in c){
        if(city != ""){
            let cityObj = JSON.parse(c[city]);
            cities.push(cityObj.name);
            createWeatherPlate(null, cityObj);
        }
    }
    if ((cities.length < 1) && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(addCurrentGeoWeather);
    }
}

//Function to show weather info of user's current location
function addCurrentGeoWeather(position){
    let url = "http://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon="+ position.coords.longitude +"&appid=77038ef12ae71b3fecf2d3c3b65c9af6&units=metric";
    var cityInfo = JSON.parse( getJSONWeather( url ) );
    document.cookie = encodeURIComponent(cityInfo.name) + "=" + JSON.stringify(cityInfo) + "; max-age=600";
    createWeatherPlate(url, cityInfo);
}

function deleteCookie(name) {
    document.cookie = document.cookie = name+'=; Max-Age=-99999999;'; 
}

//Function to log user's requests by AJAX
function saveRequestToDB(url_request, city){
    const request = new XMLHttpRequest();
    const url = "logger.php";
    const params = "url=" + url_request + "&city=" + city;

    request.open("POST", url, true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.addEventListener("readystatechange", () => {
        if(request.readyState === 4 && request.status === 200) {       
            console.log(request.responseText);
        }
    });

    request.send(params);
}