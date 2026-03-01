import React, { useState, useEffect } from 'react';
import './Weather.css';

const Weather = () => {
    // State to hold the input city name
    const [city, setCity] = useState('');
    // State to hold fetched weather data
    const [weatherData, setWeatherData] = useState(null);
    // State to handle loading status
    const [loading, setLoading] = useState(false);
    // State to handle error messages
    const [error, setError] = useState('');
    // State for toggling between Celsius and Fahrenheit
    const [isCelsius, setIsCelsius] = useState(true);

    // Directly integrate API as requested
    const API_KEY = '7e25e24ffce7e894879edd28824a0497';

    // Load last searched city from localStorage on initial render
    useEffect(() => {
        const lastCity = localStorage.getItem('lastSearchedCity');
        if (lastCity) {
            setCity(lastCity);
            fetchWeather(lastCity);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchWeather = async (cityName) => {
        if (!cityName.trim()) {
            setError('Please enter a city name.');
            setWeatherData(null);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Fetching weather data in Metric units first to get Celsius easily
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
            );

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API Key. If you just created it, please wait 10-30 minutes for it to activate.');
                }
                if (response.status === 404) {
                    throw new Error('City not found. Please try again.');
                }
                throw new Error('Failed to fetch weather data.');
            }

            const data = await response.json();
            setWeatherData(data);
            // Save successful search to localStorage
            localStorage.setItem('lastSearchedCity', cityName);
        } catch (err) {
            setError(err.message);
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle Search button click
    const handleSearch = () => {
        fetchWeather(city);
    };

    // Handle Enter key press
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchWeather(city);
        }
    };

    // Handle temperature unit toggle
    const toggleUnit = () => {
        setIsCelsius((prev) => !prev);
    };

    // Helper function to format temperature based on selected unit
    const formatTemp = (tempInCelsius) => {
        if (isCelsius) {
            return `${Math.round(tempInCelsius)}°C`;
        }
        // Convert to Fahrenheit
        return `${Math.round((tempInCelsius * 9) / 5 + 32)}°F`;
    };

    return (
        <div className="weather-card">
            <h1 className="title">Weather App</h1>

            <div className="search-box">
                <input
                    type="text"
                    placeholder="Enter city name..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="search-input"
                />
                <button className="search-btn" onClick={handleSearch}>
                    Search
                </button>
            </div>

            {loading && <p className="loading-msg">Fetching weather data...</p>}

            {error && <p className="error-msg">{error}</p>}

            {weatherData && !loading && !error && (
                <div className="weather-info">
                    <h2 className="city-name">
                        {weatherData.name}, {weatherData.sys.country}
                    </h2>

                    <div className="weather-icon-temp">
                        <img
                            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                            alt={weatherData.weather[0].description}
                            className="weather-icon"
                        />
                        <div className="temp-wrapper">
                            <span className="temp-value">{formatTemp(weatherData.main.temp)}</span>
                            <button className="toggle-unit-btn" onClick={toggleUnit}>
                                Switch to {isCelsius ? '°F' : '°C'}
                            </button>
                        </div>
                    </div>

                    <p className="weather-desc">
                        {weatherData.weather[0].description.charAt(0).toUpperCase() +
                            weatherData.weather[0].description.slice(1)}
                    </p>

                    <div className="weather-details">
                        <div className="detail">
                            <span>Humidity</span>
                            <strong>{weatherData.main.humidity}%</strong>
                        </div>
                        <div className="detail">
                            <span>Wind Speed</span>
                            <strong>{weatherData.wind.speed} m/s</strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Weather;
