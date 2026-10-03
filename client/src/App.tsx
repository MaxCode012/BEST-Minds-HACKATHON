import React, { useState } from 'react';
import { MenuCatalog } from './app/components/MenuCatalog';
import { KDS } from './app/components/KDS';
import { AIChat } from './app/components/AIChat';
import { MenuItem, CartItem, MOCK_USER } from './app/data/mockData';
import { UtensilsCrossed, ShoppingBag, ChefHat, X, Trash2 } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'table' | 'kds'>('table');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [kitchenOrders, setKitchenOrders] = useState<CartItem[]>([]);

  const handleAddToCart = (
    item: MenuItem,
    chefNote: string,
    orderType: 'individual' | 'group',
    userName: string
  ) => {
    const newCartItem: CartItem = {
      ...item,
      cartItemId: Math.random().toString(36).substring(2, 9),
      chefNote,
      orderType,
      userName: userName || MOCK_USER.name,
    };
    setCart((prev) => [...prev, newCartItem]);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleSendToKitchen = () => {
    if (cart.length === 0) return;
    setKitchenOrders((prev) => [...prev, ...cart]);
    setCart([]);
    setIsCartOpen(false);
    setView('kds');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen bg-[#0f0d0e] text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Header Bar */}
      <header className="bg-[#141010]/90 border-b border-amber-900/40 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-amber-100 tracking-wide">
                SmartResto
              </h1>
              <p className="text-[11px] text-stone-400 font-medium">Fine Dining Experience</p>
            </div>
          </div>

          {/* Navigarea între Meniu și KDS */}
          <div className="flex items-center gap-2 bg-[#1a1615] p-1.5 rounded-xl border border-amber-900/30">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === 'table'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Meniu Masă
            </button>
            <button
              onClick={() => setView('kds')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                view === 'kds'
                  ? 'bg-amber-600 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ChefHat className="w-4 h-4" /> Bucătărie (KDS)
              {kitchenOrders.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {kitchenOrders.length}
                </span>
              )}
            </button>
          </div>

          {/* Buton Coș */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Coș</span>
            {cart.length > 0 && (
              <span className="bg-amber-500 text-stone-950 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Sertar Coș (Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#1c1817] border-l border-amber-900/40 w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-amber-900/30">
                <h3 className="text-xl font-bold font-serif text-amber-100 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" /> Comanda Ta
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-stone-400 hover:text-amber-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-stone-500 text-center py-12 text-sm font-light">
                  Coșul este gol. Adaugă preparate din meniu!
                </p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-[#141010] border border-amber-900/30 p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-amber-100 text-sm font-serif">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.userName}
                          </span>
                        </div>
                        <p className="text-xs text-amber-400 font-bold">{item.price} MDL</p>
                        {item.chefNote && (
                          <p className="text-[11px] text-stone-400 italic">
                            Notă: "{item.chefNote}"
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.cartItemId)}
                        className="text-stone-500 hover:text-rose-400 p-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total și Trimitere */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-amber-900/30 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-stone-300 font-serif">Total Comandă:</span>
                  <span className="text-amber-400 font-sans text-xl">{cartTotal} MDL</span>
                </div>
                <button
                  onClick={handleSendToKitchen}
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl transition-all shadow-lg text-sm cursor-pointer"
                >
                  Trimite Comanda la Bucătărie ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conținutul Paginii */}
      <main className="pb-20">
        {view === 'table' ? (
          <MenuCatalog onAddToCart={handleAddToCart} />
        ) : (
          <KDS orders={kitchenOrders} onCompleteOrder={() => setKitchenOrders([])} />
        )}
      </main>

      {/* Widget Asistent AI */}
      <AIChat onAddToCart={handleAddToCart} />
    </div>
  );
}