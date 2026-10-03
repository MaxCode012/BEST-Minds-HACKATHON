import React, { useState } from 'react';
import { MOCK_MENU, MOCK_USER, MenuItem } from '../data/mockData';
import { AlertTriangle, Plus, ShieldCheck, MessageSquare, Users, User } from 'lucide-react';

interface Props {
  onAddToCart: (
    item: MenuItem, 
    chefNote: string, 
    orderType: 'individual' | 'group'
  ) => void;
}

export const MenuCatalog: React.FC<Props> = ({ onAddToCart }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [chefNote, setChefNote] = useState('');
  const [orderType, setOrderType] = useState<'individual' | 'group'>('individual');

  const handleConfirmAdd = () => {
    if (selectedItem) {
      onAddToCart(selectedItem, chefNote, orderType);
      setSelectedItem(null);
      setChefNote('');
    }
  };

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

                  {/* Badges Alergeni */}
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

              {/* Acțiune Deschidere Modal */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-5 h-5" /> Adaugă în Comandă
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Notițe Bucătar & Tip Comandă */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-1">{selectedItem.title}</h3>
            <p className="text-emerald-400 font-bold mb-4">{selectedItem.price} MDL</p>

            {/* Selector Tip Comandă */}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Tip Comandă
            </label>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setOrderType('individual')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'individual'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <User className="w-4 h-4" /> Individuală
              </button>

              <button
                type="button"
                onClick={() => setOrderType('group')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'group'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Users className="w-4 h-4" /> În Grup (Masa #4)
              </button>
            </div>

            {/* Câmp Notițe Bucătar */}
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Notițe pentru Bucătar
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Fără ceapă, sosul separat, mai puțin sărat..."
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-6 resize-none"
            />

            {/* Acțiuni Modal */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setChefNote('');
                }}
                className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition-colors text-sm cursor-pointer"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-md cursor-pointer"
              >
                Confirmă Adăugarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};