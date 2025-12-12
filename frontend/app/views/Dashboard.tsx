"use client"
import React, { useState, useEffect } from 'react';
import { CloudSun, Sprout, Bug, Leaf, Droplets, Wind, MapPin, ChevronRight, Activity } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [weatherSummary, setWeatherSummary] = useState({
    location: 'Your Location',
    temp: '--',
    condition: 'Loading...',
    humidity: '--',
    wind: '--'
  });

  useEffect(() => {
    // Read location from cached weather data
    const cachedWeather = localStorage.getItem('weatherData');
    if (cachedWeather) {
      const data = JSON.parse(cachedWeather);
      if (data.current) {
        setWeatherSummary(data.current);
      }
    }
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Mwauka Bwanji, Farmer! 🌿
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Today is a great day to check your maize fields.
          </p>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
          <MapPin size={18} className="text-emerald-500 ml-2 mr-1" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 pr-3">
            {weatherSummary.location}
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20 p-8 cursor-pointer" onClick={() => setActiveTab('weather')}>
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <CloudSun size={200} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-emerald-100 font-medium mb-1">Current Weather</div>
            <div className="text-6xl font-bold tracking-tighter">{Math.round(parseFloat(weatherSummary.temp))}°C</div>
            <div className="text-emerald-100 mt-2 flex items-center justify-center md:justify-start gap-2">
              <CloudSun size={20} /> {weatherSummary.condition}
            </div>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <div className="text-emerald-200 text-sm mb-1 flex items-center justify-center gap-1"><Droplets size={14}/> Humidity</div>
              <div className="font-semibold text-xl">{weatherSummary.humidity || '--'}%</div>
            </div>
            <div>
              <div className="text-emerald-200 text-sm mb-1 flex items-center justify-center gap-1"><Wind size={14}/> Wind</div>
              <div className="font-semibold text-xl">{weatherSummary.wind || '--'} km/h</div>
            </div>
            <div>
              <div className="text-emerald-200 text-sm mb-1 flex items-center justify-center gap-1"><Leaf size={14}/> Soil</div>
              <div className="font-semibold text-xl">Moist</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Card onClick={() => setActiveTab('advisory')} className="flex flex-col items-center text-center hover:scale-105 cursor-pointer border-b-4 border-emerald-500 flex-1 basis-48">
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 rounded-full mb-3 text-emerald-600 dark:text-emerald-400">
            <Sprout size={24} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">AI Schedule</h3>
        </Card>
        <Card onClick={() => setActiveTab('pest')} className="flex flex-col items-center text-center hover:scale-105 cursor-pointer border-b-4 border-red-400 flex-1 basis-48">
          <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-full mb-3 text-red-500 dark:text-red-400">
            <Bug size={24} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Pest Doctor</h3>
        </Card>
        <Card onClick={() => setActiveTab('weather')} className="flex flex-col items-center text-center hover:scale-105 cursor-pointer border-b-4 border-sky-400 flex-1 basis-48">
          <div className="bg-sky-50 dark:bg-sky-900/30 p-3 rounded-full mb-3 text-sky-500 dark:text-sky-400">
            <CloudSun size={24} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Forecast</h3>
        </Card>
             </div>
    </div>
  );
};

export default Dashboard;