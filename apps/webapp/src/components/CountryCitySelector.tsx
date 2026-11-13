import React from 'react';
import { MapPin } from 'lucide-react';

interface City {
  id: number;
  country_id: string;
  name: string;
  region?: string;
  is_major?: number;
}

interface CountryCitySelectorProps {
  countries: Array<{ id: 'BY' | 'RU'; name: string; flag: string }>;
  cities: City[];
  selectedCountry: 'BY' | 'RU';
  selectedCity: number | '';
  onSelectCountry: (country: 'BY' | 'RU') => void;
  onSelectCity: (cityId: number | '') => void;
  onHaptic?: () => void;
}

export const CountryCitySelector: React.FC<CountryCitySelectorProps> = ({
  countries,
  cities,
  selectedCountry,
  selectedCity,
  onSelectCountry,
  onSelectCity,
  onHaptic
}) => {
  const filteredCities = cities.filter(c => c.country_id === selectedCountry);

  return (
    <div className="space-y-2.5">
      {/* Country Tabs */}
      <div className="flex p-1 bg-slate-900/90 rounded-xl border border-white/5 gap-1">
        {countries.map(c => {
          const isActive = selectedCountry === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                onSelectCountry(c.id);
                onHaptic?.();
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Horizontal Scrollable Cities */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            onSelectCity('');
            onHaptic?.();
          }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCity === ''
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          Все города
        </button>

        {filteredCities.map(city => {
          const isActive = selectedCity === city.id;
          return (
            <button
              key={city.id}
              onClick={() => {
                onSelectCity(city.id);
                onHaptic?.();
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>{city.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
