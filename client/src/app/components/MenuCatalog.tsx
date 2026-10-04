import React, { useState, useEffect } from 'react';
import { MOCK_USER, MenuItem, fetchMenuFromBackend } from '../data/mockData';
import { 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  MessageSquare, 
  Users, 
  User, 
  Search,
  UtensilsCrossed,
  Loader2
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
  // Stare pentru stocarea preparatelor din baza de date și pentru indicatorul de încărcare
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [chefNote, setChefNote] = useState('');
  const [orderType, setOrderType] = useState<'individual' | 'group'>('individual');
  const [personName, setPersonName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Încărcare meniu din C# API / PostgreSQL
  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const data = await fetchMenuFromBackend();
      setMenuItems(data);
      setLoading(false);
    };

    loadMenu();
  }, []);

  const handleConfirmAdd = () => {
    if (selectedItem) {
      const finalName = orderType === 'group' && personName.trim() ? personName : MOCK_USER.name;
      onAddToCart(selectedItem, chefNote, orderType, finalName);
      setSelectedItem(null);
      setChefNote('');
      setPersonName('');
    }
  };

  const filteredMenu = menuItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profil utilizator scanat NFC - Stil Elegance */}
      <div className="bg-brand text-white rounded-2xl p-5 mb-8 flex items-center justify-between shadow-lg shadow-brand/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white text-brand flex items-center justify-center font-bold text-xl font-serif">
            {MOCK_USER.name[0]}
          </div>
          <div className="font-sans">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-white/80" /> Client: {MOCK_USER.name}
            </h3>
            <p className="text-sm text-white/85">
              Alergii detectate: <span className="bg-white text-brand-dark font-bold px-2 py-0.5 rounded-md">{MOCK_USER.allergies.join(', ')}</span>
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/30 font-sans">
          <ShieldCheck className="w-4 h-4" /> Masă Activă NFC
        </span>
      </div>

      {/* Bară de Căutare Meniu */}
      <div className="relative mb-8 font-sans">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-brand/70" />
        </div>
        <input
          type="text"
          placeholder="Caută în meniu (ex: Paste, Steak, Vin...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-line rounded-xl text-ink placeholder-muted/60 focus:outline-none focus:border-brand transition-colors text-sm focus:ring-2 focus:ring-brand/15"
        />
      </div>

      {/* Stare de încărcare sau afișarea meniului */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-brand gap-3 font-sans">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-white/85">Se încarcă meniul din baza de date...</p>
        </div>
      ) : filteredMenu.length === 0 ? (
        <p className="text-muted text-center py-12 font-sans">Nu s-a găsit niciun preparat în meniu.</p>
      ) : (
        /* Grilă Carduri Preparate */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map((item) => {
            const hasAllergen = item.allergens?.some((a) => MOCK_USER.allergies.includes(a));

            return (
              <div
                key={item.id}
                className="bg-white border border-line rounded-2xl overflow-hidden flex flex-col justify-between hover:border-brand/30 transition-all shadow-sm hover:shadow-xl hover:shadow-brand/10"
              >
                <div>
                  {/* Imagine cu Overlay Elegant */}
                  <div className="relative h-56 w-full overflow-hidden bg-sand">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    {hasAllergen && (
                      <div className="absolute top-3 right-3 bg-white/95 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-1.5 shadow-lg font-sans">
                        <AlertTriangle className="w-4 h-4 text-rose-600" /> Conține Alergeni
                      </div>
                    )}
                  </div>

                  {/* Detalii Mâncare */}
                  <div className="p-6 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl font-bold text-ink tracking-wide">{item.title}</h3>
                      <span className="text-brand font-extrabold text-xl font-sans">{item.price} MDL</span>
                    </div>
                    <p className="text-muted text-sm mb-4 leading-relaxed font-sans font-light">{item.description}</p>

                    {/* Alergeni */}
                    <div className="flex flex-wrap gap-2 mb-2 font-sans">
                      {item.allergens?.map((alg) => {
                        const isUserAllergic = MOCK_USER.allergies.includes(alg);
                        return (
                          <span
                            key={alg}
                            className={`text-[11px] px-2.5 py-1 rounded-md font-medium capitalize ${
                              isUserAllergic
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-sand text-muted border border-line'
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
                    className="w-full py-3.5 px-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
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
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-line rounded-2xl max-w-md w-full p-6 text-left shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-ink font-serif mb-1">{selectedItem.title}</h3>
            <p className="text-brand font-bold text-lg mb-5">{selectedItem.price} MDL</p>

            {/* Selector Tip Comandă */}
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
              Opțiune Servire
            </label>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setOrderType('individual')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'individual'
                    ? 'bg-brand-soft border-brand text-brand-dark font-bold'
                    : 'bg-cream/60 border-line text-muted hover:border-line'
                }`}
              >
                <User className="w-4 h-4" /> Comandă Personală
              </button>

              <button
                type="button"
                onClick={() => setOrderType('group')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === 'group'
                    ? 'bg-brand-soft border-brand text-brand-dark font-bold'
                    : 'bg-cream/60 border-line text-muted hover:border-line'
                }`}
              >
                <Users className="w-4 h-4" /> La Masă (Grup)
              </button>
            </div>

            {/* Nume Persoană pentru Grup */}
            {orderType === 'group' && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2">
                  Persoana care comandă
                </label>
                <input
                  type="text"
                  placeholder="Nume (ex: Alexandru, Maria...)"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-cream border border-line rounded-xl p-3 text-sm text-ink focus:outline-none focus:border-brand"
                />
              </div>
            )}

            {/* Notițe Bucătar */}
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-brand" /> Mențiuni pentru Chef
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Păt păstrat mediu-făcut, fără dressing, sosul separat..."
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              className="w-full bg-cream border border-line rounded-xl p-3 text-sm text-ink placeholder-muted/60 focus:outline-none focus:border-brand mb-6 resize-none"
            />

            {/* Butoane Acțiuni */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setChefNote('');
                  setPersonName('');
                }}
                className="flex-1 py-3 bg-sand hover:bg-line text-ink font-medium rounded-xl transition-colors text-sm cursor-pointer"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-colors text-sm shadow-lg cursor-pointer"
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