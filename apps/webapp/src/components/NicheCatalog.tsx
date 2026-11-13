import React from 'react';
import { Search, X, Layers } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  subcategories: Subcategory[];
}

interface NicheCatalogProps {
  categories: Category[];
  selectedCategory: string;
  selectedSubcategory: string;
  searchQuery: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (subcategoryId: string) => void;
  onSearchChange: (query: string) => void;
  onHaptic?: () => void;
}

export const NicheCatalog: React.FC<NicheCatalogProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  onSelectCategory,
  onSelectSubcategory,
  onSearchChange,
  onHaptic
}) => {
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-2.5">
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию, адресу или ключевому слову..."
          className="w-full pl-9 pr-9 py-2.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/80 focus:ring-1 focus:ring-sky-500/80 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Categories Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => {
            onSelectCategory('');
            onSelectSubcategory('');
            onHaptic?.();
          }}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCategory === ''
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-sm'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
          }`}
        >
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Все ниши</span>
          </div>
        </button>

        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (isActive) {
                  onSelectCategory('');
                  onSelectSubcategory('');
                } else {
                  onSelectCategory(cat.id);
                  onSelectSubcategory('');
                }
                onHaptic?.();
              }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Subcategories (if Category selected) */}
      {currentCategoryObj && currentCategoryObj.subcategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 bg-slate-900/50 rounded-lg border border-slate-800/80 scrollbar-none">
          <button
            onClick={() => {
              onSelectSubcategory('');
              onHaptic?.();
            }}
            className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              selectedSubcategory === ''
                ? 'bg-sky-500/20 text-sky-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Все в {currentCategoryObj.name}
          </button>

          {currentCategoryObj.subcategories.map(sub => {
            const isSubActive = selectedSubcategory === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => {
                  onSelectSubcategory(isSubActive ? '' : sub.id);
                  onHaptic?.();
                }}
                className={`flex-shrink-0 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  isSubActive
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
