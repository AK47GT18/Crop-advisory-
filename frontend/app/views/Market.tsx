"use client"
import React from 'react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const marketData = [
  { name: 'Maize', price: 'MWK 15,000', change: 2.5, trend: 'up', location: 'Lilongwe' },
  { name: 'Soybeans', price: 'MWK 35,000', change: -1.8, trend: 'down', location: 'Blantyre' },
  { name: 'Groundnuts', price: 'MWK 28,000', change: 5.1, trend: 'up', location: 'Mzuzu' },
  { name: 'Rice', price: 'MWK 22,000', change: 0.5, trend: 'up', location: 'Zomba' },
  { name: 'Tobacco', price: 'MWK 85,000', change: -3.2, trend: 'down', location: 'Kasungu' },
];

const Market: React.FC = () => (
  <div className="animate-fadeIn space-y-8">
    <div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Market Prices</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1">Latest commodity prices from major markets in Malawi.</p>
    </div>

    <Card>
      <div className="space-y-4">
        {marketData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <div>
              <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.location} Market</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.price}</p>
              <div className={`flex items-center justify-end gap-1 text-sm ${item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {item.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{item.change}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

export default Market;