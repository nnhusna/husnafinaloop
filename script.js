const inputBox = document.querySelector('.input-box');
const searchBtn = document.getElementById('searchBtn');
const weather_img = document.querySelector('.weather-img');
const temperature = document.querySelector('.temperature');
const description = document.querySelector('.description');
const humidity = document.getElementById('humidity');
const wind_speed = document.getElementById('wind-speed');
const locationElement = document.getElementById('location');
const localTime = document.getElementById('localTime');
const feelsLike = document.getElementById('feelsLike');
const forecastTemperature = document.getElementById('forecastTemperature');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const weatherDescription = document.getElementById('weatherDescription');

const chanceOfRainElement = document.getElementById('chanceOfRain');
const chanceOfSnowElement = document.getElementById('chanceOfSnow');

const location_not_found = document.querySelector('.location-not-found');
const weather_body = document.querySelector('.weather-body');

const clothingRecommendationsBtn = document.getElementById('clothingRecommendationsBtn');
const clothingRecommendationsContainer = document.querySelector('.clothing-recommendations');
const clothingImage = document.getElementById('clothingImage');
const clothingDescription = document.getElementById('clothingDescription');
const nextRecommendationBtn = document.getElementById('nextRecommendationBtn');

const api_key = "32804b24a847407391c53709241010"; // Replace with your actual API key
let clothingRecommendations = [];
let currentRecommendationIndex = 0;

async function checkWeather(city) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${api_key}&q=${city}&days=1`;

    try {
        const response = await fetch(url);
        const weather_data = await response.json();

        if (response.status === 400 || !weather_data.location) {
            location_not_found.style.display = "flex";
            weather_body.style.display = "none";
            clothingRecommendationsBtn.style.display = 'none';
            clothingRecommendationsContainer.style.display = 'none'; // Hide recommendations if location not found
            return;
        }

        location_not_found.style.display = "none";
        weather_body.style.display = "flex";
        clothingRecommendationsBtn.style.display = 'block';
        clothingRecommendationsContainer.style.display = 'none'; // Hide recommendations when showing new weather data

        locationElement.textContent = `${weather_data.location.name}, ${weather_data.location.region}, ${weather_data.location.country}`;
        localTime.textContent = weather_data.location.localtime;
        temperature.innerHTML = `${Math.round(weather_data.current.temp_c)}°C`;
        feelsLike.innerHTML = `${Math.round(weather_data.current.feelslike_c)}°C`;
        forecastTemperature.innerHTML = `${Math.round(weather_data.forecast.forecastday[0].day.avgtemp_c)}°C`;
        weatherDescription.innerHTML = weather_data.current.condition.text;
        humidity.innerHTML = `${weather_data.current.humidity}%`;
        wind_speed.innerHTML = `${weather_data.current.wind_kph} Km/H`;

        // Extracting chance of rain and snow
        const chanceOfRain = weather_data.forecast.forecastday[0].day.daily_chance_of_rain;
        const chanceOfSnow = weather_data.forecast.forecastday[0].day.daily_chance_of_snow;

        chanceOfRainElement.textContent = `${chanceOfRain}%`;
        chanceOfSnowElement.textContent = `${chanceOfSnow}%`;

        sunrise.innerHTML = weather_data.forecast.forecastday[0].astro.sunrise;
        sunset.innerHTML = weather_data.forecast.forecastday[0].astro.sunset;

        const weatherIcon = `https:${weather_data.current.condition.icon}`;
        weather_img.src = weatherIcon;

        // Pass both condition text and temperature to recommendations
        generateClothingRecommendations(weather_data.current.condition.text, weather_data.current.temp_c);

    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function generateClothingRecommendations(description, temperature) {
    clothingRecommendations = [];

    // Temperature-based recommendations
    if (temperature > 30) { // Hot Weather
        clothingRecommendations.push(
            { image: "./assets/tshirt.jpg", text: "A lightweight t-shirt to stay cool." },
            { image: "./assets/lightpants.jpg", text: "Wear shorts or light pants." },
            { image: "./assets/hat.jpg", text: "A hat to shield from the sun." }
        );
    } else if (temperature > 20) { // Warm Weather
        clothingRecommendations.push(
            { image: "./assets/light_clothing.jpg", text: "Wear light, breathable clothing." },
            { image: "./assets/casual.jpg", text: "Casual clothing should be fine." }
        );
    } else if (temperature > 10) { // Mild Weather
        clothingRecommendations.push(
            { image: "./assets/light_jacket.jpg", text: "A light jacket for mild temperatures." },
            { image: "./assets/casual.jpg", text: "Casual, comfortable clothing is suitable." }
        );
    } else if (temperature <= 10 && temperature > 0) { // Cool Weather
        clothingRecommendations.push(
            { image: "./assets/heavy_jacket.jpg", text: "A heavy jacket to stay warm." },
            { image: "./assets/scarf.jpg", text: "A scarf for added warmth." }
        );
    } else { // Cold Weather
        clothingRecommendations.push(
            { image: "./assets/winter_jacket.jpg", text: "Wear a heavy winter jacket." },
            { image: "./assets/snow_boots.jpg", text: "Snow boots to keep your feet warm and dry." },
            { image: "./assets/gloves.jpg", text: "Gloves to keep your hands warm." },
            { image: "./assets/warm_hat.jpg", text: "A warm hat for extra protection." }
        );
    }

    // Weather condition-based recommendations
    if (description.includes("rain") || description.includes("drizzle")) {
        clothingRecommendations.push(
            { image: "./assets/raincoat.jpg", text: "Wear a raincoat to stay dry." },
            { image: "./assets/umbrella.jpg", text: "Carry an umbrella." },
            { image: "./assets/waterproof_boots.jpg", text: "Waterproof boots recommended." }
        );
    } else if (description.includes("snow") || description.includes("sleet") || description.includes("blizzard")) {
        // Snow recommendations already included in cold weather
    }

    currentRecommendationIndex = 0; // Reset to the first recommendation
}

function showRecommendation() {
    if (clothingRecommendations.length > 0) {
        clothingImage.src = clothingRecommendations[currentRecommendationIndex].image;
        clothingDescription.textContent = clothingRecommendations[currentRecommendationIndex].text;
    }
}

clothingRecommendationsBtn.addEventListener('click', () => {
    clothingRecommendationsContainer.style.display = 'block';
    showRecommendation();
});

nextRecommendationBtn.addEventListener('click', () => {
    currentRecommendationIndex = (currentRecommendationIndex + 1) % clothingRecommendations.length;
    showRecommendation();
});

searchBtn.addEventListener('click', () => {
    clothingRecommendationsContainer.style.display = 'none'; // Hide clothing recommendations on new search
    checkWeather(inputBox.value);
});

inputBox.addEventListener('keyup', (event) => {
    if (event.key === "Enter") {
        clothingRecommendationsContainer.style.display = 'none'; // Hide clothing recommendations on new search
        checkWeather(inputBox.value);
    }
});
