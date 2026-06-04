// Weather API Manager
class WeatherManager {
    constructor() {
        // Using Open-Meteo API (free, no API key required)
        this.baseUrl = 'https://api.open-meteo.com/v1/forecast';
        this.geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
        this.currentWeatherUrl = 'https://api.open-meteo.com/v1/forecast';
        this.temperatureUnit = 'celsius';
        this.windSpeedUnit = 'ms';
    }

    async searchCities(query) {
        if (!query || query.length < 2) return [];
        
        try {
            const response = await fetch(
                `${this.geocodingUrl}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
            );
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error searching cities:', error);
            return [];
        }
    }

    async getCurrentWeather(latitude, longitude) {
        try {
            const params = new URLSearchParams({
                latitude: latitude,
                longitude: longitude,
                current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
                hourly: 'temperature_2m,weather_code,precipitation_probability,wind_speed_10m',
                daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max',
                temperature_unit: this.temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
                wind_speed_unit: this.getWindSpeedUnit(),
                timezone: 'auto',
                forecast_days: 16
            });

            const response = await fetch(`${this.currentWeatherUrl}?${params}`);
            if (!response.ok) throw new Error('Failed to fetch weather data');
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching weather:', error);
            throw error;
        }
    }

    getWindSpeedUnit() {
        const units = {
            'ms': 'ms',
            'kmh': 'kmh',
            'mph': 'mph',
            'knots': 'kn'
        };
        return units[this.windSpeedUnit] || 'ms';
    }

    setTemperatureUnit(unit) {
        this.temperatureUnit = unit;
    }

    setWindSpeedUnit(unit) {
        this.windSpeedUnit = unit;
    }

    getWeatherDescription(code, isDay) {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail'
        };
        return descriptions[code] || 'Unknown';
    }

    getWeatherEmoji(code) {
        const emojis = {
            0: '☀️',
            1: '🌤️',
            2: '⛅',
            3: '☁️',
            45: '🌫️',
            48: '🌫️',
            51: '🌦️',
            53: '🌦️',
            55: '🌧️',
            61: '🌧️',
            63: '⛈️',
            65: '⛈️',
            71: '🌨️',
            73: '🌨️',
            75: '❄️',
            77: '🌨️',
            80: '🌧️',
            81: '⛈️',
            82: '⛈️',
            85: '🌨️',
            86: '🌨️',
            95: '⛈️',
            96: '⛈️',
            99: '⛈️'
        };
        return emojis[code] || '🌤️';
    }
}

// UI Manager
class UIManager {
    constructor(weatherManager) {
        this.weatherManager = weatherManager;
        this.currentWeatherData = null;
        this.currentLocation = null;
        this.autoRefreshInterval = null;
        this.initElements();
        this.attachEventListeners();
        this.loadFavorites();
        this.loadSettings();
    }

    initElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.currentLocationBtn = document.getElementById('currentLocationBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.suggestions = document.getElementById('suggestions');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.retryBtn = document.getElementById('retryBtn');
        this.currentWeatherSection = document.getElementById('currentWeatherSection');
        this.hourlyForecastSection = document.getElementById('hourlyForecastSection');
        this.dailyForecastSection = document.getElementById('dailyForecastSection');
        this.cityName = document.getElementById('cityName');
        this.countryName = document.getElementById('countryName');
        this.lastUpdated = document.getElementById('lastUpdated');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.temperature = document.getElementById('temperature');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.feelsLike = document.getElementById('feelsLike');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.windDirection = document.getElementById('windDirection');
        this.pressure = document.getElementById('pressure');
        this.visibility = document.getElementById('visibility');
        this.uvIndex = document.getElementById('uvIndex');
        this.sunrise = document.getElementById('sunrise');
        this.sunset = document.getElementById('sunset');
        this.hourlyForecast = document.getElementById('hourlyForecast');
        this.dailyForecast = document.getElementById('dailyForecast');
        this.favoritesGrid = document.getElementById('favoritesGrid');
        this.noFavoritesMsg = document.getElementById('noFavoritesMsg');
        this.maxTemp = document.getElementById('maxTemp');
        this.minTemp = document.getElementById('minTemp');
        this.rainProb = document.getElementById('rainProb');
        this.cloudCoverage = document.getElementById('cloudCoverage');
        this.temperatureUnit = document.getElementById('temperatureUnit');
        this.windSpeedUnit = document.getElementById('windSpeedUnit');
        this.autoRefresh = document.getElementById('autoRefresh');
        this.showNotifications = document.getElementById('showNotifications');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    attachEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchCity());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });
        this.cityInput.addEventListener('input', (e) => this.showSuggestions(e.target.value));
        this.currentLocationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.refreshBtn.addEventListener('click', () => this.refreshWeather());
        this.retryBtn.addEventListener('click', () => this.searchCity());
        this.temperatureUnit.addEventListener('change', (e) => {
            this.weatherManager.setTemperatureUnit(e.target.value);
            this.refreshWeather();
        });
        this.windSpeedUnit.addEventListener('change', (e) => {
            this.weatherManager.setWindSpeedUnit(e.target.value);
            this.refreshWeather();
        });
        this.autoRefresh.addEventListener('change', (e) => {
            this.saveSettings();
            if (e.target.checked && this.currentLocation) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        });
    }

    async showSuggestions(query) {
        if (!query || query.length < 2) {
            this.suggestions.classList.add('hidden');
            return;
        }

        try {
            const cities = await this.weatherManager.searchCities(query);
            if (cities.length === 0) {
                this.suggestions.classList.add('hidden');
                return;
            }

            this.suggestions.innerHTML = cities.map(city => `
                <div class="suggestion-item" data-lat="${city.latitude}" data-lon="${city.longitude}">
                    ${city.name}${city.admin1 ? ', ' + city.admin1 : ''}${city.country ? ', ' + city.country : ''}
                </div>
            `).join('');

            this.suggestions.classList.remove('hidden');

            this.suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    const lat = item.dataset.lat;
                    const lon = item.dataset.lon;
                    this.fetchWeather(lat, lon);
                    this.suggestions.classList.add('hidden');
                    this.cityInput.value = '';
                });
            });
        } catch (error) {
            console.error('Error showing suggestions:', error);
        }
    }

    async searchCity() {
        const query = this.cityInput.value.trim();
        if (!query) return;

        try {
            const cities = await this.weatherManager.searchCities(query);
            if (cities.length === 0) {
                this.showError('City not found. Please try another search.');
                return;
            }

            const city = cities[0];
            this.fetchWeather(city.latitude, city.longitude);
            this.suggestions.classList.add('hidden');
        } catch (error) {
            this.showError('Error searching for city.');
        }
    }

    getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser.');
            return;
        }

        this.showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.fetchWeather(latitude, longitude);
            },
            (error) => {
                this.showError('Unable to get your location. Please search for a city instead.');
            }
        );
    }

    async fetchWeather(latitude, longitude) {
        try {
            this.showLoading();
            const data = await this.weatherManager.getCurrentWeather(latitude, longitude);
            this.currentWeatherData = data;
            this.currentLocation = { latitude, longitude };
            this.displayWeather(data);
            this.hideError();
            this.saveCurrentLocation();
        } catch (error) {
            this.showError('Failed to fetch weather data. Please try again.');
        }
    }

    displayWeather(data) {
        const current = data.current;
        const hourly = data.hourly;
        const daily = data.daily;
        const timezone = data.timezone;

        // Update current weather
        this.temperature.textContent = Math.round(current.temperature_2m);
        this.weatherDescription.textContent = this.weatherManager.getWeatherDescription(current.weather_code, current.is_day);
        this.feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}°`;
        this.humidity.textContent = `${current.relative_humidity_2m}%`;
        this.windSpeed.textContent = `${Math.round(current.wind_speed_10m)} ${this.weatherManager.getWindSpeedUnit()}`;
        this.windDirection.textContent = this.getWindDirectionText(current.wind_direction_10m);
        this.uvIndex.textContent = 'N/A';
        this.pressure.textContent = 'N/A';
        this.visibility.textContent = 'N/A';

        this.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;

        // Get city info from coordinates (would need reverse geocoding for actual city name)
        this.cityName.textContent = 'Current Location';
        this.countryName.textContent = timezone || 'Loading...';

        // Display sunrise and sunset
        const sunriseTime = new Date(daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const sunsetTime = new Date(daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        this.sunrise.textContent = sunriseTime;
        this.sunset.textContent = sunsetTime;

        // Daily stats
        this.maxTemp.textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
        this.minTemp.textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
        this.rainProb.textContent = `${daily.precipitation_probability_max[0]}%`;
        this.cloudCoverage.textContent = 'N/A';

        // Display hourly forecast
        this.displayHourlyForecast(hourly);

        // Display daily forecast
        this.displayDailyForecast(daily);

        this.hideLoading();
        this.currentWeatherSection.classList.remove('hidden');
        this.hourlyForecastSection.classList.remove('hidden');
        this.dailyForecastSection.classList.remove('hidden');

        this.showNotification('Weather data updated successfully!');
    }

    displayHourlyForecast(hourly) {
        const now = new Date();
        const hours = 24;
        let html = '';

        for (let i = 0; i < Math.min(hours, hourly.time.length); i++) {
            const time = new Date(hourly.time[i]);
            const hour = time.getHours();
            const temp = Math.round(hourly.temperature_2m[i]);
            const code = hourly.weather_code[i];
            const emoji = this.weatherManager.getWeatherEmoji(code);

            html += `
                <div class="hourly-card">
                    <div class="hourly-time">${hour}:00</div>
                    <div class="hourly-icon">${emoji}</div>
                    <div class="hourly-temp">${temp}°</div>
                </div>
            `;
        }

        this.hourlyForecast.innerHTML = html;
    }

    displayDailyForecast(daily) {
        const days = 7;
        let html = '';

        for (let i = 0; i < Math.min(days, daily.time.length); i++) {
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const maxTemp = Math.round(daily.temperature_2m_max[i]);
            const minTemp = Math.round(daily.temperature_2m_min[i]);
            const code = daily.weather_code[i];
            const emoji = this.weatherManager.getWeatherEmoji(code);
            const description = this.weatherManager.getWeatherDescription(code);

            html += `
                <div class="daily-card">
                    <div class="daily-date">${dayName}</div>
                    <div class="daily-icon">${emoji}</div>
                    <div class="daily-temps">
                        <span class="daily-max">${maxTemp}°</span>
                        <span class="daily-min">${minTemp}°</span>
                    </div>
                    <div class="daily-desc">${description}</div>
                </div>
            `;
        }

        this.dailyForecast.innerHTML = html;
    }

    getWindDirectionText(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        const index = Math.round(degrees / 22.5) % 16;
        return `${directions[index]} (${Math.round(degrees)}°)`;
    }

    refreshWeather() {
        if (this.currentLocation) {
            this.fetchWeather(this.currentLocation.latitude, this.currentLocation.longitude);
        }
    }

    startAutoRefresh() {
        if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = setInterval(() => this.refreshWeather(), 10 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
    }

    showLoading() {
        this.loadingSpinner.classList.remove('hidden');
        this.currentWeatherSection.classList.add('hidden');
        this.hourlyForecastSection.classList.add('hidden');
        this.dailyForecastSection.classList.add('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.loadingSpinner.classList.add('hidden');
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    showNotification(message) {
        if (this.showNotifications.checked) {
            this.notificationText.textContent = message;
            this.notification.classList.remove('hidden');
            setTimeout(() => {
                this.notification.classList.add('hidden');
            }, 3000);
        }
    }

    loadFavorites() {
        const saved = localStorage.getItem('weatherFavorites');
        if (saved) {
            const favorites = JSON.parse(saved);
            this.displayFavorites(favorites);
        }
    }

    displayFavorites(favorites) {
        if (favorites.length === 0) {
            this.noFavoritesMsg.style.display = 'block';
            this.favoritesGrid.innerHTML = '';
            return;
        }

        this.noFavoritesMsg.style.display = 'none';
        this.favoritesGrid.innerHTML = favorites.map(fav => `
            <div class="favorite-card" onclick="uiManager.fetchWeather(${fav.lat}, ${fav.lon})">
                <div class="favorite-name">${fav.name}</div>
                <div class="favorite-temp">${fav.temp}°</div>
                <div class="favorite-condition">${fav.condition}</div>
            </div>
        `).join('');
    }

    saveCurrentLocation() {
        if (this.currentLocation) {
            localStorage.setItem('lastLocation', JSON.stringify(this.currentLocation));
        }
    }

    saveSettings() {
        const settings = {
            temperatureUnit: this.temperatureUnit.value,
            windSpeedUnit: this.windSpeedUnit.value,
            autoRefresh: this.autoRefresh.checked,
            showNotifications: this.showNotifications.checked
        };
        localStorage.setItem('weatherSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('weatherSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.temperatureUnit.value = settings.temperatureUnit || 'celsius';
            this.windSpeedUnit.value = settings.windSpeedUnit || 'ms';
            this.autoRefresh.checked = settings.autoRefresh !== false;
            this.showNotifications.checked = settings.showNotifications !== false;
            
            this.weatherManager.setTemperatureUnit(this.temperatureUnit.value);
            this.weatherManager.setWindSpeedUnit(this.windSpeedUnit.value);

            if (this.autoRefresh.checked) {
                this.startAutoRefresh();
            }
        }

        // Load last location
        const lastLocation = localStorage.getItem('lastLocation');
        if (lastLocation) {
            const { latitude, longitude } = JSON.parse(lastLocation);
            this.fetchWeather(latitude, longitude);
        }
    }
}

// Initialize App
let weatherManager;
let uiManager;

document.addEventListener('DOMContentLoaded', () => {
    weatherManager = new WeatherManager();
    uiManager = new UIManager(weatherManager);
});
