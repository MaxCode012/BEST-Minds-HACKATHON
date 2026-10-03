import { useState } from 'react';
import { MenuCatalog } from './app/components/MenuCatalog';
import { MenuItem, CartItem } from './app/data/mockData';
import { ShoppingBag, Utensils, MessageSquare, Trash2 } from 'lucide-react';
import { KDS } from './app/components/KDS';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<CartItem[]>([]);
  const [view, setView] = useState<'table' | 'kitchen'>('table');
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item: MenuItem, chefNote: string, orderType: 'individual' | 'group') => {
    const newCartItem: CartItem = {
      ...item,
      cartItemId: Math.random().toString(36).substring(2, 9),
      chefNote,
      orderType,
    };
    setCart((prev) => [...prev, newCartItem]);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleSendToKitchen = () => {
    setKitchenOrders((prev) => [...prev, ...cart]);
    setCart([]);
    setIsCartOpen(false);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Utensils className="text-emerald-400" />
            <span>SmartResto <span className="text-xs font-normal text-slate-400">| Masa #4</span></span>
          </div>

          <div className="flex items-center gap-4">
            {/* Comutator rapid Client / Bucătărie */}
            <button
              onClick={() => setView(view === 'table' ? 'kitchen' : 'table')}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 transition-colors"
            >
              Schimbă în: {view === 'table' ? 'Ecran Bucătărie' : 'Ecran Client'}
            </button>

            {/* Buton interactiv Coș */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">{cart.length} produse</span>
              <span className="text-slate-500">|</span>
              <span className="font-bold text-sm text-emerald-400">{totalPrice} MDL</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sertar Coș (Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-800 border-l border-slate-700 h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="text-emerald-400" /> Coșul Tău
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white text-sm font-semibold"
                >
                  Închide ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-500 text-center py-10">Coșul este gol.</p>
              ) : (
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-slate-900/80 border border-slate-700/80 p-3.5 rounded-xl flex justify-between items-start text-left"
                    >
                      <div className="pr-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                              item.orderType === 'group'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {item.orderType}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-bold text-xs">{item.price} MDL</span>

                        {item.chefNote && (
                          <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-md p-1.5 mt-2 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span>{item.chefNote}</span>
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.cartItemId)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subsol Coș */}
            <div className="pt-4 border-t border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 font-medium">Total de plată:</span>
                <span className="text-xl font-extrabold text-emerald-400">{totalPrice} MDL</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={handleSendToKitchen}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Trimite Comanda către Bucătărie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corpul Paginii */}
      <main>
        {view === 'table' ? (
          <MenuCatalog onAddToCart={handleAddToCart} />
        ) : (
          <KDS 
            orders={kitchenOrders} 
            onCompleteOrder={() => setKitchenOrders([])} 
          />
        )}
      </main>
    </div>
  );
}