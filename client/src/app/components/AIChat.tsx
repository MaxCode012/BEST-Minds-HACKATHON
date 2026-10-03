import React, { useState } from 'react';
import { Sparkles, X, Bot, Check, RefreshCw, Plus, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { MOCK_MENU, MOCK_USER, MenuItem } from '../data/mockData';

interface Preferences {
  hungerLevel: 'light' | 'hearty';
  dietType: 'all' | 'vegetarian' | 'vegan';
  drinks: boolean | null;
  dessert: boolean | null;
  budget: number | '';
  allergies: string[];
}

interface Props {
  onAddToCart?: (
    item: MenuItem,
    chefNote: string,
    orderType: 'individual' | 'group',
    userName: string
  ) => void;
}

const COMMON_ALLERGIES = ['lactoză', 'alune', 'gluten', 'ouă', 'pește', 'soia'];

export const AIChat: React.FC<Props> = ({ onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<number[]>([]);
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  const [prefs, setPrefs] = useState<Preferences>({
    hungerLevel: 'hearty',
    dietType: 'all',
    drinks: null,
    dessert: null,
    budget: '',
    allergies: [...MOCK_USER.allergies],
  });

  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);

  const handleReset = () => {
    setStep(1);
    setLoading(false);
    setPrefs({
      hungerLevel: 'hearty',
      dietType: 'all',
      drinks: null,
      dessert: null,
      budget: '',
      allergies: [...MOCK_USER.allergies],
    });
    setRecommendations([]);
    setAddedItemIds([]);
    setCustomAllergyInput('');
  };

  const toggleAllergy = (allergy: string) => {
    setPrefs((prev) => {
      const exists = prev.allergies.includes(allergy);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== allergy)
          : [...prev.allergies, allergy],
      };
    });
  };

  const handleAddCustomAllergy = () => {
    const trimmed = customAllergyInput.trim().toLowerCase();
    if (trimmed && !prefs.allergies.includes(trimmed)) {
      setPrefs((prev) => ({
        ...prev,
        allergies: [...prev.allergies, trimmed],
      }));
      setCustomAllergyInput('');
    }
  };

  // Trimiterea pachetului de date către C# Backend Controller (api/Recommendations)
  const submitPreferencesToBackend = async () => {
    setLoading(true);

    const payload = {
      userId: MOCK_USER.id || "user-1",
      userName: MOCK_USER.name,
      hungerLevel: prefs.hungerLevel,
      dietType: prefs.dietType,
      wantsDrinks: prefs.drinks,
      wantsDessert: prefs.dessert,
      maxBudget: typeof prefs.budget === 'number' ? prefs.budget : null,
      allergies: prefs.allergies,
    };

    try {
      const response = await fetch('http://localhost:5277/api/Recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Răspuns primit de la Controller-ul C#:', data);

        // Mapăm datele returnate din Backend
        if (Array.isArray(data)) {
          setRecommendations(data);
        } else if (data.items && Array.isArray(data.items)) {
          setRecommendations(data.items);
        } else {
          setRecommendations([]);
        }
      } else {
        console.error('Eroare HTTP de la serverul C#:', response.status);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Eroare la trimiterea fetch către http://localhost:5277/api/Recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
      setStep(5);
    }
  };

  const handleAddDirectly = (item: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(item, 'Recomandat de Sommelier AI', 'individual', MOCK_USER.name);
      setAddedItemIds((prev) => [...prev, item.id]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Buton Flotant Auriu */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-5 py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 cursor-pointer border border-amber-400/30"
        >
          <Sparkles className="w-5 h-5 text-stone-950 animate-pulse" />
          <span>Sommelier AI</span>
        </button>
      )}

      {/* Fereastra Chat / Chestionar */}
      {isOpen && (
        <div className="bg-[#1c1817] border border-amber-900/50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col h-[540px] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#141010] p-4 border-b border-amber-900/30 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-100 text-sm font-serif">SmartResto AI</h4>
                <p className="text-[11px] text-amber-400 font-medium">
                  {step <= 4 ? `Pasul ${step} din 4` : 'Meniu Recomandat'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-amber-200 p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corp Quiz */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#181413] flex flex-col justify-center">
            {/* PASUL 1: FOAME & DIETĂ */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-amber-100 font-semibold text-sm text-center font-serif">
                  Cât de foame vă este și ce preferințe aveți? 🍽️
                </h3>
                
                <div>
                  <label className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block mb-1.5">Mărime Masă:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrefs({ ...prefs, hungerLevel: 'light' })}
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        prefs.hungerLevel === 'light'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      🥗 Gustare Ușoară
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrefs({ ...prefs, hungerLevel: 'hearty' })}
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        prefs.hungerLevel === 'hearty'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      🥩 Masă Copioasă
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block mb-1.5">Preferință Dietă:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['all', 'vegetarian', 'vegan'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPrefs({ ...prefs, dietType: d })}
                        className={`py-2 text-[11px] font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                          prefs.dietType === d
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                        }`}
                      >
                        {d === 'all' ? 'Toate' : d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                >
                  Înainte ➔
                </button>
              </div>
            )}

            {/* PASUL 2: BĂUTURI & DESERT */}
            {step === 2 && (
              <div className="space-y-4 text-center">
                <h3 className="text-amber-100 font-semibold text-sm font-serif">
                  Doriți o băutură sau un desert? 🍷🍰
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-stone-900 p-3 rounded-xl border border-stone-800">
                    <span className="text-xs text-stone-200 font-medium">Include Băutură</span>
                    <button
                      onClick={() => setPrefs({ ...prefs, drinks: !prefs.drinks })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prefs.drinks
                          ? 'bg-amber-600 text-stone-950'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {prefs.drinks ? 'DA' : 'NU'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-stone-900 p-3 rounded-xl border border-stone-800">
                    <span className="text-xs text-stone-200 font-medium">Include Desert</span>
                    <button
                      onClick={() => setPrefs({ ...prefs, dessert: !prefs.dessert })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prefs.dessert
                          ? 'bg-amber-600 text-stone-950'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {prefs.dessert ? 'DA' : 'NU'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Înapoi
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                  >
                    Înainte ➔
                  </button>
                </div>
              </div>
            )}

            {/* PASUL 3: BUGET */}
            {step === 3 && (
              <div className="space-y-4 text-center">
                <h3 className="text-amber-100 font-semibold text-sm font-serif">Care este bugetul maxim per preparat? 💵</h3>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                  </div>
                  <input
                    type="number"
                    placeholder="Ex: 120"
                    value={prefs.budget}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        budget: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="w-full pl-9 pr-12 py-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 text-sm font-bold"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-stone-400 font-bold">
                    MDL
                  </span>
                </div>

                <div className="flex gap-2 justify-center">
                  {[80, 120, 150].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPrefs({ ...prefs, budget: amount })}
                      className="text-xs bg-stone-900 hover:bg-stone-800 border border-stone-800 px-3 py-1.5 rounded-lg text-amber-300 cursor-pointer"
                    >
                      {amount} MDL
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Înapoi
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                  >
                    Înainte ➔
                  </button>
                </div>
              </div>
            )}

            {/* PASUL 4: ALERGII & TRIMITERE LA API C# */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-amber-100 font-semibold text-sm font-serif flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Selectează Alergiile Tale
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Selectează alergeni de transmis către API-ul C#:
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {COMMON_ALLERGIES.map((alg) => {
                    const isSelected = prefs.allergies.includes(alg);
                    return (
                      <button
                        key={alg}
                        type="button"
                        onClick={() => toggleAllergy(alg)}
                        className={`py-2 px-2 text-[11px] font-bold rounded-xl border capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-rose-950/60 border-rose-600 text-rose-300 shadow-md'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-rose-400 shrink-0" />}
                        {alg}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Alta (ex: susan...)"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAllergy()}
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="bg-stone-800 hover:bg-stone-700 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold border border-stone-700 cursor-pointer"
                  >
                    Adaugă
                  </button>
                </div>

                {prefs.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-400 font-semibold block w-full">Alergii selectate:</span>
                    {prefs.allergies.map((alg) => (
                      <span
                        key={alg}
                        onClick={() => toggleAllergy(alg)}
                        className="bg-rose-950/40 border border-rose-700/50 text-rose-300 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:line-through"
                      >
                        {alg} <X className="w-2.5 h-2.5" />
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-stone-800 text-stone-300 font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Înapoi
                  </button>
                  <button
                    onClick={submitPreferencesToBackend}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> Trimitere...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Trimite la API
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* PASUL 5: AFISARE RĂSPUNS BACKEND */}
            {step === 5 && (
              <div className="space-y-3 text-left">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-amber-100 font-bold text-xs font-serif">Rezultate primite de la C# Controller:</h4>
                  <button
                    onClick={handleReset}
                    className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resetează
                  </button>
                </div>

                {recommendations.length === 0 ? (
                  <p className="text-stone-400 text-xs text-center py-6 font-sans">
                    Nu s-au găsit preparate conform răspunsului primit de la server.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                    {recommendations.map((item) => {
                      const isAdded = addedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-stone-900 border border-amber-900/30 p-3 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <h5 className="font-semibold text-amber-100 text-xs font-serif">{item.title}</h5>
                            <span className="text-amber-400 font-bold text-xs">{item.price} MDL</span>
                          </div>

                          <button
                            onClick={() => handleAddDirectly(item)}
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-stone-800 text-stone-500'
                                : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                            }`}
                          >
                            {isAdded ? (
                              'Adăugat'
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Adaugă
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};