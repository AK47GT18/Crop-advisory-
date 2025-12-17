"use client"
import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, Sun, Cloud, CloudRain, CloudDrizzle, MapPin } from 'lucide-react';
import Card from "../components/ui/Card";

function mapConditionToIcon(condition: string) {
  if (condition. includes("Sunny") || condition.includes("Clear")) return Sun;
  if (condition.includes("Partly")) return CloudSun;
  if (condition.includes("Cloudy")) return Cloud;
  if (condition. includes("Rain")) return CloudRain;
  if (condition.includes("Drizzle")) return CloudDrizzle;
  return Sun;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      // Check for cached data
      const cachedWeather = localStorage.getItem('weatherData');
      const cachedTimestamp = localStorage.getItem('weatherDataTimestamp');
      const oneHour = 60 * 60 * 1000;

      if (cachedWeather && cachedTimestamp && (Date.now() - parseInt(cachedTimestamp)) < oneHour) {
        const data = JSON.parse(cachedWeather);
        
        // Re-map icons from cached data
        data.current.icon = mapConditionToIcon(data.current.condition);
        data.hourly = data.hourly.map((h:  any) => ({ ...h, icon: mapConditionToIcon(h.condition) }));
        data.daily = data.daily.map((d: any, index: number) => {
          const date = new Date(d.day);
          const dayName = index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday:  'short' });
          return { ...d, day: dayName, icon: mapConditionToIcon(d.condition) };
        });

        setWeather(data);
        return; // Use cached data
      }

      // If cache is old or doesn't exist, fetch new data
      fetchNewWeatherData();
    };

    const fetchWeatherForLocation = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://agriseed.onrender.com/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed to fetch weather data from backend.");
        const data = await res.json();
        // Save to cache
        localStorage.setItem('weatherData', JSON.stringify(data));
        localStorage.setItem('weatherDataTimestamp', Date. now().toString());
  
        // Map icons
        data.current.icon = mapConditionToIcon(data.current.condition);
  
        // Show a full range of hours for the day, not just future ones
        data.hourly = data.hourly
          .filter((_: any, index: number) => index % 3 === 0) // Show every 3rd hour
          . map((h: any) => ({ ...h, icon: mapConditionToIcon(h.condition) }));
  
        // Format day names
        data.daily = data.daily.map((d: any, index: number) => {
          const date = new Date(d.day);
          const dayName = index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: 'short' });
          return { ...d, day: dayName, icon: mapConditionToIcon(d.condition) };
        });
  
        setWeather(data);
      } catch (error) {
        console.error(error);
        setError("Could not retrieve weather data.");
      }
    };

    const fetchNewWeatherData = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherForLocation(position.coords.latitude, position.coords.longitude).catch(err => {
            console.error(err);
            setError("Could not get weather for your location.");
          });
        },
        (err) => {
          console.error(err);
          setError("Geolocation permission denied.  Showing default location.");
          // Fallback to Livingstonia, Rumphi if permission is denied
          fetchWeatherForLocation(-10.6, 34.117).catch(e => setError("Could not retrieve weather data."));
        }
      );
    };

    loadWeather();
  }, []);

  if (error && ! weather) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-600 dark:text-amber-400 flex-col animate-fadeIn text-center">
        <MapPin size={48} className="mb-4 opacity-50" />
        <p className="font-semibold">Could not get your location</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  if (! weather) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 flex-col animate-fadeIn">
        <CloudSun size={48} className="mb-4 opacity-50 animate-pulse" />
        <p>Fetching your local weather...</p>
      </div>
    );
  }

  const { current, hourly, daily } = weather;
  const CurrentIcon = current.icon;

  return (
    <div className="animate-fadeIn space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Weather Forecast & Advisory</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Showing weather for <strong>{current.location}</strong>. 
        </p>
      </div>

      {/* Current Weather */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/30">
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <p className="text-lg opacity-90">{current.condition}</p>
            <p className="text-6xl font-bold my-2">{current.temp}°C</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 opacity-90">
              <div className="flex items-center gap-2">
                <Droplets size={20} />
                <span>{current.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind size={20} />
                <span>{current.wind} km/h</span>
              </div>
            </div>
          </div>
          <CurrentIcon size={80} className="opacity-80 self-center mt-4 sm:mt-0" />
        </div>
      </Card>

      {/* Hourly Forecast */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Today's Forecast</h2>
        <div className="overflow-x-auto -mx-4 sm:-mx-6 md:mx-0">
          <div className="flex gap-2 pb-2 px-4 sm:px-6 md:px-0 [&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]: block [-ms-overflow-style: auto] [scrollbar-width:thin]">
            {hourly.map((hour: any, index: number) => {
              const HourIcon = hour.icon;
              const isCurrentHour = new Date().getHours() === parseInt(hour.time.split(':')[0]);
              return (
                <div key={index} className={`relative flex flex-col items-center gap-2 flex-shrink-0 text-center w-20 sm:w-24 p-2 rounded-lg transition-colors ${isCurrentHour ? 'bg-emerald-100 dark:bg-emerald-900' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  <p className={`font-semibold text-sm ${isCurrentHour ?  'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>{hour.time}</p>
                  <HourIcon size={24} className={isCurrentHour ? 'text-emerald-500' :  ''} />
                  <p className="font-bold text-sm sm:text-lg">{Math.round(hour.temp)}°</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 5-Day Forecast */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">5-Day Forecast</h2>
        <div className="space-y-3">
          {daily.map((day: any, index: number) => {
            const DayIcon = day.icon;
            return (
              <div key={index} className="flex items-center justify-between">
                <p className="font-semibold w-12">{day.day}</p>
                <DayIcon size={24} className="text-emerald-500 mx-4" />
                <p className="font-bold text-lg">{Math.round(day.temp)}°C</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Weather;
