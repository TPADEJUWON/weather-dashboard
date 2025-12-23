import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Search,
  MapPin,
  Calendar,
} from "lucide-react";

export default function WeatherDashboard() {
  const [city, setCity] = useState("Lagos");
  const [searchInput, setSearchInput] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch weather data
  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError("");

    try {
      // Using Open-Meteo API (free, no API key required)
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found");
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Get current weather and forecast
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const weatherData = await weatherResponse.json();

      setWeather({
        city: name,
        country: country,
        temp: Math.round(weatherData.current.temperature_2m),
        feelsLike: Math.round(weatherData.current.apparent_temperature),
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        pressure: Math.round(weatherData.current.pressure_msl),
        weatherCode: weatherData.current.weather_code,
      });

      // Set forecast data (next 5 days)
      const forecastData = weatherData.daily.time
        .slice(1, 6)
        .map((date, index) => ({
          date: new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
          high: Math.round(weatherData.daily.temperature_2m_max[index + 1]),
          low: Math.round(weatherData.daily.temperature_2m_min[index + 1]),
          weatherCode: weatherData.daily.weather_code[index + 1],
        }));

      setForecast(forecastData);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch weather data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  // Handle search
  const handleSearch = () => {
    if (searchInput.trim()) {
      setCity(searchInput);
      fetchWeather(searchInput);
      setSearchInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get weather icon based on WMO code
  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1)
      return <Sun size={64} className="text-yellow-400" />;
    if (code === 2 || code === 3)
      return <Cloud size={64} className="text-gray-400" />;
    if (code >= 51 && code <= 67)
      return <CloudRain size={64} className="text-blue-400" />;
    if (code >= 80) return <CloudRain size={64} className="text-blue-500" />;
    return <Cloud size={64} className="text-gray-400" />;
  };

  // Get weather description
  const getWeatherDesc = (code) => {
    if (code === 0) return "Clear sky";
    if (code === 1) return "Mainly clear";
    if (code === 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 71 && code <= 75) return "Snow";
    if (code >= 80) return "Rain showers";
    return "Cloudy";
  };

  // Get background gradient based on weather
  const getBackgroundGradient = (code) => {
    if (code === 0 || code === 1) return "from-blue-400 to-blue-600";
    if (code === 2 || code === 3) return "from-gray-400 to-gray-600";
    if (code >= 51) return "from-blue-500 to-blue-700";
    return "from-blue-400 to-blue-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading weather data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => fetchWeather(city)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient(
        weather?.weatherCode || 0
      )} py-8 px-4`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-2 flex gap-2">
            <div className="flex-1 flex items-center bg-white rounded-lg px-4">
              <Search size={20} className="text-gray-400 mr-2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for a city..."
                className="flex-1 py-3 outline-none text-gray-700"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        {/* Main Weather Card */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MapPin size={24} />
              <h1 className="text-3xl font-bold">
                {weather.city}, {weather.country}
              </h1>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Temperature Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                {getWeatherIcon(weather.weatherCode)}
                <div>
                  <div className="text-7xl font-bold">{weather.temp}°C</div>
                  <div className="text-xl opacity-90">
                    Feels like {weather.feelsLike}°C
                  </div>
                </div>
              </div>
              <div className="text-2xl capitalize opacity-90">
                {getWeatherDesc(weather.weatherCode)}
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wind size={20} />
                  <span className="text-sm opacity-80">Wind Speed</span>
                </div>
                <div className="text-3xl font-bold">{weather.windSpeed}</div>
                <div className="text-sm opacity-80">km/h</div>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={20} />
                  <span className="text-sm opacity-80">Humidity</span>
                </div>
                <div className="text-3xl font-bold">{weather.humidity}</div>
                <div className="text-sm opacity-80">%</div>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge size={20} />
                  <span className="text-sm opacity-80">Pressure</span>
                </div>
                <div className="text-3xl font-bold">{weather.pressure}</div>
                <div className="text-sm opacity-80">hPa</div>
              </div>

              <div className="bg-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={20} />
                  <span className="text-sm opacity-80">Visibility</span>
                </div>
                <div className="text-3xl font-bold">10</div>
                <div className="text-sm opacity-80">km</div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">5-Day Forecast</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <div
                key={index}
                className="bg-white/20 rounded-lg p-4 text-center"
              >
                <div className="font-semibold mb-2 text-sm">{day.date}</div>
                <div className="flex justify-center mb-2">
                  {getWeatherIcon(day.weatherCode)}
                </div>
                <div className="text-sm opacity-90 mb-1">
                  {getWeatherDesc(day.weatherCode)}
                </div>
                <div className="flex justify-center gap-2 text-sm">
                  <span className="font-bold">{day.high}°</span>
                  <span className="opacity-70">{day.low}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/80 text-sm">
          Weather data provided by Open-Meteo API • Built with React
        </div>
      </div>
    </div>
  );
}
