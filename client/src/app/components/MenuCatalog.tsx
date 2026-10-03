import React from 'react';
import { MOCK_MENU, MOCK_USER, MenuItem } from '../data/mockData';
import { AlertTriangle, Plus, ShieldCheck } from 'lucide-react';

interface Props {
  onAddToCart?: (item: MenuItem) => void;
}

export const MenuCatalog: React.FC<Props> = ({ onAddToCart }) => {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profil utilizator scanat NFC */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-8 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
            {MOCK_USER.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-white">Client: {MOCK_USER.name}</h3>
            <p className="text-sm text-slate-400">
              Alergii detectate: <span className="text-rose-400 font-medium">{MOCK_USER.allergies.join(', ')}</span>
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" /> NFC Profil Activ
        </span>
      </div>

      {/* Grilă Carduri Produse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_MENU.map((item) => {
          const hasAllergen = item.allergens.some((a) => MOCK_USER.allergies.includes(a));

          return (
            <div
              key={item.id}
              className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-600 transition-all shadow-lg"
            >
              <div>
                {/* Imagine */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  {hasAllergen && (
                    <div className="absolute top-3 right-3 bg-rose-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <AlertTriangle className="w-4 h-4" /> Conține Alergeni
                    </div>
                  )}
                </div>

                {/* Detalii Mâncare */}
                <div className="p-5 text-left">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    <span className="text-emerald-400 font-extrabold text-lg">{item.price} MDL</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">{item.description}</p>

                  {/* Badges Alergeni separate clar */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {item.allergens.map((alg) => {
                      const isUserAllergic = MOCK_USER.allergies.includes(alg);
                      return (
                        <span
                          key={alg}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize ${
                            isUserAllergic
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/60 text-slate-300 border border-slate-600/40'
                          }`}
                        >
                          {alg}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Acțiune Adăugare */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onAddToCart && onAddToCart(item)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" /> Adaugă în Comandă
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};