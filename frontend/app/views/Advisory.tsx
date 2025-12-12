"use client"
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Sprout, 
  TrendingUp,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  FlaskConical,
  Leaf
} from 'lucide-react';

interface VarietyInfo {
  maturity_days: number;
  drought_tolerance: string;
  yield_estimate_tonnes_per_ha: string;
}

interface Schedule {
  week: number;
  stage: string;
  task: string;
  fertilizer: string;
}

interface PlantingWindow {
  status: string;
  message: string;
  harvest_month?: string;
}

interface FertilizerPlan {
  type: string;
  basal: string;
  topdress1: string;
  topdress2: string;
}

interface ResultData {
  status: string;
  windowMessage?: string;
  reason?: string;
  recommendation?: string;
  plantingWindow?: string;
  yield?: string;
  yieldPerHa?: string;
  harvestDate?: string;
  revenue?: string;
  cost?: string;
  profit?: string;
  profitPerAcre?: string;
  schedule?: Schedule[];
  fertilizerPlan?: FertilizerPlan;
  varietyInfo?: VarietyInfo;
}

const Advisory: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Maize');
  const [selectedVariety, setSelectedVariety] = useState<string>('Kanyani');
  const [soilType, setSoilType] = useState<string>('Loam');
  const [landSize, setLandSize] = useState<number>(2.5);
  const [plantingDate, setPlantingDate] = useState<string>('2024-12-15');
  const [selectedFertilizer, setSelectedFertilizer] = useState<string>('23:10:5 + Urea');
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [varietyInfo, setVarietyInfo] = useState<VarietyInfo | undefined>(undefined);
  const [error, setError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Crop varieties database (local fallback)
  const cropDatabase: Record<string, Record<string, string[]>> = {
    'Maize': {
      'OPV': ['Kanyani', 'SC 403', 'MH 18', 'MH 19', 'MH 20'],
      'Hybrid': ['DK 8031', 'DK 8053', 'SC 627'],
      'Local': ['Chitedze', 'Mwanza', 'Kalima']
    },
    'Rice': {
      'Improved': ['NERICA 4', 'NERICA 5', 'NERICA 7', 'IR 2793-80-1', 'TXD 306'],
      'Local': ['Kalima', 'Ndiwo']
    },
    'Groundnuts': {
      'Improved': ['CG7', 'Nsinjiro Improved', 'JL 24'],
      'Local': ['Chitala', 'Jengela', 'Nsinjiro']
    },
    'Beans': {
      'Improved': ['Kalima', 'Kablanketi', 'Kanyani', 'MW 348'],
      'Local': ['Mwasi', 'Kholopera', 'Nayela']
    }
  };

  const varietyDetails: Record<string, VarietyInfo> = {
    'Kanyani': { maturity_days: 120, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '2.5-4.5' },
    'SC 403': { maturity_days: 125, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '2.3-4.2' },
    'MH 18': { maturity_days: 115, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '2.8-4.8' },
    'MH 19': { maturity_days: 120, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '3.0-5.0' },
    'MH 20': { maturity_days: 125, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '3.2-5.2' },
    'DK 8031': { maturity_days: 135, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '4.5-6.5' },
    'DK 8053': { maturity_days: 140, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '5.0-7.0' },
    'SC 627': { maturity_days: 130, drought_tolerance: 'very good', yield_estimate_tonnes_per_ha: '4.8-6.8' },
    'Chitedze': { maturity_days: 140, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '1.8-3.5' },
    'Mwanza': { maturity_days: 135, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '1.6-3.2' },
    'Kalima': { maturity_days: 130, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '1.5-3.0' },
    'NERICA 4': { maturity_days: 90, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '2.5-4.0' },
    'NERICA 5': { maturity_days: 95, drought_tolerance: 'moderate', yield_estimate_tonnes_per_ha: '2.3-3.8' },
    'CG7': { maturity_days: 130, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '1.2-2.0' },
    'MW 348': { maturity_days: 75, drought_tolerance: 'good', yield_estimate_tonnes_per_ha: '1.1-1.7' }
  };

  const fertilizerOptions: Record<string, string[]> = {
    'Maize': ['DAP + Urea', '23:10:5 + Urea', '23:10:5 +6S +1Zn + Urea', 'Organic Manure', 'No Fertilizer'],
    'Rice': ['NPK 15:15:15 + Urea', 'Organic Manure', 'No Fertilizer'],
    'Groundnuts': ['NPK (P & K focused)', 'Organic Manure', 'No Fertilizer'],
    'Beans': ['NPK 15:15:15', 'Organic Manure', 'No Fertilizer']
  };

  // Update variety info when variety changes
  useEffect(() => {
    if (selectedVariety && varietyDetails[selectedVariety]) {
      setVarietyInfo(varietyDetails[selectedVariety]);
    }
  }, [selectedVariety]);

  // Simulate initial data loading for skeleton UI
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 750); // Simulate a 750ms load time
    return () => clearTimeout(timer);
  }, []);

  const getAllVarieties = (): string[] => {
    return Object.values(cropDatabase[selectedCrop] || {}).flat();
  };

  const handleGenerate = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      // Format planting date to YYYY-MM-DD
      const [day, month, year] = plantingDate.includes('-') 
        ? plantingDate.split('-')
        : [plantingDate.slice(0, 2), plantingDate.slice(2, 4), plantingDate.slice(4, 8)];
      
      const formattedDate = plantingDate.includes('-') 
        ? plantingDate 
        : `${year}-${month}-${day}`;

      // Call backend API
      const response = await fetch(`${API_URL}/predict-yield`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crop: selectedCrop,
          variety: selectedVariety,
          soil_type: soilType,
          planting_date: formattedDate,
          land_size_acres: landSize,
          fertilizer_type: selectedFertilizer,
          fertilizer_rate_kg_per_ha: 200,
          rainfall_mm: 550,
          avg_temperature_c: 24,
          management_score: 75,
          pest_pressure: 30
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const plantDate = new Date(formattedDate);
        const harvestDate = new Date(plantDate);
        harvestDate.setDate(harvestDate.getDate() + (varietyInfo?.maturity_days || 120));

        // Generate farming schedule
        const schedule: Schedule[] = [
          {
            week: 1,
            stage: 'Planting',
            task: 'Plant seeds 5cm deep. Irrigate with 25mm of water.',
            fertilizer: data.fertilizer_plan?.basal || 'Apply basal fertilizer'
          },
          {
            week: 3,
            stage: 'Germination',
            task: 'Monitor for uniform germination. Light irrigation (15mm) if soil is dry.',
            fertilizer: 'No fertilizer needed.'
          },
          {
            week: 5,
            stage: 'Vegetative',
            task: 'First weeding. Increase irrigation to 30mm per week.',
            fertilizer: data.fertilizer_plan?.topdress1 || 'Top-dress with Urea'
          },
          {
            week: 8,
            stage: 'Tasseling',
            task: 'Critical water period. Ensure consistent moisture (35mm/week).',
            fertilizer: data.fertilizer_plan?.topdress2 || 'Second top-dressing'
          },
          {
            week: 12,
            stage: 'Grain Filling',
            task: 'Reduce irrigation gradually to 20mm/week. Scout for pests.',
            fertilizer: 'No fertilizer needed.'
          },
          {
            week: Math.ceil((varietyInfo?.maturity_days || 120) / 7),
            stage: 'Maturity',
            task: 'Stop irrigation 2 weeks before harvest to allow drying.',
            fertilizer: 'N/A'
          }
        ];

        setResult({
          status: data.planting_window?.status === 'bad' ? 'bad' : 'good',
          windowMessage: data.planting_window?.message || 'Planting conditions are favorable',
          yield: data.prediction?.total_yield_tonnes?.toFixed(2),
          yieldPerHa: data.prediction?.yield_per_ha?.toFixed(2),
          harvestDate: harvestDate.toLocaleDateString('en-GB', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          }),
          revenue: data.financial?.estimated_revenue?.toLocaleString() || '0',
          cost: data.financial?.estimated_cost?.toLocaleString() || '0',
          profit: data.financial?.estimated_profit?.toLocaleString() || '0',
          profitPerAcre: (data.financial?.estimated_profit / landSize)?.toLocaleString() || '0',
          schedule,
          fertilizerPlan: data.fertilizer_plan,
          varietyInfo,
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate recommendations';
      setError(errorMsg);
      console.error('Error:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Skeleton loader component for form inputs
  const SkeletonLoader = () => (
    <div className="w-full h-[52px] bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
  );

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3 mb-2">
          <Leaf className="text-emerald-600" size={32} />
          AI Crop Advisory System
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Get AI-powered yield forecasts, financial projections, and a personalized farming schedule to optimize your harvest.
        </p>
      </div>

      <Card className="space-y-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isInitializing ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : (
            <>
              {/* Crop Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Crop</label>
                <select 
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    const varieties = Object.values(cropDatabase[e.target.value] || {}).flat();
                    if (varieties.length > 0) setSelectedVariety(varieties[0]);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="Maize">Maize (Corn)</option>
                  <option value="Rice">Rice</option>
                  <option value="Groundnuts">Groundnuts</option>
                  <option value="Beans">Beans</option>
                </select>
              </div>

              {/* Variety Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Variety</label>
                <select 
                  value={selectedVariety}
                  onChange={(e) => setSelectedVariety(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  {getAllVarieties().map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Soil Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Soil Type</label>
                <select 
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option>Sandy Loam</option>
                  <option>Clay</option>
                  <option>Silt</option>
                  <option>Loam</option>
                  <option>Clay Loam</option>
                </select>
              </div>

              {/* Land Size */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Land Size (Acres)</label>
                <input 
                  type="number" 
                  value={landSize}
                  onChange={(e) => setLandSize(parseFloat(e.target.value))}
                  step="0.1"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Planting Date */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Planting Date</label>
                <input 
                  type="date" 
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              {/* Fertilizer Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fertilizer Type</label>
                <select 
                  value={selectedFertilizer}
                  onChange={(e) => setSelectedFertilizer(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  {(fertilizerOptions[selectedCrop] || fertilizerOptions.Maize).map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        {/* Variety Info Display */}
        {varietyInfo && (
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Maturity</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{varietyInfo.maturity_days} days</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Drought Tolerance</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 capitalize">{varietyInfo.drought_tolerance}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Potential Yield</p>
                <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{varietyInfo.yield_estimate_tonnes_per_ha} t/ha</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm"><strong>Error:</strong> {error}</p>
          </div>
        )}

        <Button 
          onClick={handleGenerate}
          className={`w-full text-white font-semibold py-4 shadow-xl ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} shadow-emerald-200 dark:shadow-emerald-900/20`}
          icon={Sprout}
        >
          {loading ? 'Analyzing with AI...' : 'Generate AI Recommendations'}
        </Button>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {result.status === 'bad' ? (
            <Card className="border-l-4 border-amber-500">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Planting Window Alert</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-2">{result.windowMessage}</p>
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Current conditions may not be optimal for planting.</p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Success Indicator */}
              <Card className="border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
                  <div>
                    <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">✓ {result.windowMessage}</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Excellent conditions for planting your selected crop variety</p>
                  </div>
                </div>
              </Card>

              {/* Yield Predictions */}
              <Card>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" size={24} />
                  Yield Predictions
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Total Yield</p>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{result.yield}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">tonnes</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Yield per Hectare</p>
                    <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{result.yieldPerHa}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">t/ha</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Harvest Date</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{result.harvestDate}</p>
                  </div>
                </div>

                {/* Financial Projection */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-600" />
                    Financial Projection
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400">Estimated Revenue:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">MWK {result.revenue}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400">Estimated Costs:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">- MWK {result.cost}</span>
                    </div>
                    <div className="flex justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-slate-800 dark:text-white">Net Profit:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">MWK {result.profit}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <span className="text-slate-600 dark:text-slate-400">Profit per Acre:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">MWK {result.profitPerAcre}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Fertilizer Plan */}
              {result.fertilizerPlan && (
                <Card>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <FlaskConical className="text-emerald-600" size={24} />
                    Fertilizer Application Plan
                  </h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Recommended Type:</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white mt-1">{result.fertilizerPlan.type}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Basal (At Planting):</p>
                      <p className="text-base font-semibold text-slate-800 dark:text-white mt-1">{result.fertilizerPlan.basal}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">First Top-dress:</p>
                      <p className="text-base font-semibold text-slate-800 dark:text-white mt-1">{result.fertilizerPlan.topdress1}</p>
                    </div>
                    {result.fertilizerPlan.topdress2 !== 'N/A' && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Second Top-dress:</p>
                        <p className="text-base font-semibold text-slate-800 dark:text-white mt-1">{result.fertilizerPlan.topdress2}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Farming Schedule */}
              {result.schedule && (
                <Card>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <CalendarDays className="text-emerald-600" size={24} />
                    Farming Schedule
                  </h3>
                  <div className="space-y-4">
                    {result.schedule.map((item, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                            W{item.week}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold text-center w-14">{item.stage}</div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 dark:text-white mb-2">{item.task}</p>
                          <p className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-lg inline-block">
                            <strong>Fertilizer:</strong> {item.fertilizer}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Advisory;