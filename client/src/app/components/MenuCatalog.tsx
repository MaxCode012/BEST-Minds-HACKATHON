import React, { useState } from 'react';
import { MOCK_MENU, MOCK_USER, MenuItem } from '../data/mockData';
import { 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  User, 
  Search,
  UtensilsCrossed
} from 'lucide-react';

interface Props {
  onAddToCart: (
    item: MenuItem, 
    chefNote: string, 
    orderType: 'individual' | 'group',
    userName: string
  ) => void;
}

export const MenuCatalog: React.FC<Props> = ({ onAddToCart }) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [chefNote, setChefNote] = useState('');
  const [orderType, setOrderType] = useState<'individual' | 'group'>('individual');
  const [personName, setPersonName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleConfirmAdd = () => {
    if (selectedItem) {
      const finalName = orderType === 'group' && personName.trim() ? personName : MOCK_USER.name;
      onAddToCart(selectedItem, chefNote, orderType, finalName);
      setSelectedItem(null);
      setChefNote('');
      setPersonName('');
    }
  };

  const filteredMenu = MOCK_MENU.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 font-serif">
      {/* Profil utilizator scanat NFC - Stil Elegance */}
      <div className="bg-[#1c1817]/90 border border-amber-900/40 rounded-2xl p-5 mb-8 flex items-center justify-between shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xl">
            {MOCK_USER.name[0]}
          </div>
          <div className="font-sans">
            <h3 className="font-bold text-stone-100 text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" /> Client: {MOCK_USER.name}
            </h3>
            <p className="text-sm text-stone-400">
              Alergii detectate: <span className="text-rose-400 font-semibold">{MOCK_USER.allergies.join(', ')}</span>
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-sans">
          <ShieldCheck className="w-4 h-4" /> Masă Activă NFC
        </span>
      </div>

      {/* Bară de Căutare Meniu */}
      <div className="relative mb-8 font-sans">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-amber-600/70" />
        </div>
        <input
          type="text"
          placeholder="Caută în meniu (ex: Paste, Steak, Vin...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-[#181413] border border-amber-900/30 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/80 transition-colors text-sm shadow-inner"
        />
      </div>

      {/* Grilă Carduri Preparate */}
      {filteredMenu.length === 0 ? (
        <p className="text-stone-500 text-center py-12 font-sans">Nu s-a găsit niciun preparat în meniu.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map((item) => {
            const hasAllergen = item.allergens.some((a) => MOCK_USER.allergies.includes(a));

            return (
              <div
                key={item.id}
                className="bg-[#1a1615] border border-amber-900/20 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-600/40 transition-all shadow-2xl hover:shadow-amber-900/10"
              >
                <div>
                  {/* Imagine cu Overlay Elegant */}
                  <div className="relative h-56 w-full overflow-hidden bg-stone-950">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1615] via-transparent to-transparent opacity-80" />
                    {hasAllergen && (
                      <div className="absolute top-3 right-3 bg-rose-950/90 border border-rose-600/50 text-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-lg font-sans">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Conține Alergeni
                      </div>
                    )}
                  </div>

                  {/* Detalii Mâncare */}
                  <div className="p-6 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-amber-100 tracking-wide">{item.title}</h3>
                      <span className="text-amber-400 font-extrabold text-xl font-sans">{item.price} MDL</span>
                    </div>
                    <p className="text-stone-400 text-sm mb-4 leading-relaxed font-sans font-light">{item.description}</p>

                    {/* Alergeni */}
                    <div className="flex flex-wrap gap-2 mb-2 font-sans">
                      {item.allergens.map((alg) => {
                        const isUserAllergic = MOCK_USER.allergies.includes(alg);
                        return (
                          <span
                            key={alg}
                            className={`text-[11px] px-2.5 py-1 rounded-md font-medium capitalize ${
                              isUserAllergic
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-700/50'
                                : 'bg-stone-800/80 text-stone-400 border border-stone-700/40'
                            }`}
                          >
                            {alg}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Buton Adăugare */}
                <div className="p-6 pt-0 font-sans">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" /> Adaugă la Comandă
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Notițe & Tip Comandă */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1c1817] border border-amber-900/50 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-amber-100 font-serif mb-1">{selectedItem.title}</h3>
            <p className="text-amber-400 font-bold text-lg mb-5">{selectedItem.price} MDL</p>

            {/* Selector Tip Comandă */}
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Opțiune Servire
            </label>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setOrderType('individual')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'individual'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <User className="w-4 h-4" /> Comandă Personală
              </button>

              <button
                type="button"
                onClick={() => setOrderType('group')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'group'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <Users className="w-4 h-4" /> La Masă (Grup)
              </button>
            </div>

            {/* Nume Persoană pentru Grup */}
            {orderType === 'group' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                  Persoana care comandă
                </label>
                <input
                  type="text"
                  placeholder="Nume (ex: Alexandru, Maria...)"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Notițe Bucătar */}
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-500" /> Mențiuni pentru Chef
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Păt păstrat mediu-făcut, fără dressing, sosul separat..."
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 mb-6 resize-none"
            />

            {/* Butoane Acțiuni */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setChefNote('');
                  setPersonName('');
                }}
                className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl transition-colors text-sm cursor-pointer"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-colors text-sm shadow-lg cursor-pointer"
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};