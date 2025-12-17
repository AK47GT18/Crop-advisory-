"use client"
import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, Sun, Cloud, CloudRain, CloudDrizzle, MapPin } from 'lucide-react';

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

function mapConditionToIcon(condition: string) {
  if (condition.includes("Sunny") || condition.includes("Clear")) return Sun;
  if (condition.includes("Partly")) return CloudSun;
  if (condition.includes("Cloudy")) return Cloud;
  if (condition.includes("Rain")) return CloudRain;
  if (condition.includes("Drizzle")) return CloudDrizzle;
  return Sun;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWeather = async () => {
      // Check for cached data in memory (no localStorage)
      const cachedWeather = (window as any).__weatherCache?.data;
      const cachedTimestamp = (window as any).__weatherCache?.timestamp;
      const oneHour = 60 * 60 * 1000;

      if (cachedWeather && cachedTimestamp && (Date.now() - cachedTimestamp) < oneHour) {
        const data = JSON.parse(JSON.stringify(cachedWeather));
        
        // Re-map icons from cached data
        data.current.icon = mapConditionToIcon(data.current.condition);
        data.hourly = data.hourly.map((h: any) => ({ ...h, icon: mapConditionToIcon(h.condition) }));
        data.daily = data.daily.map((d: any, index: number) => {
          const date = new Date(d.day);
          const dayName = index === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: 'short' });
          return { ...d, day: dayName, icon: mapConditionToIcon(d.condition) };
        });

        setWeather(data);
        return;
      }

      fetchNewWeatherData();
    };

    const fetchWeatherForLocation = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://agriseed.onrender.com/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error("Failed to fetch weather data from backend.");
        const data = await res.json();
        
        // Save to memory cache
        (window as any).__weatherCache = {
          data: data,
          timestamp: Date.now()
        };
  
        // Map icons
        data.current.icon = mapConditionToIcon(data.current.condition);
  
        data.hourly = data.hourly
          .filter((_: any, index: number) => index % 3 === 0)
          .map((h: any) => ({ ...h, icon: mapConditionToIcon(h.condition) }));
  
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
          setError("Geolocation permission denied. Showing default location.");
          fetchWeatherForLocation(-10.6, 34.117).catch(e => setError("Could not retrieve weather data."));
        }
      );
    };

    loadWeather();
  }, []);

  if (error && !weather) {
    return (
      <div className="flex items-center justify-center h-64 text-amber-600 dark:text-amber-400 flex-col text-center px-4">
        <MapPin size={48} className="mb-4 opacity-50" />
        <p className="font-semibold">Could not get your location</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 flex-col px-4">
        <CloudSun size={48} className="mb-4 opacity-50 animate-pulse" />
        <p>Fetching your local weather...</p>
      </div>
    );
  }

  const { current, hourly, daily } = weather;
  const CurrentIcon = current.icon;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">Weather Forecast & Advisory</h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Showing weather for <strong>{current.location}</strong>
        </p>
      </div>

      {/* Current Weather */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <p className="text-base sm:text-lg opacity-90">{current.condition}</p>
            <p className="text-5xl sm:text-6xl font-bold my-2">{current.temp}°C</p>
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 opacity-90 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Droplets size={18} className="sm:w-5 sm:h-5" />
                <span>{current.humidity}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind size={18} className="sm:w-5 sm:h-5" />
                <span>{current.wind} km/h</span>
              </div>
            </div>
          </div>
          <CurrentIcon size={64} className="opacity-80 sm:w-20 sm:h-20" />
        </div>
      </Card>

      {/* Hourly Forecast */}
      <Card>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Today's Forecast</h2>
        <div className="overflow-x-auto -mx-4 sm:-mx-6">
          <div className="flex gap-2 pb-2 px-4 sm:px-6 min-w-max">
            {hourly.map((hour: any, index: number) => {
              const HourIcon = hour.icon;
              const isCurrentHour = new Date().getHours() === parseInt(hour.time.split(':')[0]);
              return (
                <div 
                  key={index} 
                  className={`flex flex-col items-center gap-2 flex-shrink-0 text-center w-16 sm:w-20 p-2 rounded-lg transition-colors ${
                    isCurrentHour 
                      ? 'bg-emerald-100 dark:bg-emerald-900' 
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <p className={`font-semibold text-xs sm:text-sm ${
                    isCurrentHour 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {hour.time}
                  </p>
                  <HourIcon size={20} className={`sm:w-6 sm:h-6 ${isCurrentHour ? 'text-emerald-500' : ''}`} />
                  <p className="font-bold text-sm sm:text-base">{Math.round(hour.temp)}°</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 5-Day Forecast */}
      <Card>
        <h2 className="text-lg sm:text-xl font-semibold mb-4">5-Day Forecast</h2>
        <div className="space-y-3">
          {daily.map((day: any, index: number) => {
            const DayIcon = day.icon;
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <p className="font-semibold text-sm sm:text-base w-12 sm:w-16">{day.day}</p>
                <DayIcon size={20} className="text-emerald-500 sm:w-6 sm:h-6" />
                <p className="font-bold text-base sm:text-lg ml-auto">{Math.round(day.temp)}°C</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Weather;
