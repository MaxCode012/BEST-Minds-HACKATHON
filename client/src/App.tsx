import { useState } from 'react';
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
    <div className="min-h-screen bg-cream text-ink font-sans selection:bg-brand selection:text-white">
      <header className="bg-white/85 border-b border-line sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-sm shadow-brand/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-ink tracking-wide leading-tight">
                SmartResto
              </h1>
              <p className="text-[11px] text-muted font-medium">Fine Dining Experience</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-sand p-1 rounded-xl">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                view === 'table'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Meniu Masă
            </button>
            <button
              onClick={() => setView('kds')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                view === 'kds'
                  ? 'bg-white text-brand shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <ChefHat className="w-4 h-4" /> Bucătărie (KDS)
              {kitchenOrders.length > 0 && (
                <span className="bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full font-extrabold">
                  {kitchenOrders.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Coș</span>
            {cart.length > 0 && (
              <span className="bg-white text-brand text-xs px-2 py-0.5 rounded-full font-extrabold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {isCartOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white border-l border-line w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-line">
                <h3 className="text-xl font-bold font-serif text-ink flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand" /> Comanda Ta
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-muted hover:text-ink p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-muted text-center py-12 text-sm">
                  Coșul este gol. Adaugă preparate din meniu!
                </p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-cream border border-line p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-ink text-sm font-serif">{item.title}</h4>
                          <span className="text-[10px] font-bold text-brand-dark bg-brand-soft px-2 py-0.5 rounded">
                            {item.userName}
                          </span>
                        </div>
                        <p className="text-xs text-brand font-bold">{item.price} MDL</p>
                        {item.chefNote && (
                          <p className="text-[11px] text-muted italic">Notă: "{item.chefNote}"</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.cartItemId)}
                        className="text-muted hover:text-rose-600 p-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-line space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-ink font-serif">Total Comandă:</span>
                  <span className="text-brand font-sans text-xl">{cartTotal} MDL</span>
                </div>
                <button
                  onClick={handleSendToKitchen}
                  className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-colors shadow-sm text-sm cursor-pointer"
                >
                  Trimite Comanda la Bucătărie ➔
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="pb-20">
        {view === 'table' ? (
          <MenuCatalog onAddToCart={handleAddToCart} />
        ) : (
          <KDS orders={kitchenOrders} onCompleteOrder={() => setKitchenOrders([])} />
        )}
      </main>

      <AIChat onAddToCart={handleAddToCart} />
    </div>
  );
}