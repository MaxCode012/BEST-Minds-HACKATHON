import React, { useState, type FormEvent } from 'react';
import { MenuCatalog } from './app/components/MenuCatalog';
import { KDS } from './app/components/KDS';
import { AIChat } from './app/components/AIChat';
import { MenuItem, CartItem, MOCK_USER } from './app/data/mockData';
import { UtensilsCrossed, ShoppingBag, ChefHat, X, Trash2 } from 'lucide-react';

type Recommendation = {
  orderId: number;
  requestedAt: string;
  selectedItems: { id: number; name: string; price: number; category: string; reason: string }[];
  totalCost: number;
  remainingBudget: number;
  reasoning: string;
};

export default function App() {
  const [view, setView] = useState<'table' | 'kds'>('table');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [kitchenOrders, setKitchenOrders] = useState<CartItem[]>([]);
  const [orderId, setOrderId] = useState('123');
  const [preferences, setPreferences] = useState('spicy');
  const [budget, setBudget] = useState('250');
  const [includeDrink, setIncludeDrink] = useState(true);
  const [requestedAt, setRequestedAt] = useState('');
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(orderId),
          preferences: preferences.split(',').map((value) => value.trim()).filter(Boolean),
          budget: Number(budget),
          includeDrink,
          requestedAt: requestedAt ? new Date(requestedAt).toISOString() : null,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail ?? body.title ?? 'Could not get recommendations.');
      }
      setRecommendation(body as Recommendation);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reach the backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0d0e] text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      <header className="bg-[#141010]/90 border-b border-amber-900/40 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="pb-20">
        {view === 'table' ? (
          <MenuCatalog onAddToCart={handleAddToCart} />
        ) : (
          <KDS orders={kitchenOrders} onCompleteOrder={() => setKitchenOrders([])} />
        )}
      </main>

      <section className="mx-auto max-w-4xl px-6 pb-8">
        <div className="rounded-2xl border border-amber-900/40 bg-[#141010] p-6 shadow-lg">
          <h2 className="mb-2 font-serif text-xl font-bold text-amber-100">AI recommendations</h2>
          <p className="mb-6 text-sm text-stone-400">
            Tell us about the order and get meal suggestions from the AI assistant.
          </p>

          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm text-stone-200">
              Order ID
              <input
                type="number"
                min="1"
                required
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                className="rounded-lg border border-amber-900/40 bg-[#0f0d0e] px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-stone-200">
              Budget (MDL)
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="rounded-lg border border-amber-900/40 bg-[#0f0d0e] px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-stone-200">
              Preferences (comma separated)
              <input
                value={preferences}
                onChange={(event) => setPreferences(event.target.value)}
                placeholder="spicy, vegetarian"
                className="rounded-lg border border-amber-900/40 bg-[#0f0d0e] px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
              />
            </label>

            <label className="md:col-span-2 flex flex-col gap-2 text-sm text-stone-200">
              Requested time (optional)
              <input
                type="datetime-local"
                value={requestedAt}
                onChange={(event) => setRequestedAt(event.target.value)}
                className="rounded-lg border border-amber-900/40 bg-[#0f0d0e] px-3 py-2 text-stone-100 outline-none focus:border-amber-500"
              />
            </label>

            <label className="md:col-span-2 flex items-center gap-2 text-sm text-stone-200">
              <input
                type="checkbox"
                checked={includeDrink}
                onChange={(event) => setIncludeDrink(event.target.checked)}
              />
              Include a drink
            </label>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-stone-950 transition-all hover:bg-amber-500 disabled:opacity-60"
            >
              {loading ? 'Getting recommendations…' : 'Recommend a meal'}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-sm text-rose-400" role="alert">
              {error}
            </p>
          )}

          {recommendation && (
            <section className="mt-6 rounded-xl border border-amber-900/30 bg-[#0f0d0e] p-4" aria-live="polite">
              <h3 className="mb-2 font-serif text-lg font-bold text-amber-100">
                Recommendation for order #{recommendation.orderId}
              </h3>
              <p className="mb-4 text-sm text-stone-300">{recommendation.reasoning}</p>

              {recommendation.selectedItems.length === 0 ? (
                <p className="text-sm text-stone-300">No items fit this budget.</p>
              ) : (
                <ul className="space-y-3">
                  {recommendation.selectedItems.map((item) => (
                    <li key={item.id} className="rounded-lg border border-amber-900/20 bg-[#141010] p-3">
                      <div className="flex justify-between gap-3">
                        <strong className="text-amber-100">{item.name}</strong>
                        <span className="text-amber-400">{item.price.toFixed(2)} MDL</span>
                      </div>
                      <p className="text-xs uppercase tracking-wide text-stone-400">{item.category}</p>
                      <p className="mt-1 text-sm text-stone-300">{item.reason}</p>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 text-sm text-stone-300">
                <strong>Total:</strong> {recommendation.totalCost.toFixed(2)} MDL · <strong>Remaining:</strong>{' '}
                {recommendation.remainingBudget.toFixed(2)} MDL
              </p>
              <small className="mt-2 block text-xs text-stone-400">
                Requested at: {new Date(recommendation.requestedAt).toLocaleString()}
              </small>
            </section>
          )}
        </div>
      </section>

      <AIChat onAddToCart={handleAddToCart} />
    </div>
  );
}
