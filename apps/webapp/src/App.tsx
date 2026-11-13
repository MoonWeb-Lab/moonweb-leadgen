import React, { useState, useEffect, useMemo } from 'react';
import { useTelegram } from './hooks/useTelegram.js';
import { api, FilterState } from './api/client.js';
import { Header } from './components/Header.js';
import { CountryCitySelector } from './components/CountryCitySelector.js';
import { NicheCatalog } from './components/NicheCatalog.js';
import { FilterBar } from './components/FilterBar.js';
import { LeadCard } from './components/LeadCard.js';
import { OfferModal } from './components/OfferModal.js';
import { ExportModal } from './components/ExportModal.js';
import { Loader2, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const { user, userId, triggerHaptic, triggerNotificationHaptic } = useTelegram();

  // Catalog Data
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, noWebsite: 0 });

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    countryId: 'BY',
    cityId: '',
    categoryId: '',
    subcategoryId: '',
    onlyNoWebsite: true,
    hasInstagram: false,
    hasTelegram: false,
    hasPhone: false,
    minRating: '',
    crmStatus: 'all',
    search: '',
    sortBy: 'reviews',
    page: 1,
    limit: 25
  });

  // Leads Data State
  const [leads, setLeads] = useState<any[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [activeOffer, setActiveOffer] = useState<any | null>(null);
  const [activeOfferLead, setActiveOfferLead] = useState<any | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Initial load of catalog
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [cList, ctList, catList, st] = await Promise.all([
          api.getCountries(),
          api.getCities(),
          api.getCategories(),
          api.getStats()
        ]);
        setCountries(cList);
        setCities(ctList);
        setCategories(catList);
        setStats({ total: st.total, noWebsite: st.noWebsite });
      } catch (err) {
        console.error('Ошибка инициализации каталога:', err);
      }
    }
    loadCatalog();
  }, []);

  // Fetch leads on filter change
  useEffect(() => {
    let isCancelled = false;
    async function loadLeads() {
      setLoading(true);
      try {
        const res = await api.getLeads(filters);
        if (!isCancelled) {
          setLeads(res.data);
          setTotalFound(res.total);
        }
      } catch (err) {
        console.error('Ошибка загрузки лидов:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(loadLeads, 150); // slight debounce for rapid clicks
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  // Handlers
  const handleSelectCountry = (countryId: 'BY' | 'RU') => {
    setFilters(prev => ({ ...prev, countryId, cityId: '', page: 1 }));
  };

  const handleSelectCity = (cityId: number | '') => {
    setFilters(prev => ({ ...prev, cityId, page: 1 }));
  };

  const handleSelectCategory = (categoryId: string) => {
    setFilters(prev => ({ ...prev, categoryId, subcategoryId: '', page: 1 }));
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    setFilters(prev => ({ ...prev, subcategoryId, page: 1 }));
  };

  const handleSearchChange = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleUpdateCrmStatus = async (leadId: number, status: string) => {
    // Optimistic UI update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, crmStatus: status } : l));
    try {
      await api.updateLeadCrm(leadId, status);
    } catch (err) {
      console.error('Ошибка обновления статуса CRM:', err);
    }
  };

  const handleOpenOffer = async (lead: any) => {
    setActiveOfferLead(lead);
    try {
      const offer = await api.getOffer(lead.id);
      setActiveOffer(offer);
    } catch (err) {
      console.error('Ошибка генерации оффера:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070C18] text-slate-100 flex flex-col">
      {/* Sticky Top Header */}
      <Header user={user} metrics={stats} />

      <main className="max-w-4xl mx-auto w-full px-4 py-4 space-y-4 flex-1">
        {/* Country & City Selector */}
        <CountryCitySelector
          countries={countries}
          cities={cities}
          selectedCountry={filters.countryId}
          selectedCity={filters.cityId}
          onSelectCountry={handleSelectCountry}
          onSelectCity={handleSelectCity}
          onHaptic={() => triggerHaptic('light')}
        />

        {/* Niche & Search Catalog */}
        <NicheCatalog
          categories={categories}
          selectedCategory={filters.categoryId}
          selectedSubcategory={filters.subcategoryId}
          searchQuery={filters.search}
          onSelectCategory={handleSelectCategory}
          onSelectSubcategory={handleSelectSubcategory}
          onSearchChange={handleSearchChange}
          onHaptic={() => triggerHaptic('light')}
        />

        {/* Filter & Sorters Toolbar */}
        <FilterBar
          onlyNoWebsite={filters.onlyNoWebsite}
          hasTelegram={filters.hasTelegram}
          hasInstagram={filters.hasInstagram}
          minRating={filters.minRating}
          crmStatus={filters.crmStatus}
          sortBy={filters.sortBy}
          totalFound={totalFound}
          onToggleNoWebsite={() => setFilters(f => ({ ...f, onlyNoWebsite: !f.onlyNoWebsite, page: 1 }))}
          onToggleTelegram={() => setFilters(f => ({ ...f, hasTelegram: !f.hasTelegram, page: 1 }))}
          onToggleInstagram={() => setFilters(f => ({ ...f, hasInstagram: !f.hasInstagram, page: 1 }))}
          onToggleMinRating={() => setFilters(f => ({ ...f, minRating: f.minRating === 4.5 ? '' : 4.5, page: 1 }))}
          onSelectCrmStatus={(status) => setFilters(f => ({ ...f, crmStatus: status, page: 1 }))}
          onSelectSortBy={(sort) => setFilters(f => ({ ...f, sortBy: sort, page: 1 }))}
          onOpenExport={() => setIsExportOpen(true)}
          onHaptic={() => triggerHaptic('light')}
        />

        {/* Leads Feed */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <p className="text-xs">Загрузка карточек компаний...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center space-y-3 my-6">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Компаний по заданным фильтрам не найдено</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Попробуйте сбросить поисковый запрос, выбрать другой город или отключить строгие фильтры.
            </p>
            <button
              onClick={() => setFilters({
                countryId: 'BY',
                cityId: '',
                categoryId: '',
                subcategoryId: '',
                onlyNoWebsite: true,
                hasInstagram: false,
                hasTelegram: false,
                hasPhone: false,
                minRating: '',
                crmStatus: 'all',
                search: '',
                sortBy: 'reviews',
                page: 1,
                limit: 25
              })}
              className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold hover:bg-sky-500/30 transition-all"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="space-y-3 pb-8">
            {leads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onOpenOffer={handleOpenOffer}
                onUpdateCrmStatus={handleUpdateCrmStatus}
                onHaptic={() => triggerHaptic('medium')}
              />
            ))}
          </div>
        )}
      </main>

      {/* Offer Modal */}
      <OfferModal
        isOpen={Boolean(activeOffer)}
        onClose={() => {
          setActiveOffer(null);
          setActiveOfferLead(null);
        }}
        offer={activeOffer}
        tgLink={activeOfferLead?.tgLink}
        onHaptic={triggerNotificationHaptic}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filters={filters}
        userChatId={userId}
        totalLeads={totalFound}
        onHaptic={triggerNotificationHaptic}
      />
    </div>
  );
};
